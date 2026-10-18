import type { NextRequest } from "next/server";
import { createSecretServerClient } from "@/lib/supabase/server";
import {
  ControlCenterSecurityError,
  createOpaqueToken,
  getControlCenterConfig,
  sha256Base64Url,
  sha256Hex,
  validateOAuthClient,
  validatePkceVerifier,
} from "@/features/control-center/server/security";
import { errorResponse, optionsResponse, successResponse, validateControlCenterOrigin } from "@/features/control-center/server/http";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(request);
}

const TOKEN_FIELDS = new Set(["grant_type", "code", "code_verifier", "client_id", "redirect_uri"]);

async function parseTokenRequest(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 8_192) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Token request is too large.", 413);
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  const rawBody = await request.text().catch(() => "");
  if (Buffer.byteLength(rawBody, "utf8") > 8_192) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Token request is too large.", 413);
  }
  if (!rawBody) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid token request.", 400);
  }
  let entries: Array<[string, unknown]>;
  if (contentType === "application/json") {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      // Handled by the strict object check below.
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid token request.", 400);
    }
    entries = Object.entries(parsed as Record<string, unknown>);
  } else if (contentType === "application/x-www-form-urlencoded") {
    entries = Array.from(new URLSearchParams(rawBody).entries());
  } else {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Unsupported content type.", 415);
  }

  if (entries.some(([key]) => !TOKEN_FIELDS.has(key))) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Unknown token request parameter.", 400);
  }
  if (new Set(entries.map(([key]) => key)).size !== entries.length) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Duplicate token request parameter.", 400);
  }
  const body = Object.fromEntries(entries);
  return {
    grantType: typeof body.grant_type === "string" ? body.grant_type : "",
    code: typeof body.code === "string" ? body.code.trim() : "",
    verifier: typeof body.code_verifier === "string" ? body.code_verifier.trim() : "",
    clientId: typeof body.client_id === "string" ? body.client_id.trim() : "",
    redirectUri: typeof body.redirect_uri === "string" ? body.redirect_uri.trim() : "",
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!validateControlCenterOrigin(request)) {
      return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
    }
    const body = await parseTokenRequest(request);
    if (body.grantType !== "authorization_code") {
      throw new ControlCenterSecurityError("INVALID_REQUEST", "Unsupported grant request.", 400);
    }
    const { code, verifier, clientId, redirectUri } = body;
    if (!/^[0-9a-f]{64}$/i.test(code)) {
      throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid authorization code.", 400);
    }
    validateOAuthClient(clientId, redirectUri);
    validatePkceVerifier(verifier);

    const challenge = sha256Base64Url(verifier);
    const supabase = createSecretServerClient();
    const exchange = await supabase.rpc("consume_control_center_auth_code", {
      p_code_hash: sha256Hex(code),
      p_client_id: clientId,
      p_redirect_uri: redirectUri,
      p_code_challenge: challenge,
    });
    if (exchange.error) {
      throw new ControlCenterSecurityError("INVALID_TOKEN", "Authorization code is invalid, expired, or already used.", 401);
    }
    const exchangeRow = Array.isArray(exchange.data) ? exchange.data[0] : exchange.data;
    if (exchangeRow?.outcome === "admin_required") {
      throw new ControlCenterSecurityError("ADMIN_ACCESS_REQUIRED", "Administrator access has been revoked.", 403);
    }
    if (exchangeRow?.outcome !== "success") {
      throw new ControlCenterSecurityError("INVALID_TOKEN", "Authorization code is invalid, expired, or already used.", 401);
    }
    const adminUserId = exchangeRow?.admin_user_id ? String(exchangeRow.admin_user_id) : "";
    if (!adminUserId) {
      throw new ControlCenterSecurityError("INVALID_TOKEN", "Authorization code is invalid.", 401);
    }

    const config = getControlCenterConfig();
    const accessToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + config.accessTokenTtlSeconds * 1000).toISOString();
    const session = await supabase.from("control_center_sessions").insert({
      token_hash: sha256Hex(accessToken),
      admin_user_id: adminUserId,
      client_id: clientId,
      issuer: config.issuer,
      audience: config.audience,
      scopes: ["control_center:read"],
      expires_at: expiresAt,
    }).select("id").single();
    if (session.error) throw new Error("Unable to create Control Center session.");

    return successResponse(
      {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: config.accessTokenTtlSeconds,
        scope: "control_center:read",
        issuer: config.issuer,
        audience: config.audience,
      },
      { request },
    );
  } catch (error) {
    if (error instanceof ControlCenterSecurityError) {
      return errorResponse(error.code, error.message, error.status, {
        request,
        permission: error.code === "ADMIN_ACCESS_REQUIRED" ? "admin" : undefined,
      });
    }
    return errorResponse("INTEGRATION_ERROR", "Unable to exchange Control Center authorization code.", 500, { request });
  }
}
