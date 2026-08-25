import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  hasProcessedStripeEvent,
  markChargeRefunded,
  markCheckoutSessionFailed,
  markCheckoutSessionPaid,
  markPaymentIntentFailed,
  markStripeEventProcessed,
} from "@/features/payments/server/payment-repository";
import { getStripeClient, getStripeWebhookSecret, hasStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasStripeWebhookSecret()) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  const rawBody = await request.text();
  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (await hasProcessedStripeEvent(event.id)) return NextResponse.json({ received: true, duplicate: true });

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") await markCheckoutSessionPaid(session);
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      await markCheckoutSessionFailed(event.data.object as Stripe.Checkout.Session);
      break;
    case "payment_intent.payment_failed":
      await markPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case "charge.refunded":
      await markChargeRefunded(event.data.object as Stripe.Charge);
      break;
    default:
      break;
  }

  await markStripeEventProcessed(event);
  return NextResponse.json({ received: true });
}
