"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  EyeOff,
  Gauge,
  LoaderCircle,
  Monitor,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import type {
  ConfiguratorSelection,
  QuotePreview,
  ServiceConfiguratorSchema,
} from "../types/configurator";

const rankFamilies = [
  { key: "iron", label: "Iron", image: "/ranks/valorant/iron.png", tiers: ["1", "2", "3"] },
  { key: "bronze", label: "Bronze", image: "/ranks/valorant/bronze.png", tiers: ["1", "2", "3"] },
  { key: "silver", label: "Silver", image: "/ranks/valorant/silver.png", tiers: ["1", "2", "3"] },
  { key: "gold", label: "Gold", image: "/ranks/valorant/gold.png", tiers: ["1", "2", "3"] },
  { key: "platinum", label: "Platinum", image: "/ranks/valorant/platinum.png", tiers: ["1", "2", "3"] },
  { key: "diamond", label: "Diamond", image: "/ranks/valorant/diamond.png", tiers: ["1", "2", "3"] },
  { key: "ascendant", label: "Ascendant", image: "/ranks/valorant/ascendant.png", tiers: ["1", "2", "3"] },
  { key: "immortal", label: "Immortal", image: "/ranks/valorant/immortal.png", tiers: [] },
] as const;

const rankOrder = [
  "iron-1", "iron-2", "iron-3",
  "bronze-1", "bronze-2", "bronze-3",
  "silver-1", "silver-2", "silver-3",
  "gold-1", "gold-2", "gold-3",
  "platinum-1", "platinum-2", "platinum-3",
  "diamond-1", "diamond-2", "diamond-3",
  "ascendant-1", "ascendant-2", "ascendant-3",
  "immortal",
] as const;

type RankId = (typeof rankOrder)[number];

const rrGainOptions = [
  { value: "10", label: "10+ RR", meta: "+20%" },
  { value: "20", label: "20+ RR", meta: "Base" },
  { value: "30", label: "30+ RR", meta: "Base" },
  { value: "45", label: "45+ RR", meta: "-10%" },
] as const;

const rrAmountOptions = [
  { value: "0-20", label: "0–20 RR", meta: "Base" },
  { value: "21-40", label: "21–40 RR", meta: "-4%" },
  { value: "41-60", label: "41–60 RR", meta: "-5%" },
  { value: "61-80", label: "61–80 RR", meta: "-6%" },
  { value: "81-100", label: "81–100 RR", meta: "-8%" },
] as const;

const servers = [
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "brazil", label: "Brazil" },
  { value: "korea", label: "Korea" },
  { value: "sea-oce", label: "SEA/OCE" },
  { value: "latin-america", label: "Latin America" },
] as const;

function rankIndex(rank: string) {
  return rankOrder.indexOf(rank as RankId);
}

function familyForRank(rank: string) {
  return rankFamilies.find((family) => rank === family.key || rank.startsWith(`${family.key}-`))
    ?? rankFamilies[0];
}

function rankLabel(rank: string) {
  if (rank === "immortal") return "Immortal";
  const family = familyForRank(rank);
  const tier = rank.split("-").at(-1);
  return `${family.label} ${tier === "1" ? "I" : tier === "2" ? "II" : "III"}`;
}


function firstRankForFamily(familyKey: string) {
  if (familyKey === "immortal") return "immortal";
  return `${familyKey}-1`;
}

function firstAvailableRankForFamily(familyKey: string, currentRank: string) {
  if (familyKey === "immortal") {
    return rankIndex("immortal") > rankIndex(currentRank) ? "immortal" : null;
  }

  for (const tier of ["1", "2", "3"]) {
    const candidate = `${familyKey}-${tier}`;
    if (rankIndex(candidate) > rankIndex(currentRank)) return candidate;
  }

  return null;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function RankIcon({
  rank,
  selected,
}: {
  rank: string;
  selected?: boolean;
}) {
  const family = familyForRank(rank);

  return (
    <span className="relative grid size-[3.1rem] place-items-center">
      <Image
        src={family.image}
        alt=""
        width={46}
        height={46}
        sizes="46px"
        className={`relative z-[1] h-[2.7rem] w-[2.7rem] object-contain opacity-90 transition-[opacity,transform] duration-200 ease-out drop-shadow-[0_6px_12px_rgba(0,0,0,.45)] group-hover/rank:opacity-100 group-hover/rank:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none ${selected ? "opacity-100" : ""}`}
      />
      {selected ? (
        <span className="absolute -right-0.5 -top-0.5 z-[2] grid size-4 place-items-center rounded-full border border-[#39E56F]/35 bg-[#39E56F] text-[#050807]">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}

function CompactRankSelector({
  value,
  currentRank,
  target,
  allowUnrated,
  omitImmortalCurrent,
  onChange,
}: {
  value: string;
  currentRank?: string;
  target?: boolean;
  allowUnrated?: boolean;
  omitImmortalCurrent?: boolean;
  onChange: (value: string) => void;
}) {
  const unrated = value === "unrated";
  const selectedFamily = unrated ? null : familyForRank(value);
  const currentIndex = currentRank ? rankIndex(currentRank) : -1;

  const visibleFamilies = rankFamilies.filter((family) => {
    if (omitImmortalCurrent && family.key === "immortal") return false;
    if (!target) return true;
    return firstAvailableRankForFamily(family.key, currentRank ?? "") !== null;
  });

  function chooseFamily(familyKey: string) {
    if (!target) {
      onChange(firstRankForFamily(familyKey));
      return;
    }
    const next = firstAvailableRankForFamily(familyKey, currentRank ?? "");
    if (next) onChange(next);
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-rose-300/[0.12] bg-rose-400/[0.035]">
          {unrated ? (
            <span className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">NR</span>
          ) : (
            <Image
              src={selectedFamily?.image ?? rankFamilies[0].image}
              alt=""
              width={44}
              height={44}
              sizes="44px"
              className="h-10 w-10 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.42)]"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-200/65">
            {target ? "Target rank" : "Current rank"}
          </p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
            {unrated ? "Unrated" : rankLabel(value)}
          </p>
        </div>
      </div>

      {allowUnrated ? (
        <button
          type="button"
          onClick={() => onChange("unrated")}
          className={`mt-4 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-semibold transition-colors ${
            unrated
              ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
              : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          <span>Unrated</span>
          {unrated ? (
            <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
          ) : null}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {visibleFamilies.map((family) => {
          const selected = selectedFamily?.key === family.key;
          return (
            <button
              key={family.key}
              type="button"
              title={family.label}
              onClick={() => chooseFamily(family.key)}
              className={`group/rank relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 transition-[border-color,background-color,transform] duration-200 ease-out motion-reduce:transition-none ${
                selected
                  ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span className={`pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity ${
                selected ? "opacity-80" : "opacity-35"
              }`} />
              {selected ? (
                <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#39E56F]/55 to-transparent" />
              ) : null}
              <RankIcon rank={firstRankForFamily(family.key)} selected={selected} />
              <span
                className={`mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-semibold leading-3.5 transition-colors ${
                  selected ? "text-white" : "text-white/68 group-hover/rank:text-white/90"
                }`}
              >
                {family.label}
              </span>
            </button>
          );
        })}
      </div>

      {!unrated && selectedFamily && selectedFamily.key !== "immortal" ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Tier
          </span>
          {selectedFamily.tiers.map((tier) => {
            const candidate = `${selectedFamily.key}-${tier}`;
            const available = !target || rankIndex(candidate) > currentIndex;
            const active = value === candidate;

            return (
              <button
                key={tier}
                type="button"
                disabled={!available}
                onClick={() => onChange(candidate)}
                className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-[border-color,background-color,color] ${
                  active
                    ? "border-[#39E56F]/28 bg-[#39E56F]/[0.04] text-[#F4F7F5]"
                    : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-20`}
              >
                {tier === "1" ? "I" : tier === "2" ? "II" : "III"}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ChoicePill({
  active,
  onClick,
  label,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
        active
          ? "border-rose-300/[0.18] bg-[#131B17] text-[#F4F7F5]"
          : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {meta ? <span className="text-[10px] font-bold text-white/42">{meta}</span> : null}
        {active ? (
          <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        ) : null}
      </span>
    </button>
  );
}

function CompactExtra({
  checked,
  onChange,
  icon,
  title,
  price,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  title: string;
  price: string;
  description: string;
}) {
  const isFree = price === "FREE";

  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
        checked
          ? "border-rose-300/[0.18] bg-[#131B17]"
          : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg border transition-colors ${
          checked
            ? "border-white/[0.12] bg-[#090D0B] text-rose-200/80"
            : "border-white/[0.07] bg-white/[0.025] text-white/55 group-hover/extra:text-white/75"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${isFree ? "text-[#82F5A4]" : "text-rose-200/60"}`}>
            {price}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]" title={description}>
          {description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`grid size-4 shrink-0 place-items-center rounded-full border ${
          checked
            ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]"
            : "border-white/[0.12] bg-white/[0.02] text-transparent"
        }`}
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    </button>
  );
}

function QuantityControl({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-[2.75rem_1fr_2.75rem] gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 transition-colors hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
        >
          −
        </button>
        <div className="grid h-11 place-items-center rounded-xl border border-rose-300/[0.18] bg-[#131B17]">
          <span className="font-gaming-value text-lg font-bold text-white">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 transition-colors hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
        >
          +
        </button>
      </div>
      <p className="mt-2 text-[10px] text-white/30">Maximum {max} per order.</p>
    </div>
  );
}

export function ValorantServiceConfigurator({
  gameSlug,
  service,
}: {
  gameSlug: string;
  service: ServiceSummary;
  schema: ServiceConfiguratorSchema;
}) {
  const router = useRouter();
  const isRankBoost = service.slug === "rank-boost";
  const isWins = service.slug === "wins";
  const isPlacements = service.slug === "placement-matches" || service.slug === "placements-boost";

  const [selection, setSelection] = useState<ConfiguratorSelection>({
    currentRank: isPlacements ? "unrated" : "gold-1",
    ...(isRankBoost ? { targetRank: "platinum-1", rrAmount: "0-20" } : {}),
    ...(isWins ? { wins: 1 } : {}),
    ...(isPlacements ? { matches: 1 } : {}),
    ...(isRankBoost || isWins ? { rrGain: "20" } : {}),
    queue: "solo",
    server: "north-america",
    platform: "pc",
    playOffline: false,
    agentPreferences: false,
    liveStream: false,
    expressDelivery: false,
    extraWin: false,
    rankInsurance: false,
  });

  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const currentRank = String(selection.currentRank);
  const targetRank = String(selection.targetRank ?? "");

  useEffect(() => {
    if (!isRankBoost) return;
    if (rankIndex(targetRank) <= rankIndex(currentRank)) {
      const next = rankOrder[rankIndex(currentRank) + 1];
      if (next) setSelection((current) => ({ ...current, targetRank: next }));
    }
  }, [currentRank, targetRank, isRankBoost]);

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

        if (!response.ok || !payload.quote) {
          throw new Error(payload.error ?? "Unable to calculate quote.");
        }

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
      const payload = (await response.json()) as {
        order?: { id: string; orderNumber: string };
        error?: string;
      };

      if (response.status === 401) {
        const next = `/games/${gameSlug}/${service.slug}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to create order.");
      }

      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const serviceLabel = isRankBoost
    ? "Valorant Rank Boost"
    : isWins
      ? "Valorant Competitive Wins"
      : "Valorant Placements Boost";

  const summaryRows = useMemo(() => {
    const rows: Array<[string, string]> = [
      ["Boost type", selection.queue === "duo" ? "Duo" : "Solo"],
      ["Server", servers.find((server) => server.value === selection.server)?.label ?? "North America"],
      ["Platform", "PC"],
    ];

    if (isRankBoost || isWins) {
      rows.splice(1, 0, [
        "RR gain",
        rrGainOptions.find((item) => item.value === selection.rrGain)?.label ?? "20+ RR",
      ]);
    }

    if (isRankBoost) {
      rows.splice(2, 0, [
        "RR amount",
        rrAmountOptions.find((item) => item.value === selection.rrAmount)?.label ?? "0–20 RR",
      ]);
    }

    return rows;
  }, [selection, isRankBoost, isWins, isPlacements]);

  return (
    <div className="grid gap-4 pb-24 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:pb-0">
      <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080b09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-gradient-to-br from-rose-500/[0.055] via-transparent to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-200/65">
              <Sparkles className="size-3.5" />
              {serviceLabel}
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Configure your full order without leaving this panel.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">
            Live server pricing
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-5 lg:p-6">
          {isRankBoost ? (
            <div className="relative grid gap-5 lg:grid-cols-2">
              <span className="pointer-events-none absolute left-1/2 top-5 hidden size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-rose-200/45 lg:grid">
                <ArrowRight className="size-3.5" />
              </span>
              <CompactRankSelector
                value={currentRank}
                omitImmortalCurrent
                onChange={(value) => update("currentRank", value)}
              />
              <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <CompactRankSelector
                  value={targetRank}
                  currentRank={currentRank}
                  target
                  onChange={(value) => update("targetRank", value)}
                />
              </div>
            </div>
          ) : (
            <CompactRankSelector
              value={currentRank}
              allowUnrated={isPlacements}
              onChange={(value) => update("currentRank", value)}
            />
          )}

          <div className="h-px bg-white/[0.07]" />

          {(isWins || isPlacements) ? (
            <QuantityControl
              value={Number(isWins ? selection.wins : selection.matches)}
              min={1}
              max={5}
              label={isWins ? "Competitive wins" : "Placement matches"}
              onChange={(value) => update(isWins ? "wins" : "matches", value)}
            />
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Boost type
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Choose Solo or Duo.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ChoicePill
                  active={selection.queue === "solo"}
                  onClick={() => update("queue", "solo")}
                  label="Solo"
                  meta="Base"
                />
                <ChoicePill
                  active={selection.queue === "duo"}
                  onClick={() => update("queue", "duo")}
                  label="Duo"
                  meta="+100%"
                />
              </div>
            </div>

            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Platform
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Valorant boosting is PC only.</p>
              <div className="mt-3">
                <div className="flex h-11 items-center justify-between rounded-xl border border-rose-300/[0.18] bg-[#131B17] px-3">
                  <span className="flex items-center gap-3 text-xs font-semibold text-white">
                    <span className="grid size-7 place-items-center rounded-lg border border-white/[0.10] bg-[#090D0B] text-sky-300">
                      <Monitor className="size-4" />
                    </span>
                    PC
                  </span>
                  <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(isRankBoost || isWins) ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                    RR Gain
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Select the expected RR gain.</p>
                </div>
                <Gauge className="size-4 text-rose-200/50" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {rrGainOptions.map((option) => (
                  <ChoicePill
                    key={option.value}
                    active={selection.rrGain === option.value}
                    onClick={() => update("rrGain", option.value)}
                    label={option.label}
                    meta={option.meta}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {isRankBoost ? (
            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                RR Amount
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Choose your current RR amount.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {rrAmountOptions.map((option) => (
                  <ChoicePill
                    key={option.value}
                    active={selection.rrAmount === option.value}
                    onClick={() => update("rrAmount", option.value)}
                    label={option.label}
                    meta={option.meta}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
              Server
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Select the server for this order.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <ChoicePill
                  key={server.value}
                  active={selection.server === server.value}
                  onClick={() => update("server", server.value)}
                  label={server.label}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Customize extras
                </p>
                <p className="mt-1 text-sm font-semibold text-white">Add only the upgrades you want.</p>
              </div>
              <Zap className="size-4 text-rose-200/50" />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <CompactExtra
                checked={selection.playOffline === true}
                onChange={(checked) => update("playOffline", checked)}
                icon={<EyeOff className="size-3.5" />}
                title="Play Offline"
                price="FREE"
                description="Keep your order activity discreet."
              />
              <CompactExtra
                checked={selection.agentPreferences === true}
                onChange={(checked) => update("agentPreferences", checked)}
                icon={<Users className="size-3.5" />}
                title="Agents Preferences"
                price="FREE"
                description="Save your preferred agents for the booster."
              />
              <CompactExtra
                checked={selection.liveStream === true}
                onChange={(checked) => update("liveStream", checked)}
                icon={<MonitorPlay className="size-3.5" />}
                title="Streaming"
                price="+$10"
                description="Watch the boosting session live."
              />
              <CompactExtra
                checked={selection.expressDelivery === true}
                onChange={(checked) => update("expressDelivery", checked)}
                icon={<Zap className="size-3.5" />}
                title="Express Delivery"
                price="+30%"
                description="Prioritize faster fulfillment."
              />
              <CompactExtra
                checked={selection.extraWin === true}
                onChange={(checked) => update("extraWin", checked)}
                icon={<Trophy className="size-3.5" />}
                title="+1 Extra Win"
                price="+$6"
                description="Add one extra competitive win."
              />
              <CompactExtra
                checked={selection.rankInsurance === true}
                onChange={(checked) => update("rankInsurance", checked)}
                icon={<ShieldCheck className="size-3.5" />}
                title="Rank Insurance"
                price="+50%"
                description="Add rank insurance to the order."
              />
            </div>
          </div>

          <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:grid-cols-3">
            {[
              "Server-calculated final pricing.",
              "No hidden upgrade selections.",
              "Live order tracking included.",
            ].map((note) => (
              <div key={note} className="flex items-center gap-2 text-[10px] text-white/40">
                <Check className="size-3 shrink-0 text-emerald-300" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside id="boost-summary" className="scroll-mt-24 xl:sticky xl:top-24">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-rose-500/[0.05] via-transparent to-transparent px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                    Order Summary
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">{serviceLabel}</p>
                </div>
                {isLoading ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-[#A0AAA4]">
                    <LoaderCircle className="size-3 animate-spin text-[#82F5A4] motion-reduce:animate-none" />
                    Updating
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39E56F]/18 bg-[#39E56F]/[0.035] px-2.5 py-1 text-[9px] font-medium text-[#82F5A4]">
                    <Check className="size-3" strokeWidth={2.5} />
                    Ready
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              {isRankBoost ? (
                <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Image src={familyForRank(currentRank).image} alt="" width={30} height={30} className="size-7 shrink-0 object-contain" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current</p>
                        <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{rankLabel(currentRank)}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-rose-200/35" />
                    <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Target</p>
                        <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{rankLabel(targetRank)}</p>
                      </div>
                      <Image src={familyForRank(targetRank).image} alt="" width={30} height={30} className="size-7 shrink-0 object-contain" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {currentRank === "unrated" ? (
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-[8px] font-black text-white/40">NR</span>
                      ) : (
                        <Image src={familyForRank(currentRank).image} alt="" width={30} height={30} className="size-7 shrink-0 object-contain" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current rank</p>
                        <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{currentRank === "unrated" ? "Unrated" : rankLabel(currentRank)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">{isWins ? "Wins" : "Placements"}</p>
                      <p className="font-gaming-value mt-0.5 text-lg font-bold leading-none text-[#F4F7F5]">{String(isWins ? selection.wins : selection.matches)}</p>
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

              {error ? (
                <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">
                  {error}
                </div>
              ) : null}

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
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#A0AAA4]">Total</p>
                      <p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">
                        {formatPrice(quote.total)}
                      </p>
                      {!isLoading ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/38">
                          <Check className="size-3 text-[#82F5A4]" strokeWidth={2.5} />
                          Server-validated price
                        </p>
                      ) : (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35">
                          <LoaderCircle className="size-3 animate-spin text-[#82F5A4] motion-reduce:animate-none" />
                          Updating price…
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">USD</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="my-4 h-px bg-white/[0.08]" />
                  <div>
                    <p className="text-[11px] font-medium text-[#A0AAA4]">Total</p>
                    <p className="font-gaming-value mt-1 text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">—</p>
                    {isLoading ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35">
                        <LoaderCircle className="size-3 animate-spin text-[#82F5A4] motion-reduce:animate-none" />
                        Updating price…
                      </p>
                    ) : (
                      <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35">Price unavailable</p>
                    )}
                  </div>
                </>
              )}

              {orderError ? (
                <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{orderError}</div>
              ) : null}

              <Button
                className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none transition-colors duration-200 hover:bg-[#20C95A] hover:text-[#050807] motion-reduce:transition-none"
                size="lg"
                disabled={!quote || isLoading || isCreatingOrder}
                onClick={createOrder}
              >
                {isCreatingOrder ? (
                  <>
                    Creating order
                    <LoaderCircle className="ml-2 size-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Create secure order
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>

              <p className="mt-3 text-center text-[10px] leading-4 text-white/35">
                Final price is server-validated before Stripe payment.
              </p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-white/[0.08] bg-[#080B09] p-3.5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-rose-300/[0.14] bg-rose-400/[0.045] text-rose-200/75">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#F4F7F5]">Secure payment</p>
                <p className="mt-1 text-[10px] leading-4 text-white/40">
                  Payment is processed by Stripe after your order is created.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-4 py-3 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="font-gaming-value whitespace-nowrap text-[1.55rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                {quote ? formatPrice(quote.total) : "—"}
              </p>
              {isLoading ? (
                <span className="inline-flex items-center gap-1 text-[9px] text-[#A0AAA4]">
                  <LoaderCircle className="size-2.5 animate-spin text-[#82F5A4] motion-reduce:animate-none" />
                  Updating…
                </span>
              ) : null}
            </div>
          </div>
          <a
            href="#boost-summary"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#39E56F]/35 bg-[#39E56F] px-5 text-sm font-bold text-[#050807] shadow-none transition-colors duration-200 hover:bg-[#20C95A] motion-reduce:transition-none"
          >
            View order
            <ArrowRight className="ml-2 size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
