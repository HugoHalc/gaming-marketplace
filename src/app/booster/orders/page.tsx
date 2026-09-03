import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gamepad2,
  PackageOpen,
} from "lucide-react";
import { ClaimOrderButton } from "@/components/booster/claim-order-button";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import {
  listActiveBoosterOrders,
  listAvailableBoosterOrders,
  listCompletedBoosterOrders,
} from "@/features/booster/server/booster-orders";

export const metadata = { title: "Booster Orders | BoostingPedia" };
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

function value(value: unknown) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return null;
}

export default async function BoosterOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const query = await searchParams;
  const view =
    query.view === "active" || query.view === "completed"
      ? query.view
      : "available";

  const orders =
    view === "active"
      ? await listActiveBoosterOrders()
      : view === "completed"
        ? await listCompletedBoosterOrders()
        : await listAvailableBoosterOrders();

  return (
    <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
          Booster Orders
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
          Orders
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
        {[
          ["available", "Available", "/booster/orders"],
          ["active", "In Progress", "/booster/orders?view=active"],
          ["completed", "Completed", "/booster/orders?view=completed"],
        ].map(([key, label, href]) => (
          <Link
            key={key}
            href={href}
            className={`rounded-lg border px-3 py-2 text-[10px] font-semibold transition-colors ${
              view === key
                ? "border-[#39E56F]/20 bg-[#39E56F]/[0.07] text-[#82F5A4]"
                : "border-white/[0.07] bg-[#0B100D] text-[#A0AAA4] hover:text-[#F4F7F5]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {orders.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {orders.map(({ order, payout, payoutRateBps, assignedAt }) => {
            const item = order.items[0];
            const config = item?.configuration ?? {};
            const summary = [
              ["Platform", config.platform],
              ["Playlist", config.playlist],
              ["Boost Method", config.boostMethod],
              ["Current", config.currentRank ?? config.previousRank],
              ["Target", config.targetRank],
              ["Wins", config.wins],
              ["Matches", config.matches],
            ]
              .map(([label, raw]) => [label, value(raw)] as const)
              .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
              .slice(0, 4);

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0D120F]"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#0E1411] text-[#A0AAA4]">
                        <Gamepad2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                          {item?.gameName ?? "Gaming service"}
                        </p>
                        <h2 className="mt-0.5 truncate text-sm font-semibold text-[#F4F7F5]">
                          {item?.serviceName ?? "Boosting order"}
                        </h2>
                        <p className="font-gaming-value mt-1 text-[9px] text-[#667069]">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>
                    {view !== "available" ? (
                      <OrderStatusBadge status={order.status} />
                    ) : null}
                  </div>

                  {summary.length ? (
                    <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-white/[0.05] py-3.5">
                      {summary.map(([label, text]) => (
                        <div key={label}>
                          <dt className="text-[8px] text-[#667069]">{label}</dt>
                          <dd className="mt-1 text-[10px] font-medium text-[#F4F7F5]">
                            {text}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[8px] text-[#667069]">Your payout</p>
                      <p className="font-gaming-value mt-1 text-xl font-bold text-[#82F5A4]">
                        {formatMoney(payout)}
                      </p>
                      <p className="mt-1 text-[8px] text-[#667069]">
                        {(payoutRateBps / 100).toFixed(0)}% payout
                      </p>
                    </div>

                    {view === "available" ? (
                      <ClaimOrderButton orderId={order.id} />
                    ) : (
                      <Link
                        href={`/booster/orders/${order.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-white/[0.08] px-3 text-[10px] font-semibold text-[#F4F7F5] hover:bg-white/[0.03]"
                      >
                        Open Order
                        <ArrowRight className="ml-2 size-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/[0.05] px-4 py-3 text-[8px] text-[#667069]">
                  {view === "available" ? (
                    <>
                      <Clock3 className="size-3" />
                      Paid {formatDate(order.createdAt)}
                    </>
                  ) : view === "completed" ? (
                    <>
                      <CheckCircle2 className="size-3 text-[#82F5A4]" />
                      Completed order
                    </>
                  ) : (
                    <>
                      <Clock3 className="size-3" />
                      Accepted {assignedAt ? formatDate(assignedAt) : "recently"}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 flex min-h-[280px] items-center justify-center border-y border-white/[0.05] text-center">
          <div>
            <PackageOpen className="mx-auto size-6 text-[#667069]" />
            <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">
              {view === "available"
                ? "No orders available"
                : view === "active"
                  ? "No active orders"
                  : "No completed orders"}
            </p>
            <p className="mt-1.5 text-[10px] text-[#A0AAA4]">
              {view === "available"
                ? "New paid customer orders will appear here."
                : "Orders will appear here as you work through them."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
