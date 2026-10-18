import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import {
  ControlCenterSecurityError,
  sha256Hex,
  validateAuthorizationRequest,
  validateOAuthClient,
} from "@/features/control-center/server/security";
import { controlCenterHeaders, errorResponse } from "@/features/control-center/server/http";
import { createSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const AUTHORIZATION_FIELDS = new Set([
  "response_type",
  "client_id",
  "redirect_uri",
  "scope",
  "state",
  "code_challenge",
  "code_challenge_method",
]);

export async function GET(request: NextRequest) {
  try {
    const keys = Array.from(request.nextUrl.searchParams.keys());
    if (keys.some((key) => !AUTHORIZATION_FIELDS.has(key)) || new Set(keys).size !== keys.length) {
      throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid authorization request.", 400);
    }
    const clientId = request.nextUrl.searchParams.get("client_id")?.trim() ?? "";
    const redirectUri = request.nextUrl.searchParams.get("redirect_uri")?.trim() ?? "";
    const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";
    const responseType = request.nextUrl.searchParams.get("response_type")?.trim() ?? "";
    const scope = request.nextUrl.searchParams.get("scope")?.trim() ?? "";
    const codeChallenge = request.nextUrl.searchParams.get("code_challenge")?.trim() ?? "";
    const method = request.nextUrl.searchParams.get("code_challenge_method")?.trim() ?? "";

    validateOAuthClient(clientId, redirectUri);
    validateAuthorizationRequest({ responseType, scope, state, codeChallenge, codeChallengeMethod: method });

    const identity = await getCurrentIdentity();
    if (!identity) {
      const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", next);
      return NextResponse.redirect(loginUrl, { status: 303, headers: controlCenterHeaders(request) });
    }
    if (identity.profile?.role !== "admin") {
      return errorResponse("ADMIN_ACCESS_REQUIRED", "Administrator access is required.", 403, {
        request,
        permission: "admin",
      });
    }

    const code = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60_000).toISOString();
    const { error } = await createSecretServerClient().rpc("issue_control_center_auth_code", {
      p_code_hash: sha256Hex(code),
      p_admin_user_id: identity.id,
      p_client_id: clientId,
      p_redirect_uri: redirectUri,
      p_code_challenge: codeChallenge,
      p_expires_at: expiresAt,
    });
    if (error?.message.includes("CONTROL_CENTER_RATE_LIMIT")) {
      throw new ControlCenterSecurityError("RATE_LIMITED", "Too many authorization requests.", 429);
    }
    if (error?.message.includes("CONTROL_CENTER_ADMIN_REQUIRED")) {
      throw new ControlCenterSecurityError("ADMIN_ACCESS_REQUIRED", "Administrator access is required.", 403);
    }
    if (error) throw new Error("Unable to create Control Center authorization code.");

    const redirect = new URL(redirectUri);
    redirect.searchParams.set("code", code);
    redirect.searchParams.set("state", state);
    return NextResponse.redirect(redirect, { status: 303, headers: controlCenterHeaders(request) });
  } catch (error) {
    if (error instanceof ControlCenterSecurityError) {
      return errorResponse(error.code, error.message, error.status, { request });
    }
    return errorResponse("INTEGRATION_ERROR", "Unable to authorize Control Center access.", 500, { request });
  }
}
