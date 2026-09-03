import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  Trophy,
} from "lucide-react";
import {
  listActiveBoosterOrders,
  listAvailableBoosterOrders,
  listCompletedBoosterOrders,
} from "@/features/booster/server/booster-orders";

export const metadata = { title: "Booster Dashboard | BoostingPedia" };
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
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function BoosterDashboardPage() {
  const [available, active, completed] = await Promise.all([
    listAvailableBoosterOrders(),
    listActiveBoosterOrders(),
    listCompletedBoosterOrders(),
  ]);

  const completedPayout = completed.reduce((sum, entry) => sum + entry.payout, 0);

  return (
    <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
          Booster Dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-xs leading-5 text-[#A0AAA4]">
          Your active workload, completed orders and marketplace availability at a glance.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-4">
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Available orders</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
            {available.length}
          </p>
        </div>
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Active orders</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
            {active.length}
          </p>
        </div>
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Completed orders</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
            {completed.length}
          </p>
        </div>
        <div className="border-b border-white/[0.06] pb-4">
          <p className="text-[9px] text-[#667069]">Completed payout</p>
          <p className="font-gaming-value mt-1 text-2xl font-bold text-[#82F5A4]">
            {formatMoney(completedPayout)}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Work in progress
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#F4F7F5]">Active Orders</h2>
          </div>
          <Link
            href="/booster/orders?view=active"
            className="text-[10px] font-semibold text-[#82F5A4] hover:text-[#F4F7F5]"
          >
            View active orders
          </Link>
        </div>

        <div className="mt-3 divide-y divide-white/[0.05] border-y border-white/[0.05]">
          {active.slice(0, 5).map(({ order, payout, assignedAt }) => (
            <Link
              key={order.id}
              href={`/booster/orders/${order.id}`}
              className="group grid gap-3 py-4 hover:bg-white/[0.012] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#0E1411]">
                  <Package className="size-4 text-[#A0AAA4]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#F4F7F5]">
                    {order.items[0]?.serviceName ?? "Boosting order"}
                  </p>
                  <p className="font-gaming-value mt-1 text-[9px] text-[#667069]">
                    {order.orderNumber} · Accepted {assignedAt ? formatDate(assignedAt) : "recently"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="font-gaming-value text-sm font-bold text-[#82F5A4]">
                  {formatMoney(payout)}
                </span>
                <ArrowRight className="size-3.5 text-[#667069] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}

          {!active.length ? (
            <div className="py-8 text-center">
              <Clock3 className="mx-auto size-5 text-[#667069]" />
              <p className="mt-2 text-xs font-semibold text-[#F4F7F5]">No active orders</p>
              <Link
                href="/booster/orders"
                className="mt-2 inline-flex text-[10px] font-semibold text-[#82F5A4]"
              >
                Browse available orders
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-[#667069]" />
          <h2 className="text-lg font-semibold text-[#F4F7F5]">Completed Orders</h2>
        </div>

        <div className="mt-3 divide-y divide-white/[0.05] border-y border-white/[0.05]">
          {completed.slice(0, 5).map(({ order, payout }) => (
            <Link
              key={order.id}
              href={`/booster/orders/${order.id}`}
              className="group flex items-center justify-between gap-4 py-3.5 hover:bg-white/[0.012]"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#F4F7F5]">
                  {order.items[0]?.serviceName ?? "Boosting order"}
                </p>
                <p className="mt-1 text-[9px] text-[#667069]">
                  {order.orderNumber} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-gaming-value text-xs font-bold text-[#82F5A4]">
                  {formatMoney(payout)}
                </span>
                <CheckCircle2 className="size-3.5 text-[#82F5A4]" />
              </div>
            </Link>
          ))}

          {!completed.length ? (
            <p className="py-5 text-[10px] text-[#667069]">No completed orders yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
