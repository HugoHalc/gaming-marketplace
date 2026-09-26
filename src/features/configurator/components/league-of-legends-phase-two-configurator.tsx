"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  EyeOff,
  LoaderCircle,
  MonitorPlay,
  Sparkles,
  Swords,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import { parseWholeNumberQuantity, quantitySelectionValue } from "../client/whole-number-quantity";
import { AccountBoostTrust } from "./account-boost-trust";
import { LeagueOfLegendsOrderGuidance } from "./league-of-legends-order-guidance";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection, QuotePreview } from "../types/configurator";
import { PlatformIcon } from "./platform-icon";
import { PaymentMethodsTrustBlock } from "./payment-methods-trust-block";
import { MinimumOrderNotice } from "./minimum-order-notice";
import { meetsMinimumOrderTotal, minimumOrderShortfallCents } from "@/features/orders/minimum-order";



const serviceNavigation = [
  { slug: "rank-boost", label: "Rank Boost", mobileLabel: "Rank" },
  { slug: "wins", label: "Ranked Wins Boost", mobileLabel: "Wins" },
  { slug: "placement-matches", label: "Placements Boost", mobileLabel: "Placements" },
  { slug: "unrated-matches", label: "Unrated Matches Boost", mobileLabel: "Unrated" },
  { slug: "arena-boost", label: "Arena Boost", mobileLabel: "Arena" },
  { slug: "mastery-boost", label: "Mastery Boost", mobileLabel: "Mastery" },
  { slug: "clash-boost", label: "Clash Boost", mobileLabel: "Clash" },
] as const;

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

const roles = [
  ["top", "Top"],
  ["jungler", "Jungler"],
  ["mid", "Mid"],
  ["ad-carry", "AD Carry"],
  ["support", "Support"],
] as const;

const clashTiers = [
  ["1", "Tier 1"],
  ["2", "Tier 2"],
  ["3", "Tier 3"],
  ["4", "Tier 4"],
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
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

function Choice({ active, label, meta, disabled, onClick }: {
  active: boolean;
  label: string;
  meta?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onKeyDown={handleRadioKeyDown}
      onClick={onClick}
      className={`flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0A0E0C] motion-reduce:transition-none ${
        active
          ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-white"
          : "border-white/[0.08] bg-[#090D0B] text-white/62 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      <span className="min-w-0 text-xs font-semibold leading-4">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {meta ? <span className="text-[10px] font-bold text-white/42">{meta}</span> : null}
        {active ? <Check className="size-3.5 text-[#82F5A4]" aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

function Quantity({ rawValue, min, max, label, helper, error, id, onChange }: {
  rawValue: string | number;
  min: number;
  max: number;
  label: string;
  helper: string;
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
          <p className="mt-1 text-[10px] text-white/30">{helper}</p>
        </div>
        <span className="font-gaming-value text-xl font-bold text-[#E7C867]">{String(rawValue)}</span>
      </div>
      <input id={id} type="text" inputMode="numeric" value={String(rawValue)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(quantitySelectionValue(event.target.value, min, max))} className={`mt-3 h-11 w-full rounded-xl border bg-[#090D0B] px-3 text-sm font-semibold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/25 motion-reduce:transition-none ${error ? "border-rose-300/30" : "border-white/[0.08] focus:border-[#C89B3C]/35"}`} />
      <input type="range" min={min} max={max} step={1} value={sliderValue} aria-label={`${label} slider`} onChange={(event) => onChange(Number(event.target.value))} className="mt-4 h-5 w-full cursor-pointer accent-[#C89B3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/25" />
      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/28"><span>{min}</span><span>{max}</span></div>
      {error ? <p id={errorId} className="mt-2 text-[10px] leading-4 text-rose-200">{error}</p> : null}
    </div>
  );
}

function parseMasteryPoints(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && Number.isInteger(value) && value >= 10000 && value <= 1000000 && value % 10000 === 0
      ? { valid: true as const, value }
      : { valid: false as const, value: null };
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) return { valid: false as const, value: null };
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 10000 && parsed <= 1000000 && parsed % 10000 === 0
    ? { valid: true as const, value: parsed }
    : { valid: false as const, value: null };
}

function masteryPointsSelectionValue(raw: string) {
  const parsed = parseMasteryPoints(raw);
  return parsed.valid ? parsed.value : raw;
}

function MasteryPointsControl({ rawValue, error, onChange }: { rawValue: string | number; error: string | null; onChange: (value: string | number) => void }) {
  const parsed = parseMasteryPoints(rawValue);
  const sliderValue = parsed.valid ? parsed.value : 10000;
  const id = "lol-mastery-points";
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div><label htmlFor={id} className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Mastery points</label><p className="mt-1 text-sm font-semibold text-white">10,000–1,000,000 points</p></div>
        <span className="font-gaming-value text-xl font-bold text-[#E7C867]">{parsed.valid ? parsed.value.toLocaleString("en-US") : String(rawValue)}</span>
      </div>
      <input id={id} type="text" inputMode="numeric" value={String(rawValue)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(masteryPointsSelectionValue(event.target.value))} className={`mt-3 h-11 w-full rounded-xl border bg-[#090D0B] px-3 text-sm font-semibold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C89B3C]/25 motion-reduce:transition-none ${error ? "border-rose-300/30" : "border-white/[0.08] focus:border-[#C89B3C]/35"}`} />
      <input type="range" min={10000} max={1000000} step={10000} value={sliderValue} aria-label="Mastery points slider" onChange={(event) => onChange(Number(event.target.value))} className="mt-4 h-5 w-full cursor-pointer accent-[#C89B3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/25" />
      {error ? <p id={errorId} className="mt-2 text-[10px] leading-4 text-rose-200">{error}</p> : null}
    </div>
  );
}

function Extra({ checked, title, price, description, icon, onChange }: {
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
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#E7C867]/70">{icon}</span>
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

export function LeagueOfLegendsPhaseTwoConfigurator({ gameSlug, service }: { gameSlug: string; service: ServiceSummary }) {
  const router = useRouter();
  const isArena = service.slug === "arena-boost";
  const isMastery = service.slug === "mastery-boost";
  const isClash = service.slug === "clash-boost";

  const [selection, setSelection] = useState<ConfiguratorSelection>({
    server: "europe-west",
    platform: "pc",
    ...(isArena ? { games: 3, role: "top", boostMethod: "account" } : {}),
    ...(isMastery ? { masteryMode: "marks", marks: 2, masteryPoints: 10000, masteryCurrentLevel: 1, masteryTargetLevel: 3 } : {}),
    ...(isClash ? { clashTier: "1", games: 1, boosters: 1, boostMethod: "account" } : {}),
    playOffline: false,
    championsPreferences: false,
    streaming: false,
    expressDelivery: false,
    soloQueueOnly: false,
  });
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const arenaGamesRaw = typeof selection.games === "string" || typeof selection.games === "number" ? selection.games : 3;
  const marksRaw = typeof selection.marks === "string" || typeof selection.marks === "number" ? selection.marks : 1;
  const clashGamesRaw = typeof selection.games === "string" || typeof selection.games === "number" ? selection.games : 1;
  const clashBoostersRaw = typeof selection.boosters === "string" || typeof selection.boosters === "number" ? selection.boosters : 1;
  const masteryPointsRaw = typeof selection.masteryPoints === "string" || typeof selection.masteryPoints === "number" ? selection.masteryPoints : 10000;
  const masteryCurrentRaw = typeof selection.masteryCurrentLevel === "string" || typeof selection.masteryCurrentLevel === "number" ? selection.masteryCurrentLevel : 1;
  const masteryTargetRaw = typeof selection.masteryTargetLevel === "string" || typeof selection.masteryTargetLevel === "number" ? selection.masteryTargetLevel : 3;

  const arenaGamesResult = parseWholeNumberQuantity(arenaGamesRaw, 3, 60);
  const marksResult = parseWholeNumberQuantity(marksRaw, 1, 25);
  const clashGamesResult = parseWholeNumberQuantity(clashGamesRaw, 1, 10);
  const clashBoostersResult = parseWholeNumberQuantity(clashBoostersRaw, 1, 5);
  const masteryPointsResult = parseMasteryPoints(masteryPointsRaw);
  const masteryCurrentResult = parseWholeNumberQuantity(masteryCurrentRaw, 1, 9);
  const masteryTargetMinimum = masteryCurrentResult.valid ? (masteryCurrentResult.value === 1 ? 3 : masteryCurrentResult.value + 1) : 2;
  const masteryTargetResult = parseWholeNumberQuantity(masteryTargetRaw, masteryTargetMinimum, 10);
  const masteryMode = String(selection.masteryMode ?? "marks");
  const serverValid = servers.some(([value]) => value === selection.server);
  const platformValid = selection.platform === "pc";
  const boostMethodValid = selection.boostMethod === "account" || selection.boostMethod === "duo";
  const arenaRoleValid = roles.some(([value]) => value === selection.role);
  const clashTierValid = clashTiers.some(([value]) => value === selection.clashTier);
  const serviceSelectionsValid = isArena
    ? arenaGamesResult.valid && arenaRoleValid && boostMethodValid
    : isClash
      ? clashGamesResult.valid && clashBoostersResult.valid && clashTierValid && boostMethodValid
      : masteryMode === "points"
        ? masteryPointsResult.valid
        : masteryMode === "marks"
          ? marksResult.valid
          : masteryMode === "tier"
            ? masteryCurrentResult.valid && masteryTargetResult.valid
            : false;
  const selectionIsValid = serverValid && platformValid && serviceSelectionsValid;

  const selectionForRequest = useMemo(() => {
    const next = { ...selection };
    if (isMastery) {
      if (masteryMode !== "points") delete next.masteryPoints;
      if (masteryMode !== "marks") delete next.marks;
      if (masteryMode !== "tier") {
        delete next.masteryCurrentLevel;
        delete next.masteryTargetLevel;
      }
    }
    return next;
  }, [isMastery, masteryMode, selection]);

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
          body: JSON.stringify({ gameSlug, serviceSlug: service.slug, selection: selectionForRequest }),
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
  }, [gameSlug, service.slug, selectionForRequest, selectionIsValid]);

  function update(key: string, value: string | number | boolean) {
    setQuote(null);
    setIsLoading(true);
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function updateMasteryCurrentLevel(value: string | number) {
    setQuote(null);
    setIsLoading(true);
    setSelection((current) => {
      const parsedCurrent = parseWholeNumberQuantity(value, 1, 9);
      if (!parsedCurrent.valid) return { ...current, masteryCurrentLevel: value };
      const minimumTarget = parsedCurrent.value === 1 ? 3 : parsedCurrent.value + 1;
      const currentTarget = parseWholeNumberQuantity(current.masteryTargetLevel, minimumTarget, 10);
      return {
        ...current,
        masteryCurrentLevel: parsedCurrent.value,
        masteryTargetLevel: currentTarget.valid ? currentTarget.value : minimumTarget,
      };
    });
  }

  async function createOrder() {
    if (!selectionIsValid || !quote || !meetsMinimumOrderTotal(quote.total) || isLoading || isCreatingOrder) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, serviceSlug: service.slug, selection: selectionForRequest }),
      });
      const payload = (await response.json()) as { order?: { id: string }; error?: string };
      if (response.status === 401) {
        checkoutIntent.saveForAuthentication();
        router.push(`/login?next=${encodeURIComponent(`/games/${gameSlug}/${service.slug}`)}`);
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

  const serviceLabel = isArena
    ? "League of Legends Arena Boost"
    : isMastery
      ? "League of Legends Mastery Boost"
      : "League of Legends Clash Boost";

  const serverLabel = servers.find(([value]) => value === selection.server)?.[1] ?? "Europe West";
  const masteryCurrentLevel = masteryCurrentResult.valid ? masteryCurrentResult.value : masteryCurrentRaw;
  const masteryTargetLevel = masteryTargetResult.valid ? masteryTargetResult.value : masteryTargetRaw;

  const summaryRows: Array<[string, string]> = [];
  if (isArena) {
    const roleLabel = arenaRoleValid
      ? roles.find(([value]) => value === selection.role)?.[1] ?? String(selection.role)
      : String(selection.role);
    const boostMethodLabel = boostMethodValid
      ? selection.boostMethod === "duo" ? "Play with Booster" : "Account Boost"
      : String(selection.boostMethod);
    summaryRows.push(
      ["Arena games", arenaGamesResult.valid ? String(arenaGamesResult.value) : String(arenaGamesRaw)],
      ["Role", roleLabel],
      ["Boost method", boostMethodLabel],
    );
  }
  if (isMastery) {
    if (masteryMode === "points") {
      summaryRows.push(
        ["Boost option", "Mastery Points Farm"],
        ["Mastery points", masteryPointsResult.valid ? masteryPointsResult.value.toLocaleString("en-US") : String(masteryPointsRaw)],
      );
    } else if (masteryMode === "marks") {
      summaryRows.push(
        ["Boost option", "Marks of Mastery"],
        ["Marks of Mastery", marksResult.valid ? String(marksResult.value) : String(marksRaw)],
      );
    } else if (masteryMode === "tier") {
      summaryRows.push(
        ["Boost option", "Tier Boost"],
        ["Current level", masteryCurrentResult.valid ? `Level ${masteryCurrentResult.value}` : String(masteryCurrentRaw)],
        ["Target level", masteryTargetResult.valid ? `Level ${masteryTargetResult.value}` : String(masteryTargetRaw)],
      );
    } else {
      summaryRows.push(["Boost option", String(selection.masteryMode)]);
    }
  }
  if (isClash) {
    const boostMethodLabel = boostMethodValid
      ? selection.boostMethod === "duo" ? "Play with Booster" : "Account Boost"
      : String(selection.boostMethod);
    summaryRows.push(
      ["Clash tier", clashTierValid ? `Tier ${selection.clashTier}` : String(selection.clashTier)],
      ["Games", clashGamesResult.valid ? String(clashGamesResult.value) : String(clashGamesRaw)],
      ["Boosters", clashBoostersResult.valid ? String(clashBoostersResult.value) : String(clashBoostersRaw)],
      ["Boost method", boostMethodLabel],
    );
  }
  summaryRows.push(
    ["Server", serverValid ? serverLabel : String(selection.server)],
    ["Platform", platformValid ? "PC" : String(selection.platform)],
  );

  const belowMinimum = Boolean(quote && !meetsMinimumOrderTotal(quote.total));
  const minimumShortfallCents = quote ? minimumOrderShortfallCents(quote.total) : 0;

  return (
    <>
      <nav aria-label="League of Legends services" className="mb-3 sm:mb-4 xl:hidden">
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {serviceNavigation.map((item) => {
              const active = service.slug === item.slug;
              return (
                <Link key={item.slug} href={`/games/league-of-legends/${item.slug}`} aria-current={active ? "page" : undefined} className={`inline-flex h-11 items-center sm:h-10 justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-colors ${active ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-[#F4F7F5]" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
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
          <nav aria-label="League of Legends services" className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5">
            <div className="px-2.5 pb-3 pt-2">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E7C867]/80">League of Legends</p>
              <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
            </div>
            <div className="space-y-1.5">
              {serviceNavigation.map((item) => {
                const active = service.slug === item.slug;
                return (
                  <Link key={item.slug} href={`/games/league-of-legends/${item.slug}`} aria-current={active ? "page" : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${active ? "border-[#C89B3C]/35 bg-[#7A5B22]/15 text-[#F4F7F5]" : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"}`}>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                    {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" /> : null}
                  </Link>
                );
              })}
            </div>
            <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
            <Link href="/games/league-of-legends" className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 transition-colors hover:text-white/65">League of Legends overview</Link>
          </nav>
        </aside>

        <div className="grid min-w-0 gap-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] 2xl:grid-cols-[minmax(0,1fr)_23rem] 2xl:items-start 2xl:pb-0">
          <section className="min-w-0">
            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#080B09] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
              <div>
                <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E7C867]/80"><Sparkles className="size-3.5" />{serviceLabel}</div>
                <p className="mt-1 hidden text-sm text-[var(--muted-foreground)] sm:block">Verified League of Legends pricing inside the BoostingPedia configurator family.</p>
              </div>
              <span className="hidden w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300 sm:inline-flex">Server-calculated pricing</span>
            </div>

            <div className="mt-4 space-y-4">
              {isArena ? (
                <ConfiguratorBlock title="Arena setup">
                  <div className="space-y-5">
                    <Quantity rawValue={arenaGamesRaw} min={3} max={60} label="Arena games" helper="Choose between 3 and 60 games." error={arenaGamesResult.valid ? null : "Enter a whole number between 3 and 60."} id="lol-arena-games" onChange={(value) => update("games", value)} />
                    <div>
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Role</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">Role selection is price-neutral.</p>
                      <div role="radiogroup" aria-label="Role" className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        {roles.map(([value, label]) => <Choice key={value} active={selection.role === value} label={label} onClick={() => update("role", value)} />)}
                      </div>
                    </div>
                  </div>
                </ConfiguratorBlock>
              ) : null}

              {isMastery ? (
                <>
                  <ConfiguratorBlock title="Boost option">
                    <div role="radiogroup" aria-label="Mastery boost option" className="grid auto-rows-fr gap-2 sm:grid-cols-3">
                      <Choice active={selection.masteryMode === "points"} label="Mastery Points Farm" onClick={() => update("masteryMode", "points")} />
                      <Choice active={selection.masteryMode === "marks"} label="Marks of Mastery" onClick={() => update("masteryMode", "marks")} />
                      <Choice active={selection.masteryMode === "tier"} label="Tier Boost" onClick={() => update("masteryMode", "tier")} />
                    </div>
                  </ConfiguratorBlock>

                  <ConfiguratorBlock title="Configuration">
                    {selection.masteryMode === "points" ? (
                      <MasteryPointsControl
                        rawValue={masteryPointsRaw}
                        error={masteryPointsResult.valid ? null : "Enter a value from 10,000 to 1,000,000 in increments of 10,000."}
                        onChange={(value) => update("masteryPoints", value)}
                      />
                    ) : selection.masteryMode === "tier" ? (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Quantity
                          rawValue={masteryCurrentRaw}
                          min={1}
                          max={9}
                          label="Current Level"
                          helper="Level 1 starts with a minimum target of Level 3."
                          error={masteryCurrentResult.valid ? null : "Enter a whole number between 1 and 9."}
                          id="lol-mastery-current-level"
                          onChange={updateMasteryCurrentLevel}
                        />
                        <Quantity
                          rawValue={masteryTargetRaw}
                          min={masteryTargetMinimum}
                          max={10}
                          label="Target Level"
                          helper="Choose a target above your current level, up to Level 10."
                          error={masteryCurrentResult.valid && masteryTargetResult.valid ? null : masteryCurrentResult.valid ? `Enter a whole number between ${masteryTargetMinimum} and 10.` : "Choose a valid current level first."}
                          id="lol-mastery-target-level"
                          onChange={(value) => update("masteryTargetLevel", value)}
                        />
                      </div>
                    ) : (
                      <Quantity rawValue={marksRaw} min={1} max={25} label="Marks of Mastery" helper="Choose between 1 and 25 marks." error={marksResult.valid ? null : "Enter a whole number between 1 and 25."} id="lol-mastery-marks" onChange={(value) => update("marks", value)} />
                    )}
                  </ConfiguratorBlock>
                </>
              ) : null}

              {isClash ? (
                <ConfiguratorBlock title="Clash setup">
                  <div className="space-y-5">
                    <div>
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Clash tier</p>
                      <div role="radiogroup" aria-label="Clash tier" className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-4">
                        {clashTiers.map(([value, label]) => <Choice key={value} active={selection.clashTier === value} label={label} onClick={() => update("clashTier", value)} />)}
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Quantity rawValue={clashGamesRaw} min={1} max={10} label="Clash games" helper="Choose between 1 and 10 games." error={clashGamesResult.valid ? null : "Enter a whole number between 1 and 10."} id="lol-clash-games" onChange={(value) => update("games", value)} />
                      <Quantity rawValue={clashBoostersRaw} min={1} max={5} label="Boosters" helper="Choose between 1 and 5 boosters." error={clashBoostersResult.valid ? null : "Enter a whole number between 1 and 5."} id="lol-clash-boosters" onChange={(value) => update("boosters", value)} />
                    </div>
                  </div>
                </ConfiguratorBlock>
              ) : null}

              {(isArena || isClash) ? (
                <ConfiguratorBlock title="Boost method">
                  <div role="radiogroup" aria-label="Boost method" className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                    <Choice active={selection.boostMethod === "account"} label="Account Boost" meta="Base" onClick={() => update("boostMethod", "account")} />
                    <Choice active={selection.boostMethod === "duo"} label="Play with Booster" meta="+50%" onClick={() => update("boostMethod", "duo")} />
                  </div>
                  <AccountBoostTrust selected={selection.boostMethod === "account"} accent="gold" showDescription />
                </ConfiguratorBlock>
              ) : null}

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

              <ConfiguratorBlock title="Extras" helper="Optional modifiers for this service.">
                <div className="grid auto-rows-fr gap-2 sm:grid-cols-2">
                  <Extra checked={selection.playOffline === true} onChange={(checked) => update("playOffline", checked)} icon={<EyeOff className="size-3.5" />} title="Play Offline" price="FREE" description="Keep activity discreet where the service exposes this option." />
                  {isArena || isClash ? <Extra checked={selection.championsPreferences === true} onChange={(checked) => update("championsPreferences", checked)} icon={<Users className="size-3.5" />} title="Champions Preferences" price="FREE" description="Provide champion preferences for the order." /> : null}
                  <Extra checked={selection.streaming === true} onChange={(checked) => update("streaming", checked)} icon={<MonitorPlay className="size-3.5" />} title="Streaming" price="+$7.00" description="Add streaming to your order." />
                  <Extra checked={selection.expressDelivery === true} onChange={(checked) => update("expressDelivery", checked)} icon={<Zap className="size-3.5" />} title="Express Delivery" price="+20%" description="Prioritize faster fulfillment." />
                  <Extra checked={selection.soloQueueOnly === true} onChange={(checked) => update("soloQueueOnly", checked)} icon={<Swords className="size-3.5" />} title="Solo Queue Only" price="+40%" description="Use the documented solo-queue-only modifier." />
                </div>
              </ConfiguratorBlock>

              <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:grid-cols-3">
                {["Stable base pricing without temporary campaign pricing.", "Server-validated BoostingPedia totals.", "Progressive discounts applied server-side."].map((note) => <div key={note} className="flex items-center gap-2 text-[10px] text-white/40"><Check className="size-3 shrink-0 text-emerald-300" aria-hidden="true" /><span>{note}</span></div>)}
              </div>
            </div>
          </section>

          <aside id="boost-summary" className="scroll-mt-28 2xl:scroll-mt-24 2xl:sticky 2xl:top-24">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-[#C89B3C]/[0.055] via-transparent to-transparent px-4 py-4">
                <div className="flex items-start justify-between gap-4"><div><p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">Order Summary</p><p className="mt-2 text-[11px] font-medium text-[#A0AAA4]">{serviceLabel}</p></div>{isLoading ? <LoaderCircle className="size-4 animate-spin text-[#E7C867] motion-reduce:animate-none" aria-label="Updating price" /> : null}</div>
              </div>
              <div className="p-4">
                <div className="divide-y divide-white/[0.06]">{summaryRows.map(([label, value]) => <div key={label} className="flex min-h-9 items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">{label}</span><span className="text-right font-medium text-white/78">{value}</span></div>)}</div>
                {error ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{error}</div> : null}
                {quote ? (
                  <>
                    <div className="my-4 h-px bg-white/[0.08]" />
                    <div className="space-y-2">{quote.breakdown.map((item, index) => <div key={`${item.label}-${index}`} className="flex min-h-7 items-center justify-between gap-4 text-[11px]"><span className="text-[#A0AAA4]">{item.label}</span><span className={item.amount < 0 ? "font-medium text-[#82F5A4]" : "font-medium text-white/78"}>{item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}</span></div>)}</div>
                    <div className="my-4 h-px bg-white/[0.08]" />
                    <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-medium text-[#A0AAA4]">Total</p><p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">{formatPrice(quote.total)}</p></div><span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">USD</span></div>
                  </>
                ) : <div className="py-6 text-sm text-white/40">Adjust the configuration to generate a quote.</div>}
                <MinimumOrderNotice id={`lol-${service.slug}-minimum-order`} shortfallCents={belowMinimum ? minimumShortfallCents : 0} />
                {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{orderError}</div> : null}
                <LeagueOfLegendsOrderGuidance
                  idPrefix={`lol-${service.slug}`}
                  accountAccess={isArena || isClash ? (selection.boostMethod === "duo" ? "duo" : "account") : null}
                />

                <Button className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none hover:bg-[#20C95A] hover:text-[#050807]" size="lg" disabled={!selectionIsValid || !quote || belowMinimum || isLoading || isCreatingOrder} onClick={createOrder}>{isCreatingOrder ? <>Preparing checkout<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Checkout<ArrowRight className="ml-2 size-4" /></>}</Button>
                <p className="mt-3 text-center text-[10px] leading-4 text-white/35">Final price is recalculated and validated on the server.</p>
              </div>
            </div>
            <PaymentMethodsTrustBlock className="mt-3" />
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:px-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3 2xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p><p className="font-gaming-value mt-0.5 whitespace-nowrap text-[1.55rem] font-bold leading-none text-[#F4F7F5]">{quote ? formatPrice(quote.total) : "—"}</p></div><a href="#boost-summary" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#39E56F]/35 bg-[#39E56F] px-5 text-sm font-bold text-[#050807]">View order<ArrowRight className="ml-2 size-4" /></a></div>
      </div>

    </>
  );
}
