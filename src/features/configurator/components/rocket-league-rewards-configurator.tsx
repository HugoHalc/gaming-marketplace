"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
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
import type {
  ConfiguratorSelection,
  QuotePreview,
} from "../types/configurator";

const rankFamilies = [
  { key: "bronze", label: "Bronze", image: "/ranks/rocket-league/bronze.png", tiers: ["1", "2", "3"] },
  { key: "silver", label: "Silver", image: "/ranks/rocket-league/silver.png", tiers: ["1", "2", "3"] },
  { key: "gold", label: "Gold", image: "/ranks/rocket-league/gold.png", tiers: ["1", "2", "3"] },
  { key: "platinum", label: "Platinum", image: "/ranks/rocket-league/platinum.png", tiers: ["1", "2", "3"] },
  { key: "diamond", label: "Diamond", image: "/ranks/rocket-league/diamond.png", tiers: ["1", "2", "3"] },
  { key: "champion", label: "Champion", image: "/ranks/rocket-league/champion.png", tiers: ["1", "2", "3"] },
  { key: "grand-champion", label: "Grand Champion", image: "/ranks/rocket-league/grand-champion.png", tiers: ["1", "2", "3"] },
  { key: "supersonic-legend", label: "Supersonic Legend", image: "/ranks/rocket-league/supersonic-legend.png", tiers: [] },
] as const;

const playlists = [
  { value: "1v1", label: "1v1 Duel", group: "Competitive", surcharge: "Base" },
  { value: "2v2", label: "2v2 Doubles", group: "Competitive", surcharge: "Base" },
  { value: "3v3", label: "3v3 Standard", group: "Competitive", surcharge: "+20%" },
  { value: "rumble", label: "Rumble", group: "Extra", surcharge: "+20%" },
  { value: "hoops", label: "Hoops", group: "Extra", surcharge: "+20%" },
  { value: "dropshot", label: "Dropshot", group: "Extra", surcharge: "+20%" },
  { value: "snow-day", label: "Snow Day", group: "Extra", surcharge: "+20%" },
  { value: "heatseeker", label: "Heatseeker", group: "Extra", surcharge: "+20%" },
  { value: "4v4", label: "4v4 Squads", group: "Extra", surcharge: "+30%" },
] as const;

const platforms = [
  { value: "pc", label: "PC", color: "text-sky-300" },
  { value: "playstation", label: "PlayStation", color: "text-blue-300" },
  { value: "xbox", label: "Xbox", color: "text-green-300" },
  { value: "switch", label: "Nintendo Switch", color: "text-red-300" },
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function familyForRank(rank: string) {
  return rankFamilies.find(
    (family) => rank === family.key || rank.startsWith(`${family.key}-`),
  ) ?? rankFamilies[0];
}

function rankLabel(rank: string) {
  if (rank === "supersonic-legend") return "Supersonic Legend";
  const family = familyForRank(rank);
  const tier = rank.split("-").at(-1);
  return `${family.label} ${tier === "1" ? "I" : tier === "2" ? "II" : "III"}`;
}

function firstRankForFamily(familyKey: string) {
  if (familyKey === "supersonic-legend") {
    return familyKey;
  }
  return `${familyKey}-1`;
}

function volumeDiscountRate(wins: number) {
  if (wins >= 10) return 21;
  if (wins >= 8) return 20;
  if (wins >= 6) return 19;
  if (wins >= 4) return 18;
  if (wins >= 3) return 10;
  if (wins >= 2) return 5;
  return 0;
}

function nextDiscountTier(wins: number) {
  if (wins < 2) return { wins: 2, discount: 5 };
  if (wins < 3) return { wins: 3, discount: 10 };
  if (wins < 4) return { wins: 4, discount: 18 };
  if (wins < 6) return { wins: 6, discount: 19 };
  if (wins < 8) return { wins: 8, discount: 20 };
  if (wins < 10) return { wins: 10, discount: 21 };
  return null;
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
          ? "border-blue-300/[0.18] bg-[#131B17] text-[#F4F7F5]"
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
  disabled,
  onChange,
  icon,
  title,
  price,
  description,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
  title: string;
  price: string;
  description: string;
}) {
  const isFree = price === "FREE";

  return (
    <button
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
        disabled
          ? "cursor-not-allowed border-white/[0.05] bg-black/10 opacity-45"
          : checked
            ? "border-blue-300/[0.18] bg-[#131B17]"
            : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg border transition-colors duration-200 motion-reduce:transition-none ${
          checked
            ? "border-white/[0.12] bg-[#090D0B] text-blue-200/80"
            : "border-white/[0.07] bg-white/[0.025] text-white/55 group-hover/extra:text-white/75"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span
            className={`shrink-0 text-[10px] font-bold ${
              disabled
                ? "text-white/35"
                : isFree
                  ? "text-[#82F5A4]"
                  : "text-blue-200/60"
            }`}
          >
            {disabled ? "Not needed" : price}
          </span>
        </span>
        <span
          className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]"
          title={description}
        >
          {description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`grid size-4 shrink-0 place-items-center rounded-full border transition-[border-color,background-color,color] duration-200 motion-reduce:transition-none ${
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


function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "pc") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" opacity="0.95" />
        <circle cx="9.15" cy="14.2" r="1.85" fill="currentColor" />
        <path d="M10.7 13.4 14.7 10.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="15.9" cy="10.2" r="2.15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (platform === "playstation") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none">
        <path d="M10 5.2v10.6c0 .9-.34 1.44-1.08 1.62L6.3 18.2v-2.1l1.62-.55c.34-.12.5-.32.5-.68V5.85l1.58-.65Z" fill="currentColor" />
        <path d="M11.4 7.1c2.2.7 4.22 1.44 5.85 2.15.72.32 1.05.77 1.05 1.35 0 .55-.33.98-1 1.2l-6.52 2.08v-2.13l4.75-1.48c.26-.08.28-.22.05-.32-1.17-.47-2.83-1.02-4.18-1.42V7.1Z" fill="currentColor" opacity=".92" />
        <path d="m11.18 12.75 5.05-1.6v1.85l-4.02 1.3c-.55.18-.78.4-.78.73 0 .35.25.48.72.38l2.9-.62v1.8l-3.45.78c-1.57.35-2.57-.25-2.57-1.48 0-1.03.65-1.86 2.25-2.34Z" fill="currentColor" opacity=".84" />
      </svg>
    );
  }

  if (platform === "xbox") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.2 8.05c1.1.48 2.26 1.3 3.78 2.77 1.5-1.46 2.68-2.28 3.82-2.77" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.85 16.25c.9-1.55 1.88-2.83 3.13-4.12 1.23 1.28 2.23 2.56 3.17 4.12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none">
      <rect x="4.3" y="4.2" width="15.4" height="15.6" rx="6.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.55 6.65v10.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.65" cy="11.1" r="1.02" fill="currentColor" />
      <circle cx="14.9" cy="12.9" r="1.02" fill="currentColor" />
    </svg>
  );
}

function CurrentRankSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const family = familyForRank(value);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.035]">
          {family.image ? (
            <Image
              src={family.image}
              alt=""
              width={44}
              height={44}
              className="h-10 w-10 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.42)]"
            />
          ) : (
            <span className="grid size-9 place-items-center rounded-full border border-white/[0.10] bg-white/[0.025] text-sm font-bold text-white/45">
              ?
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/65">
            Current rank
          </p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
            {rankLabel(value)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {rankFamilies.map((item) => {
          const selected = family.key === item.key;
          return (
            <button
              key={item.key}
              type="button"
              title={item.label}
              onClick={() => onChange(firstRankForFamily(item.key))}
              className={`group/rank relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 transition-[border-color,background-color,transform] duration-200 ease-out motion-reduce:transition-none ${
                selected
                  ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              {selected ? (
                <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#39E56F]/55 to-transparent" />
              ) : null}

              <span className="relative grid size-[3.1rem] place-items-center">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    width={46}
                    height={46}
                    className={`relative z-[1] h-[2.7rem] w-[2.7rem] object-contain opacity-90 transition-[opacity,transform] duration-200 ease-out drop-shadow-[0_6px_12px_rgba(0,0,0,.45)] group-hover/rank:opacity-100 group-hover/rank:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none ${
                      selected ? "opacity-100" : ""
                    }`}
                  />
                ) : (
                  <span className={`grid size-[2.7rem] place-items-center rounded-full border text-sm font-bold ${
                    selected
                      ? "border-white/[0.14] bg-white/[0.04] text-white/75"
                      : "border-white/[0.10] bg-white/[0.025] text-white/40"
                  }`}>
                    ?
                  </span>
                )}

                {selected ? (
                  <span className="absolute -right-0.5 -top-0.5 z-[2] grid size-4 place-items-center rounded-full border border-[#39E56F]/35 bg-[#39E56F] text-[#050807]">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                ) : null}
              </span>

              <span className={`mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-semibold leading-3.5 transition-colors duration-200 ${
                selected ? "text-white" : "text-white/68 group-hover/rank:text-white/90"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {family.key !== "supersonic-legend" ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Tier
          </span>
          {family.tiers.map((tier) => {
            const candidate = `${family.key}-${tier}`;
            const active = value === candidate;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onChange(candidate)}
                className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                  active
                    ? "border-[#39E56F]/28 bg-[#39E56F]/[0.04] text-[#F4F7F5]"
                    : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                }`}
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

interface Props {
  gameSlug: string;
  service: ServiceSummary;
}

export function RocketLeagueRewardsConfigurator({ gameSlug, service }: Props) {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>({
    currentRank: "bronze-1",
    wins: 4,
    playlist: "2v2",
    platform: "pc",
    boostMethod: "account",
    appearOffline: false,
    liveStream: false,
    expressDelivery: false,
  });
  const [showAllExtras, setShowAllExtras] = useState(false);
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const wins = Number(selection.wins);
  const discountRate = volumeDiscountRate(wins);
  const nextTier = nextDiscountTier(wins);
  const boostMethod = String(selection.boostMethod);
  const selectedPlaylist = useMemo(
    () => playlists.find((item) => item.value === selection.playlist) ?? playlists[1],
    [selection.playlist],
  );

  useEffect(() => {
    if (boostMethod === "play-with-booster" && selection.appearOffline === true) {
      setSelection((current) => ({ ...current, appearOffline: false }));
    }
  }, [boostMethod, selection.appearOffline]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/quotes/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameSlug,
            serviceSlug: service.slug,
            selection,
          }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          quote?: QuotePreview;
          error?: string;
        };

        if (!response.ok || !payload.quote) {
          throw new Error(payload.error ?? "Unable to calculate quote.");
        }

        setQuote(payload.quote);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setQuote(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to calculate quote.",
        );
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
        body: JSON.stringify({
          gameSlug,
          serviceSlug: service.slug,
          selection,
        }),
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
      setOrderError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create order.",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const visibleExtraModes = showAllExtras
    ? playlists.filter((playlist) => playlist.group === "Extra")
    : playlists.filter((playlist) => playlist.group === "Extra").slice(0, 2);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
      <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080b09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.055] via-transparent to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-200/65">
              <Trophy className="size-3.5" />
              Rocket League Rewards Boost
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Choose your current rank and how many wins you want.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">
            Live server pricing
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <CurrentRankSelector
              value={String(selection.currentRank)}
              onChange={(value) => update("currentRank", value)}
            />

            <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0AAA4]">
                    Season rewards
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-gaming-value text-[2.35rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                      {wins} / 10
                    </span>
                    <span className="pb-1 text-[11px] font-medium text-[#A0AAA4]">
                      Reward wins selected
                    </span>
                  </div>
                </div>

                <div className="flex h-10 items-center rounded-xl border border-white/[0.09] bg-[#090D0B] px-3">
                  <input
                    aria-label="Reward Wins"
                    type="number"
                    min={1}
                    max={10}
                    value={wins}
                    onChange={(event) => {
                      const value = Math.max(1, Math.min(10, Number(event.target.value) || 1));
                      update("wins", value);
                    }}
                    className="font-gaming-value w-12 bg-transparent text-center text-base font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="grid grid-cols-10 gap-1.5" aria-label={`${wins} of 10 reward wins selected`}>
                  {Array.from({ length: 10 }, (_, index) => {
                    const step = index + 1;
                    const completed = step <= wins;
                    const finalStep = step === 10 && wins === 10;

                    return (
                      <span
                        key={step}
                        className={`h-2 rounded-full border transition-[border-color,background-color] duration-200 motion-reduce:transition-none ${
                          finalStep
                            ? "border-[#39E56F]/35 bg-[#39E56F]/45"
                            : completed
                              ? "border-blue-300/[0.18] bg-blue-400/55"
                              : "border-white/[0.07] bg-white/[0.08]"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between text-[9px] font-medium text-white/30">
                  <span>1 win</span>
                  <span>10 wins</span>
                </div>
              </div>

              <input
                aria-label="Season reward wins slider"
                type="range"
                min={1}
                max={10}
                step={1}
                value={wins}
                onChange={(event) => update("wins", Number(event.target.value))}
                className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-transparent accent-blue-400"
                style={{
                  background: `linear-gradient(to right, rgba(96,165,250,.55) 0%, rgba(96,165,250,.55) ${((wins - 1) / 9) * 100}%, rgba(255,255,255,.07) ${((wins - 1) / 9) * 100}%, rgba(255,255,255,.07) 100%)`,
                }}
              />

              <div className="mt-3 rounded-xl border border-[#39E56F]/18 bg-[#39E56F]/[0.035] p-3.5">
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.13em] text-[#A0AAA4]">
                  Rewards package discount
                </p>
                <p className="font-gaming-value mt-1.5 text-[1.65rem] font-bold leading-none tracking-[-0.035em] text-[#F4F7F5]">
                  {discountRate > 0 ? `${discountRate}% OFF` : "Standard price"}
                </p>
                {discountRate > 0 ? (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#82F5A4]">
                    <Check className="size-3" strokeWidth={2.7} />
                    Unlocked
                  </p>
                ) : null}

                <p className="mt-2 text-[10px] leading-4 text-white/40">
                  {nextTier
                    ? `Add ${nextTier.wins - wins} more win${nextTier.wins - wins === 1 ? "" : "s"} to unlock ${nextTier.discount}% OFF.`
                    : "Maximum rewards discount unlocked."}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Playlist
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Choose your playlist.
                </p>
              </div>
              <span className="text-[10px] text-white/35">
                Price modifiers shown upfront
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {playlists
                .filter((playlist) => playlist.group === "Competitive")
                .map((playlist) => (
                  <ChoicePill
                    key={playlist.value}
                    active={selection.playlist === playlist.value}
                    onClick={() => update("playlist", playlist.value)}
                    label={playlist.label}
                    meta={playlist.surcharge}
                  />
                ))}
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {visibleExtraModes.map((playlist) => (
                <ChoicePill
                  key={playlist.value}
                  active={selection.playlist === playlist.value}
                  onClick={() => update("playlist", playlist.value)}
                  label={playlist.label}
                  meta={playlist.surcharge}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowAllExtras((current) => !current)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.015] px-3 text-xs font-semibold text-white/50 transition-colors hover:border-white/[0.18] hover:text-white"
              >
                {showAllExtras ? "Show less" : "More extra modes"}
                <ChevronDown className={`size-3.5 transition-transform ${showAllExtras ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Platform
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {platforms.map((platform) => {
                  const active = selection.platform === platform.value;
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => update("platform", platform.value)}
                      className={`flex h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                        active
                          ? "border-blue-300/[0.18] bg-[#131B17] text-white"
                          : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                      }`}
                    >
                      <span className={`grid size-7 place-items-center rounded-lg border ${
                        active ? "border-white/[0.12] bg-[#090D0B]" : "border-white/[0.08] bg-white/[0.02]"
                      } ${platform.color}`}>
                        <PlatformIcon platform={platform.value} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{platform.label}</span>
                      {active ? (
                        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                          <Check className="size-2.5" strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Boost Method
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => update("boostMethod", "account")}
                  className={`min-h-[8.4rem] rounded-xl border p-4 text-left transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none ${
                    boostMethod === "account"
                      ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035]"
                      : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-blue-200/75">
                      <Gauge className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold text-[#82F5A4]">
                      Base price
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">
                    Account Boost
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                    We play on your account.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => update("boostMethod", "play-with-booster")}
                  className={`min-h-[8.4rem] rounded-xl border p-4 text-left transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none ${
                    boostMethod === "play-with-booster"
                      ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035]"
                      : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-blue-200/75">
                      <Users className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold text-blue-200/65">
                      +45%
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">
                    Play With Booster
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                    You play while we boost with you.
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Customize
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Optional upgrades.
                </p>
              </div>
              <span className="text-[10px] text-white/35">
                Nothing preselected
              </span>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <CompactExtra
                checked={selection.appearOffline === true}
                disabled={boostMethod === "play-with-booster"}
                onChange={(checked) => update("appearOffline", checked)}
                icon={<EyeOff className="size-3.5" />}
                title="Appear Offline"
                price="FREE"
                description="Stay discreet during your boost."
              />
              <CompactExtra
                checked={selection.liveStream === true}
                onChange={(checked) => update("liveStream", checked)}
                icon={<MonitorPlay className="size-3.5" />}
                title="Live Stream"
                price="+$10"
                description="Watch through Twitch or Discord."
              />
              <CompactExtra
                checked={selection.expressDelivery === true}
                onChange={(checked) => update("expressDelivery", checked)}
                icon={<Zap className="size-3.5" />}
                title="Express Delivery"
                price="+20%"
                description="Priority ahead of standard orders."
              />
            </div>
          </div>

          <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:grid-cols-3">
            {[
              "Server-calculated final pricing.",
              "Real rewards package discounts.",
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

      <aside id="rewards-summary" className="scroll-mt-24 xl:sticky xl:top-24">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                    Order Summary
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">Rewards Boost</p>
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
              <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                <div className="flex items-center gap-2.5">
                  {familyForRank(String(selection.currentRank)).image ? (
                    <Image src={familyForRank(String(selection.currentRank)).image!} alt="" width={30} height={30} className="size-7 shrink-0 object-contain" />
                  ) : (
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.10] bg-white/[0.025] text-[10px] font-bold text-white/45">?</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current rank</p>
                    <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{rankLabel(String(selection.currentRank))}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-white/[0.06] pt-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Season rewards</p>
                      <p className="font-gaming-value mt-0.5 text-xl font-bold text-[#F4F7F5]">
                        {wins} / 10 <span className="text-xs font-semibold text-white/45">wins</span>
                      </p>
                    </div>
                    {discountRate > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#82F5A4]">
                        <Check className="size-3" strokeWidth={2.7} />
                        {discountRate}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-10 gap-1">
                    {Array.from({ length: 10 }, (_, index) => {
                      const step = index + 1;
                      const active = step <= wins;
                      const finalStep = step === 10 && wins === 10;

                      return (
                        <span
                          key={step}
                          className={`h-1.5 rounded-full ${
                            finalStep
                              ? "bg-[#39E56F]/55"
                              : active
                                ? "bg-blue-400/50"
                                : "bg-white/[0.08]"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-2 divide-y divide-white/[0.06]">
                <div className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">Playlist</span><span className="font-medium text-white/78">{selectedPlaylist.label}</span></div>
                <div className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">Platform</span><span className="font-medium text-white/78">{platforms.find((item) => item.value === selection.platform)?.label}</span></div>
                <div className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">Method</span><span className="font-medium text-white/78">{boostMethod === "account" ? "Account Boost" : "Play With Booster"}</span></div>
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
                  <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">
                    USD
                  </span>
                </div>
              </>
            ) : isLoading ? (
              <>
                <div className="my-4 h-px bg-white/[0.08]" />
                <div>
                  <p className="text-[11px] font-medium text-[#A0AAA4]">Total</p>
                  <p className="font-gaming-value mt-1 text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">—</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35">
                    <LoaderCircle className="size-3 animate-spin text-[#82F5A4] motion-reduce:animate-none" />
                    Updating price…
                  </p>
                </div>
              </>
            ) : null}

            {orderError ? (
              <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">
                {orderError}
              </div>
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
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue-300/[0.14] bg-blue-400/[0.045] text-blue-200/75">
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
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Your total
            </p>
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
            href="#rewards-summary"
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
