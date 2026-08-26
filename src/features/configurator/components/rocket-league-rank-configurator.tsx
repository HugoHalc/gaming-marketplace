"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  EyeOff,
  Gamepad2,
  Gauge,
  LoaderCircle,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection, QuotePreview } from "../types/configurator";

const rankFamilies = [
  { key: "bronze", label: "Bronze", short: "B", accent: "from-amber-900/60 to-amber-500/15", image: "/ranks/rocket-league/bronze.svg", tiers: ["1", "2", "3"] },
  { key: "silver", label: "Silver", short: "S", accent: "from-slate-500/45 to-white/5", image: "/ranks/rocket-league/silver.svg", tiers: ["1", "2", "3"] },
  { key: "gold", label: "Gold", short: "G", accent: "from-yellow-500/45 to-amber-400/5", image: "/ranks/rocket-league/gold.svg", tiers: ["1", "2", "3"] },
  { key: "platinum", label: "Platinum", short: "P", accent: "from-green-500/40 to-teal-300/5", image: "/ranks/rocket-league/platinum.svg", tiers: ["1", "2", "3"] },
  { key: "diamond", label: "Diamond", short: "D", accent: "from-emerald-500/45 to-green-400/5", image: "/ranks/rocket-league/diamond.svg", tiers: ["1", "2", "3"] },
  { key: "champion", label: "Champion", short: "C", accent: "from-fuchsia-600/45 to-rose-400/5", image: "/ranks/rocket-league/champion.svg", tiers: ["1", "2", "3"] },
  { key: "grand-champion", label: "Grand Champion", short: "GC", accent: "from-red-600/50 to-fuchsia-500/5", image: "/ranks/rocket-league/grand-champion.svg", tiers: ["1", "2", "3"] },
  { key: "supersonic-legend", label: "Supersonic Legend", short: "SSL", accent: "from-green-500/55 to-green-400/10", image: "/ranks/rocket-league/supersonic-legend.svg", tiers: [] },
] as const;

const rankOrder = [
  "bronze-1", "bronze-2", "bronze-3",
  "silver-1", "silver-2", "silver-3",
  "gold-1", "gold-2", "gold-3",
  "platinum-1", "platinum-2", "platinum-3",
  "diamond-1", "diamond-2", "diamond-3",
  "champion-1", "champion-2", "champion-3",
  "grand-champion-1", "grand-champion-2", "grand-champion-3",
  "supersonic-legend",
] as const;

type RankId = (typeof rankOrder)[number];

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

function rankIndex(rank: string) {
  return rankOrder.indexOf(rank as RankId);
}

function familyForRank(rank: string) {
  return rankFamilies.find((family) => rank === family.key || rank.startsWith(`${family.key}-`)) ?? rankFamilies[0];
}

function rankLabel(rank: string) {
  if (rank === "supersonic-legend") return "Supersonic Legend";
  const family = familyForRank(rank);
  const tier = rank.split("-").at(-1);
  return `${family.label} ${tier === "1" ? "I" : tier === "2" ? "II" : "III"}`;
}

function firstRankForFamily(familyKey: string) {
  if (familyKey === "supersonic-legend") return "supersonic-legend";
  return `${familyKey}-1`;
}

function firstAvailableRankForFamily(familyKey: string, currentRank: string) {
  if (familyKey === "supersonic-legend") {
    return rankIndex("supersonic-legend") > rankIndex(currentRank) ? "supersonic-legend" : null;
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
  family,
  selected,
}: {
  family: (typeof rankFamilies)[number];
  selected: boolean;
}) {
  return (
    <span className={`relative grid size-12 place-items-center overflow-hidden rounded-2xl border bg-gradient-to-br ${family.accent} ${
      selected ? "border-green-400/45 shadow-[0_0_28px_-10px_rgba(0,230,90,.55)]" : "border-white/[0.08]"
    }`}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.16),transparent_48%)]" />
      <Image
        src={family.image}
        alt=""
        width={40}
        height={40}
        className="relative z-[1] h-10 w-10 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,.55)]"
      />
      {selected ? (
        <span className="absolute -right-1 -top-1 z-[2] grid size-4 place-items-center rounded-full bg-green-400 text-[#071019] shadow-[0_0_12px_rgba(74,222,128,.45)]">
          <Check className="size-2.5" />
        </span>
      ) : null}
    </span>
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

function CompactRankSelector({
  title,
  value,
  currentRank,
  target,
  onChange,
}: {
  title: string;
  value: string;
  currentRank?: string;
  target?: boolean;
  onChange: (value: string) => void;
}) {
  const selectedFamily = familyForRank(value);
  const currentIndex = currentRank ? rankIndex(currentRank) : -1;

  const visibleFamilies = target
    ? rankFamilies.filter((family) => firstAvailableRankForFamily(family.key, currentRank ?? "") !== null)
    : rankFamilies.filter((family) => family.key !== "supersonic-legend");

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-green-400/75">{title}</p>
          <p className="mt-1 text-base font-bold tracking-[-0.03em] text-white">{rankLabel(value)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {visibleFamilies.map((family) => {
          const selected = selectedFamily.key === family.key;
          return (
            <button
              key={family.key}
              type="button"
              title={family.label}
              onClick={() => chooseFamily(family.key)}
              className={`flex min-w-0 flex-col items-center rounded-xl border px-1.5 py-2 transition-all ${
                selected
                  ? "border-green-400/35 bg-green-400/[0.06]"
                  : "border-white/[0.07] bg-black/15 hover:border-white/[0.15] hover:bg-white/[0.025]"
              }`}
            >
              <RankIcon family={family} selected={selected} />
              <span className="mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-medium leading-3.5 text-white/75">
                {family.label}
              </span>
            </button>
          );
        })}
      </div>

      {selectedFamily.key !== "supersonic-legend" ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Tier</span>
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
                className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-colors ${
                  active
                    ? "border-green-400/40 bg-green-400/[0.10] text-green-100"
                    : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white"
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
      className={`flex h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left transition-colors ${
        active
          ? "border-green-400/35 bg-green-400/[0.08] text-white"
          : "border-white/[0.08] bg-black/15 text-white/65 hover:border-white/[0.16] hover:text-white"
      }`}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      {meta ? <span className={`shrink-0 text-[10px] font-bold ${active ? "text-green-300" : "text-white/40"}`}>{meta}</span> : null}
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
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
      checked ? "border-green-400/30 bg-green-400/[0.06]" : "border-white/[0.07] bg-black/15"
    } ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-white/[0.15]"}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/55">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-white">{title}</span>
          <span className="shrink-0 text-[10px] font-bold text-green-300">{disabled ? "Not needed" : price}</span>
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[var(--muted-foreground)]" title={description}>
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 accent-green-500"
      />
    </label>
  );
}

interface RocketLeagueRankConfiguratorProps {
  gameSlug: string;
  service: ServiceSummary;
}

export function RocketLeagueRankConfigurator({ gameSlug, service }: RocketLeagueRankConfiguratorProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>({
    currentRank: "gold-1",
    targetRank: "platinum-1",
    playlist: "2v2",
    platform: "pc",
    boostMethod: "account",
    appearOffline: false,
    liveStream: false,
    expressDelivery: false,
    rankInsurance: false,
  });
  const [showAllExtras, setShowAllExtras] = useState(false);
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const currentRank = String(selection.currentRank);
  const targetRank = String(selection.targetRank);
  const boostMethod = String(selection.boostMethod);

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.value === selection.playlist) ?? playlists[1],
    [selection.playlist],
  );

  useEffect(() => {
    if (rankIndex(targetRank) <= rankIndex(currentRank)) {
      const next = rankOrder[rankIndex(currentRank) + 1];
      if (next) setSelection((current) => ({ ...current, targetRank: next }));
    }
  }, [currentRank, targetRank]);

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

  function update(key: string, value: string | boolean) {
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

      if (!response.ok || !payload.order) throw new Error(payload.error ?? "Unable to create order.");
      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
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
              <Sparkles className="size-3.5" />
              Rocket League Rank Boost
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Configure your full order without leaving this panel.</p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">
            Live server pricing
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <CompactRankSelector
              title="Current rank"
              value={currentRank}
              onChange={(value) => update("currentRank", value)}
            />
            <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <CompactRankSelector
                title="Desired rank"
                value={targetRank}
                currentRank={currentRank}
                target
                onChange={(value) => update("targetRank", value)}
              />
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">Playlist</p>
                <p className="mt-1 text-sm font-semibold text-white">Choose your playlist.</p>
              </div>
              <span className="text-[10px] text-white/35">Price modifiers shown upfront</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {playlists.filter((playlist) => playlist.group === "Competitive").map((playlist) => (
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">Platform</p>
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
                      <span className={`grid size-7 place-items-center rounded-lg border ${
                        active ? "border-green-400/20 bg-black/20" : "border-white/[0.08] bg-white/[0.02]"
                      } ${platform.color}`}>
                        <PlatformIcon platform={platform.value} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:border-l lg:border-white/[0.07] lg:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">Boost method</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-green-300"><Gauge className="size-4" /></span>
                    <span className="text-[10px] font-bold text-green-300">Base price</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-white">Account Boost</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-white/40">We play on your account.</p>
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
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-green-300"><Users className="size-4" /></span>
                    <span className="text-[10px] font-bold text-green-300">+45%</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-white">Play With Booster</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-white/40">You play while we boost with you.</p>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400/75">Customize</p>
                <p className="mt-1 text-sm font-semibold text-white">Optional upgrades.</p>
              </div>
              <span className="text-[10px] text-white/35">Nothing preselected</span>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <CompactExtra
                checked={selection.appearOffline === true}
                disabled={boostMethod === "play-with-booster"}
                onChange={(checked) => update("appearOffline", checked)}
                icon={<EyeOff className="size-3.5" />}
                title="Appear Offline"
                price="FREE"
                description="Stay discreet and reduce unwanted friend invites."
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
              <CompactExtra
                checked={selection.rankInsurance === true}
                onChange={(checked) => update("rankInsurance", checked)}
                icon={<ShieldCheck className="size-3.5" />}
                title="Rank Insurance"
                price="+50%"
                description="2–3 extra wins after reaching your target."
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
        <div className="overflow-hidden rounded-[1.6rem] border border-green-400/20 bg-[#070a08] shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-green-500/[0.14] via-emerald-500/[0.04] to-transparent p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-green-300">Your boost</p>
                <p className="mt-1 text-base font-semibold text-white">Rocket League Rank Boost</p>
              </div>
              {isLoading ? <LoaderCircle className="size-4 animate-spin text-green-400" /> : null}
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current</p>
                <p className="mt-1 text-xs font-semibold text-white">{rankLabel(currentRank)}</p>
              </div>
              <ArrowRight className="size-3.5 text-green-400/70" />
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Target</p>
                <p className="mt-1 text-xs font-semibold text-white">{rankLabel(targetRank)}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-1.5 text-[11px]">
              <div className="flex justify-between gap-4"><span className="text-white/35">Playlist</span><span className="font-medium text-white/70">{selectedPlaylist.label}</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/35">Platform</span><span className="font-medium text-white/70">{platforms.find((item) => item.value === selection.platform)?.label}</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/35">Method</span><span className="font-medium text-white/70">{boostMethod === "account" ? "Account Boost" : "Play With Booster"}</span></div>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{error}</div>
            ) : null}

            {quote ? (
              <>
                <div className="my-3 h-px bg-white/[0.08]" />
                <div className="space-y-2">
                  {quote.breakdown.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="text-[var(--muted-foreground)]">{item.label}</span>
                      <span className={item.amount < 0 ? "font-medium text-emerald-300" : "font-medium text-white"}>
                        {item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="my-3 h-px bg-white/[0.08]" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Total</p>
                    <p className="mt-0.5 text-2xl font-bold tracking-[-0.045em] text-white">{formatPrice(quote.total)}</p>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[9px] font-medium text-white/45">USD</span>
                </div>
              </>
            ) : null}

            {orderError ? (
              <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{orderError}</div>
            ) : null}

            <Button className="mt-4 w-full" size="lg" disabled={!quote || isLoading || isCreatingOrder} onClick={createOrder}>
              {isCreatingOrder ? (
                <>Creating order<LoaderCircle className="ml-2 size-4 animate-spin" /></>
              ) : (
                <>Create secure order<ArrowRight className="ml-2 size-4" /></>
              )}
            </Button>

            <div className="mt-3 flex gap-2 text-[10px] leading-4 text-white/35">
              <ShieldCheck className="mt-0.5 size-3 shrink-0" />
              <span>Final price is validated on the server. Stripe payment follows after order creation.</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-green-400/15 bg-black/90 px-4 py-3 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p>
            <p className="mt-0.5 text-xl font-black tracking-[-0.045em] text-white">
              {quote ? formatPrice(quote.total) : "—"}
            </p>
          </div>
          <a
            href="#boost-summary"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-green-400/30 bg-green-500 px-5 text-sm font-bold text-black shadow-[0_12px_35px_-16px_rgba(0,230,90,.85)] transition hover:brightness-110"
          >
            View order
            <ArrowRight className="ml-2 size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
