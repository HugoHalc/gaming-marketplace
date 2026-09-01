import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  MessageSquare,
  PackageOpen,
} from "lucide-react";
import { requireUser } from "@/features/auth/server/auth";
import {
  getCurrentUserOrderHistory,
  listCurrentUserOrders,
} from "@/features/orders/server/order-repository";
import {
  OrderStatusBadge,
  orderStatusLabel,
} from "@/features/orders/components/order-status-badge";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";
import type { OrderRecord, OrderStatusEvent } from "@/features/orders/types/orders";

export const metadata = { title: "Dashboard | BoostingPedia" };
export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["paid", "queued", "in_progress"] as const;

const rankAssets: Record<string, string> = {
  bronze: "/ranks/rocket-league/bronze.png",
  silver: "/ranks/rocket-league/silver.png",
  gold: "/ranks/rocket-league/gold.png",
  platinum: "/ranks/rocket-league/platinum.png",
  diamond: "/ranks/rocket-league/diamond.png",
  champion: "/ranks/rocket-league/champion.png",
  "grand-champion": "/ranks/rocket-league/grand-champion.png",
  "supersonic-legend": "/ranks/rocket-league/supersonic-legend.png",
};

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

function rankFamily(value: string) {
  if (value === "supersonic-legend") return value;
  return value.replace(/-\d$/, "");
}

function rankLabel(value: string) {
  if (value === "unrated") return "Unrated";
  if (value === "supersonic-legend") return "Supersonic Legend";

  const tier = value.match(/-(\d)$/)?.[1];
  const family = rankFamily(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const roman = tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : "";
  return `${family}${roman ? ` ${roman}` : ""}`;
}

function isResolvableRank(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === "unrated" || value === "supersonic-legend") return true;
  const family = rankFamily(value);
  return Boolean(rankAssets[family] && /-\d$/.test(value));
}

function RankPresentation({
  rank,
  label,
}: {
  rank: string;
  label: string;
}) {
  const asset = rankAssets[rankFamily(rank)];

  return (
    <div className="flex items-center gap-3">
      {asset ? (
        <Image
          src={asset}
          alt=""
          width={54}
          height={54}
          className="size-[50px] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,.42)]"
        />
      ) : (
        <span className="grid size-[50px] place-items-center rounded-full border border-white/[0.08] text-[10px] font-bold text-[#667069]">
          ?
        </span>
      )}
      <div>
        <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
          {label}
        </p>
        <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">
          {rankLabel(rank)}
        </p>
      </div>
    </div>
  );
}

function ActiveOrderProgression({ order }: { order: OrderRecord }) {
  const item = order.items[0];
  if (!item) return null;

  const config = item.configuration;
  const currentCandidate =
    typeof config.currentRank !== "undefined" ? config.currentRank : config.previousRank;
  const targetCandidate = config.targetRank;

  const currentRank = isResolvableRank(currentCandidate) ? currentCandidate : null;
  const targetRank = isResolvableRank(targetCandidate) ? targetCandidate : null;

  if (currentRank && targetRank) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-5 sm:gap-7">
        <RankPresentation rank={currentRank} label="Current" />
        <ArrowRight className="size-4 shrink-0 text-blue-200/40" />
        <RankPresentation rank={targetRank} label="Target" />
      </div>
    );
  }

  const wins = typeof config.wins === "number" ? config.wins : null;
  const matches = typeof config.matches === "number" ? config.matches : null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
      {currentRank ? <RankPresentation rank={currentRank} label="Rank context" /> : null}

      {wins !== null || matches !== null ? (
        <div>
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
            {matches !== null ? "Placement Matches" : "Wins Selected"}
          </p>
          <p className="font-gaming-value mt-1 text-3xl font-bold leading-none text-[#F4F7F5]">
            {matches ?? wins}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function HorizontalTimeline({
  history,
  currentStatus,
}: {
  history: OrderStatusEvent[];
  currentStatus: OrderRecord["status"];
}) {
  const stages = history.length
    ? history.slice(-3).map((event) => ({
        id: event.id,
        label: orderStatusLabel(event.toStatus),
      }))
    : [{ id: currentStatus, label: orderStatusLabel(currentStatus) }];

  return (
    <div className="mt-6 border-t border-white/[0.06] pt-4">
      <div className="flex min-w-0 items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stages.map((stage, index) => {
          const current = index === stages.length - 1;
          return (
            <div key={stage.id} className="flex min-w-0 items-center">
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`grid size-5 place-items-center rounded-full border ${
                    current
                      ? "border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-200"
                      : "border-white/[0.10] bg-white/[0.025] text-[#A0AAA4]"
                  }`}
                >
                  {current ? (
                    <span className="size-1.5 rounded-full bg-cyan-300" />
                  ) : (
                    <Check className="size-2.5" strokeWidth={2.5} />
                  )}
                </span>
                <span className="whitespace-nowrap text-[10px] font-medium text-[#A0AAA4]">
                  {stage.label}
                </span>
              </div>

              {index < stages.length - 1 ? (
                <span className="mx-3 h-px w-10 shrink-0 bg-white/[0.08] sm:w-16" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const identity = await requireUser();
  const [orders, unreadNotifications] = await Promise.all([
    listCurrentUserOrders(),
    getUnreadNotificationCount(),
  ]);

  const activeOrders = orders.filter((order) =>
    ACTIVE_STATUSES.includes(order.status as (typeof ACTIVE_STATUSES)[number]),
  );
  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const activeOrder = activeOrders[0] ?? null;
  const activeHistory = activeOrder
    ? await getCurrentUserOrderHistory(activeOrder.id)
    : [];

  const firstName =
    identity.profile?.gamer_tag ||
    identity.profile?.full_name?.split(" ")[0] ||
    null;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section>
        <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-200/60">
          Account Overview
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-3xl">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A0AAA4]">
          Track your boosts, manage active orders and keep every service update in one place.
        </p>
      </section>

      <section
        className="mt-5 flex min-h-12 flex-wrap items-center gap-y-3 border-y border-white/[0.05] py-3"
        aria-label="Account summary"
      >
        <div className="flex items-baseline gap-2 pr-5 sm:pr-7">
          <span className="font-gaming-value text-xl font-bold text-[#F4F7F5]">
            {activeOrders.length}
          </span>
          <span className="text-xs text-[#A0AAA4]">
            Active Order{activeOrders.length === 1 ? "" : "s"}
          </span>
        </div>
        <span className="hidden h-5 w-px bg-white/[0.07] sm:block" />
        <div className="flex items-baseline gap-2 px-0 pr-5 sm:px-7">
          <span className="font-gaming-value text-xl font-bold text-[#F4F7F5]">
            {completedOrders}
          </span>
          <span className="text-xs text-[#A0AAA4]">Completed</span>
        </div>
        <span className="hidden h-5 w-px bg-white/[0.07] sm:block" />
        <div className="flex items-baseline gap-2 sm:pl-7">
          <span className="font-gaming-value text-xl font-bold text-[#F4F7F5]">0</span>
          <span className="text-xs text-[#A0AAA4]">Unread</span>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#F4F7F5]">Active order</h2>
          {activeOrders.length > 1 ? (
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-blue-200/75 hover:text-blue-100"
            >
              View all active orders
            </Link>
          ) : null}
        </div>

        {activeOrder ? (
          <div className="mt-3 overflow-hidden rounded-[1.3rem] border border-white/[0.08] bg-[#0E1411]">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-200/55">
                    {activeOrder.items[0]?.gameName ?? "Gaming service"}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#F4F7F5]">
                    {activeOrder.items[0]?.serviceName ?? "Active service"}
                  </h3>
                  <p className="font-gaming-value mt-1.5 text-[11px] font-semibold text-[#667069]">
                    {activeOrder.orderNumber}
                  </p>
                </div>

                <OrderStatusBadge status={activeOrder.status} />
              </div>

              <ActiveOrderProgression order={activeOrder} />
              <HorizontalTimeline
                history={activeHistory}
                currentStatus={activeOrder.status}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.05] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-[#A0AAA4]">
                {activeOrder.status === "queued"
                  ? "Waiting for booster assignment"
                  : orderStatusLabel(activeOrder.status)}
              </p>
              <Link
                href={`/dashboard/orders/${activeOrder.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]"
              >
                View Order
                <ArrowRight className="ml-2 size-3.5" strokeWidth={1.9} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 border-y border-white/[0.05] py-9 text-center">
            <PackageOpen className="mx-auto size-6 text-[#667069]" />
            <h3 className="mt-3 text-sm font-semibold text-[#F4F7F5]">
              No active boosts
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[#A0AAA4]">
              Your active services will appear here after you place and fund an order.
            </p>
            <Link
              href="/games"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] hover:bg-[#20C95A]"
            >
              Browse games
            </Link>
          </div>
        )}
      </section>

      <div className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.55fr)]">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#F4F7F5]">Recent orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-[#A0AAA4] hover:text-[#F4F7F5]"
            >
              View all
            </Link>
          </div>

          {orders.length ? (
            <>
              <div className="mt-3 hidden md:block">
                <div className="grid grid-cols-[.8fr_1.35fr_.8fr_.65fr_.75fr_auto] gap-4 border-b border-white/[0.06] px-1 py-2.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-[#667069]">
                  <span>Order</span>
                  <span>Game / Service</span>
                  <span>Status</span>
                  <span>Total</span>
                  <span>Date</span>
                  <span aria-hidden="true" />
                </div>
                {orders.slice(0, 5).map((order) => {
                  const item = order.items[0];
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="grid min-h-[60px] grid-cols-[.8fr_1.35fr_.8fr_.65fr_.75fr_auto] items-center gap-4 border-b border-white/[0.05] px-1 py-3 transition-colors hover:bg-white/[0.015]"
                    >
                      <span className="font-gaming-value truncate text-xs font-bold text-[#F4F7F5]">
                        {order.orderNumber}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-[#F4F7F5]">
                          {item?.gameName ?? "Gaming service"}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-[#667069]">
                          {item?.serviceName ?? "Service"}
                        </span>
                      </span>
                      <span>
                        <OrderStatusBadge status={order.status} />
                      </span>
                      <span className="font-gaming-value text-sm font-bold text-[#F4F7F5]">
                        {formatMoney(order.total)}
                      </span>
                      <span className="text-[10px] text-[#A0AAA4]">
                        {formatDate(order.createdAt)}
                      </span>
                      <ArrowRight className="size-3.5 text-[#667069]" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-0 md:hidden">
                {orders.slice(0, 5).map((order) => {
                  const item = order.items[0];
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="border-b border-white/[0.05] py-4 first:border-t"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-gaming-value truncate text-xs font-bold text-[#F4F7F5]">
                            {order.orderNumber}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium text-[#F4F7F5]">
                            {item?.serviceName ?? "Gaming service"}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-[#667069]">
                            {item?.gameName}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-[#667069]">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="font-gaming-value text-base font-bold text-[#F4F7F5]">
                          {formatMoney(order.total)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-3 border-y border-white/[0.05] py-8 text-center">
              <PackageOpen className="mx-auto size-5 text-[#667069]" />
              <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">
                No orders yet
              </p>
              <p className="mt-1 text-xs text-[#A0AAA4]">
                Your order history will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#F4F7F5]">Recent messages</h2>
            <span className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
              Phase 16C
            </span>
          </div>

          <div className="mt-3 flex min-h-[150px] flex-col items-center justify-center border-y border-white/[0.05] px-4 py-6 text-center">
            <MessageSquare className="size-5 text-[#667069]" strokeWidth={1.8} />
            <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">
              No messages yet
            </p>
            <p className="mt-1 max-w-[240px] text-[11px] leading-5 text-[#A0AAA4]">
              Order conversations will appear here when live chat is available.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <Bell className="mt-0.5 size-4 shrink-0 text-blue-200/65" />
            <div>
              <p className="text-xs font-semibold text-[#F4F7F5]">Order updates</p>
              <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                You currently have {unreadNotifications} unread notification
                {unreadNotifications === 1 ? "" : "s"}.
              </p>
              <Link
                href="/dashboard/notifications"
                className="mt-1.5 inline-flex text-[11px] font-semibold text-blue-200/75 hover:text-blue-100"
              >
                View notifications
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
