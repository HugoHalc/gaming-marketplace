"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Gamepad2,
  Grid2X2,
  List,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { OrderRecord } from "@/features/orders/types/orders";

type DashboardOrder = OrderRecord & {
  operationalState: string | null;
  autoCompleteAt: string | null;
};

type FilterKey = "all" | "placed" | "active" | "delivered" | "completed";
type ViewMode = "grid" | "list";

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

  const roman =
    tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : "";

  return `${family}${roman ? ` ${roman}` : ""}`;
}

function resolvableRank(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === "unrated" || value === "supersonic-legend") return true;
  return Boolean(rankAssets[rankFamily(value)] && /-\d$/.test(value));
}

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

function operationalLabel(order: DashboardOrder) {
  if (order.operationalState === "delivered") return "Delivered";
  if (order.operationalState === "waiting_customer") return "Waiting Customer";
  if (order.operationalState === "issue") return "Issue";
  if (order.operationalState === "accepted") return "Accepted";
  if (order.operationalState === "in_progress") return "In Progress";
  if (order.operationalState === "completed" || order.status === "completed")
    return "Completed";

  if (order.status === "pending_payment") return "Placed";
  if (order.status === "paid" || order.status === "queued") return "Queued";
  return formatLabel(order.status);
}

function statusClass(order: DashboardOrder) {
  const label = operationalLabel(order);

  if (label === "Completed")
    return "border-[#39E56F]/15 bg-[#39E56F]/[0.055] text-[#82F5A4]";
  if (label === "Delivered")
    return "border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-200";
  if (label === "Issue")
    return "border-rose-300/15 bg-rose-300/[0.055] text-rose-200";
  if (label === "Waiting Customer")
    return "border-amber-300/15 bg-amber-300/[0.055] text-amber-100";

  return "border-white/[0.08] bg-white/[0.035] text-[#A0AAA4]";
}

function matchesFilter(order: DashboardOrder, filter: FilterKey) {
  if (filter === "all") return true;

  if (filter === "placed") {
    return ["pending_payment", "paid", "queued"].includes(order.status);
  }

  if (filter === "active") {
    return (
      order.status === "in_progress" &&
      order.operationalState !== "delivered" &&
      order.operationalState !== "completed"
    );
  }

  if (filter === "delivered") {
    return order.operationalState === "delivered";
  }

  return (
    order.status === "completed" ||
    order.operationalState === "completed"
  );
}

function RankLine({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  if (!resolvableRank(value)) return null;

  const asset = rankAssets[rankFamily(value)];

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-[#667069]">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-right">
        <span className="font-gaming-value truncate text-[11px] font-bold text-[#F4F7F5]">
          {rankLabel(value)}
        </span>
        {asset ? (
          <Image
            src={asset}
            alt=""
            width={34}
            height={34}
            className="size-8 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,.45)]"
          />
        ) : null}
      </span>
    </div>
  );
}

function Extras({ configuration }: { configuration: Record<string, string | number | boolean> }) {
  const extras: string[] = [];

  if (configuration.playlist) extras.push(String(configuration.playlist));
  if (configuration.boostMethod === "play-with-booster") extras.push("Play With Booster");
  if (configuration.liveStream === true) extras.push("Live Stream");
  if (configuration.express === true) extras.push("Express");
  if (configuration.appearOffline === true) extras.push("Appear Offline");
  if (configuration.rankInsurance === true) extras.push("Rank Insurance");

  return extras.length ? (
    <div className="flex flex-wrap gap-1.5">
      {extras.slice(0, 4).map((extra) => (
        <span
          key={extra}
          className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[9px] font-medium text-[#A0AAA4]"
        >
          {formatLabel(extra)}
        </span>
      ))}
    </div>
  ) : null;
}

function OrderCard({
  order,
  viewMode,
}: {
  order: DashboardOrder;
  viewMode: ViewMode;
}) {
  const item = order.items[0];
  const config = item?.configuration ?? {};
  const currentRank =
    typeof config.currentRank !== "undefined"
      ? config.currentRank
      : config.previousRank;
  const targetRank = config.targetRank;

  const wins = typeof config.wins === "number" ? config.wins : null;
  const matches = typeof config.matches === "number" ? config.matches : null;
  const platform =
    typeof config.platform === "string" ? formatLabel(config.platform) : null;

  if (viewMode === "list") {
    return (
      <Link
        href={`/dashboard/orders/${order.id}`}
        className="grid gap-4 rounded-xl border border-white/[0.07] bg-[#0D120F] p-4 transition-colors hover:border-white/[0.12] hover:bg-[#101713] md:grid-cols-[minmax(0,1.25fr)_minmax(210px,.8fr)_auto]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-white/[0.08]">
            <Image
              src="/game-cards/rocket-league.webp"
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-gaming-value text-[11px] font-bold text-[#82F5A4]">
              {order.orderNumber}
            </p>
            <h3 className="mt-1 truncate text-sm font-semibold text-[#F4F7F5]">
              {item?.serviceName ?? "Gaming Service"}
            </h3>
            <p className="mt-1 text-[10px] text-[#667069]">
              {item?.gameName ?? "Rocket League"} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {resolvableRank(currentRank) ? (
            <div className="flex items-center gap-2">
              <Image
                src={rankAssets[rankFamily(currentRank)]}
                alt=""
                width={34}
                height={34}
                className="size-8 object-contain"
              />
              <div>
                <p className="text-[9px] text-[#667069]">Current</p>
                <p className="font-gaming-value text-[10px] font-bold text-[#F4F7F5]">
                  {rankLabel(currentRank)}
                </p>
              </div>
            </div>
          ) : null}

          {resolvableRank(targetRank) ? (
            <>
              <ArrowRight className="size-3.5 text-[#667069]" />
              <div className="flex items-center gap-2">
                <Image
                  src={rankAssets[rankFamily(targetRank)]}
                  alt=""
                  width={34}
                  height={34}
                  className="size-8 object-contain"
                />
                <div>
                  <p className="text-[9px] text-[#667069]">Target</p>
                  <p className="font-gaming-value text-[10px] font-bold text-[#F4F7F5]">
                    {rankLabel(targetRank)}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span
            className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-semibold ${statusClass(order)}`}
          >
            {operationalLabel(order)}
          </span>
          <span className="font-gaming-value text-sm font-bold text-[#F4F7F5]">
            {formatMoney(order.total)}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#0D120F] transition-[border-color,transform,background-color] hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#101713]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-white/[0.08]">
            <Image
              src="/game-cards/rocket-league.webp"
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
          <span className="font-gaming-value truncate text-[11px] font-bold text-[#F4F7F5]">
            {order.orderNumber}
          </span>
        </div>

        <span className="font-gaming-value text-sm font-bold text-[#F4F7F5]">
          {formatMoney(order.total)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
              {item?.gameName ?? "Rocket League"}
            </p>
            <h3 className="mt-1.5 truncate text-[15px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
              {item?.serviceName ?? "Gaming Service"}
            </h3>
          </div>

          <span
            className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-semibold ${statusClass(order)}`}
          >
            {operationalLabel(order)}
          </span>
        </div>

        <div className="mt-4 space-y-2.5 border-y border-white/[0.05] py-3.5">
          <RankLine label="Current Rank" value={currentRank} />
          <RankLine label="Desired Rank" value={targetRank} />

          {matches !== null ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#667069]">Placement Matches</span>
              <span className="font-gaming-value text-[11px] font-bold text-[#F4F7F5]">
                {matches}
              </span>
            </div>
          ) : null}

          {wins !== null ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#667069]">Wins</span>
              <span className="font-gaming-value text-[11px] font-bold text-[#F4F7F5]">
                {wins}
              </span>
            </div>
          ) : null}

          {platform ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#667069]">Platform</span>
              <span className="text-[11px] font-semibold text-[#F4F7F5]">
                {platform}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-3">
          <Extras configuration={config} />
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] text-[#667069]">Placed</p>
            <p className="mt-1 text-[10px] font-medium text-[#A0AAA4]">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <span className="inline-flex items-center text-[10px] font-semibold text-[#82F5A4]">
            Open Order
            <ArrowRight className="ml-1.5 size-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function DashboardOrdersHub({
  orders,
}: {
  orders: DashboardOrder[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [game, setGame] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return orders.filter((order) => {
      const item = order.items[0];
      const matchesGame =
        game === "all" ||
        item?.gameSlug === game ||
        item?.gameName?.toLowerCase().replace(/\s+/g, "-") === game;

      const matchesStatus = matchesFilter(order, filter);

      const matchesSearch =
        !needle ||
        order.orderNumber.toLowerCase().includes(needle) ||
        item?.serviceName?.toLowerCase().includes(needle) ||
        item?.gameName?.toLowerCase().includes(needle);

      return matchesGame && matchesStatus && matchesSearch;
    });
  }, [orders, filter, game, search]);

  const counts = {
    all: orders.length,
    placed: orders.filter((order) => matchesFilter(order, "placed")).length,
    active: orders.filter((order) => matchesFilter(order, "active")).length,
    delivered: orders.filter((order) => matchesFilter(order, "delivered")).length,
    completed: orders.filter((order) => matchesFilter(order, "completed")).length,
  };

  return (
    <div className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-[#667069]">
            Account Orders
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
            Orders
          </h1>
        </div>

        <p className="hidden text-[10px] text-[#667069] sm:block">
          {orders.length} total order{orders.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0B100D]">
            <div className="relative aspect-[1.7/1] overflow-hidden border-b border-white/[0.06]">
              <Image
                src="/game-cards/rocket-league.webp"
                alt=""
                fill
                sizes="190px"
                className="object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B100D] via-[#0B100D]/20 to-transparent" />
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => setGame("all")}
                className={`flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[11px] font-semibold transition-colors ${
                  game === "all"
                    ? "bg-[#39E56F]/[0.08] text-[#82F5A4]"
                    : "text-[#A0AAA4] hover:bg-white/[0.03]"
                }`}
              >
                <Gamepad2 className="size-4" />
                All Games
              </button>

              <button
                type="button"
                onClick={() => setGame("rocket-league")}
                className={`mt-1 flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[11px] font-semibold transition-colors ${
                  game === "rocket-league"
                    ? "bg-[#39E56F]/[0.08] text-[#82F5A4]"
                    : "text-[#A0AAA4] hover:bg-white/[0.03]"
                }`}
              >
                <span className="relative size-5 overflow-hidden rounded-md">
                  <Image
                    src="/game-cards/rocket-league.webp"
                    alt=""
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </span>
                Rocket League
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["placed", "Placed"],
                  ["active", "In Progress"],
                  ["delivered", "Delivered"],
                  ["completed", "Completed"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`h-9 rounded-lg border px-3 text-[10px] font-semibold transition-colors ${
                    filter === key
                      ? "border-[#39E56F]/20 bg-[#39E56F]/[0.075] text-[#82F5A4]"
                      : "border-white/[0.07] bg-[#0B100D] text-[#A0AAA4] hover:text-[#F4F7F5]"
                  }`}
                >
                  {label}
                  <span className="ml-1.5 text-[9px] opacity-60">{counts[key]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1 lg:w-[220px] lg:flex-none">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#667069]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search orders"
                  className="h-9 w-full rounded-lg border border-white/[0.07] bg-[#0B100D] pl-9 pr-3 text-[10px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-white/[0.14]"
                />
              </label>

              <div className="flex rounded-lg border border-white/[0.07] bg-[#0B100D] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`grid size-7 place-items-center rounded-md ${
                    viewMode === "grid"
                      ? "bg-white/[0.06] text-[#F4F7F5]"
                      : "text-[#667069]"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid2X2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`grid size-7 place-items-center rounded-md ${
                    viewMode === "list"
                      ? "bg-white/[0.06] text-[#F4F7F5]"
                      : "text-[#667069]"
                  }`}
                  aria-label="List view"
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {filteredOrders.length ? (
            <div
              className={
                viewMode === "grid"
                  ? "mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
                  : "mt-5 space-y-3"
              }
            >
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex min-h-[340px] items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-[#0B100D]/55 px-6 text-center">
              <div>
                <Clock3 className="mx-auto size-5 text-[#667069]" />
                <h2 className="mt-3 text-sm font-semibold text-[#F4F7F5]">
                  No orders found
                </h2>
                <p className="mt-1.5 max-w-sm text-[10px] leading-5 text-[#667069]">
                  Try another status, game or search term.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
