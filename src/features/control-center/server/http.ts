import { NextResponse, type NextRequest } from "next/server";
import {
  CONTROL_CENTER_DATA_SOURCE,
  CONTROL_CENTER_SCHEMA_VERSION,
  type ControlCenterDataState,
  type ControlCenterErrorCode,
  type ControlCenterPagination,
} from "@/features/control-center/types/contracts";
import { getControlCenterConfig } from "@/features/control-center/server/security";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
} as const;

function allowedOrigins() {
  return getControlCenterConfig().allowedOrigins;
}

export function validateControlCenterOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return allowedOrigins().has(origin);
}

export function controlCenterHeaders(request?: NextRequest) {
  const headers = new Headers(NO_STORE_HEADERS);
  const origin = request?.headers.get("origin");
  if (origin && allowedOrigins().has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

export function successResponse<T>(
  data: T,
  options: {
    request?: NextRequest;
    status?: number;
    dataState?: ControlCenterDataState;
    pagination?: ControlCenterPagination;
  } = {},
) {
  const now = new Date().toISOString();
  return NextResponse.json(
    {
      schemaVersion: CONTROL_CENTER_SCHEMA_VERSION,
      dataSource: CONTROL_CENTER_DATA_SOURCE,
      lastUpdated: now,
      dataState: options.dataState ?? "ok",
      freshness: { mode: "live", asOf: now },
      data,
      ...(options.pagination ? { pagination: options.pagination } : {}),
    },
    { status: options.status ?? 200, headers: controlCenterHeaders(options.request) },
  );
}

export function errorResponse(
  code: ControlCenterErrorCode,
  message: string,
  status: number,
  options: {
    request?: NextRequest;
    permission?: "admin" | "control_center:read";
    dataState?: ControlCenterDataState;
  } = {},
) {
  const now = new Date().toISOString();
  return NextResponse.json(
    {
      schemaVersion: CONTROL_CENTER_SCHEMA_VERSION,
      dataSource: CONTROL_CENTER_DATA_SOURCE,
      lastUpdated: now,
      dataState: options.dataState ?? (status >= 500 ? "integration_error" : "unavailable"),
      freshness: { mode: "unavailable", asOf: null },
      error: {
        code,
        message,
        ...(options.permission ? { permission: options.permission } : {}),
      },
    },
    { status, headers: controlCenterHeaders(options.request) },
  );
}

export function optionsResponse(request: NextRequest) {
  if (!validateControlCenterOrigin(request)) {
    return errorResponse("INVALID_REQUEST", "Origin is not allowed.", 403, { request });
  }
  const headers = controlCenterHeaders(request);
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Control-Center-Request-Id, X-Control-Center-Request-Timestamp");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Max-Age", "600");
  return new NextResponse(null, { status: 204, headers });
}
