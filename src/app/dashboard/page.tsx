import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Package,
} from "lucide-react";
import { requireUser } from "@/features/auth/server/auth";
import { listDashboardCustomerOrders, customerBoardTimestamp } from "./customer-orders";
import { CustomerOrderCard } from "@/components/dashboard/customer-order-card";
import { OrderBoardCard, orderBoardPageClass } from "@/components/orders/order-board-primitives";
import { OrderLocalDate } from "@/components/booster/order-local-date";
import { shortBoardOrderIds } from "@/features/booster/presentation/order-board";
import { projectCustomerOrder } from "@/features/orders/presentation/customer-order-board";
import { createSecretServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard | BoostingPedia" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await requireUser();
  const orders = await listDashboardCustomerOrders(identity.id);
  const supabase = createSecretServerClient();

  const activeOrders = orders.filter((order) =>
    ["paid", "queued", "in_progress"].includes(order.status),
  );
  const completedOrders = orders.filter((order) => order.status === "completed");

  const orderIds = orders.map((order) => order.id);
  const { data: operationalRows } = orderIds.length
    ? await supabase
        .from("order_operational_states")
        .select("order_id, state")
        .in("order_id", orderIds)
    : { data: [] };

  const operationalByOrder = new Map(
    (operationalRows ?? []).map((row) => [
      row.order_id as string,
      row.state as string,
    ]),
  );

  const highlighted = activeOrders[0] ?? orders[0] ?? null;
  const displayName =
    identity.profile?.gamer_tag ||
    identity.profile?.full_name ||
    identity.email.split("@")[0];

  function statusCopy(orderId: string, status: string) {
    const operational = operationalByOrder.get(orderId);

    if (operational === "delivered") return "Waiting for your confirmation";
    if (operational === "waiting_customer") return "Waiting for your response";
    if (operational === "issue") return "Under review";
    if (operational === "in_progress" || status === "in_progress") return "In progress";
    if (operational === "accepted") return "Booster assigned";
    if (status === "paid" || status === "queued") return "Ready for assignment";
    if (status === "completed") return "Completed";
    return status.replace(/_/g, " ");
  }

  const shortIds = shortBoardOrderIds(orders);
  return <div className={orderBoardPageClass}>
    <header className="min-w-0"><h1 className="break-words text-[28px] font-bold tracking-tight">Welcome back, {displayName}</h1><p className="mt-1 text-xs leading-5 text-[#A4AEA8]">Track your active services and open an order whenever you need an update.</p></header>
    <div className="mt-3 grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
      {[["Active Orders", activeOrders.length], ["Completed Orders", completedOrders.length], ["Total Orders", orders.length]].map(([label, count]) => <OrderBoardCard key={label} className="border-[#39E56F]/15 p-3"><p className="break-words text-[11px] text-[#A4AEA8]">{label}</p><p className="mt-1 text-xl font-semibold">{count}</p></OrderBoardCard>)}
    </div>
    <div className="mt-4 grid min-w-0 items-start gap-4 xl:grid-cols-2">
      <section className="min-w-0" aria-label="Active Order">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Active Order</h2><Link href="/dashboard/orders" className="inline-flex min-h-11 items-center text-xs font-semibold text-[#82F5A4] focus-visible:outline-2 focus-visible:outline-[#39E56F]">View all orders</Link></div>
        {highlighted ? <CustomerOrderCard order={projectCustomerOrder(highlighted, operationalByOrder.get(highlighted.id) ?? null)} shortId={shortIds.get(highlighted.id)} now={customerBoardTimestamp()} /> : <OrderBoardCard className="border-white/[0.08] p-5"><Package aria-hidden="true" className="size-5 text-[#A4AEA8]" /><h3 className="mt-3 text-sm font-semibold">No orders yet</h3><p className="mt-1 text-xs text-[#A4AEA8]">Your active service will appear here after your first order.</p><Link href="/games" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] focus-visible:outline-2 focus-visible:outline-[#39E56F]">Browse services</Link></OrderBoardCard>}
      </section>
      <section className="min-w-0" aria-label="Recent activity">
        <div className="mb-2 flex min-h-11 items-center gap-2"><MessageSquare aria-hidden="true" className="size-4 text-[#A4AEA8]" /><h2 className="text-base font-semibold">Recent Activity</h2></div>
        <OrderBoardCard className="border-white/[0.08] p-3">
          <div className="divide-y divide-white/[0.06]">{orders.slice(0, 4).map((order) => <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="group flex min-h-11 items-center justify-between gap-3 rounded-lg py-3 hover:bg-white/[0.025] focus-visible:outline-2 focus-visible:outline-[#39E56F]"><div className="min-w-0"><p className="break-words text-sm font-semibold">{order.items[0]?.serviceName ?? "Gaming service"}</p><p className="mt-1 break-words text-xs text-[#A4AEA8]">{statusCopy(order.id, order.status)}</p><div className="mt-1 text-[11px] text-[#A4AEA8]"><OrderLocalDate timestamp={order.createdAt} /></div></div><div className="flex shrink-0 items-center gap-2">{order.status === "completed" ? <CheckCircle2 aria-hidden="true" className="size-4 text-[#82F5A4]" /> : null}<ArrowRight aria-hidden="true" className="size-4 text-[#A4AEA8]" /></div></Link>)}</div>
          {!orders.length ? <p className="py-3 text-xs text-[#A4AEA8]">No recent activity yet.</p> : null}
        </OrderBoardCard>
      </section>
    </div>
  </div>;
}
