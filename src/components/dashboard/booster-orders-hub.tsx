"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gamepad2, Grid2X2, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ClaimOrderButton } from "@/components/booster/claim-order-button";
import type { OrderRecord } from "@/features/orders/types/orders";
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";

type BoosterOrderEntry = {
  order: OrderRecord;
  payout: number;
  payoutRateBps: number;
  assignedAt: string | null;
};

type Bucket = "placed" | "active" | "completed";
type FilterKey = "all" | Bucket;
type ViewMode = "grid" | "list";
type MarketplaceEntry = BoosterOrderEntry & { bucket: Bucket };

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

function statusLabel(bucket: Bucket) {
  if (bucket === "placed") return "Ready for Assignment";
  if (bucket === "active") return "In Progress";
  return "Completed";
}

function statusClass(bucket: Bucket) {
  if (bucket === "placed") {
    return "border-[#39E56F]/20 bg-[#39E56F]/[0.07] text-[#82F5A4]";
  }
  if (bucket === "active") {
    return "border-sky-300/15 bg-sky-300/[0.06] text-sky-200";
  }
  return "border-lime-300/15 bg-lime-300/[0.06] text-lime-200";
}

export function BoosterOrdersHub({
  available,
  active,
  completed,
}: {
  available: BoosterOrderEntry[];
  active: BoosterOrderEntry[];
  completed: BoosterOrderEntry[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [game, setGame] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const entries = useMemo<MarketplaceEntry[]>(
    () =>
      [
        ...available.map((entry) => ({ ...entry, bucket: "placed" as const })),
        ...active.map((entry) => ({ ...entry, bucket: "active" as const })),
        ...completed.map((entry) => ({ ...entry, bucket: "completed" as const })),
      ].sort(
        (a, b) =>
          new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime(),
      ),
    [available, active, completed],
  );

  const visibleOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return entries.filter((entry) => {
      if (filter !== "all" && entry.bucket !== filter) return false;

      const item = entry.order.items[0];
      const normalizedGameName = item?.gameName
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      if (game !== "all" && normalizedGameName !== game) return false;

      if (!needle) return true;

      return [entry.order.orderNumber, item?.gameName, item?.serviceName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [entries, filter, game, search]);

  const counts = {
    all: entries.length,
    placed: available.length,
    active: active.length,
    completed: completed.length,
  };

  return (
    <div className="mx-auto w-full max-w-[1520px] px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
            Booster Orders
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
            Orders
          </h1>
          <p className="mt-2 text-[10px] text-[#A0AAA4]">
            Accept available work and manage your active services.
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B100D] px-3 text-[9px] font-semibold text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
        >
          Customer Orders
        </Link>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[178px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0B100D]">
            <div className="relative aspect-[1.7/1] overflow-hidden border-b border-white/[0.05]">
              <Image
                src="/game-cards/rocket-league.webp"
                alt=""
                fill
                sizes="178px"
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B100D] via-transparent to-transparent" />
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => setGame("all")}
                className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[10px] font-semibold transition-colors ${
                  game === "all"
                    ? "bg-[#39E56F]/[0.07] text-[#82F5A4]"
                    : "text-[#A0AAA4] hover:bg-white/[0.03]"
                }`}
              >
                <Gamepad2 className="size-3.5" />
                All Games
              </button>

              <button
                type="button"
                onClick={() => setGame("rocket-league")}
                className={`mt-1 flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[10px] font-semibold transition-colors ${
                  game === "rocket-league"
                    ? "bg-[#39E56F]/[0.07] text-[#82F5A4]"
                    : "text-[#A0AAA4] hover:bg-white/[0.03]"
                }`}
              >
                <span className="relative size-4 overflow-hidden rounded">
                  <Image
                    src="/game-cards/rocket-league.webp"
                    alt=""
                    fill
                    sizes="16px"
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
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["placed", "Placed"],
                  ["active", "In Progress"],
                  ["completed", "Completed"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`h-9 rounded-lg border px-3 text-[9px] font-semibold transition-colors ${
                    filter === key
                      ? "border-[#39E56F]/20 bg-[#39E56F]/[0.07] text-[#82F5A4]"
                      : "border-white/[0.07] bg-[#0B100D] text-[#A0AAA4] hover:text-[#F4F7F5]"
                  }`}
                >
                  {label}
                  <span className="ml-1.5 opacity-55">{counts[key]}</span>
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

          <div
            className={
              viewMode === "grid"
                ? "mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
                : "mt-5 grid grid-cols-1 gap-3"
            }
          >
            {visibleOrders.map(({ order, payout, bucket }) => {
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

              return (
                <article
                  key={`${bucket}-${order.id}`}
                  className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0B100D]"
                >
                  <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3">
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
                      <span className="font-gaming-value text-sm font-bold text-[#F4F7F5]">
                        {formatMoney(payout)}
                      </span>
                      {bucket === "placed" ? (
                        <ClaimOrderButton orderId={order.id} compact />
                      ) : (
                        <span
                          className={`rounded-lg border px-2.5 py-1.5 text-[8px] font-semibold ${statusClass(bucket)}`}
                        >
                          {statusLabel(bucket)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
                          {item?.gameName ?? "Rocket League"}
                        </p>
                        <h2 className="mt-1 truncate text-[14px] font-semibold text-[#F4F7F5]">
                          {item?.serviceName ?? "Gaming Service"}
                        </h2>
                      </div>

                      {bucket === "placed" ? (
                        <span
                          className={`shrink-0 rounded-lg border px-2 py-1 text-[8px] font-semibold ${statusClass(bucket)}`}
                        >
                          {statusLabel(bucket)}
                        </span>
                      ) : null}
                    </div>

                    {currentResolved || targetResolved ? (
                      <div className="mt-4 flex min-h-[64px] items-center gap-3 border-y border-white/[0.05] py-3">
                        {currentResolved ? (
                          <div className="min-w-0 flex-1">
                            <RocketLeagueRankValue value={currentRank} label="Current" />
                          </div>
                        ) : null}
                        {currentResolved && targetResolved ? (
                          <ArrowRight className="size-3.5 shrink-0 text-white/20" />
                        ) : null}
                        {targetResolved ? (
                          <div className="min-w-0 flex-1">
                            <RocketLeagueRankValue value={targetRank} label="Target" />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4 border-y border-white/[0.05] py-3">
                        <p className="text-[8px] text-[#667069]">Platform</p>
                        <p className="mt-1 text-[10px] font-semibold text-[#F4F7F5]">
                          {platform ?? "Not specified"}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[8px] text-[#667069]">Placed</p>
                        <p className="mt-1 text-[9px] font-medium text-[#A0AAA4]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {bucket === "placed" ? (
                        <span className="text-[9px] font-semibold text-[#82F5A4]">
                          Available to accept
                        </span>
                      ) : (
                        <Link
                          href={`/dashboard/orders/${order.id}?mode=booster`}
                          className="inline-flex items-center text-[9px] font-semibold text-[#82F5A4]"
                        >
                          Open Order
                          <ArrowRight className="ml-1.5 size-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!visibleOrders.length ? (
            <div className="mt-5 flex min-h-[260px] items-center justify-center border-y border-white/[0.05] text-center">
              <div>
                <p className="text-sm font-semibold text-[#F4F7F5]">No orders found</p>
                <p className="mt-1.5 text-[10px] text-[#667069]">
                  Try another status, game or search term.
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
