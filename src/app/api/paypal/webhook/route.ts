import { NextResponse } from "next/server";
import {
  hasProcessedPayPalEvent,
  markPayPalCaptureFailed,
  markPayPalCaptureRefunded,
  markPayPalEventProcessed,
  markPayPalWebhookCapturePaid,
  type PayPalCaptureResource,
} from "@/features/payments/server/paypal-payment-repository";
import { hasPayPalWebhookConfiguration, verifyPayPalWebhookSignature } from "@/lib/paypal";

export const runtime = "nodejs";

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: PayPalCaptureResource;
};

export async function POST(request: Request) {
  if (!hasPayPalWebhookConfiguration()) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return NextResponse.json({ error: "Missing PayPal signature." }, { status: 400 });
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(await request.text()) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  if (!event.id || !event.event_type || !event.resource) {
    return NextResponse.json({ error: "Invalid webhook event." }, { status: 400 });
  }

  try {
    const verified = await verifyPayPalWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookEvent: event,
    });
    if (!verified) return NextResponse.json({ error: "Invalid PayPal signature." }, { status: 400 });
    if (await hasProcessedPayPalEvent(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await markPayPalWebhookCapturePaid(event.resource);
        break;
      case "PAYMENT.CAPTURE.DENIED":
        await markPayPalCaptureFailed(event.resource);
        break;
      case "PAYMENT.CAPTURE.REVERSED":
        await markPayPalCaptureRefunded({ captureId: event.resource.id, amount: event.resource.amount });
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
        await markPayPalCaptureRefunded({
          captureId: event.resource.supplementary_data?.related_ids?.capture_id,
          amount: event.resource.amount,
        });
        break;
      default:
        break;
    }

    await markPayPalEventProcessed(event.id, event.event_type);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Unable to process webhook." }, { status: 500 });
  }
}
