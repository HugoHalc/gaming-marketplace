import "server-only";
import { getCurrentUserOrder } from "@/features/orders/server/order-repository";

export type PayableOrderResult =
  | { ok: true; order: NonNullable<Awaited<ReturnType<typeof getCurrentUserOrder>>>; amountCents: number }
  | { ok: false; reason: "order" | "state" | "amount"; orderId?: string };

export async function getPayableCurrentUserOrder(orderId: string): Promise<PayableOrderResult> {
  if (!orderId) return { ok: false, reason: "order" };

  const order = await getCurrentUserOrder(orderId);
  if (!order || !order.items.length) return { ok: false, reason: "order" };
  if (order.paymentStatus === "paid" || order.status !== "pending_payment") {
    return { ok: false, reason: "state", orderId: order.id };
  }

  const itemTotal = order.items.reduce((sum, item) => sum + Math.round(item.total * 100), 0);
  const amountCents = Math.round(order.total * 100);
  if (
    itemTotal !== amountCents
    || amountCents < 50
    || order.items.some((item) => item.ruleSetVersion.startsWith("mock-"))
  ) {
    return { ok: false, reason: "amount", orderId: order.id };
  }

  return { ok: true, order, amountCents };
}
