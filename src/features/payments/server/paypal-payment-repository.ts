import "server-only";
import type { PayPalOrder } from "@/lib/paypal";
import { createSecretServerClient } from "@/lib/supabase/server";

export type PayPalCaptureResource = {
  id?: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
  supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } };
};

export function paypalAmountToCents(value: string | undefined) {
  if (!value || !/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Invalid PayPal amount.");
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) throw new Error("Invalid PayPal amount.");
  return cents;
}

export async function createPendingPayPalPayment(input: {
  orderId: string;
  amountCents: number;
  currency: string;
  paypalOrderId: string;
}) {
  const supabase = createSecretServerClient();
  const { error } = await supabase.from("payments").upsert({
    order_id: input.orderId,
    provider: "paypal",
    status: "pending",
    amount_cents: input.amountCents,
    currency: input.currency.toUpperCase(),
    paypal_order_id: input.paypalOrderId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "paypal_order_id" });
  if (error) throw new Error("Unable to store PayPal payment.");
}

export async function getPayPalPayment(paypalOrderId: string) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, order_id, status, amount_cents, currency, paypal_order_id, paypal_capture_id")
    .eq("provider", "paypal")
    .eq("paypal_order_id", paypalOrderId)
    .maybeSingle();
  if (error) throw new Error("Unable to locate PayPal payment.");
  return data;
}

async function markPayPalCapturePaid(input: {
  paypalOrderId: string;
  captureId: string;
  amountCents: number;
  currency: string;
  payerId?: string;
}) {
  const payment = await getPayPalPayment(input.paypalOrderId);
  if (!payment) throw new Error("PayPal payment record was not found.");
  if (payment.amount_cents !== input.amountCents || payment.currency !== input.currency.toUpperCase()) {
    throw new Error("PayPal payment amount does not match the order.");
  }
  if (payment.status === "paid" && payment.paypal_capture_id === input.captureId) return;

  const supabase = createSecretServerClient();
  const now = new Date().toISOString();
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "paid",
      paypal_capture_id: input.captureId,
      paypal_payer_id: input.payerId ?? null,
      paid_at: now,
      updated_at: now,
    })
    .eq("id", payment.id)
    .eq("amount_cents", input.amountCents)
    .eq("currency", input.currency.toUpperCase());
  if (paymentError) throw new Error("Unable to update PayPal payment.");

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "paid", payment_status: "paid" })
    .eq("id", payment.order_id)
    .eq("total_cents", input.amountCents)
    .neq("payment_status", "paid");
  if (orderError) throw new Error("Unable to mark the order as paid.");
}

export async function markPayPalOrderCaptured(order: PayPalOrder) {
  if (order.status !== "COMPLETED") throw new Error("PayPal order is not completed.");
  const purchaseUnit = order.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.find((item) => item.status === "COMPLETED");
  if (!purchaseUnit || !capture?.id || !capture.amount?.currency_code) {
    throw new Error("PayPal capture is incomplete.");
  }
  const payment = await getPayPalPayment(order.id);
  if (!payment || (purchaseUnit.reference_id !== payment.order_id && purchaseUnit.custom_id !== payment.order_id)) {
    throw new Error("PayPal order reference does not match.");
  }
  await markPayPalCapturePaid({
    paypalOrderId: order.id,
    captureId: capture.id,
    amountCents: paypalAmountToCents(capture.amount.value),
    currency: capture.amount.currency_code,
    payerId: order.payer?.payer_id,
  });
}

export async function markPayPalWebhookCapturePaid(resource: PayPalCaptureResource) {
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
  if (!paypalOrderId || !resource.id || !resource.amount?.currency_code || resource.status !== "COMPLETED") {
    throw new Error("PayPal webhook capture is incomplete.");
  }
  await markPayPalCapturePaid({
    paypalOrderId,
    captureId: resource.id,
    amountCents: paypalAmountToCents(resource.amount.value),
    currency: resource.amount.currency_code,
  });
}

export async function markPayPalCaptureFailed(resource: PayPalCaptureResource) {
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
  if (!paypalOrderId) return;
  const payment = await getPayPalPayment(paypalOrderId);
  if (!payment || payment.status === "paid") return;
  const supabase = createSecretServerClient();
  await supabase.from("payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.id);
  await supabase.from("orders").update({ payment_status: "failed" }).eq("id", payment.order_id).eq("payment_status", "pending");
}

export async function markPayPalCaptureRefunded(input: {
  captureId?: string;
  amount?: { currency_code?: string; value?: string };
}) {
  if (!input.captureId || !input.amount?.currency_code || !input.amount.value) return;
  const supabase = createSecretServerClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, order_id, amount_cents, currency")
    .eq("provider", "paypal")
    .eq("paypal_capture_id", input.captureId)
    .maybeSingle();
  if (error) throw new Error("Unable to locate refunded PayPal payment.");
  if (!payment) return;
  if (
    payment.amount_cents !== paypalAmountToCents(input.amount.value)
    || payment.currency !== input.amount.currency_code.toUpperCase()
  ) return;
  await supabase.from("payments").update({ status: "refunded", updated_at: new Date().toISOString() }).eq("id", payment.id);
  await supabase.from("orders").update({ status: "refunded", payment_status: "refunded" }).eq("id", payment.order_id);
}

export async function hasProcessedPayPalEvent(eventId: string) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase.from("paypal_webhook_events").select("id").eq("id", eventId).maybeSingle();
  if (error) throw new Error("Unable to verify PayPal webhook event state.");
  return Boolean(data);
}

export async function markPayPalEventProcessed(eventId: string, eventType: string) {
  const supabase = createSecretServerClient();
  const { error } = await supabase.from("paypal_webhook_events").insert({ id: eventId, event_type: eventType });
  if (error && error.code !== "23505") throw new Error("Unable to record PayPal webhook event.");
}
