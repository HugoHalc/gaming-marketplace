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
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MINIMUM_ORDER_TOTAL_LABEL,
  meetsMinimumOrderTotal,
  minimumOrderShortfallCents,
} from "@/features/orders/minimum-order";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import { parseWholeNumberQuantity, quantitySelectionValue } from "../client/whole-number-quantity";
import { AccountBoostCheckoutReassurance } from "./account-boost-trust";
import { handleRocketLeagueRadioGroupKeyDown } from "./rocket-league-radio-group";
import { RocketLeagueOrderSummaryHeader } from "./rocket-league-order-summary-header";
import { RocketLeagueMinimumOrderNotice } from "./rocket-league-minimum-order-notice";
import { RocketLeagueUnratedMark } from "./rocket-league-unrated-mark";
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
  { key: "diamond", label: "Diamond", image: "/ranks/rocket-league/diamond.svg", tiers: ["1", "2", "3"] },
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

const MAX_PLACEMENT_MATCHES = 10;

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
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={`flex h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left outline-none transition-[border-color,background-color,color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none ${
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
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-[border-color,background-color,color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none ${
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
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]" title={description}>
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

function PreviousRankSelector({
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
            <Image src={family.image} alt="" width={44} height={44} className="h-10 w-10 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.42)]" />
          ) : (
            <RocketLeagueUnratedMark className="size-9" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/65">Previous rank</p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">{rankLabel(value)}</p>
        </div>
      </div>

      <div role="radiogroup" aria-label="Previous rank family" onKeyDown={handleRocketLeagueRadioGroupKeyDown} className="mt-4 grid grid-cols-3 gap-2 min-[390px]:grid-cols-4">
        {rankFamilies.map((item) => {
          const selected = family.key === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              title={item.label}
              onClick={() => onChange(firstRankForFamily(item.key))}
              className={`group/rank relative flex min-h-[5.5rem] min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 outline-none transition-[border-color,background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none ${
                selected
                  ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] ring-1 ring-inset ring-white/[0.12]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              {selected ? <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#39E56F]/55 to-transparent" /> : null}
              <span className="relative grid size-[3.1rem] place-items-center">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    width={46}
                    height={46}
                    className={`relative z-[1] h-[2.7rem] w-[2.7rem] object-contain opacity-90 transition-[opacity,transform] duration-200 ease-out drop-shadow-[0_6px_12px_rgba(0,0,0,.45)] group-hover/rank:opacity-100 group-hover/rank:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none ${selected ? "opacity-100" : ""}`}
                  />
                ) : (
                  <RocketLeagueUnratedMark className="size-[2.7rem]" />
                )}
                {selected ? (
                  <span className="absolute -right-0.5 -top-0.5 z-[2] grid size-4 place-items-center rounded-full border border-[#39E56F]/35 bg-[#39E56F] text-[#050807]">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span className={`mt-2 line-clamp-2 min-h-8 w-full text-center text-[11px] font-semibold leading-4 transition-colors duration-200 ${selected ? "text-white" : "text-white/68 group-hover/rank:text-white/90"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {family.key !== "supersonic-legend" && family.key !== "unrated" ? (
        <div role="radiogroup" aria-label="Tier" onKeyDown={handleRocketLeagueRadioGroupKeyDown} className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Tier</span>
          {family.tiers.map((tier) => {
            const candidate = `${family.key}-${tier}`;
            const active = value === candidate;
            return (
              <button
                key={tier}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onChange(candidate)}
                className={`h-9 min-w-11 rounded-lg border px-3 text-xs font-bold outline-none transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] ${
                  active
                    ? "border-[#39E56F]/28 bg-[#39E56F]/[0.04] text-[#F4F7F5] ring-1 ring-inset ring-white/[0.12]"
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
  const [lastValidQuantity, setLastValidQuantity] = useState(4);

  const quantityResult = parseWholeNumberQuantity(selection.matches, 1, MAX_PLACEMENT_MATCHES);
  const quantityIsValid = quantityResult.valid;
  const quantityValue = quantityResult.valid ? quantityResult.value : null;
  const matches = quantityValue ?? lastValidQuantity;
  const sliderQuantity = quantityValue ?? lastValidQuantity;
  const quantityDisplay = selection.matches === "" ? "—" : String(selection.matches);
  const discountRate = quantityIsValid ? volumeDiscountRate(matches) : 0;
  const nextTier = quantityIsValid ? nextDiscountTier(matches) : null;
  const boostMethod = String(selection.boostMethod);
  const selectedPlaylist = useMemo(
    () => playlists.find((item) => item.value === selection.playlist) ?? playlists[1],
    [selection.playlist],
  );
  const sliderProgress = ((matches - 1) / (MAX_PLACEMENT_MATCHES - 1)) * 100;

  useEffect(() => {
    if (boostMethod === "play-with-booster" && selection.appearOffline === true) {
      setSelection((current) => ({ ...current, appearOffline: false }));
    }
  }, [boostMethod, selection.appearOffline]);

  useEffect(() => {
    if (!quantityIsValid) {
      setQuote(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {

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
  }, [gameSlug, quantityIsValid, service.slug, selection]);

  function update(key: string, value: string | number | boolean) {
    setIsLoading(true);
    setError(null);
    setSelection((current) => ({ ...current, [key]: value }));
  }

  const minimumShortfallCents =
    quantityIsValid && quote && !isLoading && !error
      ? minimumOrderShortfallCents(quote.total)
      : 0;
  const minimumOrderBlocked = minimumShortfallCents > 0;
  const minimumOrderSatisfied = Boolean(
    quantityIsValid && quote && !isLoading && !error && meetsMinimumOrderTotal(quote.total),
  );

  async function createOrder() {
    if (!minimumOrderSatisfied || isCreatingOrder) return;
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
        checkoutIntent.saveForAuthentication();
        const next = `/games/${gameSlug}/${service.slug}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to create order.");
      }

      checkoutIntent.clearAfterOrder();
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

  const checkoutIntent = useCheckoutIntentContinuity({
    gameSlug,
    serviceSlug: service.slug,
    selection,
    setSelection,
    canAutoResume: minimumOrderSatisfied,
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  const visibleExtraModes = showAllExtras
    ? playlists.filter((playlist) => playlist.group === "Extra")
    : playlists.filter((playlist) => playlist.group === "Extra").slice(0, 2);

  return (
    <div className="grid gap-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:pb-0">
      <section className="min-w-0">
        <div className="space-y-5 sm:space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0E0C]/75 p-4 sm:p-5">
              <PreviousRankSelector
                value={String(selection.previousRank)}
                onChange={(value) => update("previousRank", value)}
              />
            </div>

            <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <div className="flex items-end justify-between gap-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.012] p-4 sm:p-5">
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0AAA4]">Placement matches</p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-gaming-value text-[2.5rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">{quantityDisplay}</span>
                    <span className="pb-1 text-xs font-medium text-[#A0AAA4]">matches selected</span>
                  </div>
                </div>

                <div className="flex h-10 items-center rounded-xl border border-white/[0.09] bg-black/20 px-3">
                  <input
                    aria-label="Placement matches"
                    aria-invalid={!quantityIsValid}
                    aria-describedby={!quantityIsValid ? "placements-quantity-error" : undefined}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_PLACEMENT_MATCHES}
                    step={1}
                    value={String(selection.matches ?? "")}
                    onChange={(event) => {
                      const currentQuantity = parseWholeNumberQuantity(selection.matches, 1, MAX_PLACEMENT_MATCHES);
                      if (currentQuantity.valid) setLastValidQuantity(currentQuantity.value);

                      const nextQuantity = quantitySelectionValue(event.target.value, 1, MAX_PLACEMENT_MATCHES);
                      if (typeof nextQuantity === "number") setLastValidQuantity(nextQuantity);
                      update("matches", nextQuantity);
                    }}
                    className="font-gaming-value w-12 bg-transparent text-center text-base font-bold text-white outline-none"
                  />
                </div>
              </div>

              {!quantityIsValid ? (
                <p id="placements-quantity-error" role="alert" className="mt-2 text-[10px] leading-4 text-amber-100/75">
                  Enter a whole number between 1 and 10.
                </p>
              ) : null}

              <div className="mt-4 rounded-xl border border-white/[0.07] bg-[#090D0B] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.13em] text-blue-200/65">Placement matches</p>
                  <span className="text-[10px] font-medium text-white/38">Up to {MAX_PLACEMENT_MATCHES} matches</span>
                </div>
                <div className="mt-3 grid grid-cols-10 gap-1.5">
                  {Array.from({ length: MAX_PLACEMENT_MATCHES }).map((_, index) => {
                    const included = quantityIsValid && index < matches;
                    const finalIncluded = included && index === matches - 1;
                    return (
                      <span
                        key={index}
                        className={`grid h-3.5 w-full place-items-center rounded-full border transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none ${
                          included
                            ? finalIncluded
                              ? "border-blue-300/55 bg-blue-400/80"
                              : "border-blue-300/35 bg-blue-400/45"
                            : "border-white/[0.10] bg-white/[0.03]"
                        }`}
                      >
                        {finalIncluded && matches === MAX_PLACEMENT_MATCHES ? (
                          <span className="grid size-3 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                            <Check className="size-2" strokeWidth={3} />
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              </div>

              <input
                aria-label="Placement matches slider"
                type="range"
                min={1}
                max={MAX_PLACEMENT_MATCHES}
                step={1}
                value={sliderQuantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setLastValidQuantity(value);
                  update("matches", value);
                }}
                className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-transparent accent-blue-400"
                style={{
                  background: `linear-gradient(to right, rgba(96,165,250,.58) 0%, rgba(96,165,250,.58) ${sliderProgress}%, rgba(255,255,255,.07) ${sliderProgress}%, rgba(255,255,255,.07) 100%)`,
                }}
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

              <div className="mt-3 rounded-xl border border-[#39E56F]/18 bg-[#39E56F]/[0.035] p-3.5">
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.13em] text-[#A0AAA4]">Package discount</p>
                <p className="font-gaming-value mt-1.5 text-[1.75rem] font-bold leading-none tracking-[-0.035em] text-[#F4F7F5]">
                  {!quantityIsValid ? "—" : discountRate > 0 ? `${discountRate}% OFF` : "Standard price"}
                </p>
                {quantityIsValid && discountRate > 0 ? (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#82F5A4]">
                    <Check className="size-3" strokeWidth={2.7} />
                    Unlocked
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] leading-4 text-white/40">
                  {!quantityIsValid
                    ? "Enter a valid quantity to view package discounts."
                    : nextTier
                      ? `Add ${nextTier.matches - matches} more match${nextTier.matches - matches === 1 ? "" : "es"} to unlock ${nextTier.discount}% OFF.`
                      : "Maximum placement discount unlocked."}
                </p>
              </div>
            </div>
          </div>

          <div role="radiogroup" aria-label="Playlist" onKeyDown={handleRocketLeagueRadioGroupKeyDown} className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Select Playlist
                </p>
              </div>
              <span className="text-[10px] text-white/35">
                Price modifiers shown upfront
              </span>
            </div>

            <div className="mt-2 grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.012] p-2.5 sm:grid-cols-3">
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
                aria-expanded={showAllExtras}
                onClick={() => setShowAllExtras((current) => !current)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.015] px-3 text-xs font-semibold text-white/50 transition-colors hover:border-white/[0.18] hover:text-white"
              >
                {showAllExtras ? "Show less" : "More extra modes"}
                <ChevronDown className={`size-3.5 transition-transform ${showAllExtras ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
            <div className="space-y-3">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Platform
              </p>
              <div role="radiogroup" aria-label="Platform" onKeyDown={handleRocketLeagueRadioGroupKeyDown} className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.012] p-2.5">
                {platforms.map((platform) => {
                  const active = selection.platform === platform.value;
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => update("platform", platform.value)}
                      className={`flex h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left outline-none transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] ${
                        active
                          ? "border-blue-300/[0.18] bg-[#131B17] text-white"
                          : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                      }`}
                    >
                      <span className={`grid size-7 place-items-center rounded-lg border ${active ? "border-white/[0.12] bg-[#090D0B]" : "border-white/[0.08] bg-white/[0.02]"} ${platform.color}`}>
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

            <div className="space-y-3">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Boost Method
              </p>
              <div role="radiogroup" aria-label="Boost method" onKeyDown={handleRocketLeagueRadioGroupKeyDown} className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={boostMethod === "account"}
                  tabIndex={boostMethod === "account" ? 0 : -1}
                  onClick={() => update("boostMethod", "account")}
                  className={`min-h-[5.25rem] rounded-xl border p-3 text-left outline-none transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] ${
                    boostMethod === "account"
                      ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035] ring-1 ring-inset ring-white/[0.12]"
                      : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-blue-200/75">
                      <Gauge className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold text-[#82F5A4]">
                      Base
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#F4F7F5]">
                    Account Boost
                  </p>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={boostMethod === "play-with-booster"}
                  tabIndex={boostMethod === "play-with-booster" ? 0 : -1}
                  onClick={() => update("boostMethod", "play-with-booster")}
                  className={`min-h-[5.25rem] rounded-xl border p-3 text-left outline-none transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-blue-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] ${
                    boostMethod === "play-with-booster"
                      ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035] ring-1 ring-inset ring-white/[0.12]"
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
                  <p className="mt-2 text-sm font-semibold text-[#F4F7F5]">
                    Play With Booster
                  </p>
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/40">
                {boostMethod === "account" ? "The booster plays on your account." : "You play alongside the booster."}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
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

            <div className="mt-2 grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.012] p-2.5 md:grid-cols-2">
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

      <aside id="placements-summary" className="scroll-mt-28 xl:scroll-mt-24 xl:sticky xl:top-24">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
          <RocketLeagueOrderSummaryHeader serviceTitle="Placements Boost" isLoading={isLoading} ready={minimumOrderSatisfied} />

          <div className="p-4">
            <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {familyForRank(String(selection.previousRank)).image ? (
                  <Image src={familyForRank(String(selection.previousRank)).image!} alt="" width={30} height={30} className="size-7 shrink-0 object-contain" />
                ) : (
                  <RocketLeagueUnratedMark className="size-7" />
                )}
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Previous rank</p>
                  <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{rankLabel(String(selection.previousRank))}</p>
                </div>
              </div>
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Placement matches</p>
                    <p className="font-gaming-value mt-0.5 text-xl font-bold text-[#F4F7F5]">{quantityDisplay} <span className="text-xs font-semibold text-white/45">matches</span></p>
                  </div>
                  {discountRate > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#82F5A4]">
                      <Check className="size-3" strokeWidth={2.7} />
                      {discountRate}% OFF
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-10 gap-1">
                  {Array.from({ length: MAX_PLACEMENT_MATCHES }).map((_, index) => {
                    const included = quantityIsValid && index < matches;
                    return (
                      <span
                        key={index}
                        className={`h-2.5 rounded-full border ${included ? "border-blue-300/35 bg-blue-400/50" : "border-white/[0.10] bg-white/[0.03]"}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-2 divide-y divide-white/[0.06]">
              <div className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">Playlist</span><span className="font-medium text-white/78">{selectedPlaylist.label}</span></div>
              <div className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">Platform</span><span className="font-medium text-white/78">{platforms.find((item) => item.value === selection.platform)?.label}</span></div>
              <div className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">Boost method</span><span className="font-medium text-white/78">{boostMethod === "account" ? "Account Boost" : "Play With Booster"}</span></div>
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
                    <p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">{formatPrice(quote.total)}</p>
                    {!isLoading ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/38 transition-opacity duration-200 motion-reduce:transition-none">
                        <Check className="size-3 text-[#82F5A4]" strokeWidth={2.5} />
                        Server-Validated Price
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

            <RocketLeagueMinimumOrderNotice
              id="placements-minimum-order"
              shortfallCents={minimumShortfallCents}
            />

            {orderError ? (
              <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">
                {orderError}
              </div>
            ) : null}

            <AccountBoostCheckoutReassurance selected={boostMethod === "account"} accent="blue" />

            <Button
              className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none transition-colors duration-200 hover:bg-[#20C95A] hover:text-[#050807] motion-reduce:transition-none"
              size="lg"
              disabled={!minimumOrderSatisfied || isCreatingOrder}
              aria-describedby={minimumOrderBlocked ? "placements-minimum-order" : undefined}
              onClick={createOrder}
            >
              {isCreatingOrder ? (
                <>
                  Preparing checkout
                  <LoaderCircle className="ml-2 size-4 animate-spin" />
                </>
              ) : (
                <>
                  Continue to secure checkout
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:px-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3 xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="font-gaming-value whitespace-nowrap text-[1.55rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">{quote ? formatPrice(quote.total) : "—"}</p>
              {isLoading ? (
                <span className="inline-flex items-center gap-1 text-[9px] text-[#A0AAA4]">
                  <LoaderCircle className="size-2.5 animate-spin text-[#82F5A4] motion-reduce:animate-none" />
                  Updating…
                </span>
              ) : null}
            </div>
            {minimumOrderBlocked ? (
              <p className="mt-1 text-[9px] leading-3 text-amber-50/65">
                Minimum order total: {MINIMUM_ORDER_TOTAL_LABEL}
              </p>
            ) : null}
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
