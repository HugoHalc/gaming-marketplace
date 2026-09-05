"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  {
    key: "iron",
    label: "Iron",
    short: "I",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Iron_1_Rank.png",
    fallback: "from-zinc-500/45 to-zinc-300/10",
  },
  {
    key: "bronze",
    label: "Bronze",
    short: "B",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Bronze_1_Rank.png",
    fallback: "from-amber-800/55 to-amber-500/10",
  },
  {
    key: "silver",
    label: "Silver",
    short: "S",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Silver_1_Rank.png",
    fallback: "from-slate-400/50 to-white/10",
  },
  {
    key: "gold",
    label: "Gold",
    short: "G",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Gold_1_Rank.png",
    fallback: "from-yellow-500/50 to-amber-300/10",
  },
  {
    key: "platinum",
    label: "Platinum",
    short: "P",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Platinum_1_Rank.png",
    fallback: "from-cyan-500/45 to-teal-300/10",
  },
  {
    key: "diamond",
    label: "Diamond",
    short: "D",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Diamond_1_Rank.png",
    fallback: "from-fuchsia-500/50 to-violet-300/10",
  },
  {
    key: "ascendant",
    label: "Ascendant",
    short: "A",
    tiers: ["1", "2", "3"],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Ascendant_1_Rank.png",
    fallback: "from-emerald-500/50 to-green-300/10",
  },
  {
    key: "immortal",
    label: "Immortal",
    short: "IMM",
    tiers: [],
    image: "https://valorant.fandom.com/wiki/Special:Redirect/file/Immortal_1_Rank.png",
    fallback: "from-rose-600/55 to-fuchsia-400/10",
  },
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

function imageForRank(rank: string) {
  if (rank === "immortal") {
    return "https://valorant.fandom.com/wiki/Special:Redirect/file/Immortal_1_Rank.png";
  }
  const family = familyForRank(rank);
  const tier = rank.split("-").at(-1);
  const fileFamily = family.label.replaceAll(" ", "_");
  return `https://valorant.fandom.com/wiki/Special:Redirect/file/${fileFamily}_${tier}_Rank.png`;
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
  familyOnly = false,
}: {
  rank: string;
  selected?: boolean;
  familyOnly?: boolean;
}) {
  const family = familyForRank(rank);
  const src = familyOnly ? family.image : imageForRank(rank);

  return (
    <span className="relative grid size-[3.1rem] shrink-0 place-items-center">
      <span
        className={`absolute inset-1 rounded-xl bg-gradient-to-br ${family.fallback} opacity-80`}
        aria-hidden="true"
      />
      <span className="relative z-[1] grid size-[2.7rem] place-items-center overflow-hidden rounded-lg">
        {/* External image is visual-only; the colored fallback remains visible if the host blocks it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-[2.65rem] w-[2.65rem] object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,.45)]"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="absolute text-[9px] font-black tracking-[-0.04em] text-white/75">
          {family.short}
        </span>
      </span>
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
            <RankIcon rank={value} />
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
              <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40" />
              <RankIcon rank={firstRankForFamily(family.key)} selected={selected} familyOnly />
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

    if (isWins) rows.unshift(["Wins", String(selection.wins)]);
    if (isPlacements) rows.unshift(["Placements", String(selection.matches)]);

    return rows;
  }, [selection, isRankBoost, isWins, isPlacements]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
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
                icon={<EyeOff className="size-4" />}
                title="Play Offline"
                price="FREE"
                description="Keep your order activity discreet."
              />
              <CompactExtra
                checked={selection.agentPreferences === true}
                onChange={(checked) => update("agentPreferences", checked)}
                icon={<Users className="size-4" />}
                title="Agents Preferences"
                price="FREE"
                description="Save your preferred agents for the booster."
              />
              <CompactExtra
                checked={selection.liveStream === true}
                onChange={(checked) => update("liveStream", checked)}
                icon={<MonitorPlay className="size-4" />}
                title="Streaming"
                price="+$10"
                description="Watch the boosting session live."
              />
              <CompactExtra
                checked={selection.expressDelivery === true}
                onChange={(checked) => update("expressDelivery", checked)}
                icon={<Zap className="size-4" />}
                title="Express Delivery"
                price="+30%"
                description="Prioritize faster fulfillment."
              />
              <CompactExtra
                checked={selection.extraWin === true}
                onChange={(checked) => update("extraWin", checked)}
                icon={<Trophy className="size-4" />}
                title="+1 Extra Win"
                price="+$6"
                description="Add one extra competitive win."
              />
              <CompactExtra
                checked={selection.rankInsurance === true}
                onChange={(checked) => update("rankInsurance", checked)}
                icon={<ShieldCheck className="size-4" />}
                title="Rank Insurance"
                price="+50%"
                description="Add rank insurance to the order."
              />
            </div>
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-24">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080B09] shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-rose-500/[0.055] via-transparent to-transparent p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-200/65">
                  Order summary
                </p>
                <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">{service.name}</p>
              </div>
              {isLoading ? <LoaderCircle className="size-4 animate-spin text-rose-200" /> : null}
            </div>

            <div className="mt-4 space-y-3">
              {currentRank === "unrated" ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#090D0B] p-3">
                  <span className="grid size-10 place-items-center rounded-lg border border-white/[0.08] text-[9px] font-black text-white/40">
                    NR
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current</p>
                    <p className="mt-0.5 text-xs font-semibold text-white">Unrated</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#090D0B] p-3">
                  <RankIcon rank={currentRank} />
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current</p>
                    <p className="mt-0.5 text-xs font-semibold text-white">{rankLabel(currentRank)}</p>
                  </div>
                </div>
              )}

              {isRankBoost ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#090D0B] p-3">
                  <RankIcon rank={targetRank} />
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Target</p>
                    <p className="mt-0.5 text-xs font-semibold text-white">{rankLabel(targetRank)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-2.5">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-white/35">{label}</span>
                  <span className="font-semibold text-white/75">{value}</span>
                </div>
              ))}
            </div>

            <div className="my-4 h-px bg-white/[0.07]" />

            {error ? (
              <div className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {error}
              </div>
            ) : null}

            {quote ? (
              <>
                <div className="space-y-2.5">
                  {quote.breakdown.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 text-xs">
                      <span className="leading-5 text-white/38">{item.label}</span>
                      <span className={`shrink-0 font-semibold ${item.amount < 0 ? "text-emerald-300" : "text-white/80"}`}>
                        {item.amount < 0 ? "−" : ""}
                        {formatPrice(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-4 h-px bg-white/[0.07]" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">Total</p>
                    <p className="mt-1 font-gaming-value text-3xl font-bold tracking-[-0.05em] text-[#F4F7F5]">
                      {formatPrice(quote.total)}
                    </p>
                  </div>
                  <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] font-medium text-white/35">
                    USD
                  </span>
                </div>
              </>
            ) : (
              <div className="py-4 text-xs leading-5 text-white/35">
                Adjust the configuration to generate a valid quote.
              </div>
            )}

            {orderError ? (
              <div className="mt-4 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {orderError}
              </div>
            ) : null}

            <Button
              className="mt-5 w-full"
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
                  Continue to Checkout
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            <div className="mt-4 flex gap-2 text-[10px] leading-4 text-white/28">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-300/60" />
              <span>Final price is recalculated server-side before the order is stored.</span>
            </div>

            {quote ? (
              <p className="mt-3 text-[9px] text-white/18">Pricing rules: {quote.ruleSetVersion}</p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
