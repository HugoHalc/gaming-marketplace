import "server-only";
import type Stripe from "stripe";
import { createSecretServerClient } from "@/lib/supabase/server";

export async function createPendingStripePayment(input: {
  orderId: string;
  amountCents: number;
  currency: string;
  session: Stripe.Checkout.Session;
}) {
  const supabase = createSecretServerClient();
  const { error } = await supabase.from("payments").upsert({
    order_id: input.orderId,
    provider: "stripe",
    status: "pending",
    amount_cents: input.amountCents,
    currency: input.currency.toUpperCase(),
    stripe_checkout_session_id: input.session.id,
    stripe_payment_intent_id:
      typeof input.session.payment_intent === "string" ? input.session.payment_intent : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_checkout_session_id" });
  if (error) throw new Error("Unable to store payment session.");
}

export async function hasProcessedStripeEvent(eventId: string) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  if (error) throw new Error("Unable to verify webhook event state.");
  return Boolean(data);
}

export async function markStripeEventProcessed(event: Stripe.Event) {
  const supabase = createSecretServerClient();
  const { error } = await supabase.from("stripe_webhook_events").insert({
    id: event.id,
    event_type: event.type,
  });
  if (error && error.code !== "23505") throw new Error("Unable to record webhook event.");
}

async function findPaymentOrderBySession(sessionId: string) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, order_id, status")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error("Unable to locate payment.");
  return data;
}

export async function markCheckoutSessionPaid(session: Stripe.Checkout.Session) {
  const payment = await findPaymentOrderBySession(session.id);
  const orderId = payment?.order_id ?? session.metadata?.orderId;
  if (!orderId) throw new Error("Stripe session is missing an order reference.");

  const supabase = createSecretServerClient();
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "paid",
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", session.id);
  if (paymentError) throw new Error("Unable to update payment.");

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "paid", payment_status: "paid" })
    .eq("id", orderId)
    .neq("payment_status", "paid");
  if (orderError) throw new Error("Unable to mark order as paid.");
}

export async function markCheckoutSessionFailed(session: Stripe.Checkout.Session) {
  const payment = await findPaymentOrderBySession(session.id);
  if (!payment || payment.status === "paid") return;
  const supabase = createSecretServerClient();
  await supabase
    .from("payments")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", payment.id);
  await supabase
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("id", payment.order_id)
    .eq("payment_status", "pending");
}

export async function markPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createSecretServerClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, status")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle();
  if (!payment || payment.status === "paid") return;
  await supabase.from("payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.id);
  await supabase.from("orders").update({ payment_status: "failed" }).eq("id", payment.order_id).neq("payment_status", "paid");
}

export async function markChargeRefunded(charge: Stripe.Charge) {
  if (!charge.refunded || !charge.payment_intent) return;
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id;
  const supabase = createSecretServerClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (!payment) return;
  await supabase.from("payments").update({ status: "refunded", updated_at: new Date().toISOString() }).eq("id", payment.id);
  await supabase.from("orders").update({ status: "refunded", payment_status: "refunded" }).eq("id", payment.order_id);
}
