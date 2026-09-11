"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  EyeOff,
  Gamepad2,
  LoaderCircle,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import { OVERWATCH_EXTRA_PRICING } from "@/features/pricing/overwatch-pricing-rules";
import {
  AccountBoostCheckoutReassurance,
  AccountBoostTrust,
} from "./account-boost-trust";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import type {
  ConfiguratorSelection,
  QuotePreview,
  ServiceConfiguratorSchema,
} from "../types/configurator";

const serviceNavigation = [
  { slug: "rank-boost", label: "Rank Boost", mobile: "Rank" },
  { slug: "wins", label: "Competitive Wins", mobile: "Wins" },
  { slug: "competitive-drives", label: "Competitive Drives", mobile: "Drives" },
  { slug: "placement-matches", label: "Placements Boost", mobile: "Placements" },
  { slug: "unrated-matches", label: "Unrated Matches", mobile: "Unrated" },
] as const;

const rankFamilies = [
  { key: "bronze", label: "Bronze", mark: "B" },
  { key: "silver", label: "Silver", mark: "S" },
  { key: "gold", label: "Gold", mark: "G" },
  { key: "platinum", label: "Platinum", mark: "P" },
  { key: "emerald", label: "Emerald", mark: "E" },
  { key: "diamond", label: "Diamond", mark: "D" },
  { key: "master", label: "Master", mark: "M" },
  { key: "grandmaster", label: "Grandmaster", mark: "GM" },
  { key: "champion", label: "Champion", mark: "C" },
] as const;

const divisions = ["5", "4", "3", "2", "1"] as const;
const divisionLabel: Record<string, string> = {
  "5": "V",
  "4": "IV",
  "3": "III",
  "2": "II",
  "1": "I",
};
const rankOrder = rankFamilies.flatMap((family) =>
  divisions.map((division) => `${family.key}-${division}`),
);

const servers = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "middle-east", label: "Middle East" },
] as const;

const platforms = [
  { value: "pc", label: "PC" },
  { value: "xbox", label: "Xbox" },
  { value: "playstation", label: "PlayStation" },
  { value: "nintendo-switch", label: "Nintendo Switch" },
] as const;

const roles = [
  { value: "tank", label: "Tank", meta: "FREE" },
  { value: "damage", label: "Damage", meta: "FREE" },
  { value: "support", label: "Support", meta: `+${OVERWATCH_EXTRA_PRICING.role.support * 100}%` },
  { value: "open-queue", label: "Open Queue", meta: `+${OVERWATCH_EXTRA_PRICING.role["open-queue"] * 100}%` },
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

function familyForRank(rank: string) {
  const familyKey = rank.split("-")[0];
  return rankFamilies.find((family) => family.key === familyKey) ?? rankFamilies[0];
}

function rankLabel(rank: string) {
  if (rank === "unranked") return "Unranked";
  const family = familyForRank(rank);
  const division = rank.split("-").at(-1) ?? "5";
  return `${family.label} ${divisionLabel[division] ?? division}`;
}

function firstRankForFamily(familyKey: string) {
  return `${familyKey}-5`;
}

function firstAvailableRankForFamily(familyKey: string, currentRank: string) {
  for (const division of divisions) {
    const candidate = `${familyKey}-${division}`;
    if (rankIndex(candidate) > rankIndex(currentRank)) return candidate;
  }
  return null;
}

function RankFallbackBadge({ familyKey, mark }: { familyKey: string; mark: string }) {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-10 place-items-center rounded-[0.8rem] border border-amber-300/[0.13] bg-[linear-gradient(145deg,rgba(251,191,36,.07),rgba(255,255,255,.015))] text-[10px] font-black tracking-[-0.03em] text-amber-100/75"
    >
      <ShieldCheck className="absolute size-7 text-amber-200/[0.10]" strokeWidth={1.3} />
      <span className="relative">{mark}</span>
      <span className="sr-only">{familyKey}</span>
    </span>
  );
}

function ChoicePill({
  active,
  onClick,
  label,
  meta,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  meta?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 text-left transition-[border-color,background-color,color] duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "border-amber-300/[0.18] bg-[#131B17] text-[#F4F7F5]"
          : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {meta ? (
          <span className={`text-[10px] font-bold ${meta === "FREE" ? "text-[#82F5A4]" : "text-amber-200/65"}`}>
            {meta}
          </span>
        ) : null}
        {active ? (
          <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        ) : null}
      </span>
    </button>
  );
}

function QuantityControl({
  value,
  min,
  max,
  label,
  helper,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
  helper?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">{label}</p>
      <div className="mt-3 grid grid-cols-[2.75rem_1fr_2.75rem] gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 transition-colors hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white">−</button>
        <div className="grid h-11 place-items-center rounded-xl border border-amber-300/[0.16] bg-[#131B17]">
          <span className="font-gaming-value text-lg font-bold text-white">{value}</span>
        </div>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 transition-colors hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white">+</button>
      </div>
      {helper ? <p className="mt-2 text-[10px] leading-4 text-white/35">{helper}</p> : null}
    </div>
  );
}

function ExtraCard({
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
  const free = price === "FREE";
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-200 ${
        checked ? "border-amber-300/[0.16] bg-[#131B17]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg border ${checked ? "border-amber-300/[0.14] bg-black/20 text-amber-200/80" : "border-white/[0.07] bg-white/[0.025] text-white/55"}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${free ? "text-[#82F5A4]" : "text-amber-200/65"}`}>{price}</span>
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]" title={description}>{description}</span>
      </span>
      <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]" : "border-white/[0.12] bg-white/[0.02] text-transparent"}`}>
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    </button>
  );
}

function RankSelector({
  value,
  target,
  currentRank,
  allowUnranked,
  omitChampionOne,
  onChange,
}: {
  value: string;
  target?: boolean;
  currentRank?: string;
  allowUnranked?: boolean;
  omitChampionOne?: boolean;
  onChange: (value: string) => void;
}) {
  const unrated = value === "unranked";
  const selectedFamily = unrated ? null : familyForRank(value);
  const currentIndex = currentRank ? rankIndex(currentRank) : -1;

  function chooseFamily(familyKey: string) {
    if (!target) return onChange(firstRankForFamily(familyKey));
    const next = firstAvailableRankForFamily(familyKey, currentRank ?? "bronze-5");
    if (next) onChange(next);
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-300/[0.12] bg-amber-400/[0.035]">
          {unrated ? (
            <span className="text-[10px] font-black text-white/45">NR</span>
          ) : (
            <RankFallbackBadge familyKey={selectedFamily?.key ?? "bronze"} mark={selectedFamily?.mark ?? "B"} />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/65">{target ? "Target rank" : "Current rank"}</p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">{rankLabel(value)}</p>
        </div>
      </div>

      {allowUnranked ? (
        <button type="button" onClick={() => onChange("unranked")} className={`mt-4 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-semibold transition-colors ${unrated ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
          <span>Unranked</span>
          {unrated ? <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5">
        {rankFamilies.map((family) => {
          const active = selectedFamily?.key === family.key;
          const available = !target || firstAvailableRankForFamily(family.key, currentRank ?? "bronze-5") !== null;
          return (
            <button key={family.key} type="button" disabled={!available} onClick={() => chooseFamily(family.key)} title={family.label} className={`group/rank relative min-w-0 overflow-hidden rounded-xl border px-2 py-2.5 text-center transition-[border-color,background-color] duration-200 disabled:cursor-not-allowed disabled:opacity-20 ${active ? "border-amber-300/[0.18] bg-[#131B17]" : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"}`}>
              <span className="mx-auto grid size-10 place-items-center"><RankFallbackBadge familyKey={family.key} mark={family.mark} /></span>
              <span className={`mt-1.5 block truncate text-[9px] font-semibold ${active ? "text-white" : "text-white/55"}`}>{family.label}</span>
              {active ? <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
            </button>
          );
        })}
      </div>

      {!unrated && selectedFamily ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Division</span>
          {divisions.map((division) => {
            const candidate = `${selectedFamily.key}-${division}`;
            const active = value === candidate;
            const aboveCurrent = !target || rankIndex(candidate) > currentIndex;
            const allowedTop = !(omitChampionOne && candidate === "champion-1");
            const available = aboveCurrent && allowedTop;
            return (
              <button key={division} type="button" disabled={!available} onClick={() => onChange(candidate)} className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-[border-color,background-color,color] disabled:cursor-not-allowed disabled:opacity-20 ${active ? "border-amber-300/[0.18] bg-[#131B17] text-[#F4F7F5]" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
                {divisionLabel[division]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function DriveRankSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Current rank</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5">
        {rankFamilies.map((family) => <ChoicePill key={family.key} active={value === family.key} onClick={() => onChange(family.key)} label={family.label} />)}
      </div>
    </div>
  );
}

function DriveControl({ current, desired, onCurrent, onDesired }: { current: number; desired: number; onCurrent: (value: number) => void; onDesired: (value: number) => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-4">
        <div className="flex items-center justify-between gap-4"><span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Current Drive</span><span className="font-gaming-value text-lg font-bold text-white">{current.toLocaleString("en-US")}</span></div>
        <input type="range" min={0} max={3950} step={50} value={current} onChange={(event) => onCurrent(Number(event.target.value))} className="mt-4 w-full accent-amber-400" />
      </div>
      <div className="rounded-xl border border-amber-300/[0.12] bg-[#131B17] p-4">
        <div className="flex items-center justify-between gap-4"><span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/65">Desired Drive</span><span className="font-gaming-value text-lg font-bold text-white">{desired.toLocaleString("en-US")}</span></div>
        <input type="range" min={Math.min(4000, current + 50)} max={4000} step={50} value={desired} onChange={(event) => onDesired(Number(event.target.value))} className="mt-4 w-full accent-amber-400" />
      </div>
    </div>
  );
}

export function OverwatchServiceConfigurator({
  gameSlug,
  service,
}: {
  gameSlug: string;
  service: ServiceSummary;
  schema: ServiceConfiguratorSchema;
}) {
  const router = useRouter();
  const isRank = service.slug === "rank-boost";
  const isWins = service.slug === "wins";
  const isDrives = service.slug === "competitive-drives";
  const isPlacements = service.slug === "placement-matches";
  const isUnrated = service.slug === "unrated-matches";

  const [selection, setSelection] = useState<ConfiguratorSelection>({
    ...(isRank ? { currentRank: "bronze-5", targetRank: "silver-5" } : {}),
    ...(isWins ? { currentRank: "bronze-5", wins: 1 } : {}),
    ...(isPlacements ? { currentRank: "unranked", matches: 1 } : {}),
    ...(isDrives ? { driveRank: "bronze", currentDrive: 0, desiredDrive: 50 } : {}),
    ...(isUnrated ? { matches: 1 } : {}),
    boostMethod: "account",
    boosters: 1,
    role: "tank",
    server: "north-america",
    platform: "pc",
    playOffline: false,
    specificHeroes: false,
    streaming: false,
    expressDelivery: false,
    extraWin: false,
    rankInsurance: false,
  });
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const currentRank = String(selection.currentRank ?? "bronze-5");
  const targetRank = String(selection.targetRank ?? "silver-5");

  useEffect(() => {
    if (!isRank) return;
    if (rankIndex(targetRank) <= rankIndex(currentRank)) {
      const next = rankOrder[rankIndex(currentRank) + 1];
      if (next) setSelection((current) => ({ ...current, targetRank: next }));
    }
  }, [currentRank, targetRank, isRank]);

  useEffect(() => {
    if (!isDrives) return;
    const current = Number(selection.currentDrive);
    const desired = Number(selection.desiredDrive);
    if (desired <= current) setSelection((state) => ({ ...state, desiredDrive: Math.min(4000, current + 50) }));
  }, [isDrives, selection.currentDrive, selection.desiredDrive]);

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
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [gameSlug, service.slug, selection]);

  function update(key: string, value: string | number | boolean) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function updateDriveCurrent(value: number) {
    setSelection((current) => ({ ...current, currentDrive: value, desiredDrive: Math.max(Number(current.desiredDrive), Math.min(4000, value + 50)) }));
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
      const payload = (await response.json()) as { order?: { id: string; orderNumber: string }; error?: string };
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
    canAutoResume: Boolean(quote && !isLoading),
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  const serverLabel = servers.find((item) => item.value === selection.server)?.label ?? "North America";
  const platformLabel = platforms.find((item) => item.value === selection.platform)?.label ?? "PC";
  const roleLabel = roles.find((item) => item.value === selection.role)?.label ?? "Tank";
  const playWithBooster = selection.boostMethod === "duo";
  const accountBoostSelected = selection.boostMethod === "account";

  const summaryRows = useMemo(() => {
    const rows: Array<[string, string]> = [];
    if (isRank) rows.push(["Progression", `${rankLabel(String(selection.currentRank))} → ${rankLabel(String(selection.targetRank))}`]);
    if (isWins) rows.push(["Current rank", rankLabel(String(selection.currentRank))], ["Wins", String(selection.wins)]);
    if (isPlacements) rows.push(["Previous rank", rankLabel(String(selection.currentRank))], ["Matches", String(selection.matches)]);
    if (isDrives) rows.push(["Drive rank", rankFamilies.find((item) => item.key === selection.driveRank)?.label ?? "Bronze"], ["Drive", `${Number(selection.currentDrive).toLocaleString("en-US")} → ${Number(selection.desiredDrive).toLocaleString("en-US")}`]);
    if (isUnrated) rows.push(["Matches", String(selection.matches)]);
    rows.push(
      ["Boost method", playWithBooster ? `Play With Booster · ${selection.boosters}` : "Account Boost"],
      ["Role / Queue", roleLabel],
      ["Server", serverLabel],
      ["Platform", platformLabel],
    );
    return rows;
  }, [isRank, isWins, isPlacements, isDrives, isUnrated, playWithBooster, platformLabel, roleLabel, selection, serverLabel]);

  const showBonusAndInsurance = !isWins;

  const mobileNavigation = (
    <nav aria-label="Overwatch services" className="mb-3 sm:mb-4 xl:hidden">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2">
          {serviceNavigation.map((item) => {
            const active = service.slug === item.slug;
            return (
              <Link key={item.slug} href={`/games/overwatch-2/${item.slug}`} aria-current={active ? "page" : undefined} className={`inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ${active ? "border-amber-300/[0.18] bg-[#131B17] text-[#F4F7F5]" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
                {active ? <span className="mr-2 size-1.5 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
                <span className="sm:hidden">{item.mobile}</span><span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:pb-0">
      {mobileNavigation}

      <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
        <aside className="hidden xl:block">
          <nav aria-label="Overwatch services" className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5">
            <div className="px-2.5 pb-3 pt-2">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/60">Overwatch</p>
              <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
            </div>
            <div className="space-y-1.5">
              {serviceNavigation.map((item) => {
                const active = service.slug === item.slug;
                return (
                  <Link key={item.slug} href={`/games/overwatch-2/${item.slug}`} aria-current={active ? "page" : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-200 ${active ? "border-amber-300/[0.18] bg-[#131B17] text-[#F4F7F5]" : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"}`}>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                    {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
                  </Link>
                );
              })}
            </div>
            <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
            <Link href="/games/overwatch-2" className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 transition-colors hover:text-white/65">
              <ArrowLeft className="mr-2 size-3" /> Overwatch overview
            </Link>
          </nav>
        </aside>

        <div className="min-w-0 grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
          <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080B09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
            <div className="flex flex-col gap-2 border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.055] via-transparent to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <div>
                <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/70"><Sparkles className="size-3.5" />Overwatch · {service.name}</div>
                <p className="mt-1 hidden text-sm text-[var(--muted-foreground)] sm:block">Configure your full order without leaving this panel.</p>
              </div>
              <span className="hidden w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300 sm:inline-flex">Live server pricing</span>
            </div>

            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
              {isRank ? (
                <div className="relative grid gap-5 lg:grid-cols-2">
                  <span className="pointer-events-none absolute left-1/2 top-5 hidden size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-amber-200/45 lg:grid"><ArrowRight className="size-3.5" /></span>
                  <RankSelector value={currentRank} omitChampionOne onChange={(value) => update("currentRank", value)} />
                  <div className="relative border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><RankSelector value={targetRank} currentRank={currentRank} target onChange={(value) => update("targetRank", value)} /></div>
                </div>
              ) : null}

              {isWins ? <><RankSelector value={currentRank} onChange={(value) => update("currentRank", value)} /><div className="h-px bg-white/[0.07]" /><QuantityControl value={Number(selection.wins)} min={1} max={5} label="Competitive Wins" helper="Maximum 5 wins per order." onChange={(value) => update("wins", value)} /></> : null}
              {isPlacements ? <><RankSelector value={currentRank} allowUnranked onChange={(value) => update("currentRank", value)} /><div className="h-px bg-white/[0.07]" /><QuantityControl value={Number(selection.matches)} min={1} max={10} label="Placement Matches" helper="Maximum 10 placement matches per order." onChange={(value) => update("matches", value)} /></> : null}
              {isDrives ? <><DriveRankSelector value={String(selection.driveRank)} onChange={(value) => update("driveRank", value)} /><DriveControl current={Number(selection.currentDrive)} desired={Number(selection.desiredDrive)} onCurrent={updateDriveCurrent} onDesired={(value) => update("desiredDrive", value)} /></> : null}
              {isUnrated ? <QuantityControl value={Number(selection.matches)} min={1} max={10} label="Unrated Matches" helper="No rank selection is required. Maximum 10 matches per order." onChange={(value) => update("matches", value)} /> : null}

              <div className="h-px bg-white/[0.07]" />

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Boost method</p>
                  <p className="mt-1 text-sm font-semibold text-white">Choose how you want the service completed.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ChoicePill active={accountBoostSelected} onClick={() => update("boostMethod", "account")} label="Account Boost" meta="Base" />
                    <ChoicePill active={playWithBooster} onClick={() => update("boostMethod", "duo")} label="Play With Booster" meta={`+${OVERWATCH_EXTRA_PRICING.playWithBooster * 100}%`} />
                  </div>
                  <AccountBoostTrust selected={accountBoostSelected} accent="gold" showDescription />
                  {playWithBooster ? <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/15 p-4"><QuantityControl value={Number(selection.boosters)} min={1} max={5} label="Boosters" helper={`1 booster +${OVERWATCH_EXTRA_PRICING.playWithBooster * 100}%. Each additional booster adds +${OVERWATCH_EXTRA_PRICING.additionalBooster * 100}%.`} onChange={(value) => update("boosters", value)} /></div> : null}
                </div>
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Role / Queue</p>
                  <p className="mt-1 text-sm font-semibold text-white">Select the role or Open Queue.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">{roles.map((role) => <ChoicePill key={role.value} active={selection.role === role.value} onClick={() => update("role", role.value)} label={role.label} meta={role.meta} />)}</div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Server</p><div className="mt-3 grid grid-cols-2 gap-2">{servers.map((server) => <ChoicePill key={server.value} active={selection.server === server.value} onClick={() => update("server", server.value)} label={server.label} />)}</div></div>
                <div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Platform</p><div className="mt-3 grid grid-cols-2 gap-2">{platforms.map((platform) => <ChoicePill key={platform.value} active={selection.platform === platform.value} onClick={() => update("platform", platform.value)} label={platform.label} />)}</div></div>
              </div>

              <div className="h-px bg-white/[0.07]" />

              <div>
                <div className="flex items-end justify-between gap-4"><div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Customize</p><p className="mt-1 text-sm font-semibold text-white">Add only the options you want.</p></div><span className="text-[10px] text-white/30">Optional</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  <ExtraCard checked={selection.playOffline === true} onChange={(value) => update("playOffline", value)} icon={<EyeOff className="size-4" />} title="Play Offline" price="FREE" description="Keep the account activity discreet during fulfillment." />
                  <ExtraCard checked={selection.specificHeroes === true} onChange={(value) => update("specificHeroes", value)} icon={<Crosshair className="size-4" />} title="Specific Heroes" price="FREE" description="Save preferred heroes for the order." />
                  <ExtraCard checked={selection.streaming === true} onChange={(value) => update("streaming", value)} icon={<MonitorPlay className="size-4" />} title="Streaming" price={`+${formatPrice(OVERWATCH_EXTRA_PRICING.streaming)}`} description="Add streaming to your order." />
                  <ExtraCard checked={selection.expressDelivery === true} onChange={(value) => update("expressDelivery", value)} icon={<Zap className="size-4" />} title="Express Delivery" price={`+${OVERWATCH_EXTRA_PRICING.expressDelivery * 100}%`} description="Prioritize faster fulfillment when capacity is available." />
                  {showBonusAndInsurance ? <ExtraCard checked={selection.extraWin === true} onChange={(value) => update("extraWin", value)} icon={<Trophy className="size-4" />} title="+1 Bonus Win" price={`+${formatPrice(OVERWATCH_EXTRA_PRICING.bonusWin)}`} description="Add one additional win to your order." /> : null}
                  {showBonusAndInsurance ? <ExtraCard checked={selection.rankInsurance === true} onChange={(value) => update("rankInsurance", value)} icon={<ShieldCheck className="size-4" />} title="Rank Insurance" price={`+${OVERWATCH_EXTRA_PRICING.rankInsurance * 100}%`} description="Add the Overwatch rank insurance option." /> : null}
                </div>
              </div>
            </div>
          </section>

          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#0B0C0A] shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5">
                <div className="flex items-center justify-between gap-4"><div><p className="font-gaming-label text-[10px] uppercase tracking-[0.15em] text-amber-200/65">Order Summary</p><p className="mt-1 text-lg font-semibold text-white">{service.name}</p></div>{isLoading ? <LoaderCircle className="size-4 animate-spin text-amber-300" /> : <Gamepad2 className="size-4 text-amber-200/55" />}</div>
                {isRank ? <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/75"><span>{rankLabel(currentRank)}</span><ArrowRight className="size-3.5 text-white/30" /><span>{rankLabel(targetRank)}</span></div> : null}
              </div>
              <div className="p-5">
                <div className="space-y-2.5">{summaryRows.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 text-xs"><span className="text-white/38">{label}</span><span className="max-w-[12rem] text-right font-medium text-white/75">{value}</span></div>)}</div>
                <div className="my-5 h-px bg-white/[0.08]" />
                {error ? <div className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">{error}</div> : null}
                {quote ? <><div className="space-y-3">{quote.breakdown.map((item, index) => <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 text-xs"><span className="text-[var(--muted-foreground)]">{item.label}</span><span className="font-medium text-white">{formatPrice(item.amount)}</span></div>)}</div><div className="my-5 h-px bg-white/[0.08]" /><div className="flex items-end justify-between gap-4"><div><p className="text-xs text-[var(--muted-foreground)]">Estimated total</p><p className="mt-1 text-3xl font-bold tracking-[-0.045em] text-white">{formatPrice(quote.total)}</p></div><span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-white/50">USD</span></div></> : <div className="py-6 text-sm text-[var(--muted-foreground)]">Adjust the configuration to generate a valid quote.</div>}
                {orderError ? <div className="mt-5 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">{orderError}</div> : null}
                <Button className="mt-6 w-full" size="lg" disabled={!quote || isLoading || isCreatingOrder} onClick={createOrder}>{isCreatingOrder ? <>Preparing checkout<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Continue to secure checkout<ArrowRight className="ml-2 size-4" /></>}</Button>
                <AccountBoostCheckoutReassurance selected={accountBoostSelected} accent="gold" />
                <div className="mt-4 flex gap-2 text-[11px] leading-5 text-white/40"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" /><span>Pricing is recalculated on the server before the order is stored.</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#080B09]/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Total</p><p className="truncate text-xl font-bold text-white">{quote ? formatPrice(quote.total) : "—"}</p></div>
          <Button disabled={!quote || isLoading || isCreatingOrder} onClick={createOrder} className="min-w-[12.5rem] text-xs sm:text-sm">{isCreatingOrder ? <LoaderCircle className="size-4 animate-spin" /> : <><span>Continue to secure checkout</span><ArrowRight className="ml-2 size-4" /></>}</Button>
        </div>
      </div>
    </div>
  );
}
