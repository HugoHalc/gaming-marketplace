import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import {
  getCurrentUserOrder,
  getCurrentUserOrderHistory,
} from "@/features/orders/server/order-repository";

export const dynamic = "force-dynamic";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
function formatValue(value: string | number | boolean) {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string; paymentError?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const order = await getCurrentUserOrder(id);
  if (!order) notFound();

  const history = await getCurrentUserOrderHistory(order.id);
  const item = order.items[0];
  const canPay =
    order.status === "pending_payment" && order.paymentStatus !== "paid";
  const statusMessage: Record<string, string> = {
    pending_payment:
      "Complete payment to reserve your place in the fulfillment queue.",
    paid: "Payment is verified. Your order is ready to enter the fulfillment queue.",
    queued: "Your order is ready for fulfillment to begin.",
    in_progress: "Fulfillment is currently in progress.",
    completed: "Your service has been completed.",
    cancelled: "This order was cancelled.",
    refunded: "This order has been refunded.",
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center text-xs text-[#A0AAA4] hover:text-[#F4F7F5]"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to orders
      </Link>

      {query.checkout === "success" ? (
        <div className="mt-5 rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] p-4 text-sm text-[#82F5A4]">
          Payment submitted successfully. Stripe is confirming the payment and
          this page will reflect the verified status.
        </div>
      ) : null}
      {query.checkout === "cancelled" ? (
        <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
          Checkout was cancelled. Your order is still saved and you can try
          payment again.
        </div>
      ) : null}
      {query.paymentError ? (
        <div className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/[0.06] p-4 text-sm text-rose-100">
          We could not start secure checkout. Please try again.
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-gaming-value text-2xl font-bold tracking-[-0.035em] text-[#F4F7F5] sm:text-3xl">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-xs text-[#667069]">
            Created {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.11em] text-[#667069]">
            Order total
          </p>
          <p className="font-gaming-value mt-1 text-3xl font-bold text-[#F4F7F5]">
            {formatMoney(order.total)}
          </p>
          <p className="mt-1 text-[10px] text-[#667069]">
            {order.paymentStatus === "paid"
              ? "Paid"
              : order.paymentStatus === "pending"
                ? "Payment pending"
                : "Payment not completed"}
          </p>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#0E1411] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200/60">
              Current status
            </p>
            <p className="mt-1 text-sm text-[#A0AAA4]">
              {statusMessage[order.status]}
            </p>
          </div>
          <Link
            href="/dashboard/notifications"
            className="text-xs font-semibold text-blue-200/75 hover:text-blue-100"
          >
            View notifications
          </Link>
        </div>
      </section>

      {canPay ? (
        <section className="mt-5 rounded-2xl border border-blue-300/[0.14] bg-blue-400/[0.035] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
                <ShieldCheck className="size-4" />
                Secure checkout
              </div>
              <h2 className="mt-2 text-lg font-semibold text-[#F4F7F5]">
                Complete payment with Stripe
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#A0AAA4]">
                Your stored order total is validated on the server. Payment
                details are entered on Stripe&apos;s hosted checkout and never
                pass through BoostingPedia.
              </p>
            </div>
            <form action="/api/checkout" method="post" className="shrink-0">
              <input type="hidden" name="orderId" value={order.id} />
              <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#39E56F] px-5 text-sm font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
                <CreditCard className="mr-2 size-4" />
                Pay {formatMoney(order.total)}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {order.paymentStatus === "paid" ? (
        <section className="mt-5 rounded-2xl border border-[#39E56F]/18 bg-[#39E56F]/[0.045] p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-[#82F5A4]" />
            <div>
              <p className="font-semibold text-[#F4F7F5]">Payment verified</p>
              <p className="mt-1 text-sm text-[#A0AAA4]">
                Stripe confirmed this payment. The order can now move into
                fulfillment.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-[1.4rem] border border-white/[0.07] bg-[#0E1411] p-5 sm:p-6">
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200/60">
            Service
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#F4F7F5]">
            {item?.serviceName ?? "Gaming service"}
          </h2>
          <p className="mt-1 text-sm text-[#A0AAA4]">{item?.gameName}</p>

          {item ? (
            <>
              <div className="my-5 h-px bg-white/[0.07]" />
              <h3 className="text-sm font-semibold text-[#F4F7F5]">
                Configuration
              </h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(item.configuration).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-3"
                  >
                    <dt className="text-[10px] text-[#667069]">
                      {formatLabel(key)}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-[#F4F7F5]">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="my-5 h-px bg-white/[0.07]" />
              <h3 className="text-sm font-semibold text-[#F4F7F5]">
                Price breakdown
              </h3>
              <div className="mt-4 space-y-3">
                {item.priceBreakdown.map((line, index) => (
                  <div
                    key={`${line.label}-${index}`}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-[#A0AAA4]">{line.label}</span>
                    <span
                      className={
                        line.amount < 0 ? "text-[#82F5A4]" : "text-[#F4F7F5]"
                      }
                    >
                      {line.amount < 0 ? "−" : ""}
                      {formatMoney(Math.abs(line.amount))}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[10px] text-[#667069]">
                Pricing rules: {item.ruleSetVersion}
              </p>
            </>
          ) : null}
        </section>

        <aside className="rounded-[1.4rem] border border-white/[0.07] bg-[#0E1411] p-5 sm:p-6">
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200/60">
            Status
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[#F4F7F5]">
            Order timeline
          </h2>

          {history.length ? (
            <div className="mt-5 space-y-4">
              {history.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border ${
                      index === history.length - 1
                        ? "border-cyan-300/[0.18] bg-cyan-400/[0.06]"
                        : "border-white/[0.08] bg-[#090D0B]"
                    }`}
                  >
                    <CheckCircle2
                      className={`size-3.5 ${
                        index === history.length - 1
                          ? "text-cyan-200"
                          : "text-[#667069]"
                      }`}
                    />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#F4F7F5]">
                      {formatLabel(event.toStatus)}
                    </p>
                    <p className="mt-1 text-[10px] text-[#667069]">
                      {formatDate(event.createdAt)}
                    </p>
                    {event.note ? (
                      <p className="mt-2 text-xs text-[#A0AAA4]">
                        {event.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-xs leading-5 text-[#A0AAA4]">
              No status history has been recorded yet.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
