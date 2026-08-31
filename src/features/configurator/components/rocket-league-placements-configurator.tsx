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
  { key: "unrated", label: "Unrated", image: null, tiers: [] },
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
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "switch", label: "Nintendo Switch" },
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
  if (rank === "unrated") return "Unrated";
  if (rank === "supersonic-legend") return "Supersonic Legend";
  const family = familyForRank(rank);
  const tier = rank.split("-").at(-1);
  return `${family.label} ${tier === "1" ? "I" : tier === "2" ? "II" : "III"}`;
}

function firstRankForFamily(familyKey: string) {
  if (familyKey === "unrated" || familyKey === "supersonic-legend") {
    return familyKey;
  }
  return `${familyKey}-1`;
}

function volumeDiscountRate(matches: number) {
  if (matches >= 10) return 21;
  if (matches >= 8) return 20;
  if (matches >= 6) return 19;
  if (matches >= 4) return 18;
  if (matches >= 3) return 10;
  if (matches >= 2) return 5;
  return 0;
}

function nextDiscountTier(matches: number) {
  if (matches < 2) return { matches: 2, discount: 5 };
  if (matches < 3) return { matches: 3, discount: 10 };
  if (matches < 4) return { matches: 4, discount: 18 };
  if (matches < 6) return { matches: 6, discount: 19 };
  if (matches < 8) return { matches: 8, discount: 20 };
  if (matches < 10) return { matches: 10, discount: 21 };
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
      className={`flex h-10 items-center justify-between gap-3 rounded-xl border px-3 text-left transition-colors ${
        active
          ? "border-green-400/35 bg-green-400/[0.08] text-white"
          : "border-white/[0.08] bg-black/15 text-white/60 hover:border-white/[0.16] hover:text-white"
      }`}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      {meta ? (
        <span className={`shrink-0 text-[10px] font-bold ${active ? "text-green-300" : "text-white/35"}`}>
          {meta}
        </span>
      ) : null}
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

function PreviousRankSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const family = familyForRank(value);

  return (
    <div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-green-400/75">
          Previous season rank
        </p>
        <p className="mt-1 text-base font-bold tracking-[-0.03em] text-white">
          {rankLabel(value)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {rankFamilies.map((item) => {
          const selected = family.key === item.key;
          return (
            <button
              key={item.key}
              type="button"
              title={item.label}
              onClick={() => onChange(firstRankForFamily(item.key))}
              className={`group relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 transition-[border-color,background-color,box-shadow,transform] duration-200 ${
                selected
                  ? "border-green-400/45 bg-[linear-gradient(180deg,rgba(74,222,128,.075),rgba(74,222,128,.018))] shadow-[inset_0_1px_0_rgba(255,255,255,.055),0_10px_28px_-22px_rgba(74,222,128,.7)]"
                  : "border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,.032),rgba(255,255,255,.008))] hover:-translate-y-px hover:border-white/[0.17]"
              }`}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  width={46}
                  height={46}
                  className={`h-[2.85rem] w-[2.85rem] object-contain drop-shadow-[0_7px_16px_rgba(0,0,0,.62)] transition-transform duration-200 ${
                    selected ? "scale-[1.04]" : "group-hover:scale-[1.03]"
                  }`}
                />
              ) : (
                <span className={`grid h-[2.85rem] w-[2.85rem] place-items-center rounded-full border text-sm font-black ${
                  selected
                    ? "border-green-400/35 bg-green-400/[0.10] text-green-200"
                    : "border-white/[0.10] bg-white/[0.025] text-white/45"
                }`}>
                  ?
                </span>
              )}
              {selected ? (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full border border-green-200/40 bg-green-400 text-[#06110a]">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              ) : null}
              <span className={`mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-semibold leading-3.5 ${
                selected ? "text-white" : "text-white/68"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {family.key !== "supersonic-legend" && family.key !== "unrated" ? (
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
                className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-colors ${
                  active
                    ? "border-green-400/50 bg-green-400/[0.10] text-green-100"
                    : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white"
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

export function RocketLeaguePlacementsConfigurator({ gameSlug, service }: Props) {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>({
    previousRank: "unrated",
    matches: 4,
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

  const matches = Number(selection.matches);
  const discountRate = volumeDiscountRate(matches);
  const nextTier = nextDiscountTier(matches);
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
      <section className="overflow-hidden rounded-[1.6rem] border border-green-400/[0.10] bg-[#080b09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-gradient-to-br from-green-500/[0.08] via-transparent to-emerald-500/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/80">
              <Trophy className="size-3.5" />
              Rocket League Placements Boost
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Choose your current rank and how many matches you want.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">
            Live server pricing
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <PreviousRankSelector
              value={String(selection.previousRank)}
              onChange={(value) => update("previousRank", value)}
            />

            <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-green-400/75">
                    Placement matches
                  </p>
                  <p className="mt-1 text-base font-bold tracking-[-0.03em] text-white">
                    {matches} Placement Match{matches === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex h-10 items-center rounded-xl border border-white/[0.09] bg-black/20 px-3">
                  <input
                    aria-label="Placement matches"
                    type="number"
                    min={1}
                    max={10}
                    value={matches}
                    onChange={(event) => {
                      const value = Math.max(1, Math.min(10, Number(event.target.value) || 1));
                      update("matches", value);
                    }}
                    className="w-12 bg-transparent text-center text-sm font-bold text-white outline-none"
                  />
                </div>
              </div>

              <input
                aria-label="Placement matches slider"
                type="range"
                min={1}
                max={10}
                step={1}
                value={matches}
                onChange={(event) => update("matches", Number(event.target.value))}
                className="mt-5 w-full accent-green-500"
              />

              <div className="mt-2 flex justify-between text-[9px] font-medium text-white/30">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10</span>
              </div>

              <div className="mt-3 rounded-xl border border-green-400/15 bg-green-400/[0.045] p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-green-400/70">
                      Package Discount
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {discountRate > 0 ? `${discountRate}% OFF unlocked` : "Standard price"}
                    </p>
                  </div>
                  {discountRate > 0 ? (
                    <span className="rounded-full border border-green-400/25 bg-green-400/[0.10] px-2.5 py-1 text-[10px] font-black text-green-300">
                      SAVE {discountRate}%
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-[10px] leading-4 text-white/40">
                  {nextTier
                    ? `Add ${nextTier.matches - matches} more win${nextTier.matches - matches === 1 ? "" : "s"} to unlock ${nextTier.discount}% OFF.`
                    : "Maximum placement discount unlocked."}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">
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
                      className={`flex h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left transition-colors ${
                        active
                          ? "border-green-400/35 bg-green-400/[0.08] text-white"
                          : "border-white/[0.08] bg-black/15 text-white/65 hover:border-white/[0.16] hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-semibold">{platform.label}</span>
                      {active ? <Check className="size-3.5 text-green-300" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">
                Boost Method
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => update("boostMethod", "account")}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    boostMethod === "account"
                      ? "border-green-400/35 bg-green-400/[0.07]"
                      : "border-white/[0.08] bg-black/15 hover:border-white/[0.16]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-green-300">
                      <Gauge className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold text-green-300">
                      Base price
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-white">
                    Account Boost
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-white/40">
                    We play on your account.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => update("boostMethod", "play-with-booster")}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    boostMethod === "play-with-booster"
                      ? "border-green-400/35 bg-green-400/[0.07]"
                      : "border-white/[0.08] bg-black/15 hover:border-white/[0.16]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-green-300">
                      <Users className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold text-green-300">
                      +45%
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-white">
                    Play With Booster
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-white/40">
                    You play while we boost with you.
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">
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
              "Real package discounts.",
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

      <aside id="placements-summary" className="scroll-mt-24 xl:sticky xl:top-24">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                    Order Summary
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">Placements Boost</p>
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
                  {familyForRank(String(selection.previousRank)).image ? (
                    <Image src={familyForRank(String(selection.previousRank)).image!} alt="" width={30} height={30} className="size-7 shrink-0 object-contain" />
                  ) : (
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.10] bg-white/[0.025] text-[10px] font-bold text-white/45">?</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Previous season rank</p>
                    <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{rankLabel(String(selection.previousRank))}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Placement package</p>
                    <p className="font-gaming-value mt-0.5 text-xl font-bold text-[#F4F7F5]">{matches} <span className="text-xs font-semibold text-white/45">Matches</span></p>
                  </div>
                  {discountRate > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#82F5A4]">
                      <Check className="size-3" strokeWidth={2.7} />
                      {discountRate}% OFF
                    </span>
                  ) : null}
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
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Your total
            </p>
            <p className="mt-0.5 text-xl font-black tracking-[-0.045em] text-white">
              {quote ? formatPrice(quote.total) : "—"}
            </p>
          </div>
          <a
            href="#placements-summary"
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
