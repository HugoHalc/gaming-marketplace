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
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";

type DashboardOrder = OrderRecord & {
  operationalState: string | null;
  autoCompleteAt: string | null;
};

type FilterKey = "all" | "placed" | "active" | "delivered" | "completed";
type ViewMode = "grid" | "list";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "placed", label: "Placed" },
  { key: "active", label: "In Progress" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

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
  if (order.operationalState === "accepted") return "Booster Assigned";
  if (order.operationalState === "in_progress") return "In Progress";
  if (order.operationalState === "completed" || order.status === "completed") {
    return "Completed";
  }
  if (order.status === "pending_payment") return "Placed";
  if (order.status === "paid" || order.status === "queued") {
    return "Ready for Assignment";
  }
  return formatLabel(order.status);
}

function statusClass(order: DashboardOrder) {
  const label = operationalLabel(order);

  if (label === "Completed") {
    return "border-[#39E56F]/15 bg-[#39E56F]/[0.05] text-[#82F5A4]";
  }
  if (label === "Delivered") {
    return "border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200";
  }
  if (label === "Issue") {
    return "border-rose-300/15 bg-rose-300/[0.05] text-rose-200";
  }
  if (label === "Waiting Customer") {
    return "border-amber-300/15 bg-amber-300/[0.05] text-amber-100";
  }
  if (label === "In Progress" || label === "Booster Assigned") {
    return "border-blue-300/15 bg-blue-300/[0.04] text-blue-100";
  }

  return "border-white/[0.08] bg-white/[0.025] text-[#A0AAA4]";
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

  return order.status === "completed" || order.operationalState === "completed";
}

function Extras({
  configuration,
}: {
  configuration: Record<string, string | number | boolean>;
}) {
  const extras: string[] = [];

  if (configuration.playlist) extras.push(String(configuration.playlist));
  if (configuration.boostMethod === "play-with-booster") {
    extras.push("Play With Booster");
  }
  if (configuration.liveStream === true) extras.push("Live Stream");
  if (configuration.expressDelivery === true || configuration.express === true) {
    extras.push("Express");
  }
  if (configuration.appearOffline === true) extras.push("Appear Offline");
  if (configuration.rankInsurance === true) extras.push("Rank Insurance");

  return extras.length ? (
    <div className="flex flex-wrap gap-1.5">
      {extras.slice(0, 4).map((extra) => (
        <span
          key={extra}
          className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-medium text-[#8D9892]"
        >
          {formatLabel(extra)}
        </span>
      ))}
    </div>
  ) : null;
}

function OrderGoal({ order, compact = false }: { order: DashboardOrder; compact?: boolean }) {
  const item = order.items[0];
  const config = item?.configuration ?? {};
  const currentRank =
    typeof config.currentRank !== "undefined"
      ? config.currentRank
      : config.previousRank;
  const targetRank = config.targetRank;
  const currentResolved = resolveRocketLeagueRank(currentRank);
  const targetResolved = resolveRocketLeagueRank(targetRank);
  const wins = typeof config.wins === "number" ? config.wins : null;
  const matches = typeof config.matches === "number" ? config.matches : null;
  const platform =
    typeof config.platform === "string" ? formatLabel(config.platform) : null;

  if (currentResolved || targetResolved) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        {currentResolved ? (
          <RocketLeagueRankValue
            value={currentRank}
            label="Current"
            size={compact ? "sm" : undefined}
          />
        ) : null}

        {currentResolved && targetResolved ? (
          <ArrowRight className="size-3.5 shrink-0 text-blue-200/25" />
        ) : null}

        {targetResolved ? (
          <RocketLeagueRankValue
            value={targetRank}
            label="Target"
            size={compact ? "sm" : undefined}
          />
        ) : null}
      </div>
    );
  }

  if (wins !== null || matches !== null) {
    return (
      <div>
        <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
          Goal
        </p>
        <p className="font-gaming-value mt-1 text-[12px] font-bold text-[#F4F7F5]">
          {matches !== null
            ? `${matches} Match${matches === 1 ? "" : "es"}`
            : `${wins} Win${wins === 1 ? "" : "s"}`}
        </p>
      </div>
    );
  }

  if (platform) {
    return (
      <div>
        <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
          Platform
        </p>
        <p className="mt-1 text-[11px] font-semibold text-[#F4F7F5]">
          {platform}
        </p>
      </div>
    );
  }

  return (
    <p className="text-[10px] text-[#667069]">
      Service details available inside the order.
    </p>
  );
}

function OrderRow({ order }: { order: DashboardOrder }) {
  const item = order.items[0];
  const config = item?.configuration ?? {};

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group relative block border-b border-white/[0.055] transition-colors hover:bg-white/[0.012]"
    >
      <div className="grid gap-4 px-1 py-5 md:grid-cols-[minmax(220px,1.05fr)_minmax(250px,.9fr)_minmax(160px,.7fr)_auto] md:items-center lg:px-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0B100D]">
            <Image
              src="/game-cards/rocket-league.webp"
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                {item?.gameName ?? "Gaming service"}
              </span>
              <span className="text-[8px] text-white/20">•</span>
              <span className="font-gaming-value text-[9px] font-bold text-[#82F5A4]">
                {order.orderNumber}
              </span>
            </div>

            <h3 className="mt-1.5 truncate text-[14px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
              {item?.serviceName ?? "Gaming Service"}
            </h3>

            <p className="mt-1 text-[9px] text-[#667069]">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <OrderGoal order={order} compact />
        </div>

        <div className="min-w-0">
          <Extras configuration={config} />
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span
            className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[8px] font-semibold ${statusClass(order)}`}
          >
            {operationalLabel(order)}
          </span>

          <div className="min-w-[74px] text-right">
            <p className="font-gaming-value text-[14px] font-bold text-[#F4F7F5]">
              {formatMoney(order.total)}
            </p>
          </div>

          <ArrowRight className="size-3.5 shrink-0 text-[#667069] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#A0AAA4]" />
        </div>
      </div>
    </Link>
  );
}

function OrderCard({ order }: { order: DashboardOrder }) {
  const item = order.items[0];
  const config = item?.configuration ?? {};

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#0A0E0C] transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#0C120F]"
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
          <span className="font-gaming-value truncate text-[9px] font-bold text-[#82F5A4]">
            {order.orderNumber}
          </span>
        </div>

        <span
          className={`shrink-0 rounded-md border px-2 py-1 text-[8px] font-semibold ${statusClass(order)}`}
        >
          {operationalLabel(order)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
          {item?.gameName ?? "Gaming service"}
        </p>
        <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.025em] text-[#F4F7F5]">
          {item?.serviceName ?? "Gaming Service"}
        </h3>

        <div className="mt-4 border-y border-white/[0.05] py-3.5">
          <OrderGoal order={order} />
        </div>

        <div className="mt-3 min-h-7">
          <Extras configuration={config} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-[8px] text-[#667069]">Placed</p>
            <p className="mt-1 text-[9px] font-medium text-[#A0AAA4]">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="font-gaming-value text-[15px] font-bold text-[#F4F7F5]">
              {formatMoney(order.total)}
            </p>
            <span className="mt-1 inline-flex items-center text-[9px] font-semibold text-[#82F5A4]">
              Open Order
              <ArrowRight className="ml-1.5 size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
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
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return orders.filter((order) => {
      const item = order.items[0];
      const normalizedGameName = item?.gameName
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const matchesGame = game === "all" || normalizedGameName === game;
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
    <div className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <header className="border-b border-white/[0.055] pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
              Customer Orders
            </p>
            <h1 className="mt-1 text-[30px] font-bold tracking-[-0.045em] text-[#F4F7F5]">
              Orders
            </h1>
            <p className="mt-2 text-[11px] leading-5 text-[#8D9892]">
              Track your services, progress and order details in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px]">
            <span className="text-[#667069]">
              Active <strong className="ml-1 font-gaming-value text-[#F4F7F5]">{counts.active}</strong>
            </span>
            <span className="text-[#667069]">
              Delivered <strong className="ml-1 font-gaming-value text-[#F4F7F5]">{counts.delivered}</strong>
            </span>
            <span className="text-[#667069]">
              Completed <strong className="ml-1 font-gaming-value text-[#F4F7F5]">{counts.completed}</strong>
            </span>
          </div>
        </div>
      </header>

      <section className="mt-5">
        <div className="flex flex-col gap-3 border-b border-white/[0.055] pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`relative h-9 shrink-0 px-2.5 text-[10px] font-semibold transition-colors ${
                  filter === key
                    ? "text-[#F4F7F5]"
                    : "text-[#667069] hover:text-[#A0AAA4]"
                }`}
              >
                {label}
                <span
                  className={`ml-1.5 font-gaming-value text-[9px] ${
                    filter === key ? "text-[#82F5A4]" : "text-[#667069]"
                  }`}
                >
                  {counts[key]}
                </span>
                {filter === key ? (
                  <span className="absolute inset-x-2 bottom-0 h-px bg-[#39E56F]" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-9 items-center rounded-lg border border-white/[0.07] bg-[#090D0B] p-1">
              <button
                type="button"
                onClick={() => setGame("all")}
                className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[9px] font-semibold transition-colors ${
                  game === "all"
                    ? "bg-white/[0.055] text-[#F4F7F5]"
                    : "text-[#667069] hover:text-[#A0AAA4]"
                }`}
              >
                <Gamepad2 className="size-3.5" />
                All Games
              </button>
              <button
                type="button"
                onClick={() => setGame("rocket-league")}
                className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[9px] font-semibold transition-colors ${
                  game === "rocket-league"
                    ? "bg-white/[0.055] text-[#F4F7F5]"
                    : "text-[#667069] hover:text-[#A0AAA4]"
                }`}
              >
                <span className="relative size-3.5 overflow-hidden rounded-sm">
                  <Image
                    src="/game-cards/rocket-league.webp"
                    alt=""
                    fill
                    sizes="14px"
                    className="object-cover"
                  />
                </span>
                Rocket League
              </button>
            </div>

            <label className="relative min-w-0 flex-1 sm:w-[220px] sm:flex-none">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#667069]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders"
                className="h-9 w-full rounded-lg border border-white/[0.07] bg-[#090D0B] pl-9 pr-3 text-[10px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-white/[0.14]"
              />
            </label>

            <div className="hidden h-9 rounded-lg border border-white/[0.07] bg-[#090D0B] p-1 sm:flex">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`grid size-7 place-items-center rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white/[0.055] text-[#F4F7F5]"
                    : "text-[#667069] hover:text-[#A0AAA4]"
                }`}
                aria-label="List view"
              >
                <List className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`grid size-7 place-items-center rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white/[0.055] text-[#F4F7F5]"
                    : "text-[#667069] hover:text-[#A0AAA4]"
                }`}
                aria-label="Grid view"
              >
                <Grid2X2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {filteredOrders.length ? (
          <>
            <div className="grid gap-4 pt-5 sm:grid-cols-2 lg:hidden">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            <div className="hidden lg:block">
              {viewMode === "list" ? (
                <div>
                  <div className="grid grid-cols-[minmax(220px,1.05fr)_minmax(250px,.9fr)_minmax(160px,.7fr)_auto] gap-4 border-b border-white/[0.05] px-3 py-3">
                    <span className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                      Service
                    </span>
                    <span className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                      Goal
                    </span>
                    <span className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                      Options
                    </span>
                    <span className="pr-6 text-right font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                      Status / Total
                    </span>
                  </div>
                  {filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 pt-5 lg:grid-cols-2 2xl:grid-cols-3">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-5 flex min-h-[300px] items-center justify-center border-y border-white/[0.05] px-6 text-center">
            <div>
              <Clock3 className="mx-auto size-5 text-[#667069]" />
              <h2 className="mt-3 text-sm font-semibold text-[#F4F7F5]">
                No orders found
              </h2>
              <p className="mt-1.5 text-[10px] text-[#667069]">
                Try another status, game or search term.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
