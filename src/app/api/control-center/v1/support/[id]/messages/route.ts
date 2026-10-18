import type { NextRequest } from "next/server";
import { listControlCenterSupportMessages } from "@/features/control-center/server/data";
import { errorResponse, optionsResponse, successResponse, validateControlCenterOrigin } from "@/features/control-center/server/http";
import { authenticateControlCenterRequest, ControlCenterSecurityError, finishControlCenterRequest, parsePositiveLimit, validateQueryParameters } from "@/features/control-center/server/security";

export const dynamic = "force-dynamic";
export async function OPTIONS(request: NextRequest) { return optionsResponse(request); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let auth;
  try {
    if (!validateControlCenterOrigin(request)) return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
    auth = await authenticateControlCenterRequest(request);
    validateQueryParameters(request, ["limit", "cursor"]);
    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid conversation ID.", 400);
    const limit = parsePositiveLimit(request.nextUrl.searchParams.get("limit"), 50, 100);
    const rawCursor = request.nextUrl.searchParams.get("cursor");
    if (rawCursor !== null && rawCursor !== rawCursor.trim()) throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid message cursor.", 400);
    const beforeId = rawCursor;
    if (beforeId === "") throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid message cursor.", 400);
    if (beforeId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(beforeId)) throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid message cursor.", 400);
    let result;
    try {
      result = await listControlCenterSupportMessages({ conversationId: id, beforeId, limit });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid support history cursor.") {
        throw new ControlCenterSecurityError("INVALID_REQUEST", "Invalid message cursor.", 400);
      }
      throw error;
    }
    if (!result) {
      await finishControlCenterRequest(auth, 404, "client_error");
      return errorResponse("NOT_FOUND", "Support conversation not found.", 404, { request });
    }
    await finishControlCenterRequest(auth, 200, "success");
    return successResponse(result.messages, {
      request,
      dataState: result.messages.length ? "ok" : "empty",
      pagination: { limit, hasMore: result.hasMore, nextCursor: result.nextCursor },
    });
  } catch (error) {
    if (auth) await finishControlCenterRequest(auth, error instanceof ControlCenterSecurityError ? error.status : 500, error instanceof ControlCenterSecurityError && error.status < 500 ? "client_error" : "server_error");
    if (error instanceof ControlCenterSecurityError) return errorResponse(error.code, error.message, error.status, { request });
    return errorResponse("INTEGRATION_ERROR", "Unable to load support message history.", 500, { request });
  }
}
