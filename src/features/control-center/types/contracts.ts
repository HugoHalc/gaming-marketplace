export const CONTROL_CENTER_SCHEMA_VERSION = "1.0" as const;
export const CONTROL_CENTER_DATA_SOURCE = "boostingpedia" as const;

export type ControlCenterDataState =
  | "ok"
  | "empty"
  | "unavailable"
  | "integration_error";

export type ControlCenterErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "ADMIN_ACCESS_REQUIRED"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN"
  | "INVALID_CLIENT"
  | "INVALID_REDIRECT_URI"
  | "INVALID_PKCE"
  | "REPLAY_DETECTED"
  | "RATE_LIMITED"
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "INTEGRATION_ERROR"
  | "DATA_UNAVAILABLE";

export interface ControlCenterMeta {
  schemaVersion: typeof CONTROL_CENTER_SCHEMA_VERSION;
  dataSource: typeof CONTROL_CENTER_DATA_SOURCE;
  lastUpdated: string;
  dataState: ControlCenterDataState;
  freshness: {
    mode: "live" | "unavailable";
    asOf: string | null;
  };
}

export interface ControlCenterPagination {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ControlCenterSuccess<T> extends ControlCenterMeta {
  data: T;
  pagination?: ControlCenterPagination;
}

export interface ControlCenterError extends ControlCenterMeta {
  error: {
    code: ControlCenterErrorCode;
    message: string;
    permission?: "admin" | "control_center:read";
  };
}

export interface ControlCenterOverview {
  totalOrders: number;
  pendingAssignmentOrders: number;
  inProgressOrders: number;
  openSupportConversations: number;
  confirmedRevenue: {
    amount: number;
    currency: "USD";
  };
  updatedAt: string;
}

export interface ControlCenterOrder {
  id: string;
  orderNumber: string;
  game: string | null;
  service: string | null;
  amount: number;
  currency: "USD";
  paymentStatus: string;
  fulfillmentStatus: string;
  assignment: {
    kind: "booster" | "admin";
    assigneeId: string;
    displayName: string;
    assignedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  workspaceUrl: string;
}

export interface ControlCenterSupportConversation {
  id: string;
  status: "open" | "closed";
  unreadMessages: number;
  lastMessage: {
    body: string;
    senderType: "visitor" | "admin";
    createdAt: string;
  } | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ControlCenterSupportMessage {
  id: string;
  conversationId: string;
  senderType: "visitor" | "admin";
  body: string;
  createdAt: string;
}

export interface ControlCenterBooster {
  userId: string;
  displayName: string;
  isActive: boolean;
  operationalStatus: "active" | "inactive";
  enabledGames: string[];
  assignedOrders: number;
  activatedAt: string | null;
  updatedAt: string;
  lastSeenAt: string | null;
  activityDataAvailability: "available" | "unavailable";
}
