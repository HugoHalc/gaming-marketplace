import { createSecretServerClient } from "@/lib/supabase/server";
import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import type { OrderRecord, OrderStatus, OrderStatusEvent, PaymentStatus } from "@/features/orders/types/orders";

type DbOrderItem = {
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

type DbPayment = {
  id: string;
  provider: "stripe";
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  amount_cents: number;
  currency: "USD";
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
};

type DbProfile = {
  full_name: string | null;
  gamer_tag: string | null;
  phone: string | null;
};

type DbOrder = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  currency: "USD";
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  order_items: DbOrderItem[] | null;
  payments: DbPayment[] | null;
  profiles: DbProfile | DbProfile[] | null;
};

export interface AdminPaymentRecord {
  id: string;
  provider: "stripe";
  status: DbPayment["status"];
  amount: number;
  currency: "USD";
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminOrderRecord extends OrderRecord {
  userId: string;
  customer: {
    fullName: string | null;
    gamerTag: string | null;
    phone: string | null;
  };
  payments: AdminPaymentRecord[];
}

const ORDER_SELECT = `
  id, user_id, order_number, status, payment_status, currency,
  subtotal_cents, discount_cents, total_cents, customer_note, created_at, updated_at,
  profiles!orders_user_id_fkey(full_name, gamer_tag, phone),
  order_items(id, game_name, service_name, service_category, configuration, price_breakdown, rule_set_version, subtotal_cents, discount_cents, total_cents),
  payments(id, provider, status, amount_cents, currency, stripe_checkout_session_id, stripe_payment_intent_id, paid_at, created_at)
`;

function money(cents: number) {
  return cents / 100;
}

function firstProfile(value: DbOrder["profiles"]): DbProfile | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function mapOrder(row: DbOrder): AdminOrderRecord {
  const profile = firstProfile(row.profiles);
  return {
    id: row.id,
    userId: row.user_id,
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
    customer: {
      fullName: profile?.full_name ?? null,
      gamerTag: profile?.gamer_tag ?? null,
      phone: profile?.phone ?? null,
    },
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
    payments: (row.payments ?? []).map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      status: payment.status,
      amount: money(payment.amount_cents),
      currency: payment.currency,
      checkoutSessionId: payment.stripe_checkout_session_id,
      paymentIntentId: payment.stripe_payment_intent_id,
      paidAt: payment.paid_at,
      createdAt: payment.created_at,
    })),
  };
}

export async function listAdminOrders(status?: OrderStatus): Promise<AdminOrderRecord[]> {
  const supabase = createSecretServerClient();
  let query = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load admin orders: ${error.message}`);
  return (data as unknown as DbOrder[]).map(mapOrder);
}

export async function getAdminOrder(id: string): Promise<AdminOrderRecord | null> {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Unable to load admin order: ${error.message}`);
  return data ? mapOrder(data as unknown as DbOrder) : null;
}

export async function getAdminOrderHistory(orderId: string): Promise<Array<OrderStatusEvent & { changedBy: string | null }>> {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("order_status_history")
    .select("id, from_status, to_status, note, changed_by, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Unable to load order history: ${error.message}`);
  return (data ?? []).map((event) => ({
    id: event.id,
    fromStatus: event.from_status as OrderStatusEvent["fromStatus"],
    toStatus: event.to_status as OrderStatusEvent["toStatus"],
    note: event.note,
    changedBy: event.changed_by,
    createdAt: event.created_at,
  }));
}

export function nextAdminStatuses(status: OrderStatus): OrderStatus[] {
  if (status === "pending_payment") return ["cancelled"];
  if (status === "paid") return ["queued", "cancelled"];
  if (status === "queued") return ["in_progress", "cancelled"];
  if (status === "in_progress") return ["completed", "cancelled"];
  return [];
}
