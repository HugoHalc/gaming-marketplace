import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Grid2X2,
  List,
  PackageOpen,
  Search,
} from "lucide-react";
import { ClaimOrderButton } from "@/components/booster/claim-order-button";
import { GameRankValue } from "@/components/orders/game-order-presentation";
import {
  gameCardAsset,
  normalizedGameSlug,
  resolveGameRank,
} from "@/components/orders/game-order-presentation-data";
import {
  listActiveBoosterOrders,
  listAvailableBoosterOrders,
  listCompletedBoosterOrders,
  type BoosterOrderCard,
} from "@/features/booster/server/booster-orders";

export const metadata = { title: "Booster Orders | BoostingPedia" };
export const dynamic = "force-dynamic";

type ViewKey = "all" | "placed" | "active" | "completed";
type LayoutKey = "grid" | "list";
type MarketplaceOrder = BoosterOrderCard & {
  bucket: Exclude<ViewKey, "all">;
};

type SupportedGameSlug =
  | "rocket-league"
  | "valorant"
  | "marvel-rivals"
  | "overwatch-2";
type GameFilterKey = "all" | SupportedGameSlug;

const SUPPORTED_GAMES: ReadonlyArray<{
  slug: SupportedGameSlug;
  label: string;
}> = [
  { slug: "rocket-league", label: "Rocket League" },
  { slug: "valorant", label: "Valorant" },
  { slug: "marvel-rivals", label: "Marvel Rivals" },
  { slug: "overwatch-2", label: "Overwatch 2" },
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

function platformLabel(value: string) {
  if (value === "pc") return "PC";
  if (value === "xbox") return "Xbox";
  if (value === "playstation") return "PlayStation";
  if (value === "nintendo-switch") return "Nintendo Switch";
  return formatLabel(value);
}

function boostMethodLabel(value: string) {
  if (value === "play-with-booster" || value === "duo") return "Play With Booster";
  if (value === "account" || value === "solo") return "Account Boost";
  return formatLabel(value);
}

function statusLabel(bucket: MarketplaceOrder["bucket"]) {
  if (bucket === "placed") return "Ready for Assignment";
  if (bucket === "active") return "In Progress";
  return "Completed";
}

function statusClasses(bucket: MarketplaceOrder["bucket"]) {
  if (bucket === "placed") {
    return "border-[#39E56F]/20 bg-[#39E56F]/[0.07] text-[#82F5A4]";
  }
  if (bucket === "active") {
    return "border-sky-300/15 bg-sky-300/[0.06] text-sky-200";
  }
  return "border-lime-300/15 bg-lime-300/[0.06] text-lime-200";
}

function isSupportedGameSlug(value: string): value is SupportedGameSlug {
  return SUPPORTED_GAMES.some((game) => game.slug === value);
}

function buildHref({
  view,
  game,
  layout,
  q,
}: {
  view: ViewKey;
  game: GameFilterKey;
  layout: LayoutKey;
  q: string;
}) {
  const params = new URLSearchParams();
  if (view !== "all") params.set("view", view);
  if (game !== "all") params.set("game", game);
  if (layout !== "grid") params.set("layout", layout);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/booster/orders?${query}` : "/booster/orders";
}

export default async function BoosterOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    game?: string;
    layout?: string;
    q?: string;
  }>;
}) {
  const query = await searchParams;
  const view: ViewKey =
    query.view === "placed" ||
    query.view === "active" ||
    query.view === "completed"
      ? query.view
      : "all";
  const layout: LayoutKey = query.layout === "list" ? "list" : "grid";
  const game: GameFilterKey =
    typeof query.game === "string" && isSupportedGameSlug(query.game)
      ? query.game
      : "all";
  const search = query.q?.trim() ?? "";

  const [available, active, completed] = await Promise.all([
    listAvailableBoosterOrders(),
    listActiveBoosterOrders(),
    listCompletedBoosterOrders(),
  ]);

  const allOrders: MarketplaceOrder[] = [
    ...available.map((entry) => ({ ...entry, bucket: "placed" as const })),
    ...active.map((entry) => ({ ...entry, bucket: "active" as const })),
    ...completed.map((entry) => ({ ...entry, bucket: "completed" as const })),
  ].sort(
    (a, b) =>
      new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime(),
  );

  const representedGameSlugs = new Set(
    allOrders
      .map((entry) => normalizedGameSlug(entry.order.items[0]?.gameName))
      .filter(isSupportedGameSlug),
  );

  const gameFilters = SUPPORTED_GAMES.filter(
    (entry) => representedGameSlugs.has(entry.slug) || game === entry.slug,
  );

  const visibleOrders = allOrders.filter((entry) => {
    if (view !== "all" && entry.bucket !== view) return false;

    const item = entry.order.items[0];
    if (game !== "all" && normalizedGameSlug(item?.gameName) !== game) {
      return false;
    }

    if (!search) return true;
    const haystack = [
      entry.order.orderNumber,
      item?.gameName,
      item?.serviceName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  const tabs: Array<[ViewKey, string, number]> = [
    ["all", "All", allOrders.length],
    ["placed", "Placed", available.length],
    ["active", "In Progress", active.length],
    ["completed", "Completed", completed.length],
  ];

  const selectedGame =
    game === "all"
      ? null
      : SUPPORTED_GAMES.find((entry) => entry.slug === game) ?? null;

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 xl:grid-cols-[178px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-20 overflow-hidden rounded-xl border border-white/[0.07] bg-[#080D0A]">
            <div className="relative h-28 overflow-hidden border-b border-white/[0.06]">
              <Image
                src={selectedGame ? gameCardAsset(selectedGame.label) : gameCardAsset(null)}
                alt=""
                fill
                sizes="178px"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080D0A] via-[#080D0A]/30 to-transparent" />
              <div className="absolute inset-x-3 bottom-3">
                <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/45">
                  Game Marketplace
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedGame?.label ?? "All Games"}
                </p>
              </div>
            </div>

            <nav className="p-2">
              <Link
                href={buildHref({ view, game: "all", layout, q: search })}
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-semibold transition-colors ${
                  game === "all"
                    ? "bg-[#39E56F]/[0.09] text-[#82F5A4]"
                    : "text-[#8D9791] hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <Gamepad2 className="size-3.5" />
                All Games
              </Link>

              {gameFilters.map((entry) => (
                <Link
                  key={entry.slug}
                  href={buildHref({
                    view,
                    game: entry.slug,
                    layout,
                    q: search,
                  })}
                  className={`mt-1 flex h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-semibold transition-colors ${
                    game === entry.slug
                      ? "bg-[#39E56F]/[0.09] text-[#82F5A4]"
                      : "text-[#8D9791] hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  <span className="relative size-4 overflow-hidden rounded">
                    <Image
                      src={gameCardAsset(entry.label)}
                      alt=""
                      fill
                      sizes="16px"
                      className="object-cover"
                    />
                  </span>
                  <span className="truncate">{entry.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {tabs.map(([key, label, count]) => (
                <Link
                  key={key}
                  href={buildHref({ view: key, game, layout, q: search })}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[9px] font-semibold transition-colors ${
                    view === key
                      ? "border-[#39E56F]/25 bg-[#39E56F]/[0.08] text-[#82F5A4]"
                      : "border-white/[0.07] bg-[#0A0F0C] text-[#A0AAA4] hover:border-white/[0.12] hover:text-white"
                  }`}
                >
                  {label}
                  <span className="font-gaming-value text-[8px] opacity-55">{count}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <form action="/booster/orders" className="relative min-w-0 flex-1 lg:w-[270px]">
                {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
                {game !== "all" ? <input type="hidden" name="game" value={game} /> : null}
                {layout !== "grid" ? <input type="hidden" name="layout" value={layout} /> : null}
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#667069]" />
                <input
                  name="q"
                  defaultValue={search}
                  placeholder="Search orders"
                  className="h-9 w-full rounded-lg border border-white/[0.07] bg-[#0A0F0C] pl-9 pr-3 text-[10px] text-white outline-none placeholder:text-[#58615C] focus:border-[#39E56F]/30"
                />
              </form>

              <div className="flex rounded-lg border border-white/[0.07] bg-[#0A0F0C] p-1">
                <Link
                  href={buildHref({ view, game, layout: "grid", q: search })}
                  aria-label="Grid view"
                  className={`grid size-7 place-items-center rounded-md transition-colors ${
                    layout === "grid"
                      ? "bg-white/[0.07] text-white"
                      : "text-[#667069] hover:text-white"
                  }`}
                >
                  <Grid2X2 className="size-3.5" />
                </Link>
                <Link
                  href={buildHref({ view, game, layout: "list", q: search })}
                  aria-label="List view"
                  className={`grid size-7 place-items-center rounded-md transition-colors ${
                    layout === "list"
                      ? "bg-white/[0.07] text-white"
                      : "text-[#667069] hover:text-white"
                  }`}
                >
                  <List className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {visibleOrders.length ? (
            <div
              className={`mt-5 grid gap-4 ${
                layout === "list"
                  ? "grid-cols-1"
                  : "md:grid-cols-2 2xl:grid-cols-3"
              }`}
            >
              {visibleOrders.map(({ order, payout, bucket, assignedAt }) => {
                const item = order.items[0];
                const config = item?.configuration ?? {};
                const gameName = item?.gameName;
                const gameSlug = normalizedGameSlug(gameName);
                const serviceName = item?.serviceName?.trim().toLowerCase() ?? "";
                const isOverwatch = gameSlug === "overwatch-2";
                const isMarvel = gameSlug === "marvel-rivals";

                const isOverwatchDrives =
                  isOverwatch && serviceName === "competitive drives";
                const isOverwatchPlacements =
                  isOverwatch && serviceName === "placements boost";
                const isOverwatchWins =
                  isOverwatch && serviceName === "competitive wins";
                const isOverwatchUnrated =
                  isOverwatch && serviceName === "unrated matches";

                const isMarvelPlacements =
                  isMarvel && serviceName === "placements boost";
                const isMarvelWins =
                  isMarvel && serviceName === "competitive wins";
                const isMarvelHero =
                  isMarvel && serviceName === "hero boost";
                const isMarvelUnrated =
                  isMarvel && serviceName === "unrated games";

                const hasCurrentRank =
                  typeof config.currentRank !== "undefined";

                let currentRankValue: unknown = hasCurrentRank
                  ? config.currentRank
                  : config.previousRank;
                let currentDivision: unknown = hasCurrentRank
                  ? config.currentDivision
                  : config.previousDivision;
                let targetRankValue: unknown = config.targetRank;
                let targetDivision: unknown = config.targetDivision;
                let currentRankLabel = hasCurrentRank ? "Current" : "Previous";
                let targetRankLabel = isMarvel ? "Desired" : "Target";

                if (isOverwatchDrives) {
                  currentRankValue = config.driveRank;
                  currentDivision = undefined;
                  targetRankValue = undefined;
                  targetDivision = undefined;
                  currentRankLabel = "Drive Rank";
                } else if (isOverwatchPlacements || isMarvelPlacements) {
                  currentRankValue = config.previousRank;
                  currentDivision = config.previousDivision;
                  targetRankValue = undefined;
                  targetDivision = undefined;
                  currentRankLabel = "Previous Rank";
                } else if (isOverwatchWins || isMarvelWins) {
                  targetRankValue = undefined;
                  targetDivision = undefined;
                  currentRankLabel = "Current Rank";
                } else if (
                  isOverwatchUnrated ||
                  isMarvelHero ||
                  isMarvelUnrated
                ) {
                  currentRankValue = undefined;
                  currentDivision = undefined;
                  targetRankValue = undefined;
                  targetDivision = undefined;
                } else if (isOverwatch) {
                  currentRankLabel = "Current Rank";
                  targetRankLabel = "Target Rank";
                }

                const currentResolved = resolveGameRank(
                  gameName,
                  currentRankValue,
                  currentDivision,
                );
                const targetResolved = resolveGameRank(
                  gameName,
                  targetRankValue,
                  targetDivision,
                );

                const platform =
                  typeof config.platform === "string"
                    ? platformLabel(config.platform)
                    : null;
                const playlist =
                  typeof config.playlist === "string"
                    ? formatLabel(config.playlist)
                    : null;
                const boostMethod =
                  typeof config.boostMethod === "string"
                    ? boostMethodLabel(config.boostMethod)
                    : null;
                const wins = typeof config.wins === "number" ? config.wins : null;
                const matches =
                  typeof config.matches === "number" ? config.matches : null;
                const games = typeof config.games === "number" ? config.games : null;
                const activityCount = matches ?? wins ?? games;
                const activityLabel =
                  matches !== null
                    ? "Matches"
                    : wins !== null
                      ? "Wins"
                      : games !== null
                        ? "Games"
                        : null;
                const hero =
                  typeof config.hero === "string" && config.hero
                    ? config.hero
                    : null;
                const currentProficiency =
                  typeof config.currentProficiency === "number"
                    ? config.currentProficiency
                    : null;
                const targetProficiency =
                  typeof config.targetProficiency === "number"
                    ? config.targetProficiency
                    : null;
                const proficiency =
                  currentProficiency !== null && targetProficiency !== null
                    ? `${currentProficiency} → ${targetProficiency}`
                    : null;
                const currentDrive =
                  isOverwatchDrives && typeof config.currentDrive === "number"
                    ? config.currentDrive
                    : null;
                const desiredDrive =
                  isOverwatchDrives && typeof config.desiredDrive === "number"
                    ? config.desiredDrive
                    : null;
                const driveProgression =
                  currentDrive !== null && desiredDrive !== null
                    ? `${currentDrive.toLocaleString("en-US")} → ${desiredDrive.toLocaleString("en-US")}`
                    : null;
                const eternityPoints =
                  isMarvel &&
                  config.currentRank === "eternity" &&
                  typeof config.eternityPoints === "number"
                    ? config.eternityPoints
                    : null;

                const hasRankPresentation = Boolean(
                  currentResolved || targetResolved,
                );
                const hasFallbackPresentation = Boolean(
                  hero || proficiency || activityCount !== null || platform,
                );

                return (
                  <article
                    key={order.id}
                    className="group overflow-hidden rounded-xl border border-white/[0.075] bg-[#090E0B] transition-colors hover:border-white/[0.13]"
                  >
                    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.055] px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="relative size-7 shrink-0 overflow-hidden rounded-md border border-white/[0.08]">
                          <Image
                            src={gameCardAsset(gameName)}
                            alt=""
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        </span>
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
                            className={`rounded-lg border px-2.5 py-1.5 text-[8px] font-semibold ${statusClasses(bucket)}`}
                          >
                            {statusLabel(bucket)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-gaming-label text-[7px] uppercase tracking-[0.16em] text-[#53605A]">
                            {item?.gameName ?? "Gaming"}
                          </p>
                          <h2 className="mt-1.5 truncate text-[14px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
                            {item?.serviceName ?? "Boosting Order"}
                          </h2>
                        </div>
                        {bucket === "placed" ? (
                          <span
                            className={`rounded-lg border px-2.5 py-1.5 text-[8px] font-semibold ${statusClasses(bucket)}`}
                          >
                            {statusLabel(bucket)}
                          </span>
                        ) : null}
                      </div>

                      {hasRankPresentation ? (
                        <div className="mt-4 flex min-h-[74px] items-center gap-3 border-y border-white/[0.055] py-3">
                          {currentResolved ? (
                            <div className="min-w-0 flex-1">
                              <GameRankValue
                                gameName={gameName}
                                value={currentRankValue}
                                division={currentDivision}
                                label={currentRankLabel}
                              />
                            </div>
                          ) : null}
                          {currentResolved && targetResolved ? (
                            <ArrowRight className="size-3.5 shrink-0 text-white/20" />
                          ) : null}
                          {targetResolved ? (
                            <div className="min-w-0 flex-1">
                              <GameRankValue
                                gameName={gameName}
                                value={targetRankValue}
                                division={targetDivision}
                                label={targetRankLabel}
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : hasFallbackPresentation ? (
                        <div className="mt-4 grid min-h-[74px] grid-cols-2 gap-4 border-y border-white/[0.055] py-3">
                          {hero ? (
                            <div className="min-w-0">
                              <p className="font-gaming-label text-[7px] uppercase tracking-[0.14em] text-[#53605A]">
                                Hero
                              </p>
                              <p className="mt-1.5 truncate text-[10px] font-semibold text-[#F4F7F5]">
                                {hero}
                              </p>
                            </div>
                          ) : activityCount !== null && activityLabel ? (
                            <div>
                              <p className="font-gaming-label text-[7px] uppercase tracking-[0.14em] text-[#53605A]">
                                {activityLabel}
                              </p>
                              <p className="font-gaming-value mt-1.5 text-[12px] font-bold text-[#F4F7F5]">
                                {activityCount}
                              </p>
                            </div>
                          ) : null}

                          {proficiency ? (
                            <div>
                              <p className="font-gaming-label text-[7px] uppercase tracking-[0.14em] text-[#53605A]">
                                Proficiency
                              </p>
                              <p className="font-gaming-value mt-1.5 text-[10px] font-bold text-[#F4F7F5]">
                                {proficiency}
                              </p>
                            </div>
                          ) : platform ? (
                            <div>
                              <p className="font-gaming-label text-[7px] uppercase tracking-[0.14em] text-[#53605A]">
                                Platform
                              </p>
                              <p className="mt-1.5 text-[10px] font-semibold text-[#F4F7F5]">
                                {platform}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-3 flex min-h-7 flex-wrap items-start gap-1.5">
                        {hasRankPresentation && activityCount !== null && activityLabel ? (
                          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                            {activityLabel}: {activityCount}
                          </span>
                        ) : null}
                        {driveProgression ? (
                          <span className="rounded-full border border-amber-300/10 bg-amber-300/[0.03] px-2 py-1 text-[8px] text-amber-100/80">
                            Drive: {driveProgression}
                          </span>
                        ) : null}
                        {eternityPoints !== null ? (
                          <span className="rounded-full border border-[#A38CFF]/10 bg-[#7A63F2]/[0.035] px-2 py-1 text-[8px] text-[#CEC5FF]/80">
                            Eternity Points: {eternityPoints}
                          </span>
                        ) : null}
                        {platform ? (
                          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                            {platform}
                          </span>
                        ) : null}
                        {playlist ? (
                          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                            {playlist}
                          </span>
                        ) : null}
                        {boostMethod ? (
                          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[8px] text-[#A0AAA4]">
                            {boostMethod}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/[0.055] pt-3">
                        <div>
                          <p className="text-[8px] text-[#59645E]">
                            {bucket === "placed"
                              ? "Placed"
                              : bucket === "active"
                                ? "Accepted"
                                : "Completed"}
                          </p>
                          <p className="font-gaming-value mt-1 text-[9px] text-[#A0AAA4]">
                            {formatDate(assignedAt ?? order.createdAt)}
                          </p>
                        </div>

                        {bucket !== "placed" ? (
                          <Link
                            href={`/booster/orders/${order.id}`}
                            className="inline-flex items-center text-[9px] font-semibold text-[#82F5A4] transition-colors hover:text-white"
                          >
                            Open Order
                            <ArrowRight className="ml-1.5 size-3" />
                          </Link>
                        ) : (
                          <span className="text-[8px] text-[#59645E]">Available now</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-[#080D0A]/40 text-center">
              <div>
                <PackageOpen className="mx-auto size-6 text-[#59645E]" />
                <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">No orders found</p>
                <p className="mt-1.5 text-[10px] text-[#7F8983]">
                  Try another status, game or search term.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
