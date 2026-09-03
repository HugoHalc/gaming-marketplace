import { createAuthServerClient } from "@/lib/supabase/auth";
import { createSecretServerClient } from "@/lib/supabase/server";
import type { CatalogGame, ServiceSummary } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import type { OrderRecord, OrderStatusEvent } from "../types/orders";

function money(cents: number) {
  return cents / 100;
}

function cents(amount: number) {
  return Math.round(amount * 100);
}

function nullableUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

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
  order_items: DbOrderItem[] | null;
};

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

const ORDER_SELECT = "id, order_number, status, payment_status, currency, subtotal_cents, discount_cents, total_cents, customer_note, created_at, updated_at, order_items(id, game_name, service_name, service_category, configuration, price_breakdown, rule_set_version, subtotal_cents, discount_cents, total_cents)";

export async function listCurrentUserOrders(): Promise<OrderRecord[]> {
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load orders.");
  return (data as unknown as DbOrder[]).map(mapOrder);
}

export async function getCurrentUserOrder(id: string): Promise<OrderRecord | null> {
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Unable to load order.");
  return data ? mapOrder(data as unknown as DbOrder) : null;
}

export async function getCurrentUserOrderHistory(orderId: string): Promise<OrderStatusEvent[]> {
  const supabase = await createAuthServerClient();
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

export async function createServerValidatedOrder(input: {
  userId: string;
  game: CatalogGame;
  service: ServiceSummary;
  selection: ConfiguratorSelection;
  quote: QuotePreview;
}) {
  const supabase = createSecretServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      status: "pending_payment",
      payment_status: "unpaid",
      currency: input.quote.currency,
      subtotal_cents: cents(input.quote.subtotal),
      discount_cents: cents(input.quote.discount),
      total_cents: cents(input.quote.total),
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) throw new Error("Unable to create order.");

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    game_id: nullableUuid(input.game.id),
    service_id: nullableUuid(input.service.id),
    game_name: input.game.name,
    service_name: input.service.name,
    service_category: input.service.category,
    configuration: input.selection,
    price_breakdown: input.quote.breakdown,
    rule_set_version: input.quote.ruleSetVersion,
    subtotal_cents: cents(input.quote.subtotal),
    discount_cents: cents(input.quote.discount),
    total_cents: cents(input.quote.total),
  });

  if (itemError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error("Unable to create order item.");
  }

  return { id: order.id as string, orderNumber: order.order_number as string };
}
