import "server-only";

import { createAuthServerClient } from "@/lib/supabase/auth";
import { createSecretServerClient } from "@/lib/supabase/server";
import { requireBooster } from "@/features/auth/server/auth";
import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import type { OrderRecord, OrderStatusEvent } from "@/features/orders/types/orders";

function money(cents: number) {
  return cents / 100;
}

type DbItem = {
  id: string;
  game_name: string;
  service_name: string;
  service_category: OrderRecord["items"][number]["serviceCategory"];
  configuration: ConfiguratorSelection;
  price_breakdown: QuotePreview["breakdown"];
  rule_set_version: string;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
};

type DbOrder = {
  id: string;
  order_number: string;
  status: OrderRecord["status"];
  payment_status: OrderRecord["paymentStatus"];
  currency: "USD";
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  order_items: DbItem[] | null;
};

const ORDER_SELECT =
  "id, order_number, status, payment_status, currency, subtotal_cents, discount_cents, total_cents, customer_note, created_at, updated_at, order_items(id, game_name, service_name, service_category, configuration, price_breakdown, rule_set_version, subtotal_cents, discount_cents, total_cents)";

function mapOrder(row: DbOrder): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: row.payment_status,
    currency: row.currency,
    subtotal: money(row.subtotal_cents),
    discount: money(row.discount_cents),
    total: money(row.total_cents),
    customerNote: row.customer_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      gameName: item.game_name,
      serviceName: item.service_name,
      serviceCategory: item.service_category,
      configuration: item.configuration ?? {},
      priceBreakdown: item.price_breakdown ?? [],
      ruleSetVersion: item.rule_set_version,
      subtotal: money(item.subtotal_cents),
      discount: money(item.discount_cents),
      total: money(item.total_cents),
    })),
  };
}

export interface BoosterOrderCard {
  order: OrderRecord;
  payout: number;
  payoutRateBps: number;
  assignedAt: string | null;
}

export async function listAvailableBoosterOrders(): Promise<BoosterOrderCard[]> {
  const booster = await requireBooster();
  const supabase = createSecretServerClient();

  const [{ data: rows, error }, { data: assignments, error: assignmentError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("payment_status", "paid")
        .in("status", ["paid", "queued"])
        .order("created_at", { ascending: true })
        .limit(100),
      supabase
        .from("order_booster_assignments")
        .select("order_id")
        .eq("is_active", true),
    ]);

  if (error || assignmentError) throw new Error("Unable to load available orders.");

  const claimed = new Set((assignments ?? []).map((row) => row.order_id as string));
  const rate = booster.boosterProfile.payoutRateBps;

  return ((rows ?? []) as unknown as DbOrder[])
    .filter((row) => !claimed.has(row.id))
    .map((row) => ({
      order: mapOrder(row),
      payout: Math.floor(row.total_cents * rate / 10000) / 100,
      payoutRateBps: rate,
      assignedAt: null,
    }));
}

async function listAssignedOrders(): Promise<BoosterOrderCard[]> {
  const booster = await requireBooster();
  const supabase = createSecretServerClient();

  const { data: assignments, error } = await supabase
    .from("order_booster_assignments")
    .select("order_id, payout_cents, payout_rate_bps, assigned_at")
    .eq("booster_id", booster.id)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  if (error) throw new Error("Unable to load booster assignments.");
  if (!assignments?.length) return [];

  const ids = assignments.map((row) => row.order_id as string);
  const { data: rows, error: orderError } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .in("id", ids);

  if (orderError) throw new Error("Unable to load assigned orders.");

  const byId = new Map(
    ((rows ?? []) as unknown as DbOrder[]).map((row) => [row.id, row]),
  );

  return assignments.flatMap((assignment) => {
    const row = byId.get(assignment.order_id as string);
    if (!row) return [];
    return [{
      order: mapOrder(row),
      payout: money(assignment.payout_cents as number),
      payoutRateBps: assignment.payout_rate_bps as number,
      assignedAt: assignment.assigned_at as string,
    }];
  });
}

export async function listActiveBoosterOrders() {
  const rows = await listAssignedOrders();
  return rows.filter(({ order }) =>
    ["paid", "queued", "in_progress"].includes(order.status),
  );
}

export async function listCompletedBoosterOrders() {
  const rows = await listAssignedOrders();
  return rows.filter(({ order }) => order.status === "completed");
}

export async function claimBoosterOrder(orderId: string) {
  await requireBooster();
  const supabase = await createAuthServerClient();

  const { data, error } = await supabase.rpc("claim_order_for_booster", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(error.message || "Unable to claim this order.");
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error("Unable to claim this order.");

  return {
    orderId: result.order_id as string,
    payout: money(result.payout_cents as number),
    payoutRateBps: result.payout_rate_bps as number,
  };
}

export async function getAssignedBoosterOrder(orderId: string) {
  const booster = await requireBooster();
  const supabase = createSecretServerClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("order_booster_assignments")
    .select("order_id, payout_cents, payout_rate_bps, assigned_at")
    .eq("order_id", orderId)
    .eq("booster_id", booster.id)
    .eq("is_active", true)
    .maybeSingle();

  if (assignmentError) throw new Error("Unable to load booster assignment.");
  if (!assignment) return null;

  const { data: row, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error("Unable to load assigned order.");
  if (!row) return null;

  return {
    order: mapOrder(row as unknown as DbOrder),
    payout: money(assignment.payout_cents as number),
    payoutRateBps: assignment.payout_rate_bps as number,
    assignedAt: assignment.assigned_at as string,
  };
}

export async function getAssignedBoosterOrderHistory(
  orderId: string,
): Promise<OrderStatusEvent[]> {
  const assigned = await getAssignedBoosterOrder(orderId);
  if (!assigned) return [];

  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("order_status_history")
    .select("id, from_status, to_status, note, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Unable to load order history.");

  return (data ?? []).map((event) => ({
    id: event.id,
    fromStatus: event.from_status as OrderStatusEvent["fromStatus"],
    toStatus: event.to_status as OrderStatusEvent["toStatus"],
    note: event.note,
    createdAt: event.created_at,
  }));
}
