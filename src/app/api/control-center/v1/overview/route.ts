import type { NextRequest } from "next/server";
import { getControlCenterOverview } from "@/features/control-center/server/data";
import { errorResponse, optionsResponse, successResponse, validateControlCenterOrigin } from "@/features/control-center/server/http";
import { authenticateControlCenterRequest, ControlCenterSecurityError, finishControlCenterRequest, validateQueryParameters } from "@/features/control-center/server/security";

export const dynamic = "force-dynamic";
export async function OPTIONS(request: NextRequest) { return optionsResponse(request); }

export async function GET(request: NextRequest) {
  let auth;
  try {
    if (!validateControlCenterOrigin(request)) return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
    auth = await authenticateControlCenterRequest(request);
    validateQueryParameters(request, []);
    const data = await getControlCenterOverview(auth.adminUserId);
    await finishControlCenterRequest(auth, 200, "success");
    return successResponse(data, { request });
  } catch (error) {
    if (auth) await finishControlCenterRequest(auth, error instanceof ControlCenterSecurityError ? error.status : 500, error instanceof ControlCenterSecurityError && error.status < 500 ? "client_error" : "server_error");
    if (error instanceof ControlCenterSecurityError) return errorResponse(error.code, error.message, error.status, { request, permission: error.code === "ADMIN_ACCESS_REQUIRED" ? "admin" : "control_center:read" });
    return errorResponse("INTEGRATION_ERROR", "Unable to load Control Center overview.", 500, { request });
  }
}
