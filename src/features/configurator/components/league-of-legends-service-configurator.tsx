"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  EyeOff,
  LoaderCircle,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import { parseWholeNumberQuantity, quantitySelectionValue } from "../client/whole-number-quantity";
import { AccountBoostTrust } from "./account-boost-trust";
import { LeagueOfLegendsOrderGuidance } from "./league-of-legends-order-guidance";
import { PaymentMethodsTrustBlock } from "./payment-methods-trust-block";
import { PlatformIcon } from "./platform-icon";
import { MinimumOrderNotice } from "./minimum-order-notice";
import { meetsMinimumOrderTotal, minimumOrderShortfallCents } from "@/features/orders/minimum-order";
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
  { label: "Iron", image: "/ranks/league-of-legends/iron.png", divisions: ["IV", "III", "II", "I"] },
  { label: "Bronze", image: "/ranks/league-of-legends/bronze.png", divisions: ["IV", "III", "II", "I"] },
  { label: "Silver", image: "/ranks/league-of-legends/silver.png", divisions: ["IV", "III", "II", "I"] },
  { label: "Gold", image: "/ranks/league-of-legends/gold.png", divisions: ["IV", "III", "II", "I"] },
  { label: "Platinum", image: "/ranks/league-of-legends/platinum.png", divisions: ["IV", "III", "II", "I"] },
  { label: "Emerald", image: "/ranks/league-of-legends/emerald.png", divisions: ["IV", "III", "II", "I"] },
  { label: "Diamond", image: "/ranks/league-of-legends/diamond.png", divisions: ["IV", "III", "II", "I"] },
] as const;

const masterRankImage = "/ranks/league-of-legends/master.png";

const rankOpticalScale: Record<string, string> = {
  Iron: "scale-[1.02]",
  Bronze: "scale-[1.04]",
  Silver: "scale-[1.03]",
  Gold: "scale-[0.94]",
  Platinum: "scale-[1.03]",
  Emerald: "scale-[1.03]",
  Diamond: "scale-[0.99]",
  Master: "scale-[0.93] -translate-y-px",
};

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

function imageForRank(rank: string) {
  if (rank === "Master") return masterRankImage;
  const { family } = splitRank(rank);
  return rankFamilies.find((item) => item.label === family)?.image ?? null;
}

function opticalClassForRank(rank: string) {
  if (rank === "Master") return rankOpticalScale.Master;
  const { family } = splitRank(rank);
  return rankOpticalScale[family] ?? "";
}

function firstRankForFamily(family: string) {
  return `${family} IV`;
}


function handleRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!keys.includes(event.key)) return;

  const group = event.currentTarget.closest('[role="radiogroup"]');
  if (!group) return;

  const radios = Array.from(
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
  );
  if (radios.length === 0) return;

  const currentIndex = radios.indexOf(event.currentTarget);
  if (currentIndex < 0) return;

  event.preventDefault();
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? radios.length - 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (currentIndex - 1 + radios.length) % radios.length
          : (currentIndex + 1) % radios.length;

  radios[nextIndex]?.focus();
  radios[nextIndex]?.click();
}

function ConfiguratorBlock({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#0A0E0C]/75 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E7C867]/75">
          {title}
        </h3>
        {helper ? <p className="mt-1 text-[11px] leading-4 text-white/35">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
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
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E7C867]/75">
            {label}
          </p>
          <p className="font-gaming-value mt-1 text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
            {value}
          </p>
        </div>
        <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#C89B3C]/20 bg-[#C89B3C]/[0.045]">
          {unranked ? (
            <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#E7C867]/65">UR</span>
          ) : (
            <Image
              src={imageForRank(value) ?? masterRankImage}
              alt={`${value} rank`}
              width={44}
              height={44}
              className={`h-11 w-11 object-contain drop-shadow-[0_7px_12px_rgba(0,0,0,.45)] ${opticalClassForRank(value)}`}
            />
          )}
        </span>
      </div>

      <div role="radiogroup" aria-label={`${label} rank`}>
      {allowUnranked ? (
        <button
          type="button"
          role="radio"
          aria-checked={unranked}
          tabIndex={unranked ? 0 : -1}
          onKeyDown={handleRadioKeyDown}
          onClick={() => onChange("Unranked")}
          className={`mt-4 flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 motion-reduce:transition-none ${
            unranked
              ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
              : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          Unranked
          {unranked ? <Check className="size-3.5 text-[#82F5A4]" /> : null}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2 min-[390px]:grid-cols-4">
        {rankFamilies.map((family) => {
          const available = target
            ? family.divisions.some((division) => rankIndex(`${family.label} ${division}`) > currentIndex)
            : family.divisions.some((division) => rankIndex(`${family.label} ${division}`) <= maxIndex);
          const active = !unranked && !master && selected.family === family.label;

          return (
            <button
              key={family.label}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              disabled={!available}
              onKeyDown={handleRadioKeyDown}
              onClick={() => selectFamily(family.label)}
              className={`relative flex min-h-[6rem] min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 motion-reduce:transition-none ${
                active
                  ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-white"
                  : "border-white/[0.08] bg-[#090D0B] text-white/58 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-20`}
            >
              {active ? (
                <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              ) : null}
              <span className="grid h-12 w-12 place-items-center">
                <Image
                  src={family.image}
                  alt=""
                  width={48}
                  height={48}
                  className={`h-11 w-11 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.42)] ${rankOpticalScale[family.label] ?? ""}`}
                />
              </span>
              <span className="mt-1 block min-h-4 text-[11px] font-bold uppercase leading-4 tracking-[0.035em]">{family.label}</span>
            </button>
          );
        })}
      </div>

      {allowMaster ? (
        <button
          type="button"
          role="radio"
          aria-checked={master}
          tabIndex={master ? 0 : -1}
          onKeyDown={handleRadioKeyDown}
          onClick={() => onChange("Master")}
          className={`mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 motion-reduce:transition-none ${
            master
              ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-white"
              : "border-white/[0.08] bg-[#090D0B] text-white/58 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Image src={masterRankImage} alt="" width={32} height={32} className={`size-8 object-contain ${rankOpticalScale.Master}`} />
            Master
          </span>
          {master ? <Check className="size-3.5 text-[#82F5A4]" /> : null}
        </button>
      ) : null}
      </div>

      {!unranked && !master && selected.family ? (
        <div className="mt-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={`${label} division`}>
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
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                disabled={!available}
                onKeyDown={handleRadioKeyDown}
                onClick={() => onChange(candidate)}
                className={`min-h-10 min-w-10 rounded-lg border px-3 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 motion-reduce:transition-none ${
                  active
                    ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-white"
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
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onKeyDown={handleRadioKeyDown}
      onClick={onClick}
      className={`flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0A0E0C] motion-reduce:transition-none ${
        active
          ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-white"
          : "border-white/[0.08] bg-[#090D0B] text-white/62 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="min-w-0 text-xs font-semibold leading-4">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {meta ? <span className="text-[10px] font-bold text-white/42">{meta}</span> : null}
        {active ? <Check className="size-3.5 text-[#82F5A4]" aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

function Quantity({
  rawValue,
  min,
  max,
  label,
  error,
  id,
  onChange,
}: {
  rawValue: string | number;
  min: number;
  max: number;
  label: string;
  error: string | null;
  id: string;
  onChange: (value: string | number) => void;
}) {
  const parsed = parseWholeNumberQuantity(rawValue, min, max);
  const sliderValue = parsed.valid ? parsed.value : min;
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <label htmlFor={id} className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">{label}</label>
          <p className="mt-1 text-[10px] text-white/30">Choose between {min} and {max}.</p>
        </div>
        <span className="font-gaming-value text-xl font-bold text-[#E7C867]">{String(rawValue)}</span>
      </div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={String(rawValue)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(quantitySelectionValue(event.target.value, min, max))}
        className={`mt-3 h-11 w-full rounded-xl border bg-[#090D0B] px-3 text-sm font-semibold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/25 motion-reduce:transition-none ${error ? "border-rose-300/30" : "border-white/[0.08] focus:border-[#C89B3C]/35"}`}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={sliderValue}
        aria-label={`${label} slider`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-5 w-full cursor-pointer accent-[#C89B3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/25"
      />
      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/28">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {error ? <p id={errorId} className="mt-2 text-[10px] leading-4 text-rose-200">{error}</p> : null}
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
      className={`flex min-h-[4.5rem] min-w-0 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/30 motion-reduce:transition-none ${
        checked ? "border-[#C89B3C]/30 bg-[#7A5B22]/15" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#E7C867]/65">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-xs font-semibold leading-4 text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${price === "FREE" ? "text-[#82F5A4]" : "text-[#E7C867]/65"}`}>{price}</span>
        </span>
        <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">{description}</span>
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
    soloQueueOnly: false,
    rankInsurance: false,
    demotionShield: false,
  });

  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const currentRank = String(selection.currentRank);
  const targetRank = String(selection.targetRank ?? "");
  const quantityKey = isWins ? "wins" : "matches";
  const quantityMin = 1;
  const quantityMax = isUnrated ? 10 : 5;
  const selectedQuantity = isWins || isPlacements || isUnrated ? selection[quantityKey] : 1;
  const quantityRaw: string | number =
    typeof selectedQuantity === "string" || typeof selectedQuantity === "number" ? selectedQuantity : 1;
  const quantityResult = parseWholeNumberQuantity(quantityRaw, quantityMin, quantityMax);
  const quantityError =
    isWins || isPlacements || isUnrated
      ? quantityResult.valid
        ? null
        : `Enter a whole number between ${quantityMin} and ${quantityMax}.`
      : null;
  const rankProgressionValid =
    !isRank ||
    (rankIndex(currentRank) >= 0 && rankIndex(targetRank) > rankIndex(currentRank));
  const currentRankValid =
    isUnrated ||
    (isPlacements && currentRank === "Unranked") ||
    rankIndex(currentRank) >= 0 ||
    ((!isRank && !isUnrated) && currentRank === "Master");
  const sharedSelectionsValid =
    servers.some(([value]) => value === selection.server) &&
    (selection.queue === "solo-duo" || selection.queue === "flex") &&
    (selection.boostMethod === "account" || selection.boostMethod === "duo") &&
    selection.platform === "pc";
  const selectionIsValid =
    sharedSelectionsValid &&
    currentRankValid &&
    rankProgressionValid &&
    (!(isWins || isPlacements || isUnrated) || quantityResult.valid);

  useEffect(() => {
    if (!isRank) return;
    if (rankIndex(targetRank) <= rankIndex(currentRank)) {
      const next = rankOrder[rankIndex(currentRank) + 1];
      if (next) setSelection((current) => ({ ...current, targetRank: next }));
    }
  }, [currentRank, targetRank, isRank]);

  useEffect(() => {
    setQuote(null);
    setError(null);
    if (!selectionIsValid) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/quotes/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameSlug, serviceSlug: service.slug, selection }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as { quote?: QuotePreview; error?: string };
        if (!response.ok || !payload.quote) throw new Error(payload.error ?? "Unable to calculate quote.");
        if (!active) return;
        setQuote(payload.quote);
      } catch (requestError) {
        if (!active || (requestError instanceof DOMException && requestError.name === "AbortError")) return;
        setQuote(null);
        setError(requestError instanceof Error ? requestError.message : "Unable to calculate quote.");
      } finally {
        if (active) setIsLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [gameSlug, service.slug, selection, selectionIsValid]);

  function update(key: string, value: string | number | boolean) {
    setQuote(null);
    setIsLoading(true);
    setSelection((current) => ({ ...current, [key]: value }));
  }

  async function createOrder() {
    if (!selectionIsValid || !quote || !meetsMinimumOrderTotal(quote.total) || isLoading || isCreatingOrder) return;
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
        checkoutIntent.saveForAuthentication();
        const next = `/games/${gameSlug}/${service.slug}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!response.ok || !payload.order) throw new Error(payload.error ?? "Unable to create order.");
      checkoutIntent.clearAfterOrder();
      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const checkoutIntent = useCheckoutIntentContinuity({
    gameSlug,
    serviceSlug: service.slug,
    selection,
    setSelection,
    canAutoResume: Boolean(selectionIsValid && quote && meetsMinimumOrderTotal(quote.total) && !isLoading),
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  const serviceLabel = isRank
    ? "League of Legends Rank Boost"
    : isWins
      ? "League of Legends Ranked Wins"
      : isPlacements
        ? "League of Legends Placements"
        : "League of Legends Unrated Matches";

  const quantity = quantityResult.valid ? quantityResult.value : quantityRaw;
  const belowMinimum = Boolean(quote && !meetsMinimumOrderTotal(quote.total));
  const minimumShortfallCents = quote ? minimumOrderShortfallCents(quote.total) : 0;

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
      <nav aria-label="League of Legends services" className="mb-3 sm:mb-4 xl:hidden">
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {serviceNavigation.map((item) => {
              const active = item.slug === service.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/games/league-of-legends/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 items-center sm:h-10 rounded-xl border px-3.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 motion-reduce:transition-none ${
                    active
                      ? "border-[#C89B3C]/30 bg-[#7A5B22]/15 text-[#F4F7F5]"
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
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E7C867]/70">
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
                        ? "border-[#C89B3C]/30 bg-[#7A5B22]/15 text-[#F4F7F5]"
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
          <div className="grid gap-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] 2xl:grid-cols-[minmax(0,1fr)_23rem] 2xl:items-start 2xl:pb-0">
            <section className="min-w-0">
              <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#080B09] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
                <div>
                  <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E7C867]/75">
                    <Sparkles className="size-3.5" />
                    {serviceLabel}
                  </div>
                  <p className="mt-1 hidden text-sm text-[var(--muted-foreground)] sm:block">Configure your order inside the BoostingPedia flow.</p>
                </div>
                <span className="hidden w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300 sm:inline-flex">
                  Server-validated pricing
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {isRank ? (
                  <ConfiguratorBlock
                    title="Rank progression"
                    helper="Choose where the order starts and the rank you want to reach."
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] lg:items-center">
                      <RankSelector label="Current rank" value={currentRank} maxRank="Diamond II" onChange={(value) => update("currentRank", value)} />
                      <div className="grid h-8 place-items-center text-[#E7C867]/55" aria-hidden="true">
                        <ArrowRight className="size-4 rotate-90 lg:rotate-0" />
                      </div>
                      <RankSelector label="Desired rank" value={targetRank} target currentRank={currentRank} onChange={(value) => update("targetRank", value)} />
                    </div>
                  </ConfiguratorBlock>
                ) : isUnrated ? null : (
                  <ConfiguratorBlock title={isPlacements ? "Previous rank" : "Current rank"}>
                    <RankSelector
                      label={isPlacements ? "Previous rank" : "Current rank"}
                      value={currentRank}
                      allowUnranked={isPlacements}
                      allowMaster
                      onChange={(value) => update("currentRank", value)}
                    />
                  </ConfiguratorBlock>
                )}

                {(isWins || isPlacements || isUnrated) ? (
                  <ConfiguratorBlock title="Order quantity">
                    <Quantity
                      rawValue={quantityRaw}
                      min={quantityMin}
                      max={quantityMax}
                      label={isWins ? "Ranked wins" : isPlacements ? "Placement matches" : "Unrated matches"}
                      error={quantityError}
                      id={`lol-${service.slug}-quantity`}
                      onChange={(value) => update(quantityKey, value)}
                    />
                  </ConfiguratorBlock>
                ) : null}

                {isRank ? (
                  <ConfiguratorBlock title="Rank context">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block min-w-0">
                        <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Current LP</span>
                        <select value={String(selection.currentLp)} onChange={(event) => update("currentLp", event.target.value)} className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-xs font-semibold text-white outline-none transition-colors focus-visible:border-[#C89B3C]/35 focus-visible:ring-2 focus-visible:ring-[#C89B3C]/20 motion-reduce:transition-none">
                          {currentLpOptions.map(([value, label, meta]) => <option key={value} value={value}>{label} · {meta}</option>)}
                        </select>
                      </label>
                      <label className="block min-w-0">
                        <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">LP Gain</span>
                        <select value={String(selection.lpGain)} onChange={(event) => update("lpGain", event.target.value)} className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-xs font-semibold text-white outline-none transition-colors focus-visible:border-[#C89B3C]/35 focus-visible:ring-2 focus-visible:ring-[#C89B3C]/20 motion-reduce:transition-none">
                          {lpGainOptions.map(([value, label, meta]) => <option key={value} value={value}>{label} · {meta}</option>)}
                        </select>
                      </label>
                    </div>
                  </ConfiguratorBlock>
                ) : isWins ? (
                  <ConfiguratorBlock title="LP gain">
                    <label className="block min-w-0">
                      <span className="sr-only">LP Gain</span>
                      <select value={String(selection.lpGain)} onChange={(event) => update("lpGain", event.target.value)} aria-label="LP Gain" className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-xs font-semibold text-white outline-none transition-colors focus-visible:border-[#C89B3C]/35 focus-visible:ring-2 focus-visible:ring-[#C89B3C]/20 motion-reduce:transition-none">
                        {lpGainOptions.map(([value, label, meta]) => <option key={value} value={value}>{label} · {meta}</option>)}
                      </select>
                    </label>
                  </ConfiguratorBlock>
                ) : null}

                <ConfiguratorBlock title="Boost method">
                  <div role="radiogroup" aria-label="Boost method" className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                    <Choice active={selection.boostMethod === "account"} onClick={() => update("boostMethod", "account")} label="Account Boost" meta="Base" />
                    <Choice
                      active={selection.boostMethod === "duo"}
                      onClick={() => update("boostMethod", "duo")}
                      label="Play with Booster"
                      meta={isWins ? "+75%" : isUnrated ? "+30%" : "+50%"}
                    />
                  </div>
                  <AccountBoostTrust selected={selection.boostMethod === "account"} accent="gold" showDescription />
                </ConfiguratorBlock>

                <ConfiguratorBlock title="Queue">
                  <div role="radiogroup" aria-label="Queue type" className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                    <Choice active={selection.queue === "solo-duo"} onClick={() => update("queue", "solo-duo")} label="Solo - Duo" meta="FREE" />
                    <Choice active={selection.queue === "flex"} onClick={() => update("queue", "flex")} label="Flex" meta="FREE" />
                  </div>
                </ConfiguratorBlock>

                <ConfiguratorBlock title="Server and platform">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Server</span>
                      <select value={String(selection.server)} onChange={(event) => update("server", event.target.value)} className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-xs font-semibold text-white outline-none transition-colors focus-visible:border-[#C89B3C]/35 focus-visible:ring-2 focus-visible:ring-[#C89B3C]/20 motion-reduce:transition-none">
                        {servers.map(([value, label]) => <option key={value} value={value}>{label}{value === "north-america" || value === "oceania" ? " (+10%)" : ""}</option>)}
                      </select>
                    </label>
                    <label className="block min-w-0">
                      <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Platform</span>
                      <div className="relative mt-3">
                        <span className="pointer-events-none absolute left-3 top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center text-sky-300" aria-hidden="true">
                          <PlatformIcon platform="pc" />
                        </span>
                        <select
                          value="pc"
                          disabled
                          aria-label="Platform"
                          className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] pl-12 pr-3 text-xs font-semibold text-white outline-none disabled:cursor-default disabled:opacity-100"
                        >
                          <option value="pc">PC</option>
                        </select>
                      </div>
                    </label>
                  </div>
                </ConfiguratorBlock>

                <ConfiguratorBlock title="Extras" helper="Add only the options you want.">
                  <div className="grid auto-rows-fr gap-2 sm:grid-cols-2">
                    <Extra checked={selection.playOffline === true} onChange={(value) => update("playOffline", value)} icon={<EyeOff className="size-3.5" />} title="Play Offline" price="FREE" description="Keep your order activity discreet." />
                    <Extra checked={selection.championsPreferences === true} onChange={(value) => update("championsPreferences", value)} icon={<Users className="size-3.5" />} title="Champions Preferences" price="FREE" description="Share preferred champions with your booster." />
                    <Extra checked={selection.streaming === true} onChange={(value) => update("streaming", value)} icon={<MonitorPlay className="size-3.5" />} title="Streaming" price="+$7.00" description="Add streaming to your order." />
                    <Extra checked={selection.expressDelivery === true} onChange={(value) => update("expressDelivery", value)} icon={<Zap className="size-3.5" />} title="Express Delivery" price="+20%" description="Prioritize faster fulfillment." />
                    <Extra checked={selection.soloQueueOnly === true} onChange={(value) => update("soloQueueOnly", value)} icon={<ShieldCheck className="size-3.5" />} title="Solo Queue Only" price="+40%" description="Restrict the order to solo queue play." />
                    {isRank ? (
                      <Extra checked={selection.rankInsurance === true} onChange={(value) => update("rankInsurance", value)} icon={<ShieldCheck className="size-3.5" />} title="Rank Insurance" price="+50%" description="Add the documented rank insurance option." />
                    ) : null}
                    {isWins ? (
                      <Extra checked={selection.demotionShield === true} onChange={(value) => update("demotionShield", value)} icon={<ShieldCheck className="size-3.5" />} title="Demotion Shield" price="+20%" description="Add the documented demotion shield option." />
                    ) : null}
                  </div>
                </ConfiguratorBlock>

                <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:grid-cols-3">
                  {[
                    "Server-calculated pricing.",
                    "Selected options are included in your quote.",
                    "Available discounts are applied automatically.",
                  ].map((note) => (
                    <div key={note} className="flex items-center gap-2 text-[10px] text-white/40">
                      <Check className="size-3 shrink-0 text-emerald-300" aria-hidden="true" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside id="boost-summary" className="scroll-mt-28 2xl:scroll-mt-24 2xl:sticky 2xl:top-24">
              <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
                <div className="border-b border-white/[0.07] bg-gradient-to-br from-[#C89B3C]/[0.05] via-transparent to-transparent px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">Order Summary</p>
                      <p className="mt-2 text-[11px] font-medium text-[#A0AAA4]">{serviceLabel}</p>
                    </div>
                    {isLoading ? (
                      <LoaderCircle className="size-4 animate-spin text-[#82F5A4] motion-reduce:animate-none" aria-label="Updating price" />
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  {isRank ? (
                    <div className="min-h-16 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {imageForRank(currentRank) ? <Image src={imageForRank(currentRank)!} alt="" width={30} height={30} className={`size-7 shrink-0 object-contain ${opticalClassForRank(currentRank)}`} /> : null}
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">Current</p>
                            <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{currentRank}</p>
                          </div>
                        </div>
                        <ArrowRight className="size-3.5 text-amber-200/35" />
                        <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">Desired</p>
                            <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{targetRank}</p>
                          </div>
                          {imageForRank(targetRank) ? <Image src={imageForRank(targetRank)!} alt="" width={30} height={30} className={`size-7 shrink-0 object-contain ${opticalClassForRank(targetRank)}`} /> : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-16 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {!isUnrated && imageForRank(currentRank) ? <Image src={imageForRank(currentRank)!} alt="" width={30} height={30} className={`size-7 shrink-0 object-contain ${opticalClassForRank(currentRank)}`} /> : null}
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.13em] text-white/30">{isUnrated ? "Service" : isPlacements ? "Previous rank" : "Current rank"}</p>
                            <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">{isUnrated ? "Unrated" : currentRank}</p>
                          </div>
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
                      <div key={label} className="flex min-h-9 items-center justify-between gap-4 py-2 text-[11px]">
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
                          <div key={`${item.label}-${index}`} className="flex min-h-7 items-center justify-between gap-4 text-[11px]">
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
                        </div>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] text-white/45">USD</span>
                      </div>
                    </>
                  ) : null}

                  <MinimumOrderNotice id={`lol-${service.slug}-minimum-order`} shortfallCents={belowMinimum ? minimumShortfallCents : 0} />
                  {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{orderError}</div> : null}

                  <LeagueOfLegendsOrderGuidance
                    idPrefix={`lol-${service.slug}`}
                    accountAccess={selection.boostMethod === "duo" ? "duo" : "account"}
                  />

                  <Button
                    className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none hover:bg-[#20C95A] hover:text-[#050807]"
                    size="lg"
                    disabled={!selectionIsValid || !quote || belowMinimum || isLoading || isCreatingOrder}
                    onClick={createOrder}
                  >
                    {isCreatingOrder ? <>Preparing checkout<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Checkout<ArrowRight className="ml-2 size-4" /></>}
                  </Button>
                  <p className="mt-3 text-center text-[10px] leading-4 text-white/35">Final price is validated on the server before the order is stored.</p>
                </div>
              </div>
              <PaymentMethodsTrustBlock className="mt-3" />
            </aside>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:px-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3 2xl:hidden">
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
