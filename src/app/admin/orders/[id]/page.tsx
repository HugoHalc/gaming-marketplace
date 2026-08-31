import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDollarSign, Gamepad2, UserRound } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireAdmin } from "@/features/auth/server/auth";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getAdminOrder, getAdminOrderHistory, nextAdminStatuses } from "@/features/admin/server/admin-orders";
import { updateOrderStatusAction } from "../../actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  queued: "Move to queue",
  in_progress: "Start fulfillment",
  completed: "Mark completed",
  cancelled: "Cancel order",
};

function formatMoney(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
function formatLabel(value: string) { return value.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase()); }
function formatValue(value: string | number | boolean) { return typeof value === "boolean" ? (value ? "Yes" : "No") : String(value); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const history = await getAdminOrderHistory(order.id);
  const nextStatuses = nextAdminStatuses(order.status);
  const item = order.items[0];
  const latestPayment = [...order.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return <><SiteHeader/><main className="py-10 sm:py-14"><Container>
    <Link href="/admin" className="inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-white"><ArrowLeft className="mr-2 size-4"/>Back to admin</Link>

    {query.updated ? <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-100">Order status updated successfully.</div> : null}
    {query.error ? <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/[0.07] p-4 text-sm text-rose-100">{query.error}</div> : null}

    <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
      <div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{order.orderNumber}</h1><OrderStatusBadge status={order.status}/></div><p className="mt-2 text-sm text-[var(--muted-foreground)]">Created {formatDate(order.createdAt)}</p></div>
      <div className="rounded-2xl border border-white/10 bg-[var(--surface)] px-5 py-4 lg:text-right"><p className="text-xs text-[var(--muted-foreground)]">Order total</p><p className="mt-1 text-2xl font-bold text-white">{formatMoney(order.total)}</p><p className="mt-1 text-xs text-white/45">Payment: {formatLabel(order.paymentStatus)}</p></div>
    </div>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <div className="flex items-center gap-2 text-violet-200"><UserRound className="size-4"/><p className="text-xs font-semibold">CUSTOMER</p></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3"><Info label="Name" value={order.customer.fullName || "Not provided"}/><Info label="Gamer tag" value={order.customer.gamerTag || "Not provided"}/><Info label="Phone" value={order.customer.phone || "Not provided"}/></div>
          {order.customerNote ? <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/15 p-4"><p className="text-xs text-[var(--muted-foreground)]">Customer note</p><p className="mt-2 text-sm text-white/85">{order.customerNote}</p></div> : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <div className="flex items-center gap-2 text-violet-200"><Gamepad2 className="size-4"/><p className="text-xs font-semibold">SERVICE</p></div><h2 className="mt-3 text-2xl font-semibold">{item?.serviceName ?? "Gaming service"}</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">{item?.gameName}</p>
          {item ? <><div className="my-6 h-px bg-white/10"/><h3 className="text-sm font-semibold">Configuration</h3><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(item.configuration).map(([key, value]) => <div key={key} className="rounded-xl border border-white/[0.07] bg-black/15 p-3"><dt className="text-xs text-[var(--muted-foreground)]">{formatLabel(key)}</dt><dd className="mt-1 text-sm font-medium text-white">{formatValue(value)}</dd></div>)}</dl>
          <div className="my-6 h-px bg-white/10"/><h3 className="text-sm font-semibold">Price breakdown</h3><div className="mt-4 space-y-3">{item.priceBreakdown.map((line, index) => <div key={`${line.label}-${index}`} className="flex justify-between gap-4 text-sm"><span className="text-[var(--muted-foreground)]">{line.label}</span><span className={line.amount < 0 ? "text-emerald-300" : "text-white"}>{line.amount < 0 ? "−" : ""}{formatMoney(Math.abs(line.amount))}</span></div>)}</div></> : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <div className="flex items-center gap-2 text-violet-200"><CircleDollarSign className="size-4"/><p className="text-xs font-semibold">PAYMENT</p></div>
          {latestPayment ? <div className="mt-4 grid gap-4 sm:grid-cols-3"><Info label="Status" value={formatLabel(latestPayment.status)}/><Info label="Amount" value={formatMoney(latestPayment.amount)}/><Info label="Paid at" value={latestPayment.paidAt ? formatDate(latestPayment.paidAt) : "Not paid"}/></div> : <p className="mt-4 text-sm text-[var(--muted-foreground)]">No Stripe payment record yet.</p>}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-500/[0.1] to-transparent p-6">
          <p className="text-xs font-semibold text-violet-300">FULFILLMENT</p><h2 className="mt-2 text-xl font-semibold">Update order status</h2>
          {nextStatuses.length ? <div className="mt-5 space-y-4">{nextStatuses.map((status) => <form key={status} action={updateOrderStatusAction} className="rounded-2xl border border-white/10 bg-black/15 p-4"><input type="hidden" name="orderId" value={order.id}/><input type="hidden" name="status" value={status}/><label className="block text-xs text-[var(--muted-foreground)]">Internal note (optional)<textarea name="note" maxLength={500} rows={2} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-violet-400" placeholder="Reason or fulfillment note"/></label><button className={`mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${status === "cancelled" ? "border border-rose-300/20 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15" : "bg-[var(--primary)] text-white hover:brightness-110"}`}>{statusLabels[status]}</button></form>)}</div> : <p className="mt-4 text-sm text-[var(--muted-foreground)]">No manual fulfillment transition is available from this status.</p>}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6"><p className="text-xs font-semibold text-violet-300">HISTORY</p><h2 className="mt-2 text-xl font-semibold">Status timeline</h2><div className="mt-6 space-y-5">{history.map((event) => <div key={event.id} className="flex gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.07]"><CheckCircle2 className="size-3.5 text-emerald-300"/></span><div><p className="text-sm font-medium">{formatLabel(event.toStatus)}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{formatDate(event.createdAt)}</p>{event.note ? <p className="mt-2 text-xs text-white/65">{event.note}</p> : null}</div></div>)}</div></section>
      </aside>
    </div>
  </Container></main></>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3"><p className="text-xs text-[var(--muted-foreground)]">{label}</p><p className="mt-1 text-sm font-medium text-white">{value}</p></div>;
}
