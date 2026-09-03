import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PackageOpen,
} from "lucide-react";
import { ClaimOrderButton } from "@/components/booster/claim-order-button";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import {
  listActiveBoosterOrders,
  listAvailableBoosterOrders,
  listCompletedBoosterOrders,
} from "@/features/booster/server/booster-orders";
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";

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
    year: "numeric",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
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

  const tabs = [
    ["available", "Available", "/booster/orders"],
    ["active", "In Progress", "/booster/orders?view=active"],
    ["completed", "Completed", "/booster/orders?view=completed"],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-[1520px] px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
          Booster Orders
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
          Orders
        </h1>
        <p className="mt-2 text-[10px] text-[#A0AAA4]">
          Available work, active services and completed orders in one place.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
        {tabs.map(([key, label, href]) => (
          <Link
            key={key}
            href={href}
            className={`rounded-lg border px-3 py-2 text-[9px] font-semibold transition-colors ${
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
            const currentRank =
              typeof config.currentRank !== "undefined"
                ? config.currentRank
                : config.previousRank;
            const targetRank = config.targetRank;
            const currentResolved = resolveRocketLeagueRank(currentRank);
            const targetResolved = resolveRocketLeagueRank(targetRank);
            const platform =
              typeof config.platform === "string"
                ? formatLabel(config.platform)
                : null;
            const wins = typeof config.wins === "number" ? config.wins : null;
            const matches =
              typeof config.matches === "number" ? config.matches : null;
            const playlist =
              typeof config.playlist === "string"
                ? formatLabel(config.playlist)
                : null;

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0B100D] transition-colors hover:border-white/[0.12] hover:bg-[#0E1411]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative size-7 shrink-0 overflow-hidden rounded-md border border-white/[0.07]">
                      <Image
                        src="/game-cards/rocket-league.webp"
                        alt=""
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-gaming-value truncate text-[10px] font-bold text-[#F4F7F5]">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="font-gaming-value text-sm font-bold text-[#82F5A4]">
                      {formatMoney(payout)}
                    </span>
                    {view === "available" ? (
                      <ClaimOrderButton orderId={order.id} compact />
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                        {item?.gameName ?? "Rocket League"}
                      </p>
                      <h2 className="mt-1 truncate text-[14px] font-semibold text-[#F4F7F5]">
                        {item?.serviceName ?? "Boosting Order"}
                      </h2>
                    </div>

                    {view !== "available" ? (
                      <OrderStatusBadge status={order.status} />
                    ) : null}
                  </div>

                  {(currentResolved || targetResolved) ? (
                    <div className="mt-4 flex min-h-[58px] items-center gap-3 border-y border-white/[0.05] py-3">
                      {currentResolved ? (
                        <RocketLeagueRankValue
                          value={currentRank}
                          label="Current"
                        />
                      ) : null}
                      {currentResolved && targetResolved ? (
                        <ArrowRight className="size-3.5 shrink-0 text-blue-200/30" />
                      ) : null}
                      {targetResolved ? (
                        <RocketLeagueRankValue
                          value={targetRank}
                          label="Target"
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4 border-y border-white/[0.05] py-3">
                      {platform ? (
                        <div>
                          <p className="text-[8px] text-[#667069]">Platform</p>
                          <p className="mt-1 text-[10px] font-semibold text-[#F4F7F5]">
                            {platform}
                          </p>
                        </div>
                      ) : null}

                      {matches !== null || wins !== null ? (
                        <div>
                          <p className="text-[8px] text-[#667069]">
                            {matches !== null ? "Matches" : "Wins"}
                          </p>
                          <p className="font-gaming-value mt-1 text-[11px] font-bold text-[#F4F7F5]">
                            {matches ?? wins}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {platform ? (
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                        {platform}
                      </span>
                    ) : null}
                    {playlist ? (
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                        {playlist}
                      </span>
                    ) : null}
                    {config.boostMethod === "play-with-booster" ? (
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                        Play With Booster
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[8px] text-[#667069]">Payout</p>
                      <p className="mt-1 text-[8px] text-[#667069]">
                        {(payoutRateBps / 100).toFixed(0)}% rate
                      </p>
                    </div>

                    {view === "available" ? (
                      <span className="text-[9px] font-medium text-[#82F5A4]">
                        Available to accept
                      </span>
                    ) : (
                      <Link
                        href={`/booster/orders/${order.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-white/[0.08] px-3 text-[9px] font-semibold text-[#F4F7F5] hover:bg-white/[0.03]"
                      >
                        Open Order
                        <ArrowRight className="ml-2 size-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/[0.05] px-4 py-3 text-[8px] text-[#667069]">
                  {view === "available" ? (
                    <>
                      <Clock3 className="size-3" />
                      Available since {formatDate(order.createdAt)}
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
        <div className="mt-6 flex min-h-[300px] items-center justify-center border-y border-white/[0.05] text-center">
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
