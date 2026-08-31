import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getCurrentUserOrder } from "@/features/orders/server/order-repository";
import { createPendingStripePayment } from "@/features/payments/server/payment-repository";
import { getStripeClient, hasStripeSecretKey } from "@/lib/stripe";
import { createSecretServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return NextResponse.redirect(new URL("/login?next=/dashboard/orders", request.url), 303);
  if (!hasStripeSecretKey()) return NextResponse.redirect(new URL("/dashboard/orders?paymentError=stripe", request.url), 303);

  const form = await request.formData();
  const orderId = String(form.get("orderId") ?? "");
  if (!orderId) return NextResponse.redirect(new URL("/dashboard/orders?paymentError=order", request.url), 303);

  const order = await getCurrentUserOrder(orderId);
  if (!order || !order.items.length) return NextResponse.redirect(new URL("/dashboard/orders?paymentError=order", request.url), 303);
  if (order.paymentStatus === "paid" || order.status !== "pending_payment") {
    return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}`, request.url), 303);
  }

  const expectedTotal = order.items.reduce((sum, item) => sum + Math.round(item.total * 100), 0);
  const orderTotal = Math.round(order.total * 100);
  if (expectedTotal !== orderTotal || orderTotal < 50 || order.items.some((item) => item.ruleSetVersion.startsWith("mock-"))) {
    return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}?paymentError=amount`, request.url), 303);
  }

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
