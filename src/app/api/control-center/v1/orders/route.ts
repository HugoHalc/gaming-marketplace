import type { NextRequest } from "next/server";
import { listControlCenterOrders } from "@/features/control-center/server/data";
import { errorResponse, optionsResponse, successResponse, validateControlCenterOrigin } from "@/features/control-center/server/http";
import { authenticateControlCenterRequest, ControlCenterSecurityError, decodeOffsetCursor, encodeOffsetCursor, finishControlCenterRequest, parsePositiveLimit, validateQueryParameters } from "@/features/control-center/server/security";

export const dynamic = "force-dynamic";
export async function OPTIONS(request: NextRequest) { return optionsResponse(request); }

export async function GET(request: NextRequest) {
  let auth;
  try {
    if (!validateControlCenterOrigin(request)) return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
    auth = await authenticateControlCenterRequest(request);
    validateQueryParameters(request, ["limit", "cursor", "search", "status", "payment_status", "game"]);
    const limit = parsePositiveLimit(request.nextUrl.searchParams.get("limit"), 25, 100);
    const offset = decodeOffsetCursor(request.nextUrl.searchParams.get("cursor"));
    const search = (request.nextUrl.searchParams.get("search") ?? "").trim();
    if (search.length > 100) throw new ControlCenterSecurityError("INVALID_REQUEST", "Search is too long.", 400);
    const status = request.nextUrl.searchParams.get("status")?.trim() || null;
    const paymentStatus = request.nextUrl.searchParams.get("payment_status")?.trim() || null;
    const game = request.nextUrl.searchParams.get("game")?.trim() || null;
    if ([status, paymentStatus, game].some((value) => (value?.length ?? 0) > 80)) throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid filter.", 400);

    const result = await listControlCenterOrders({ adminUserId: auth.adminUserId, offset, limit, search, status, paymentStatus, game });
    await finishControlCenterRequest(auth, 200, "success");
    return successResponse(result.orders, {
      request,
      dataState: result.orders.length ? "ok" : "empty",
      pagination: { limit, hasMore: result.hasMore, nextCursor: result.hasMore ? encodeOffsetCursor(offset + limit) : null },
    });
  } catch (error) {
    if (auth) await finishControlCenterRequest(auth, error instanceof ControlCenterSecurityError ? error.status : 500, error instanceof ControlCenterSecurityError && error.status < 500 ? "client_error" : "server_error");
    if (error instanceof ControlCenterSecurityError) return errorResponse(error.code, error.message, error.status, { request });
    return errorResponse("INTEGRATION_ERROR", "Unable to load Control Center orders.", 500, { request });
  }
}
