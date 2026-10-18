import "server-only";

import { createSecretServerClient } from "@/lib/supabase/server";
import {
  getAdminSupportConversation,
  listSupportMessages,
  type SupportConversationStatus,
} from "@/features/support/server/support-repository";
import type {
  ControlCenterBooster,
  ControlCenterOrder,
  ControlCenterOverview,
  ControlCenterSupportConversation,
  ControlCenterSupportMessage,
} from "@/features/control-center/types/contracts";
import { getControlCenterConfig } from "@/features/control-center/server/security";

export async function getControlCenterOverview(adminUserId: string): Promise<ControlCenterOverview> {
  const { data, error } = await createSecretServerClient().rpc("control_center_overview", {
    p_admin_user_id: adminUserId,
  });
  if (error) throw new Error("Unable to load Control Center overview.");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Control Center overview is unavailable.");
  return {
    totalOrders: Number(row.total_orders ?? 0),
    pendingAssignmentOrders: Number(row.pending_assignment_orders ?? 0),
    inProgressOrders: Number(row.in_progress_orders ?? 0),
    openSupportConversations: Number(row.open_support_conversations ?? 0),
    confirmedRevenue: { amount: Number(row.confirmed_revenue_cents ?? 0) / 100, currency: "USD" },
    updatedAt: String(row.updated_at),
  };
}

type OrderRow = {
  id: string;
  order_number: string;
  game_name: string | null;
  service_name: string | null;
  total_cents: number;
  currency: "USD";
  payment_status: string;
  fulfillment_status: string;
  assignee_id: string | null;
  assignment_kind: "booster" | "admin" | null;
  assignee_display_name: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listControlCenterOrders(input: {
  adminUserId: string;
  offset: number;
  limit: number;
  search: string;
  status: string | null;
  paymentStatus: string | null;
  game: string | null;
}) {
  const { data, error } = await createSecretServerClient().rpc("control_center_list_orders", {
    p_admin_user_id: input.adminUserId,
    p_search: input.search,
    p_status: input.status,
    p_payment_status: input.paymentStatus,
    p_game: input.game,
    p_offset: input.offset,
    p_limit: input.limit + 1,
  });
  if (error) throw new Error("Unable to load Control Center orders.");
  const rows = (data ?? []) as OrderRow[];
  const hasMore = rows.length > input.limit;
  const config = getControlCenterConfig();
  const orders: ControlCenterOrder[] = rows.slice(0, input.limit).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    game: row.game_name,
    service: row.service_name,
    amount: Number(row.total_cents) / 100,
    currency: row.currency,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    assignment: row.assignee_id && row.assignment_kind && row.assigned_at
      ? {
          kind: row.assignment_kind,
          assigneeId: row.assignee_id,
          displayName: row.assignee_display_name || (row.assignment_kind === "admin" ? "Administrator" : "Booster"),
          assignedAt: row.assigned_at,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    workspaceUrl: `${config.siteUrl}/admin/orders/${row.id}/workspace`,
  }));
  return { orders, hasMore };
}

type SupportQueueRow = {
  id: string;
  status: "open" | "closed";
  unread_count: number | string;
  latest_message_body: string | null;
  latest_message_sender_type: "visitor" | "admin" | null;
  latest_message_created_at: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

export async function listControlCenterSupport(input: {
  adminUserId: string;
  status?: SupportConversationStatus;
  offset: number;
  limit: number;
}) {
  const { data, error } = await createSecretServerClient().rpc("control_center_list_support", {
    p_admin_user_id: input.adminUserId,
    p_status: input.status ?? null,
    p_offset: input.offset,
    p_limit: input.limit + 1,
  });
  if (error) throw new Error("Unable to load Control Center support conversations.");
  const rows = (data ?? []) as SupportQueueRow[];
  const hasMore = rows.length > input.limit;
  const conversations: ControlCenterSupportConversation[] = rows.slice(0, input.limit).map((row) => ({
    id: row.id,
    status: row.status,
    unreadMessages: Number(row.unread_count ?? 0),
    lastMessage: row.latest_message_created_at && row.latest_message_sender_type
      ? {
          body: row.latest_message_body ?? "",
          senderType: row.latest_message_sender_type,
          createdAt: row.latest_message_created_at,
        }
      : null,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  return { conversations, hasMore };
}

export async function listControlCenterSupportMessages(input: {
  conversationId: string;
  beforeId?: string | null;
  limit: number;
}) {
  const conversation = await getAdminSupportConversation(input.conversationId);
  if (!conversation) return null;
  const result = await listSupportMessages(input.conversationId, {
    beforeId: input.beforeId,
    limit: input.limit,
  });
  const messages: ControlCenterSupportMessage[] = result.messages.map((message: { id: string; conversationId: string; senderType: "visitor" | "admin"; body: string; createdAt: string }) => ({
    id: message.id,
    conversationId: message.conversationId,
    senderType: message.senderType,
    body: message.body,
    createdAt: message.createdAt,
  }));
  return { messages, hasMore: result.hasMore, nextCursor: result.nextCursor };
}

type BoosterRow = {
  user_id: string;
  full_name: string | null;
  gamer_tag: string | null;
  is_active: boolean;
  activated_at: string | null;
  updated_at: string;
  game_slugs: string[] | null;
  assigned_order_count: number | string;
};

export async function listControlCenterBoosters(input: {
  adminUserId: string;
  offset: number;
  limit: number;
  search: string;
  activeOnly: boolean;
}) {
  const { data, error } = await createSecretServerClient().rpc("control_center_list_boosters", {
    p_admin_user_id: input.adminUserId,
    p_search: input.search,
    p_active_only: input.activeOnly,
    p_offset: input.offset,
    p_limit: input.limit + 1,
  });
  if (error) throw new Error("Unable to load Control Center boosters.");
  const rows = (data ?? []) as BoosterRow[];
  const hasMore = rows.length > input.limit;
  const boosters: ControlCenterBooster[] = rows.slice(0, input.limit).map((row) => ({
    userId: row.user_id,
    displayName: row.gamer_tag || row.full_name || "Booster",
    isActive: Boolean(row.is_active),
    operationalStatus: row.is_active ? "active" : "inactive",
    enabledGames: row.game_slugs ?? [],
    assignedOrders: Number(row.assigned_order_count ?? 0),
    activatedAt: row.activated_at,
    updatedAt: row.updated_at,
    // No current server-owned telemetry can prove online/offline or last activity.
    // User-editable auth metadata is deliberately excluded from this contract.
    lastSeenAt: null,
    activityDataAvailability: "unavailable",
  }));
  return { boosters, hasMore };
}
