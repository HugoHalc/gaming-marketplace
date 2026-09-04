import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, Clock3, ListChecks, PackageCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireAdmin } from "@/features/auth/server/auth";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import type { OrderStatus } from "@/features/orders/types/orders";
import { listAdminOrders } from "@/features/admin/server/admin-orders";

export const metadata = { title: "Admin | VantaBoost" };
export const dynamic = "force-dynamic";

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending_payment", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "queued", label: "Queued" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function isOrderStatus(value: string | undefined): value is OrderStatus {
  return statuses.some((item) => item.value === value);
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  await requireAdmin();
  const query = await searchParams;
  const selectedStatus = isOrderStatus(query.status) ? query.status : undefined;
  const orders = await listAdminOrders(selectedStatus);
  const allOrders = selectedStatus ? await listAdminOrders() : orders;

  const paidRevenue = allOrders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.total, 0);
  const awaitingFulfillment = allOrders.filter((order) => ["paid", "queued", "in_progress"].includes(order.status)).length;
  const completed = allOrders.filter((order) => order.status === "completed").length;

  return <><SiteHeader/><main className="py-10 sm:py-14"><Container>
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div><p className="text-sm font-semibold text-violet-300">ADMINISTRATION</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Order operations</h1><p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">Review payments, move verified orders through fulfillment, and keep a complete status history.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/support" className="inline-flex w-fit rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] px-4 py-2 text-sm font-semibold text-[#82F5A4] hover:bg-[#39E56F]/[0.10]">Live Support</Link><Link href="/dashboard" className="inline-flex w-fit rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5">Customer dashboard</Link></div>
    </div>

    {query.error ? <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/[0.07] p-4 text-sm text-rose-100">{query.error}</div> : null}

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={<ListChecks className="size-5"/>} label="Total orders" value={String(allOrders.length)}/>
      <Stat icon={<Clock3 className="size-5"/>} label="Awaiting fulfillment" value={String(awaitingFulfillment)}/>
      <Stat icon={<PackageCheck className="size-5"/>} label="Completed" value={String(completed)}/>
      <Stat icon={<CircleDollarSign className="size-5"/>} label="Verified revenue" value={formatMoney(paidRevenue)}/>
    </section>

    <div className="mt-8 flex flex-wrap gap-2">
      <Link href="/admin" className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${!selectedStatus ? "border-violet-300/30 bg-violet-400/10 text-violet-100" : "border-white/10 text-white/55 hover:text-white"}`}>All</Link>
      {statuses.map((status) => <Link key={status.value} href={`/admin?status=${status.value}`} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selectedStatus === status.value ? "border-violet-300/30 bg-violet-400/10 text-violet-100" : "border-white/10 text-white/55 hover:text-white"}`}>{status.label}</Link>)}
    </div>

    <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6"><h2 className="font-semibold">{selectedStatus ? statuses.find((item) => item.value === selectedStatus)?.label : "All orders"}</h2><p className="mt-1 text-xs text-[var(--muted-foreground)]">{orders.length} result{orders.length === 1 ? "" : "s"}</p></div>
      {orders.length === 0 ? <div className="px-6 py-16 text-center text-sm text-[var(--muted-foreground)]">No orders match this filter.</div> : <div className="divide-y divide-white/[0.07]">{orders.map((order) => {
        const item = order.items[0];
        return <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.025] sm:px-6 lg:grid-cols-[1.15fr_1fr_.7fr_.7fr_auto] lg:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-white">{order.orderNumber}</span><OrderStatusBadge status={order.status}/></div><p className="mt-1 text-xs text-[var(--muted-foreground)]">{formatDate(order.createdAt)}</p></div>
          <div><p className="text-sm font-medium text-white">{item?.serviceName ?? "Gaming service"}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{item?.gameName ?? "—"}</p></div>
          <div><p className="text-xs text-[var(--muted-foreground)]">Customer</p><p className="mt-1 text-sm text-white">{order.customer.fullName || order.customer.gamerTag || "Customer"}</p></div>
          <div><p className="text-xs text-[var(--muted-foreground)]">Total</p><p className="mt-1 text-sm font-semibold text-white">{formatMoney(order.total)}</p><p className="mt-1 text-[11px] text-white/40">{order.paymentStatus}</p></div>
          <ArrowRight className="size-4 text-white/35"/>
        </Link>;
      })}</div>}
    </section>
  </Container></main></>;
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5"><div className="flex items-center justify-between text-violet-200"><span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>{icon}</div><p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p></div>;
}
