import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getPayableCurrentUserOrder } from "@/features/payments/server/checkout-order";
import { createPendingPayPalPayment } from "@/features/payments/server/paypal-payment-repository";
import { createPayPalOrder, hasPayPalConfiguration } from "@/lib/paypal";
import { createSecretServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return NextResponse.redirect(new URL("/login?next=/dashboard/orders", request.url), 303);

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

  const { order, amountCents } = result;
  if (!hasPayPalConfiguration()) {
    return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}?paymentError=paypal`, request.url), 303);
  }

  try {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
    const item = order.items[0];
    const { order: paypalOrder, approvalUrl } = await createPayPalOrder({
      internalOrderId: order.id,
      orderNumber: order.orderNumber,
      amountCents,
      currency: order.currency,
      description: `${item.gameName} — ${item.serviceName}`,
      returnUrl: `${siteUrl}/api/paypal/capture?orderId=${encodeURIComponent(order.id)}`,
      cancelUrl: `${siteUrl}/dashboard/orders/${order.id}?checkout=cancelled&provider=paypal`,
    });

    await createPendingPayPalPayment({
      orderId: order.id,
      amountCents,
      currency: order.currency,
      paypalOrderId: paypalOrder.id,
    });

    const supabase = createSecretServerClient();
    await supabase
      .from("orders")
      .update({ payment_status: "pending" })
      .eq("id", order.id)
      .in("payment_status", ["unpaid", "failed"]);

    return NextResponse.redirect(approvalUrl, 303);
  } catch (error) {
    console.error("[paypal/orders] Unable to start checkout.", {
      orderId: order.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}?paymentError=paypal`, request.url), 303);
  }
}
