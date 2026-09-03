import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Package,
} from "lucide-react";
import { requireUser } from "@/features/auth/server/auth";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";
import { createSecretServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard | BoostingPedia" };
export const dynamic = "force-dynamic";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const identity = await requireUser();
  const orders = await listCurrentUserOrders();
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

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <p className="font-gaming-label text-[9px] uppercase tracking-[0.15em] text-[#667069]">
          Customer Dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 max-w-xl text-xs leading-5 text-[#A0AAA4]">
          Track your active services and open an order whenever you need an update.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Active orders</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
            {activeOrders.length}
          </p>
        </div>
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Completed orders</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
            {completedOrders.length}
          </p>
        </div>
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Total orders</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
            {orders.length}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Current service
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#F4F7F5]">
              Active Order
            </h2>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-[10px] font-semibold text-[#82F5A4] hover:text-[#F4F7F5]"
          >
            View all orders
          </Link>
        </div>

        {highlighted ? (
          <Link
            href={`/dashboard/orders/${highlighted.id}`}
            className="group mt-4 grid gap-5 border-y border-white/[0.06] py-5 transition-colors hover:bg-white/[0.012] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#0E1411]">
                  <Package className="size-4 text-[#A0AAA4]" />
                </span>
                <div className="min-w-0">
                  <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                    {highlighted.items[0]?.gameName ?? "Gaming service"}
                  </p>
                  <h3 className="mt-0.5 truncate text-base font-semibold text-[#F4F7F5]">
                    {highlighted.items[0]?.serviceName ?? "Order"}
                  </h3>
                  <p className="font-gaming-value mt-1 text-[9px] text-[#667069]">
                    {highlighted.orderNumber}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px]">
                <span className="inline-flex items-center gap-1.5 text-cyan-200/80">
                  <Clock3 className="size-3" />
                  {statusCopy(highlighted.id, highlighted.status)}
                </span>
                <span className="text-[#667069]">
                  Created {formatDate(highlighted.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <div className="text-right">
                <p className="text-[8px] text-[#667069]">Total</p>
                <p className="font-gaming-value mt-1 text-lg font-bold text-[#F4F7F5]">
                  {formatMoney(highlighted.total)}
                </p>
              </div>
              <ArrowRight className="size-4 text-[#667069] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ) : (
          <div className="mt-4 border-y border-white/[0.06] py-10 text-center">
            <Package className="mx-auto size-5 text-[#667069]" />
            <h3 className="mt-3 text-sm font-semibold text-[#F4F7F5]">
              No orders yet
            </h3>
            <p className="mt-1.5 text-[10px] text-[#A0AAA4]">
              Your active service will appear here after your first order.
            </p>
            <Link
              href="/games"
              className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#39E56F] px-4 text-[10px] font-semibold text-[#050807] hover:bg-[#20C95A]"
            >
              Browse services
            </Link>
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-[#667069]" />
          <h2 className="text-lg font-semibold text-[#F4F7F5]">Recent activity</h2>
        </div>

        <div className="mt-3 divide-y divide-white/[0.05] border-y border-white/[0.05]">
          {orders.slice(0, 4).map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="group flex items-center justify-between gap-4 py-3.5 hover:bg-white/[0.012]"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#F4F7F5]">
                  {order.items[0]?.serviceName ?? "Gaming service"}
                </p>
                <p className="mt-1 text-[9px] text-[#667069]">
                  {statusCopy(order.id, order.status)} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {order.status === "completed" ? (
                  <CheckCircle2 className="size-3.5 text-[#82F5A4]" />
                ) : null}
                <ArrowRight className="size-3.5 text-[#667069] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}

          {!orders.length ? (
            <p className="py-5 text-[10px] text-[#667069]">No recent activity yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
