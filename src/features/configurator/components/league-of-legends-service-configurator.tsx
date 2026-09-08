"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  EyeOff,
  Gauge,
  LoaderCircle,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection, QuotePreview } from "../types/configurator";

const serviceNavigation = [
  { slug: "rank-boost", label: "Rank Boost", mobileLabel: "Rank" },
  { slug: "wins", label: "Ranked Wins Boost", mobileLabel: "Wins" },
  { slug: "placement-matches", label: "Placements Boost", mobileLabel: "Placements" },
  { slug: "unrated-matches", label: "Unrated Matches Boost", mobileLabel: "Unrated" },
  { slug: "arena-boost", label: "Arena Boost", mobileLabel: "Arena" },
  { slug: "mastery-boost", label: "Mastery Boost", mobileLabel: "Mastery" },
  { slug: "clash-boost", label: "Clash Boost", mobileLabel: "Clash" },
] as const;

const rankFamilies = [
  { label: "Iron", divisions: ["IV", "III", "II", "I"] },
  { label: "Bronze", divisions: ["IV", "III", "II", "I"] },
  { label: "Silver", divisions: ["IV", "III", "II", "I"] },
  { label: "Gold", divisions: ["IV", "III", "II", "I"] },
  { label: "Platinum", divisions: ["IV", "III", "II", "I"] },
  { label: "Emerald", divisions: ["IV", "III", "II", "I"] },
  { label: "Diamond", divisions: ["IV", "III", "II", "I"] },
] as const;

const rankOrder = rankFamilies.flatMap((family) =>
  family.divisions.map((division) => `${family.label} ${division}`),
);


const servers = [
  ["europe-west", "Europe West"],
  ["europe-nordic-east", "Europe Nordic East"],
  ["north-america", "North America"],
  ["latin-america-south", "Latin America South"],
  ["latin-america-north", "Latin America North"],
  ["brazil", "Brazil"],
  ["oceania", "Oceania"],
  ["russia", "Russia"],
  ["turkey", "Turkey"],
  ["japan", "Japan"],
  ["korea", "Korea"],
  ["china", "China"],
  ["philippines", "Philippines"],
  ["singapore", "Singapore"],
  ["taiwan", "Taiwan"],
  ["thailand", "Thailand"],
  ["vietnam", "Vietnam"],
  ["middle-east", "Middle East"],
] as const;

const currentLpOptions = [
  ["1", "1+ LP", "Base"],
  ["20", "20+ LP", "Base"],
  ["40", "40+ LP", "-2%"],
  ["60", "60+ LP", "-5%"],
  ["80", "80+ LP", "-7%"],
] as const;

const lpGainOptions = [
  ["37", "37 LP or more", "-15%"],
  ["34", "34 LP or more", "-10%"],
  ["31", "31 LP or more", "-5%"],
  ["27", "27 LP or more", "Base"],
  ["23", "23 LP or more", "Base"],
  ["19", "19 LP or more", "+5%"],
  ["14", "14 LP or more", "+15%"],
  ["9", "9 LP or more", "+50%"],
  ["8", "8 LP or less", "+90%"],
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function rankIndex(rank: string) {
  return rankOrder.indexOf(rank);
}

function splitRank(rank: string) {
  const [family, division] = rank.split(" ");
  return { family, division };
}

function firstRankForFamily(family: string) {
  return `${family} IV`;
}

function RankSelector({
  label,
  value,
  target,
  currentRank,
  allowUnranked,
  allowMaster,
  maxRank,
  onChange,
}: {
  label: string;
  value: string;
  target?: boolean;
  currentRank?: string;
  allowUnranked?: boolean;
  allowMaster?: boolean;
  maxRank?: string;
  onChange: (value: string) => void;
}) {
  const unranked = value === "Unranked";
  const master = value === "Master";
  const selected = splitRank(value);
  const currentIndex = currentRank ? rankIndex(currentRank) : -1;
  const maxIndex = maxRank ? rankIndex(maxRank) : Number.POSITIVE_INFINITY;

  function selectFamily(family: string) {
    if (!target) {
      const first = firstRankForFamily(family);
      if (rankIndex(first) <= maxIndex) onChange(first);
      return;
    }

    const candidate = rankFamilies
      .flatMap((item) => item.label === family ? item.divisions.map((division) => `${family} ${division}`) : [])
      .find((rank) => rankIndex(rank) > currentIndex);

    if (candidate) onChange(candidate);
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/65">
            {label}
          </p>
          <p className="font-gaming-value mt-1 text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
            {value}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl border border-amber-300/[0.15] bg-amber-300/[0.04] text-[10px] font-black uppercase tracking-[0.08em] text-amber-100/60">
          {unranked ? "UR" : master ? "M" : selected.family?.slice(0, 2)}
        </span>
      </div>

      {allowUnranked ? (
        <button
          type="button"
          onClick={() => onChange("Unranked")}
          className={`mt-4 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold transition-colors ${
            unranked
              ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
              : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          Unranked
          {unranked ? <Check className="size-3.5 text-[#82F5A4]" /> : null}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {rankFamilies.map((family) => {
          const available = target
            ? family.divisions.some((division) => rankIndex(`${family.label} ${division}`) > currentIndex)
            : family.divisions.some((division) => rankIndex(`${family.label} ${division}`) <= maxIndex);
          const active = !unranked && !master && selected.family === family.label;

          return (
            <button
              key={family.label}
              type="button"
              disabled={!available}
              onClick={() => selectFamily(family.label)}
              className={`min-w-0 rounded-xl border px-2 py-3 text-center transition-colors ${
                active
                  ? "border-amber-300/[0.22] bg-[#15170E] text-white"
                  : "border-white/[0.08] bg-[#090D0B] text-white/58 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-20`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.05em]">{family.label}</span>
            </button>
          );
        })}
      </div>

      {allowMaster ? (
        <button
          type="button"
          onClick={() => onChange("Master")}
          className={`mt-2 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold transition-colors ${
            master
              ? "border-amber-300/[0.22] bg-[#15170E] text-white"
              : "border-white/[0.08] bg-[#090D0B] text-white/58 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          Master
          {master ? <Check className="size-3.5 text-[#82F5A4]" /> : null}
        </button>
      ) : null}

      {!unranked && !master && selected.family ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Division
          </span>
          {(["IV", "III", "II", "I"] as const).map((division) => {
            const candidate = `${selected.family} ${division}`;
            const available = target ? rankIndex(candidate) > currentIndex : rankIndex(candidate) <= maxIndex;
            const active = value === candidate;
            return (
              <button
                key={division}
                type="button"
                disabled={!available}
                onClick={() => onChange(candidate)}
                className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-colors ${
                  active
                    ? "border-amber-300/[0.22] bg-[#15170E] text-white"
                    : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-20`}
              >
                {division}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Choice({
  active,
  label,
  meta,
  onClick,
}: {
  active: boolean;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left transition-colors ${
        active
          ? "border-amber-300/[0.20] bg-[#15170E] text-white"
          : "border-white/[0.08] bg-[#090D0B] text-white/62 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      {meta ? <span className="shrink-0 text-[10px] font-bold text-white/42">{meta}</span> : null}
    </button>
  );
}

function Quantity({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">{label}</p>
      <div className="mt-3 grid grid-cols-[2.75rem_1fr_2.75rem] gap-2">
        <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg text-white/60 hover:text-white">−</button>
        <div className="grid h-11 place-items-center rounded-xl border border-amber-300/[0.20] bg-[#15170E]">
          <span className="font-gaming-value text-lg font-bold text-white">{value}</span>
        </div>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg text-white/60 hover:text-white">+</button>
      </div>
      <p className="mt-2 text-[10px] text-white/30">Maximum {max} per order in the verified pricing data.</p>
    </div>
  );
}

function Extra({
  checked,
  title,
  price,
  description,
  icon,
  onChange,
}: {
  checked: boolean;
  title: string;
  price: string;
  description: string;
  icon: ReactNode;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        checked ? "border-amber-300/[0.20] bg-[#15170E]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-amber-100/65">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${price === "FREE" ? "text-[#82F5A4]" : "text-amber-100/60"}`}>{price}</span>
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]">{description}</span>
      </span>
      <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]" : "border-white/[0.12] text-transparent"}`}>
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    </button>
  );
}

export function LeagueOfLegendsServiceConfigurator({
  gameSlug,
  service,
}: {
  gameSlug: string;
  service: ServiceSummary;
}) {
  const router = useRouter();
  const isRank = service.slug === "rank-boost";
  const isWins = service.slug === "wins";
  const isPlacements = service.slug === "placement-matches";
  const isUnrated = service.slug === "unrated-matches";

  const [selection, setSelection] = useState<ConfiguratorSelection>({
    currentRank: isPlacements ? "Unranked" : "Gold IV",
    ...(isRank ? { targetRank: "Platinum IV", currentLp: "1", lpGain: "23" } : {}),
    ...(isWins ? { wins: 1, lpGain: "23" } : {}),
    ...((isPlacements || isUnrated) ? { matches: 1 } : {}),
    server: "europe-west",
    queue: "solo-duo",
    boostMethod: "account",
    platform: "pc",
    playOffline: false,
    championsPreferences: false,
    streaming: false,
    expressDelivery: false,
    oneTrickPony: false,
    soloQueueOnly: false,
    scoreMasking: false,
    rankInsurance: false,
    demotionShield: false,
    vipPriority: false,
    insaneClipDrop: false,
    eliteTier: false,
  });

  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const currentRank = String(selection.currentRank);
  const targetRank = String(selection.targetRank ?? "");

  useEffect(() => {
    if (!isRank) return;
    if (rankIndex(targetRank) <= rankIndex(currentRank)) {
      const next = rankOrder[rankIndex(currentRank) + 1];
      if (next) setSelection((current) => ({ ...current, targetRank: next }));
    }
  }, [currentRank, targetRank, isRank]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/quotes/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameSlug, serviceSlug: service.slug, selection }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as { quote?: QuotePreview; error?: string };
        if (!response.ok || !payload.quote) throw new Error(payload.error ?? "Unable to calculate quote.");
        setQuote(payload.quote);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setQuote(null);
        setError(requestError instanceof Error ? requestError.message : "Unable to calculate quote.");
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [gameSlug, service.slug, selection]);

  function update(key: string, value: string | number | boolean) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  async function createOrder() {
    if (!quote || isLoading || isCreatingOrder) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, serviceSlug: service.slug, selection }),
      });
      const payload = (await response.json()) as { order?: { id: string }; error?: string };

      if (response.status === 401) {
        const next = `/games/${gameSlug}/${service.slug}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!response.ok || !payload.order) throw new Error(payload.error ?? "Unable to create order.");
      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const serviceLabel = isRank
    ? "League of Legends Rank Boost"
    : isWins
      ? "League of Legends Ranked Wins"
      : isPlacements
        ? "League of Legends Placements"
        : "League of Legends Unrated Matches";

  const quantity = Number(isWins ? selection.wins : selection.matches ?? 1);
  const quantityMax = isUnrated ? 10 : 5;

  const summaryRows = useMemo(() => {
    const rows: Array<[string, string]> = [
      ["Boost method", selection.boostMethod === "duo" ? "Play with Booster" : "Account Boost"],
      ["Queue", selection.queue === "flex" ? "Flex" : "Solo - Duo"],
      ["Server", servers.find(([value]) => value === selection.server)?.[1] ?? "Europe West"],
      ["Platform", "PC"],
    ];

    if (isRank) {
      rows.splice(1, 0, ["Current LP", currentLpOptions.find(([value]) => value === selection.currentLp)?.[1] ?? "1+ LP"]);
      rows.splice(2, 0, ["LP gain", lpGainOptions.find(([value]) => value === selection.lpGain)?.[1] ?? "23 LP or more"]);
    } else if (isWins) {
      rows.splice(1, 0, ["LP gain", lpGainOptions.find(([value]) => value === selection.lpGain)?.[1] ?? "23 LP or more"]);
    }

    return rows;
  }, [selection, isRank, isWins]);

  return (
    <>
      <nav aria-label="League of Legends services" className="mb-4 xl:hidden">
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {serviceNavigation.map((item) => {
              const active = item.slug === service.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/games/league-of-legends/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-amber-300/[0.20] bg-[#15170E] text-[#F4F7F5]"
                      : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:text-white"
                  }`}
                >
                  {active ? <span className="mr-2 size-1.5 rounded-full bg-[#39E56F]" /> : null}
                  {item.mobileLabel}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
        <aside className="hidden xl:block">
          <nav className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5">
            <div className="px-2.5 pb-3 pt-2">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                League of Legends
              </p>
              <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
            </div>
            <div className="space-y-1.5">
              {serviceNavigation.map((item) => {
                const active = item.slug === service.slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/games/league-of-legends/${item.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                      active
                        ? "border-amber-300/[0.20] bg-[#15170E] text-[#F4F7F5]"
                        : "border-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                    {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" /> : null}
                  </Link>
                );
              })}
            </div>
            <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
            <Link href="/games/league-of-legends" className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 hover:text-white/65">
              League of Legends overview
            </Link>
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="grid gap-4 pb-24 2xl:grid-cols-[minmax(0,1fr)_23rem] 2xl:items-start 2xl:pb-0">
            <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080B09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
              <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.055] via-transparent to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/65">
                    <Sparkles className="size-3.5" />
                    {serviceLabel}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Configure your order inside the BoostingPedia flow.</p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">
                  Server-validated pricing
                </span>
              </div>

              <div className="space-y-5 p-4 sm:p-5 lg:p-6">
                {isRank ? (
                  <div className="relative grid gap-5 lg:grid-cols-2">
                    <span className="pointer-events-none absolute left-1/2 top-5 hidden size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-amber-200/45 lg:grid">
                      <ArrowRight className="size-3.5" />
                    </span>
                    <RankSelector label="Current rank" value={currentRank} maxRank="Diamond II" onChange={(value) => update("currentRank", value)} />
                    <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <RankSelector label="Desired rank" value={targetRank} target currentRank={currentRank} onChange={(value) => update("targetRank", value)} />
                    </div>
                  </div>
                ) : isUnrated ? null : (
                  <RankSelector
                    label={isPlacements ? "Previous rank" : "Current rank"}
                    value={currentRank}
                    allowUnranked={isPlacements}
                    allowMaster
                    onChange={(value) => update("currentRank", value)}
                  />
                )}

                {(isWins || isPlacements || isUnrated) ? (
                  <>
                    <div className="h-px bg-white/[0.07]" />
                    <Quantity
                      value={quantity}
                      max={quantityMax}
                      label={isWins ? "Ranked wins" : isPlacements ? "Placement matches" : "Unrated matches"}
                      onChange={(value) => update(isWins ? "wins" : "matches", value)}
                    />
                  </>
                ) : null}

                {isRank ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Current LP</p>
                      <div className="mt-3 grid gap-2">
                        {currentLpOptions.map(([value, label, meta]) => (
                          <Choice key={value} active={selection.currentLp === value} onClick={() => update("currentLp", value)} label={label} meta={meta} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">LP Gain</p>
                        <Gauge className="size-4 text-amber-200/45" />
                      </div>
                      <div className="mt-3 grid gap-2">
                        {lpGainOptions.map(([value, label, meta]) => (
                          <Choice key={value} active={selection.lpGain === value} onClick={() => update("lpGain", value)} label={label} meta={meta} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : isWins ? (
                  <div>
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">LP Gain</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {lpGainOptions.map(([value, label, meta]) => (
                        <Choice key={value} active={selection.lpGain === value} onClick={() => update("lpGain", value)} label={label} meta={meta} />
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Boost method</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Choice active={selection.boostMethod === "account"} onClick={() => update("boostMethod", "account")} label="Account Boost" meta="Base" />
                      <Choice
                        active={selection.boostMethod === "duo"}
                        onClick={() => update("boostMethod", "duo")}
                        label="Play with Booster"
                        meta={isWins ? "+75%" : isUnrated ? "+30%" : "+50%"}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Queue Type</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Choice active={selection.queue === "solo-duo"} onClick={() => update("queue", "solo-duo")} label="Solo - Duo" meta="FREE" />
                      <Choice active={selection.queue === "flex"} onClick={() => update("queue", "flex")} label="Flex" meta="FREE" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Server</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {servers.map(([value, label]) => (
                      <Choice
                        key={value}
                        active={selection.server === value}
                        onClick={() => update("server", value)}
                        label={label}
                        meta={value === "north-america" || value === "oceania" ? "+10%" : undefined}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/[0.07]" />

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Customize</p>
                      <p className="mt-1 text-sm font-semibold text-white">Add only the options you want.</p>
                    </div>
                    <Zap className="size-4 text-amber-200/50" />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Extra checked={selection.playOffline === true} onChange={(value) => update("playOffline", value)} icon={<EyeOff className="size-3.5" />} title="Play Offline" price="FREE" description="Keep your order activity discreet." />
                    <Extra checked={selection.championsPreferences === true} onChange={(value) => update("championsPreferences", value)} icon={<Users className="size-3.5" />} title="Champions Preferences" price="FREE" description="Share preferred champions with your booster." />
                    <Extra checked={selection.streaming === true} onChange={(value) => update("streaming", value)} icon={<MonitorPlay className="size-3.5" />} title="Streaming" price="+$7.00" description="BoostingPedia price after the 70% pricing rule." />
                    <Extra checked={selection.expressDelivery === true} onChange={(value) => update("expressDelivery", value)} icon={<Zap className="size-3.5" />} title="Express Delivery" price="+20%" description="Prioritize faster fulfillment." />
                    <Extra checked={selection.oneTrickPony === true} onChange={(value) => update("oneTrickPony", value)} icon={<Trophy className="size-3.5" />} title="One Trick Pony" price="+30%" description="Use the documented one-trick option." />
                    <Extra checked={selection.soloQueueOnly === true} onChange={(value) => update("soloQueueOnly", value)} icon={<ShieldCheck className="size-3.5" />} title="Solo Queue Only" price="+40%" description="Restrict the order to solo queue play." />
                    <Extra checked={selection.scoreMasking === true} onChange={(value) => update("scoreMasking", value)} icon={<EyeOff className="size-3.5" />} title="Score Masking" price="+50%" description="Apply the documented score masking option." />
                    {isRank ? (
                      <Extra checked={selection.rankInsurance === true} onChange={(value) => update("rankInsurance", value)} icon={<ShieldCheck className="size-3.5" />} title="Rank Insurance" price="+50%" description="Add the documented rank insurance option." />
                    ) : null}
                    {isWins ? (
                      <Extra checked={selection.demotionShield === true} onChange={(value) => update("demotionShield", value)} icon={<ShieldCheck className="size-3.5" />} title="Demotion Shield" price="+20%" description="Add the documented demotion shield option." />
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:grid-cols-3">
                  {[
                    "70% of normal BM pricing.",
                    "Temporary -15% campaign excluded.",
                    "Progressive discounts applied automatically.",
                  ].map((note) => (
                    <div key={note} className="flex items-center gap-2 text-[10px] text-white/40">
                      <Check className="size-3 shrink-0 text-emerald-300" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside id="boost-summary" className="scroll-mt-24 2xl:sticky 2xl:top-24">
              <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
                <div className="border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.05] via-transparent to-transparent px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">Order Summary</p>
                      <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">{serviceLabel}</p>
                    </div>
                    {isLoading ? (
                      <LoaderCircle className="size-4 animate-spin text-[#82F5A4]" />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-medium text-[#82F5A4]"><Check className="size-3" />Ready</span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {isRank ? (
                    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">Current</p>
                          <p className="font-gaming-value mt-0.5 text-sm font-bold text-[#F4F7F5]">{currentRank}</p>
                        </div>
                        <ArrowRight className="size-3.5 text-amber-200/35" />
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">Desired</p>
                          <p className="font-gaming-value mt-0.5 text-sm font-bold text-[#F4F7F5]">{targetRank}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">{isUnrated ? "Service" : isPlacements ? "Previous rank" : "Current rank"}</p>
                          <p className="font-gaming-value mt-0.5 text-sm font-bold text-[#F4F7F5]">{isUnrated ? "Unrated" : currentRank}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">{isWins ? "Wins" : "Matches"}</p>
                          <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">{quantity}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 divide-y divide-white/[0.06]">
                    {summaryRows.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 py-2 text-[11px]">
                        <span className="text-white/40">{label}</span>
                        <span className="font-medium text-white/78">{value}</span>
                      </div>
                    ))}
                  </div>

                  {error ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{error}</div> : null}

                  {quote ? (
                    <>
                      <div className="my-4 h-px bg-white/[0.08]" />
                      <div className="space-y-2">
                        {quote.breakdown.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                            <span className="text-[#A0AAA4]">{item.label}</span>
                            <span className={item.amount < 0 ? "font-medium text-[#82F5A4]" : "font-medium text-white/78"}>
                              {item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="my-4 h-px bg-white/[0.08]" />
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-medium text-[#A0AAA4]">Total</p>
                          <p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">{formatPrice(quote.total)}</p>
                          {quote.total < 5 ? <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-amber-200/70">Minimum purchase: $5.00</p> : null}
                        </div>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] text-white/45">USD</span>
                      </div>
                    </>
                  ) : null}

                  {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{orderError}</div> : null}

                  <Button
                    className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none hover:bg-[#20C95A] hover:text-[#050807]"
                    size="lg"
                    disabled={!quote || quote.total < 5 || isLoading || isCreatingOrder}
                    onClick={createOrder}
                  >
                    {isCreatingOrder ? <>Creating order<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Create secure order<ArrowRight className="ml-2 size-4" /></>}
                  </Button>
                  <p className="mt-3 text-center text-[10px] leading-4 text-white/35">Final price is validated on the server before the order is stored.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-4 py-3 backdrop-blur-xl 2xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p>
            <p className="font-gaming-value mt-0.5 text-[1.55rem] font-bold leading-none text-[#F4F7F5]">{quote ? formatPrice(quote.total) : "—"}</p>
          </div>
          <a href="#boost-summary" className="inline-flex h-11 items-center justify-center rounded-xl bg-[#39E56F] px-5 text-sm font-bold text-[#050807]">
            View order<ArrowRight className="ml-2 size-4" />
          </a>
        </div>
      </div>
    </>
  );
}
