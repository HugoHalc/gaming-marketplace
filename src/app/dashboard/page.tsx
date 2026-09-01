import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  Clock3,
  MessageSquare,
  Package,
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

function RankBadge({ rank }: { rank: string }) {
  const asset = rankAssets[rankFamily(rank)];
  if (!asset) {
    return (
      <span className="grid size-10 place-items-center rounded-full border border-white/[0.08] bg-[#090D0B] text-[10px] font-bold text-[#667069]">
        ?
      </span>
    );
  }
  return (
    <Image
      src={asset}
      alt=""
      width={44}
      height={44}
      className="size-10 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.42)]"
    />
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0E1411] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-[#A0AAA4]">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-[#090D0B] text-blue-200/65">
          {icon}
        </span>
      </div>
      <p className="font-gaming-value mt-4 text-[1.8rem] font-bold leading-none tracking-[-0.035em] text-[#F4F7F5]">
        {value}
      </p>
    </div>
  );
}

function ConfigurationSummary({ order }: { order: OrderRecord }) {
  const item = order.items[0];
  if (!item) return null;

  const configuration = item.configuration;
  const currentRank =
    typeof configuration.currentRank === "string"
      ? configuration.currentRank
      : typeof configuration.previousRank === "string"
        ? configuration.previousRank
        : null;
  const targetRank =
    typeof configuration.targetRank === "string" ? configuration.targetRank : null;

  if (currentRank && targetRank) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-2.5">
          <RankBadge rank={currentRank} />
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Current
            </p>
            <p className="font-gaming-value mt-0.5 text-sm font-bold text-[#F4F7F5]">
              {rankLabel(currentRank)}
            </p>
          </div>
        </div>
        <ArrowRight className="size-4 text-blue-200/45" />
        <div className="flex items-center gap-2.5 rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.025] px-3 py-2.5">
          <RankBadge rank={targetRank} />
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-blue-200/55">
              Target
            </p>
            <p className="font-gaming-value mt-0.5 text-sm font-bold text-[#F4F7F5]">
              {rankLabel(targetRank)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const placementMatches =
    typeof configuration.matches === "number" ? configuration.matches : null;
  const wins = typeof configuration.wins === "number" ? configuration.wins : null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {currentRank ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-2.5">
          <RankBadge rank={currentRank} />
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Rank context
            </p>
            <p className="font-gaming-value mt-0.5 text-sm font-bold text-[#F4F7F5]">
              {rankLabel(currentRank)}
            </p>
          </div>
        </div>
      ) : null}

      {placementMatches !== null || wins !== null ? (
        <div className="rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.025] px-4 py-3">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-blue-200/55">
            {placementMatches !== null ? "Placement matches" : "Wins selected"}
          </p>
          <p className="font-gaming-value mt-1 text-xl font-bold leading-none text-[#F4F7F5]">
            {placementMatches ?? wins}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RealTimeline({
  history,
  currentStatus,
}: {
  history: OrderStatusEvent[];
  currentStatus: OrderRecord["status"];
}) {
  if (!history.length) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#090D0B] p-3">
        <span className="size-2 rounded-full bg-cyan-300" />
        <div>
          <p className="text-xs font-semibold text-[#F4F7F5]">
            {orderStatusLabel(currentStatus)}
          </p>
          <p className="mt-0.5 text-[10px] text-[#667069]">
            Current order status
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {history.slice(-4).map((event, index, visible) => {
        const current = index === visible.length - 1;
        return (
          <div
            key={event.id}
            className={`rounded-xl border p-3 ${
              current
                ? "border-cyan-300/[0.16] bg-cyan-400/[0.035]"
                : "border-white/[0.07] bg-[#090D0B]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid size-5 place-items-center rounded-full border ${
                  current
                    ? "border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-200"
                    : "border-white/[0.08] bg-white/[0.02] text-[#667069]"
                }`}
              >
                <Check className="size-2.5" strokeWidth={2.5} />
              </span>
              <span className="text-[10px] font-semibold text-[#A0AAA4]">
                {orderStatusLabel(event.toStatus)}
              </span>
            </div>
            <p className="mt-2 text-[9px] text-[#667069]">
              {formatDate(event.createdAt)}
            </p>
          </div>
        );
      })}
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
  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;
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
          Account overview
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-3xl">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A0AAA4]">
          Track your boosts, manage active orders and keep every service update in one place.
        </p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Active Orders"
          value={activeOrders.length}
          icon={<Package className="size-4" strokeWidth={1.8} />}
        />
        <MetricCard
          label="Completed Orders"
          value={completedOrders}
          icon={<Check className="size-4" strokeWidth={2} />}
        />
        <MetricCard
          label="Unread Messages"
          value={0}
          icon={<MessageSquare className="size-4" strokeWidth={1.8} />}
        />
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-[#667069]">
              Priority
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#F4F7F5]">
              Active order
            </h2>
          </div>
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
          <div className="mt-3 overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-[#0E1411]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.045] via-transparent to-transparent p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.035] text-blue-200/75">
                      <Package className="size-4" strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-blue-200/55">
                        {activeOrder.items[0]?.gameName ?? "Gaming service"}
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-[#F4F7F5]">
                        {activeOrder.items[0]?.serviceName ?? "Active service"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 font-gaming-value text-xs font-semibold text-[#667069]">
                    {activeOrder.orderNumber}
                  </p>
                </div>

                <OrderStatusBadge status={activeOrder.status} />
              </div>

              <ConfigurationSummary order={activeOrder} />
              <RealTimeline
                history={activeHistory}
                currentStatus={activeOrder.status}
              />
            </div>

            <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
                {activeOrder.items[0]?.configuration.playlist ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.11em] text-[#667069]">
                      Playlist
                    </dt>
                    <dd className="mt-1 text-xs font-medium text-[#F4F7F5]">
                      {String(activeOrder.items[0].configuration.playlist)}
                    </dd>
                  </div>
                ) : null}
                {activeOrder.items[0]?.configuration.platform ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.11em] text-[#667069]">
                      Platform
                    </dt>
                    <dd className="mt-1 text-xs font-medium capitalize text-[#F4F7F5]">
                      {String(activeOrder.items[0].configuration.platform)}
                    </dd>
                  </div>
                ) : null}
                {activeOrder.items[0]?.configuration.boostMethod ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.11em] text-[#667069]">
                      Boost Method
                    </dt>
                    <dd className="mt-1 text-xs font-medium text-[#F4F7F5]">
                      {String(activeOrder.items[0].configuration.boostMethod) ===
                      "play-with-booster"
                        ? "Play With Booster"
                        : "Account Boost"}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <Link
                href={`/dashboard/orders/${activeOrder.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#39E56F] px-5 text-sm font-semibold text-[#050807] transition-colors hover:bg-[#20C95A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/40"
              >
                View Order
                <ArrowRight className="ml-2 size-4" strokeWidth={1.9} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-[1.4rem] border border-dashed border-white/[0.09] bg-[#0E1411] px-5 py-10 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-xl border border-white/[0.07] bg-[#090D0B] text-[#667069]">
              <PackageOpen className="size-5" strokeWidth={1.7} />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-[#F4F7F5]">
              No active boosts
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#A0AAA4]">
              Your active services will appear here after you place and fund an order.
            </p>
            <Link
              href="/games"
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]"
            >
              Browse games
            </Link>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#F4F7F5]">
              Recent orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-[#A0AAA4] hover:text-[#F4F7F5]"
            >
              View all
            </Link>
          </div>

          {orders.length ? (
            <>
              <div className="mt-3 hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0E1411] md:block">
                <div className="grid grid-cols-[.8fr_1.35fr_.8fr_.65fr_.75fr_auto] gap-4 border-b border-white/[0.06] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.11em] text-[#667069]">
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
                      className="grid min-h-[62px] grid-cols-[.8fr_1.35fr_.8fr_.65fr_.75fr_auto] items-center gap-4 border-b border-white/[0.06] px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.02]"
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

              <div className="mt-3 grid gap-2.5 md:hidden">
                {orders.slice(0, 5).map((order) => {
                  const item = order.items[0];
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="rounded-2xl border border-white/[0.07] bg-[#0E1411] p-4"
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
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
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
            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0E1411] p-8 text-center">
              <PackageOpen className="mx-auto size-6 text-[#667069]" />
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
            <h2 className="text-lg font-semibold text-[#F4F7F5]">
              Recent messages
            </h2>
            <span className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
              Phase 16C
            </span>
          </div>

          <div className="mt-3 flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#0E1411] p-6 text-center">
            <span className="grid size-10 place-items-center rounded-xl border border-white/[0.07] bg-[#090D0B] text-[#667069]">
              <MessageSquare className="size-4" strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">
              No messages yet
            </p>
            <p className="mt-1 max-w-[240px] text-xs leading-5 text-[#A0AAA4]">
              Order conversations will appear here when live chat is available.
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#090D0B] p-4">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 size-4 shrink-0 text-blue-200/65" />
              <div>
                <p className="text-xs font-semibold text-[#F4F7F5]">
                  Order updates
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                  You currently have {unreadNotifications} unread notification
                  {unreadNotifications === 1 ? "" : "s"}.
                </p>
                <Link
                  href="/dashboard/notifications"
                  className="mt-2 inline-flex text-[11px] font-semibold text-blue-200/75 hover:text-blue-100"
                >
                  View notifications
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
