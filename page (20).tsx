import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireUser } from "@/features/auth/server/auth";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function OrdersPage() {
  await requireUser();
  const orders = await listCurrentUserOrders();

  return <><SiteHeader/><main className="py-12 sm:py-16"><Container>
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-sm font-semibold text-violet-300">ORDERS</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Your services</h1><p className="mt-3 text-[var(--muted-foreground)]">Review active and previous orders from your account.</p></div>
      <Link href="/games" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5">Browse services</Link>
    </div>

    {orders.length ? <div className="mt-8 space-y-4">{orders.map((order) => {
      const item = order.items[0];
      return <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="group grid gap-5 rounded-2xl border border-white/10 bg-[var(--surface)] p-5 transition-colors hover:border-white/20 md:grid-cols-[1fr_auto] md:items-center">
        <div><div className="flex flex-wrap items-center gap-3"><p className="font-semibold text-white">{order.orderNumber}</p><OrderStatusBadge status={order.status}/></div><p className="mt-2 text-sm font-medium text-white/85">{item ? `${item.gameName} · ${item.serviceName}` : "Gaming service"}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">Created {formatDate(order.createdAt)}</p></div>
        <div className="flex items-center justify-between gap-5 md:justify-end"><p className="text-lg font-bold text-white">{formatMoney(order.total)}</p><ArrowRight className="size-4 text-white/40 transition-transform group-hover:translate-x-1"/></div>
      </Link>;
    })}</div> : <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center"><PackageOpen className="mx-auto size-8 text-white/30"/><h2 className="mt-4 text-lg font-semibold">No orders yet</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Configure a gaming service to create your first order.</p><Link href="/games" className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold">Explore games</Link></div>}
  </Container></main></>;
}
