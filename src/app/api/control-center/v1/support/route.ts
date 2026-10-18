import type { NextRequest } from "next/server";
import { listControlCenterSupport } from "@/features/control-center/server/data";
import { errorResponse, optionsResponse, successResponse, validateControlCenterOrigin } from "@/features/control-center/server/http";
import { authenticateControlCenterRequest, ControlCenterSecurityError, decodeOffsetCursor, encodeOffsetCursor, finishControlCenterRequest, parsePositiveLimit, validateQueryParameters } from "@/features/control-center/server/security";
import type { SupportConversationStatus } from "@/features/support/server/support-repository";

export const dynamic = "force-dynamic";
export async function OPTIONS(request: NextRequest) { return optionsResponse(request); }

export async function GET(request: NextRequest) {
  let auth;
  try {
    if (!validateControlCenterOrigin(request)) return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
    auth = await authenticateControlCenterRequest(request);
    validateQueryParameters(request, ["limit", "cursor", "status"]);
    const limit = parsePositiveLimit(request.nextUrl.searchParams.get("limit"), 25, 100);
    const offset = decodeOffsetCursor(request.nextUrl.searchParams.get("cursor"));
    const rawStatus = request.nextUrl.searchParams.get("status");
    if (rawStatus !== null && rawStatus !== "open" && rawStatus !== "closed") throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid support status.", 400);
    const status = (rawStatus || undefined) as SupportConversationStatus | undefined;
    const result = await listControlCenterSupport({ adminUserId: auth.adminUserId, status, offset, limit });
    await finishControlCenterRequest(auth, 200, "success");
    return successResponse(result.conversations, {
      request,
      dataState: result.conversations.length ? "ok" : "empty",
      pagination: { limit, hasMore: result.hasMore, nextCursor: result.hasMore ? encodeOffsetCursor(offset + limit) : null },
    });
  } catch (error) {
    if (auth) await finishControlCenterRequest(auth, error instanceof ControlCenterSecurityError ? error.status : 500, error instanceof ControlCenterSecurityError && error.status < 500 ? "client_error" : "server_error");
    if (error instanceof ControlCenterSecurityError) return errorResponse(error.code, error.message, error.status, { request });
    return errorResponse("INTEGRATION_ERROR", "Unable to load Control Center support conversations.", 500, { request });
  }
}
