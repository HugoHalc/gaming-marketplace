import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getPayableCurrentUserOrder } from "@/features/payments/server/checkout-order";
import { createPendingStripePayment } from "@/features/payments/server/payment-repository";
import { getStripeClient, hasStripeSecretKey } from "@/lib/stripe";
import { createSecretServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return NextResponse.redirect(new URL("/login?next=/dashboard/orders", request.url), 303);
  if (!hasStripeSecretKey()) return NextResponse.redirect(new URL("/dashboard/orders?paymentError=stripe", request.url), 303);

  const form = await request.formData();
  const result = await getPayableCurrentUserOrder(String(form.get("orderId") ?? ""));
  if (!result.ok) {
    if (result.reason === "state" && result.orderId) {
      return NextResponse.redirect(new URL(`/dashboard/orders/${result.orderId}`, request.url), 303);
    }
    const destination = result.orderId
      ? `/dashboard/orders/${result.orderId}?paymentError=${result.reason}`
      : `/dashboard/orders?paymentError=${result.reason}`;
    return NextResponse.redirect(new URL(destination, request.url), 303);
  }
  const { order } = result;
  const orderTotal = Math.round(order.total * 100);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const stripe = getStripeClient();
  const item = order.items[0];
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: identity.email || undefined,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId: identity.id },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.orderNumber, userId: identity.id } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: orderTotal,
            product_data: {
              name: `${item.gameName} — ${item.serviceName}`,
              description: `Order ${order.orderNumber}`,
            },
          },
        },
      ],
      success_url: `${siteUrl}/dashboard/orders/${order.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/orders/${order.id}?checkout=cancelled`,
      allow_promotion_codes: false,
    },
    { idempotencyKey: `checkout_${order.id}_${order.updatedAt}` },
  );

  if (!session.url) return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}?paymentError=session`, request.url), 303);

  await createPendingStripePayment({ orderId: order.id, amountCents: orderTotal, currency: order.currency, session });

  const supabase = createSecretServerClient();
  await supabase
    .from("orders")
    .update({ payment_status: "pending" })
    .eq("id", order.id)
    .in("payment_status", ["unpaid", "failed"]);

  return NextResponse.redirect(session.url, 303);
}
