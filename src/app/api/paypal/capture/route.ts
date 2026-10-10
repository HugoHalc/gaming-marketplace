import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getCurrentUserOrder } from "@/features/orders/server/order-repository";
import {
  getPayPalPayment,
  markPayPalOrderCaptured,
} from "@/features/payments/server/paypal-payment-repository";
import { capturePayPalOrder, hasPayPalConfiguration } from "@/lib/paypal";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const identity = await getCurrentIdentity();
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId") ?? "";
  const paypalOrderId = url.searchParams.get("token") ?? "";
  if (!identity) {
    const next = orderId ? `/dashboard/orders/${encodeURIComponent(orderId)}` : "/dashboard/orders";
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url), 303);
  }
  if (!orderId || !paypalOrderId || !hasPayPalConfiguration()) {
    return NextResponse.redirect(new URL(`/dashboard/orders/${orderId || ""}?paymentError=paypal`, request.url), 303);
  }

  const order = await getCurrentUserOrder(orderId);
  if (!order) return NextResponse.redirect(new URL("/dashboard/orders?paymentError=order", request.url), 303);

  try {
    let payment = await getPayPalPayment(paypalOrderId);
    if (!payment || payment.order_id !== order.id) throw new Error("PayPal order does not match.");
    if (payment.status !== "paid") {
      try {
        const capturedOrder = await capturePayPalOrder(paypalOrderId);
        await markPayPalOrderCaptured(capturedOrder);
      } catch (error) {
        payment = await getPayPalPayment(paypalOrderId);
        if (payment?.status !== "paid") throw error;
      }
    }
    return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}?checkout=success&provider=paypal`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`/dashboard/orders/${order.id}?paymentError=paypal`, request.url), 303);
  }
}
