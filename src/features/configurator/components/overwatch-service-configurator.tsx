"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Crosshair,
  EyeOff,
  ExternalLink,
  Gamepad2,
  LoaderCircle,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
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
import { parseWholeNumberQuantity, quantitySelectionValue } from "../client/whole-number-quantity";
import { meetsMinimumOrderTotal, minimumOrderShortfallCents } from "@/features/orders/minimum-order";
import type {
  ConfiguratorSelection,
  QuotePreview,
  ServiceConfiguratorSchema,
} from "../types/configurator";
import { PlatformIcon } from "./platform-icon";
import { PaymentMethodsTrustBlock } from "./payment-methods-trust-block";
import { MinimumOrderNotice } from "./minimum-order-notice";


const serviceNavigation = [
  { slug: "rank-boost", label: "Rank Boost", mobile: "Rank" },
  { slug: "wins", label: "Competitive Wins", mobile: "Wins" },
  { slug: "competitive-drives", label: "Competitive Drives", mobile: "Drives" },
  { slug: "placement-matches", label: "Placements Boost", mobile: "Placements" },
  { slug: "unrated-matches", label: "Unrated Matches", mobile: "Unrated" },
] as const;

const rankFamilies = [
  { key: "bronze", label: "Bronze", mark: "B", badge: "/ranks/overwatch/bronze.png" },
  { key: "silver", label: "Silver", mark: "S", badge: "/ranks/overwatch/silver.png" },
  { key: "gold", label: "Gold", mark: "G", badge: "/ranks/overwatch/gold.png" },
  { key: "platinum", label: "Platinum", mark: "P", badge: "/ranks/overwatch/platinum.png" },
  { key: "emerald", label: "Emerald", mark: "E", badge: "/ranks/overwatch/emerald.png" },
  { key: "diamond", label: "Diamond", mark: "D", badge: "/ranks/overwatch/diamond.png" },
  { key: "master", label: "Master", mark: "M", badge: "/ranks/overwatch/master.png" },
  { key: "grandmaster", label: "Grandmaster", mark: "GM", badge: "/ranks/overwatch/grandmaster.png" },
  { key: "champion", label: "Champion", mark: "C", badge: "/ranks/overwatch/champion.png" },
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

function RankBadge({
  familyKey,
  label,
  mark,
  badge,
  compact = false,
}: {
  familyKey: string;
  label: string;
  mark: string;
  badge: string | null;
  compact?: boolean;
}) {
  if (!badge) return <RankFallbackBadge familyKey={familyKey} mark={mark} />;

  return (
    <Image
      src={badge}
      alt={`${label} rank badge`}
      width={96}
      height={96}
      className={`${compact ? "size-10" : "size-12"} object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,.42)]`}
    />
  );
}

function handleOverwatchRadioGroupKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'));
  if (!buttons.length) return;
  const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
  let nextIndex = currentIndex >= 0 ? currentIndex : 0;
  if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = buttons.length - 1;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (nextIndex - 1 + buttons.length) % buttons.length;
  else nextIndex = (nextIndex + 1) % buttons.length;
  event.preventDefault();
  buttons[nextIndex]?.focus();
  buttons[nextIndex]?.click();
}

function ChoicePill({
  active,
  onClick,
  label,
  meta,
  icon,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  meta?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 text-left outline-none transition-[border-color,background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-amber-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "border-amber-300/[0.18] bg-[#131B17] text-[#F4F7F5]"
          : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon ? <span className="grid size-7 shrink-0 place-items-center">{icon}</span> : null}
        <span className="text-xs font-semibold leading-4">{label}</span>
      </span>
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

function OverwatchServiceQuantityControl({
  rawValue,
  sliderValue,
  max,
  eyebrow,
  descriptor,
  errorId,
  errorCopy,
  onRawChange,
  onSliderChange,
}: {
  rawValue: string | number;
  sliderValue: number;
  max: number;
  eyebrow: string;
  descriptor: (value: number) => string;
  errorId: string;
  errorCopy: string;
  onRawChange: (value: string) => void;
  onSliderChange: (value: number) => void;
}) {
  const parsed = parseWholeNumberQuantity(rawValue, 1, max);
  const displayValue = parsed.valid ? parsed.value : String(rawValue).trim() || "—";
  const milestones = max === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 6, 8, 10];
  const progress = max > 1 ? ((sliderValue - 1) / (max - 1)) * 100 : 100;

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.012] p-4 sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0AAA4]">{eyebrow}</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-gaming-value text-[2.5rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">{displayValue}</span>
            <span className="pb-1 text-xs font-medium text-[#A0AAA4]">{parsed.valid ? descriptor(parsed.value) : "Matches"}</span>
          </div>
        </div>
        <input
          aria-label={eyebrow}
          aria-invalid={!parsed.valid}
          aria-describedby={!parsed.valid ? errorId : undefined}
          type="number"
          min={1}
          max={max}
          step={1}
          inputMode="numeric"
          value={rawValue}
          onChange={(event) => onRawChange(event.target.value)}
          className="font-gaming-value h-10 w-16 rounded-xl border border-white/[0.09] bg-black/20 px-2 text-center text-base font-bold text-white outline-none focus-visible:border-amber-300/30 focus-visible:ring-2 focus-visible:ring-amber-300/25"
        />
      </div>
      <input
        aria-label={`${eyebrow} slider`}
        type="range"
        min={1}
        max={max}
        step={1}
        value={sliderValue}
        onChange={(event) => onSliderChange(Number(event.target.value))}
        className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-transparent accent-[#39E56F]"
        style={{ background: `linear-gradient(to right, rgba(57,229,111,.72) 0%, rgba(57,229,111,.72) ${progress}%, rgba(255,255,255,.07) ${progress}%, rgba(255,255,255,.07) 100%)` }}
      />
      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/30">{milestones.map((value) => <span key={value}>{value}</span>)}</div>
      {!parsed.valid ? <p id={errorId} role="alert" className="mt-3 text-[10px] leading-4 text-rose-200">{errorCopy}</p> : null}
      <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2.5">
        <p className="text-[10px] font-semibold text-white/58">Quantity pricing</p>
        <p className="mt-0.5 text-[9px] leading-4 text-white/34">Your server-calculated total updates from the selected quantity and options.</p>
      </div>
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
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  title: string;
  price: string;
  description: string;
  disabled?: boolean;
}) {
  const free = price === "FREE";
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "border-amber-300/[0.16] bg-[#131B17]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg border ${checked ? "border-amber-300/[0.14] bg-black/20 text-amber-200/80" : "border-white/[0.07] bg-white/[0.025] text-white/55"}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${disabled ? "text-white/35" : free ? "text-[#82F5A4]" : "text-amber-200/65"}`}>
            {disabled ? "Account only" : price}
          </span>
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
  sourceLabel,
  onChange,
}: {
  value: string;
  target?: boolean;
  currentRank?: string;
  allowUnranked?: boolean;
  omitChampionOne?: boolean;
  sourceLabel?: string;
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
            <RankBadge
              familyKey={selectedFamily?.key ?? "bronze"}
              label={selectedFamily?.label ?? "Bronze"}
              mark={selectedFamily?.mark ?? "B"}
              badge={selectedFamily?.badge ?? null}
              compact
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/65">{target ? "Target rank" : sourceLabel ?? "Current rank"}</p>
          <p className="font-gaming-value mt-0.5 text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">{rankLabel(value)}</p>
        </div>
      </div>

      {allowUnranked ? (
        <button type="button" role="radio" aria-checked={unrated} tabIndex={unrated ? 0 : -1} onClick={() => onChange("unranked")} className={`mt-4 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-semibold transition-colors ${unrated ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
          <span>Unranked</span>
          {unrated ? <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
        </button>
      ) : null}

      <div role="radiogroup" aria-label={target ? "Target rank" : sourceLabel ?? "Current rank"} onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-4 grid grid-cols-3 gap-2 min-[390px]:grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5">
        {rankFamilies.map((family) => {
          const active = selectedFamily?.key === family.key;
          const available = !target || firstAvailableRankForFamily(family.key, currentRank ?? "bronze-5") !== null;
          return (
            <button key={family.key} type="button" role="radio" aria-checked={active} tabIndex={active ? 0 : -1} disabled={!available} onClick={() => chooseFamily(family.key)} title={family.label} className={`group/rank relative min-w-0 rounded-xl border px-2 py-2.5 text-center outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-amber-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-20 ${active ? "border-amber-300/[0.18] bg-[#131B17]" : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"}`}>
              <span className="mx-auto grid h-12 place-items-center">
                <RankBadge familyKey={family.key} label={family.label} mark={family.mark} badge={family.badge} />
              </span>
              <span className={`mt-1.5 block break-words text-[9px] font-semibold leading-3 ${active ? "text-white" : "text-white/55"}`}>{family.label}</span>
              {active ? <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
            </button>
          );
        })}
      </div>

      {!unrated && selectedFamily ? (
        <div role="radiogroup" aria-label="Division" onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Division</span>
          {divisions.map((division) => {
            const candidate = `${selectedFamily.key}-${division}`;
            const active = value === candidate;
            const aboveCurrent = !target || rankIndex(candidate) > currentIndex;
            const allowedTop = !(omitChampionOne && candidate === "champion-1");
            const available = aboveCurrent && allowedTop;
            return (
              <button key={division} type="button" role="radio" aria-checked={active} tabIndex={active ? 0 : -1} disabled={!available} onClick={() => onChange(candidate)} className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-[border-color,background-color,color] disabled:cursor-not-allowed disabled:opacity-20 ${active ? "border-amber-300/[0.18] bg-[#131B17] text-[#F4F7F5]" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
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
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Drive Rank</p>
      <div role="radiogroup" aria-label="Drive rank" onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-3 grid grid-cols-3 gap-2 min-[390px]:grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5">
        {rankFamilies.map((family) => {
          const active = value === family.key;
          return (
            <button
              key={family.key}
              type="button"
              onClick={() => onChange(family.key)}
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              className={`relative min-w-0 rounded-xl border px-2 py-2.5 text-center outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-amber-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none ${
                active
                  ? "border-amber-300/[0.18] bg-[#131B17]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span className="mx-auto grid h-12 place-items-center">
                <RankBadge familyKey={family.key} label={family.label} mark={family.mark} badge={family.badge} />
              </span>
              <span className={`mt-1.5 block break-words text-[9px] font-semibold leading-3 ${active ? "text-white" : "text-white/55"}`}>
                {family.label}
              </span>
              {active ? (
                <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OverwatchOrderGuidance() {
  return (
    <div className="mt-4 border-t border-white/[0.06]">
      <section className="px-0 py-3" aria-labelledby="overwatch-estimated-timing-heading">
        <div className="flex items-start gap-2.5">
          <Clock3 className="mt-0.5 size-3.5 shrink-0 text-amber-200/65" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 id="overwatch-estimated-timing-heading" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200/65">Estimated timing</h3>
            <div className="mt-1.5 space-y-1 text-[10px] leading-4 text-white/45" role="status" aria-live="polite" aria-atomic="true">
              <p className="flex items-center justify-between gap-3"><span className="text-white/35">Estimated start</span><span className="font-medium text-white/55">Unavailable</span></p>
              <p className="flex items-center justify-between gap-3"><span className="text-white/35">Estimated completion</span><span className="font-medium text-white/55">Unavailable</span></p>
              <p className="pt-0.5 text-white/32">No verified timing estimate is available for this configuration.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-white/[0.06] py-3" aria-labelledby="overwatch-verify-order-heading">
        <div className="flex items-start gap-2.5">
          <UsersRound className="mt-0.5 size-3.5 shrink-0 text-amber-200/65" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 id="overwatch-verify-order-heading" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200/65">Verify before you order</h3>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-2 text-[10px] leading-4">
              <a href="https://www.trustpilot.com/review/boostingpedia.com" target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1 text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/35">Public Trustpilot reviews<ExternalLink className="size-2.5" aria-hidden="true" /></a>
              <Link href="/refunds" className="inline-flex min-h-8 items-center text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/35">Refund policy</Link>
            </div>
            <p className="mt-1.5 text-[9px] leading-4 text-white/30">Support is available through BoostingPedia if you need help with your order.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DriveControl({ current, desired, valid, onCurrent, onDesired }: { current: number; desired: number; valid: boolean; onCurrent: (value: number) => void; onDesired: (value: number) => void }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.012] p-4 sm:p-5">
      <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)]">
        <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-4">
          <div className="flex items-end justify-between gap-4"><div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Current Drive</p><p className="mt-1 text-[10px] text-white/35">Drive points</p></div><span className="font-gaming-value text-xl font-bold text-white">{current.toLocaleString("en-US")}</span></div>
          <input aria-label="Current Drive points" type="range" min={0} max={3950} step={50} value={current} onChange={(event) => onCurrent(Number(event.target.value))} className="mt-4 w-full accent-[#39E56F]" />
        </div>
        <span className="hidden place-items-center text-white/25 lg:grid" aria-hidden="true"><ArrowRight className="size-4" /></span>
        <div className="rounded-xl border border-amber-300/[0.12] bg-[#131B17] p-4">
          <div className="flex items-end justify-between gap-4"><div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/65">Target Drive</p><p className="mt-1 text-[10px] text-white/35">Drive points</p></div><span className="font-gaming-value text-xl font-bold text-white">{desired.toLocaleString("en-US")}</span></div>
          <input aria-label="Target Drive points" aria-invalid={!valid} aria-describedby={!valid ? "overwatch-drive-error" : undefined} type="range" min={50} max={4000} step={50} value={desired} onChange={(event) => onDesired(Number(event.target.value))} className="mt-4 w-full accent-[#39E56F]" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 text-[10px]"><span className="text-white/35">Total progression</span><span className="font-medium text-white/65">{valid ? `${(desired - current).toLocaleString("en-US")} Drive points` : "—"}</span></div>
      {!valid ? <p id="overwatch-drive-error" role="alert" className="mt-2 text-[10px] leading-4 text-rose-200">Target Drive must be above Current Drive. Use values from 0–4,000 in increments of 50.</p> : null}
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
  const [lastValidQuantity, setLastValidQuantity] = useState(1);

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
    if (selection.boostMethod !== "duo" || selection.playOffline !== true) return;
    setSelection((current) => ({ ...current, playOffline: false }));
  }, [selection.boostMethod, selection.playOffline]);

  useEffect(() => {
    if (!isWins || (selection.extraWin !== true && selection.rankInsurance !== true)) return;
    setSelection((current) => ({
      ...current,
      extraWin: false,
      rankInsurance: false,
    }));
  }, [isWins, selection.extraWin, selection.rankInsurance]);

  const quantityMode = isWins || isPlacements || isUnrated;
  const quantityKey = isWins ? "wins" : "matches";
  const quantityMax = isWins ? 5 : 10;
  const selectedQuantity = quantityMode ? selection[quantityKey] : 1;
  const quantityRaw: string | number =
    typeof selectedQuantity === "string" || typeof selectedQuantity === "number" ? selectedQuantity : 1;
  const quantityValidation = quantityMode ? parseWholeNumberQuantity(quantityRaw, 1, quantityMax) : { valid: true as const, value: 1 };
  const quantityIsValid = !quantityMode || quantityValidation.valid;
  const driveCurrent = Number(selection.currentDrive);
  const driveDesired = Number(selection.desiredDrive);
  const driveIsValid = !isDrives || (Number.isInteger(driveCurrent) && Number.isInteger(driveDesired) && driveCurrent >= 0 && driveCurrent <= 3950 && driveDesired >= 50 && driveDesired <= 4000 && driveCurrent % 50 === 0 && driveDesired % 50 === 0 && driveDesired > driveCurrent);
  const configurationIsValid = quantityIsValid && driveIsValid;
  const displayedQuote = configurationIsValid ? quote : null;

  useEffect(() => {
    if (!quantityMode || !quantityValidation.valid) return;
    setLastValidQuantity(quantityValidation.value);
  }, [quantityMode, quantityValidation.valid, quantityValidation.value]);

  useEffect(() => {
    if (!configurationIsValid) {
      setQuote(null);
      setError(null);
      setIsLoading(false);
      return;
    }
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
  }, [gameSlug, service.slug, selection, configurationIsValid]);

  function update(key: string, value: string | number | boolean) {
    setSelection((current) => ({
      ...current,
      [key]: value,
      ...(key === "boostMethod" && value === "duo" ? { playOffline: false } : {}),
      ...(key === "boostMethod" && value === "account" ? { boosters: 1 } : {}),
      ...(isWins && (key === "extraWin" || key === "rankInsurance")
        ? { extraWin: false, rankInsurance: false }
        : {}),
    }));
  }

  function updateDriveCurrent(value: number) {
    setSelection((current) => ({ ...current, currentDrive: value }));
  }

  const hasCurrentQuote = Boolean(displayedQuote && !isLoading && !error);
  const minimumShortfall = hasCurrentQuote && displayedQuote ? minimumOrderShortfallCents(displayedQuote.total) : 0;
  const minimumBlocked = hasCurrentQuote && displayedQuote ? !meetsMinimumOrderTotal(displayedQuote.total) : false;
  const canContinue = Boolean(hasCurrentQuote && displayedQuote && meetsMinimumOrderTotal(displayedQuote.total));
  const minimumNoticeId = "overwatch-minimum-order-notice";

  async function createOrder() {
    if (!quote || isLoading || isCreatingOrder || !canContinue) return;
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
    canAutoResume: canContinue,
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  const serverLabel = servers.find((item) => item.value === selection.server)?.label ?? "North America";
  const platformLabel = platforms.find((item) => item.value === selection.platform)?.label ?? "PC";
  const roleLabel = roles.find((item) => item.value === selection.role)?.label ?? "Tank";
  const playWithBooster = selection.boostMethod === "duo";
  const accountBoostSelected = selection.boostMethod === "account";
  const boosterCount = Math.min(5, Math.max(1, Number(selection.boosters) || 1));
  const duoModifier =
    OVERWATCH_EXTRA_PRICING.playWithBooster +
    Math.max(0, boosterCount - 1) * OVERWATCH_EXTRA_PRICING.additionalBooster;
  const duoMeta = `+${Math.round(duoModifier * 100)}%`;

  const summaryRows = useMemo(() => {
    const rows: Array<[string, string]> = [];
    if (isRank) rows.push(["Progression", `${rankLabel(String(selection.currentRank))} → ${rankLabel(String(selection.targetRank))}`]);
    if (isWins) rows.push(["Current rank", rankLabel(String(selection.currentRank))], ["Wins", quantityValidation.valid ? String(quantityValidation.value) : "—"]);
    if (isPlacements) rows.push(["Previous rank", rankLabel(String(selection.currentRank))], ["Placement matches", quantityValidation.valid ? String(quantityValidation.value) : "—"]);
    if (isDrives) rows.push(["Drive rank", rankFamilies.find((item) => item.key === selection.driveRank)?.label ?? "Bronze"], ["Current Drive points", driveCurrent.toLocaleString("en-US")], ["Target Drive points", driveDesired.toLocaleString("en-US")], ["Total progression", driveIsValid ? `${(driveDesired - driveCurrent).toLocaleString("en-US")} Drive points` : "—"]);
    if (isUnrated) rows.push(["Unrated matches", quantityValidation.valid ? String(quantityValidation.value) : "—"]);
    rows.push(
      ["Boost method", playWithBooster ? `Play With Booster · ${selection.boosters}` : "Account Boost"],
      ["Role / Queue", roleLabel],
      ["Server", serverLabel],
      ["Platform", platformLabel],
    );
    return rows;
  }, [isRank, isWins, isPlacements, isDrives, isUnrated, playWithBooster, platformLabel, roleLabel, selection, serverLabel, quantityValidation.valid, quantityValidation.value, driveCurrent, driveDesired, driveIsValid]);

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
                
              </div>
              
            </div>

            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
              {isRank ? (
                <div className="relative grid gap-5 lg:grid-cols-2">
                  <span className="pointer-events-none absolute left-1/2 top-5 hidden size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-amber-200/45 lg:grid"><ArrowRight className="size-3.5" /></span>
                  <RankSelector value={currentRank} omitChampionOne onChange={(value) => update("currentRank", value)} />
                  <div className="relative border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><RankSelector value={targetRank} currentRank={currentRank} target onChange={(value) => update("targetRank", value)} /></div>
                </div>
              ) : null}

              {isWins ? <><RankSelector value={currentRank} onChange={(value) => update("currentRank", value)} /><div className="h-px bg-white/[0.07]" /><OverwatchServiceQuantityControl rawValue={quantityRaw} sliderValue={quantityValidation.valid ? quantityValidation.value : lastValidQuantity} max={5} eyebrow="NUMBER OF WINS" descriptor={(value) => value === 1 ? "Competitive Win" : "Competitive Wins"} errorId="overwatch-wins-quantity-error" errorCopy="Enter a whole number between 1 and 5." onRawChange={(value) => update("wins", quantitySelectionValue(value, 1, 5))} onSliderChange={(value) => update("wins", value)} /></> : null}
              {isPlacements ? <><RankSelector value={currentRank} allowUnranked sourceLabel="Previous rank" onChange={(value) => update("currentRank", value)} /><div className="h-px bg-white/[0.07]" /><OverwatchServiceQuantityControl rawValue={quantityRaw} sliderValue={quantityValidation.valid ? quantityValidation.value : lastValidQuantity} max={10} eyebrow="NUMBER OF PLACEMENT MATCHES" descriptor={(value) => value === 1 ? "Placement Match" : "Placement Matches"} errorId="overwatch-placements-quantity-error" errorCopy="Enter a whole number between 1 and 10." onRawChange={(value) => update("matches", quantitySelectionValue(value, 1, 10))} onSliderChange={(value) => update("matches", value)} /></> : null}
              {isDrives ? <><DriveRankSelector value={String(selection.driveRank)} onChange={(value) => update("driveRank", value)} /><DriveControl current={driveCurrent} desired={driveDesired} valid={driveIsValid} onCurrent={updateDriveCurrent} onDesired={(value) => update("desiredDrive", value)} /></> : null}
              {isUnrated ? <OverwatchServiceQuantityControl rawValue={quantityRaw} sliderValue={quantityValidation.valid ? quantityValidation.value : lastValidQuantity} max={10} eyebrow="NUMBER OF MATCHES" descriptor={(value) => value === 1 ? "Unrated Match" : "Unrated Matches"} errorId="overwatch-unrated-quantity-error" errorCopy="Enter a whole number between 1 and 10." onRawChange={(value) => update("matches", quantitySelectionValue(value, 1, 10))} onSliderChange={(value) => update("matches", value)} /> : null}

              <div className="h-px bg-white/[0.07]" />

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Boost method</p>
                  <p className="mt-1 text-sm font-semibold text-white">Choose how you want the service completed.</p>
                  <div role="radiogroup" aria-label="Boost method" onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-3 grid grid-cols-2 gap-2">
                    <ChoicePill active={accountBoostSelected} onClick={() => update("boostMethod", "account")} label="Account Boost" meta="Base" />
                    <ChoicePill active={playWithBooster} onClick={() => update("boostMethod", "duo")} label="Play With Booster" meta={duoMeta} />
                  </div>
                  <AccountBoostTrust selected={accountBoostSelected} accent="gold" showDescription />
                  {playWithBooster ? <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/15 p-4"><QuantityControl value={Number(selection.boosters)} min={1} max={5} label="Boosters" helper={`1 booster +${OVERWATCH_EXTRA_PRICING.playWithBooster * 100}%. Each additional booster adds +${OVERWATCH_EXTRA_PRICING.additionalBooster * 100}%.`} onChange={(value) => update("boosters", value)} /></div> : null}
                </div>
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Role / Queue</p>
                  <p className="mt-1 text-sm font-semibold text-white">Select the role or Open Queue.</p>
                  <div role="radiogroup" aria-label="Role or queue" onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-3 grid grid-cols-2 gap-2">{roles.map((role) => <ChoicePill key={role.value} active={selection.role === role.value} onClick={() => update("role", role.value)} label={role.label} meta={role.meta} />)}</div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Server</p><div role="radiogroup" aria-label="Server" onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-3 grid grid-cols-2 gap-2">{servers.map((server) => <ChoicePill key={server.value} active={selection.server === server.value} onClick={() => update("server", server.value)} label={server.label} />)}</div></div>
                <div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Platform</p><div role="radiogroup" aria-label="Platform" onKeyDown={handleOverwatchRadioGroupKeyDown} className="mt-3 grid grid-cols-2 gap-2">{platforms.map((platform) => <ChoicePill key={platform.value} active={selection.platform === platform.value} onClick={() => update("platform", platform.value)} label={platform.label} icon={<PlatformIcon platform={platform.value} />} />)}</div></div>
              </div>

              <div className="h-px bg-white/[0.07]" />

              <div>
                <div className="flex items-end justify-between gap-4"><div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Customize</p><p className="mt-1 text-sm font-semibold text-white">Add only the options you want.</p></div><span className="text-[10px] text-white/30">Optional</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  <ExtraCard checked={selection.playOffline === true} onChange={(value) => update("playOffline", value)} icon={<EyeOff className="size-4" />} title="Play Offline" price="FREE" description={playWithBooster ? "Available with Account Boost only." : "Keep the account activity discreet during fulfillment."} disabled={playWithBooster} />
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
            <div id="boost-summary" className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#0B0C0A] shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5">
                <div className="flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-white">Order Summary</h2><p className="mt-1 text-xs text-white/45">{service.name}</p></div>{isLoading ? <LoaderCircle className="size-4 animate-spin text-amber-300 motion-reduce:animate-none" /> : <Gamepad2 className="size-4 text-amber-200/55" />}</div>
                {isRank ? <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/75"><span>{rankLabel(currentRank)}</span><ArrowRight className="size-3.5 text-white/30" aria-hidden="true" /><span>{rankLabel(targetRank)}</span></div> : null}
              </div>
              <div className="p-5">
                <div className="space-y-2.5">{summaryRows.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 text-xs"><span className="text-white/38">{label}</span><span className="max-w-[12rem] text-right font-medium text-white/75">{value}</span></div>)}</div>
                <div className="my-4 h-px bg-white/[0.08]" />
                {error ? <div className="rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{error}</div> : null}
                {displayedQuote ? <><div className="space-y-2">{displayedQuote.breakdown.map((item, index) => <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 text-[11px]"><span className="text-[#A0AAA4]">{item.label}</span><span className={item.amount < 0 ? "font-medium text-[#82F5A4]" : "font-medium text-white/78"}>{item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}</span></div>)}</div><div className="my-4 h-px bg-white/[0.08]" /><div className="flex items-end justify-between gap-4" aria-live="polite"><div><p className="text-[11px] font-medium text-[#A0AAA4]">Total</p><p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">{formatPrice(displayedQuote.total)}</p><p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/38"><Check className="size-3 text-[#82F5A4]" strokeWidth={2.5} aria-hidden="true" />Server-validated price</p></div><span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">USD</span></div></> : <><div className="my-4 h-px bg-white/[0.08]" /><div aria-live="polite"><p className="text-[11px] font-medium text-[#A0AAA4]">Total</p><p className="font-gaming-value mt-1 text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">—</p>{isLoading ? <p className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35"><LoaderCircle className="size-3 animate-spin text-[#82F5A4] motion-reduce:animate-none" />Updating price…</p> : <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35">Price unavailable</p>}</div></>}
                <AccountBoostCheckoutReassurance selected={accountBoostSelected} accent="gold" />
                {!configurationIsValid ? <p className="mt-3 text-[10px] leading-4 text-amber-100/75" role="status">Enter a valid configuration to continue to checkout.</p> : null}
                {minimumBlocked ? <MinimumOrderNotice id={minimumNoticeId} shortfallCents={minimumShortfall} /> : null}
                <OverwatchOrderGuidance />
                {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{orderError}</div> : null}
                <Button className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none transition-colors duration-200 hover:bg-[#20C95A] hover:text-[#050807] motion-reduce:transition-none" size="lg" aria-describedby={minimumBlocked ? minimumNoticeId : undefined} disabled={!displayedQuote || isLoading || isCreatingOrder || !canContinue} onClick={createOrder}>{isCreatingOrder ? <>Preparing checkout<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Checkout<ArrowRight className="ml-2 size-4" /></>}</Button>
              </div>
            </div>
            <PaymentMethodsTrustBlock className="mt-3" />
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:px-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3 xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p><p className="font-gaming-value mt-0.5 whitespace-nowrap text-[1.55rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">{displayedQuote ? formatPrice(displayedQuote.total) : "—"}</p></div>
          <a href="#boost-summary" className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/35">View order</a>
        </div>
      </div>
    </div>
  );
}
