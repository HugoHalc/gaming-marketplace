import type { NextRequest } from "next/server";
import {
  errorResponse,
  optionsResponse,
  successResponse,
  validateControlCenterOrigin,
} from "@/features/control-center/server/http";
import {
  authenticateControlCenterRequest,
  ControlCenterSecurityError,
  finishControlCenterRequest,
  revokeControlCenterSession,
  validateQueryParameters,
} from "@/features/control-center/server/security";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(request);
}

export async function POST(request: NextRequest) {
  let auth;
  try {
    if (!validateControlCenterOrigin(request)) {
      return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
    }
    auth = await authenticateControlCenterRequest(request);
    validateQueryParameters(request, []);
    await revokeControlCenterSession(auth);
    await finishControlCenterRequest(auth, 200, "success");
    return successResponse({ revoked: true }, { request });
  } catch (error) {
    if (auth) {
      await finishControlCenterRequest(
        auth,
        error instanceof ControlCenterSecurityError ? error.status : 500,
        error instanceof ControlCenterSecurityError && error.status < 500 ? "client_error" : "server_error",
      );
    }
    if (error instanceof ControlCenterSecurityError) {
      return errorResponse(error.code, error.message, error.status, { request });
    }
    return errorResponse("INTEGRATION_ERROR", "Unable to revoke Control Center access.", 500, { request });
  }
}
