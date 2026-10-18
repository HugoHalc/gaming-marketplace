import "server-only";

import { createHash, randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { createSecretServerClient } from "@/lib/supabase/server";

const ACCESS_SCOPE = "control_center:read";
const DEFAULT_CLIENT_ID = "boostingpedia-control-center";
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export class ControlCenterSecurityError extends Error {
  constructor(
    public readonly code:
      | "AUTHENTICATION_REQUIRED"
      | "ADMIN_ACCESS_REQUIRED"
      | "TOKEN_EXPIRED"
      | "INVALID_TOKEN"
      | "INVALID_CLIENT"
      | "INVALID_REDIRECT_URI"
      | "INVALID_PKCE"
      | "REPLAY_DETECTED"
      | "RATE_LIMITED"
      | "INVALID_REQUEST",
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export interface ControlCenterAuthContext {
  sessionId: string;
  adminUserId: string;
  requestId: string;
  expiresAt: string;
}

export const CONTROL_CENTER_SCOPE = ACCESS_SCOPE;

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Base64Url(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function getControlCenterConfig() {
  const clientId = process.env.CONTROL_CENTER_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://boostingpedia.com").replace(/\/$/, "");
  const issuer = process.env.CONTROL_CENTER_ISSUER?.trim() || siteUrl;
  const audience = process.env.CONTROL_CENTER_AUDIENCE?.trim() || clientId;
  const redirectUris = new Set(
    (process.env.CONTROL_CENTER_ALLOWED_REDIRECT_URIS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const allowedOrigins = new Set(
    (process.env.CONTROL_CENTER_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const parsedTtl = Number(process.env.CONTROL_CENTER_ACCESS_TOKEN_TTL_SECONDS ?? "600");
  const accessTokenTtlSeconds = Number.isFinite(parsedTtl)
    ? Math.min(Math.max(Math.trunc(parsedTtl), 300), 900)
    : 600;

  return { clientId, siteUrl, issuer, audience, redirectUris, allowedOrigins, accessTokenTtlSeconds };
}

export function validateOAuthClient(clientId: string, redirectUri: string) {
  const config = getControlCenterConfig();
  if (clientId !== config.clientId) {
    throw new ControlCenterSecurityError("INVALID_CLIENT", "Unknown Control Center client.", 400);
  }
  if (!config.redirectUris.has(redirectUri)) {
    throw new ControlCenterSecurityError("INVALID_REDIRECT_URI", "Redirect URI is not registered.", 400);
  }
  return config;
}

export function validatePkceChallenge(value: string) {
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(value)) {
    throw new ControlCenterSecurityError("INVALID_PKCE", "Invalid PKCE challenge.", 400);
  }
}

export function validatePkceVerifier(value: string) {
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(value)) {
    throw new ControlCenterSecurityError("INVALID_PKCE", "Invalid PKCE verifier.", 400);
  }
}

export function validateAuthorizationRequest(input: {
  responseType: string;
  scope: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}) {
  validatePkceChallenge(input.codeChallenge);
  if (
    input.responseType !== "code" ||
    input.scope !== ACCESS_SCOPE ||
    input.codeChallengeMethod !== "S256" ||
    input.state.length < 16 ||
    input.state.length > 256 ||
    !/^[A-Za-z0-9._~-]+$/.test(input.state)
  ) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid authorization request.", 400);
  }
}

export function parsePositiveLimit(value: string | null, fallback = 25, maximum = 100) {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", `limit must be between 1 and ${maximum}.`, 400);
  }
  return parsed;
}

export function validateQueryParameters(request: NextRequest, allowed: readonly string[]) {
  const allowedSet = new Set(allowed);
  const keys = Array.from(request.nextUrl.searchParams.keys());
  if (keys.some((key) => !allowedSet.has(key)) || new Set(keys).size !== keys.length) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Unknown or duplicate query parameter.", 400);
  }
}

export function encodeOffsetCursor(offset: number) {
  return Buffer.from(JSON.stringify({ offset }), "utf8").toString("base64url");
}

export function decodeOffsetCursor(cursor: string | null) {
  if (cursor === null) return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { offset?: unknown };
    if (!Number.isInteger(parsed.offset) || Number(parsed.offset) < 0 || Number(parsed.offset) > 1_000_000) {
      throw new Error("invalid");
    }
    return Number(parsed.offset);
  } catch {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid pagination cursor.", 400);
  }
}

function hashOptionalHeader(value: string | null) {
  return value ? sha256Hex(value).slice(0, 32) : null;
}

function normalizeRouteKey(request: NextRequest) {
  return request.nextUrl.pathname.slice(0, 200);
}

export async function authenticateControlCenterRequest(
  request: NextRequest,
): Promise<ControlCenterAuthContext> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!TOKEN_PATTERN.test(token)) {
    throw new ControlCenterSecurityError("AUTHENTICATION_REQUIRED", "A valid Control Center bearer token is required.", 401);
  }

  const requestId = request.headers.get("x-control-center-request-id")?.trim() ?? "";
  const requestTimestamp = request.headers.get("x-control-center-request-timestamp")?.trim() ?? "";
  const timestamp = Date.parse(requestTimestamp);
  if (
    !UUID_V4_PATTERN.test(requestId) ||
    !ISO_UTC_PATTERN.test(requestTimestamp) ||
    Number.isNaN(timestamp) ||
    new Date(timestamp).toISOString() !== requestTimestamp
  ) {
    throw new ControlCenterSecurityError("INVALID_REQUEST", "Request ID and timestamp are required.", 400);
  }

  const config = getControlCenterConfig();
  const supabase = createSecretServerClient();
  const { data, error } = await supabase.rpc("begin_control_center_request", {
    p_token_hash: sha256Hex(token),
    p_request_id: requestId,
    p_request_timestamp: requestTimestamp,
    p_method: request.method.slice(0, 12),
    p_route: normalizeRouteKey(request),
    p_ip_hash: hashOptionalHeader(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null),
    p_user_agent_hash: hashOptionalHeader(request.headers.get("user-agent")),
    p_issuer: config.issuer,
    p_audience: config.audience,
    p_required_scope: ACCESS_SCOPE,
    p_max_requests: 120,
    p_window_seconds: 60,
  });

  if (error) {
    const message = error.message || "Control Center authorization failed.";
    if (message.includes("CONTROL_CENTER_REPLAY")) {
      throw new ControlCenterSecurityError("REPLAY_DETECTED", "This request was already used.", 409);
    }
    if (message.includes("CONTROL_CENTER_RATE_LIMIT")) {
      throw new ControlCenterSecurityError("RATE_LIMITED", "Too many Control Center requests.", 429);
    }
    if (message.includes("CONTROL_CENTER_EXPIRED")) {
      throw new ControlCenterSecurityError("TOKEN_EXPIRED", "Control Center session expired.", 401);
    }
    if (message.includes("CONTROL_CENTER_ADMIN_REQUIRED")) {
      throw new ControlCenterSecurityError("ADMIN_ACCESS_REQUIRED", "Administrator access is required.", 403);
    }
    throw new ControlCenterSecurityError("INVALID_TOKEN", "Control Center session is invalid.", 401);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (row?.denial_code === "CONTROL_CENTER_ADMIN_REQUIRED") {
    throw new ControlCenterSecurityError("ADMIN_ACCESS_REQUIRED", "Administrator access is required.", 403);
  }
  if (!row?.session_id || !row?.admin_user_id || !row?.expires_at) {
    throw new ControlCenterSecurityError("INVALID_TOKEN", "Control Center session is invalid.", 401);
  }

  return {
    sessionId: String(row.session_id),
    adminUserId: String(row.admin_user_id),
    requestId,
    expiresAt: String(row.expires_at),
  };
}

export async function revokeControlCenterSession(context: ControlCenterAuthContext) {
  const { data, error } = await createSecretServerClient().rpc("revoke_control_center_session", {
    p_session_id: context.sessionId,
    p_admin_user_id: context.adminUserId,
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.revoked) {
    throw new ControlCenterSecurityError("INVALID_TOKEN", "Control Center session is invalid.", 401);
  }
}

export async function finishControlCenterRequest(
  context: ControlCenterAuthContext,
  statusCode: number,
  outcome: "success" | "client_error" | "server_error",
) {
  const { error } = await createSecretServerClient()
    .from("control_center_access_audit")
    .update({ status_code: statusCode, outcome })
    .eq("session_id", context.sessionId)
    .eq("request_id", context.requestId);
  if (error) console.error("Unable to finalize Control Center access audit.");
}
