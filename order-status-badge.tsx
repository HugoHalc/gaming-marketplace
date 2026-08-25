import type { OrderStatus } from "../types/orders";

const labels: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  queued: "Queued",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const positive = status === "completed" || status === "paid";
  const active = status === "queued" || status === "in_progress";
  const negative = status === "cancelled" || status === "refunded";
  const className = positive
    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
    : active
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
      : negative
        ? "border-rose-300/20 bg-rose-400/10 text-rose-200"
        : "border-amber-300/20 bg-amber-400/10 text-amber-200";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{labels[status]}</span>;
}
