import type { OrderStatus } from "../types/orders";

const labels: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  queued: "Ready for assignment",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const styles: Record<OrderStatus, string> = {
  pending_payment: "border-amber-300/[0.18] bg-amber-300/[0.07] text-amber-200",
  paid: "border-blue-300/[0.16] bg-blue-400/[0.07] text-blue-200",
  queued: "border-blue-300/[0.16] bg-blue-400/[0.07] text-blue-200",
  in_progress: "border-cyan-300/[0.18] bg-cyan-400/[0.07] text-cyan-200",
  completed: "border-[#39E56F]/20 bg-[#39E56F]/[0.07] text-[#82F5A4]",
  cancelled: "border-rose-300/[0.16] bg-rose-400/[0.06] text-rose-200",
  refunded: "border-violet-300/[0.16] bg-violet-400/[0.06] text-violet-200",
};

export function orderStatusLabel(status: OrderStatus) {
  return labels[status];
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
