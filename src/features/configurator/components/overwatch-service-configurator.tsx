"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  EyeOff,
  Gamepad2,
  Globe2,
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

function SectionCard({
  eyebrow,
  title,
  description,
  icon,
  trailing,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.3rem] border border-white/[0.075] bg-[#0A0F0C]/88 p-4 shadow-[0_18px_45px_-36px_rgba(0,0,0,.95)] sm:p-5">
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-amber-300/[0.12] bg-amber-300/[0.035] text-amber-200/70">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-200/60">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-sm font-semibold tracking-[-0.015em] text-[#F4F7F5]">{title}</h3>
            {description ? (
              <p className="mt-1 text-[11px] leading-4 text-white/38">{description}</p>
            ) : null}
          </div>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
      {children}
    </section>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  label,
  description,
  meta,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
}) {
  const free = meta === "FREE";
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`group/option relative flex min-h-[4.7rem] min-w-0 items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none ${
        active
          ? "border-amber-300/[0.22] bg-amber-300/[0.055]"
          : "border-white/[0.075] bg-[#080D0B] hover:-translate-y-px hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl border transition-colors ${
        active
          ? "border-amber-300/[0.16] bg-black/20 text-amber-200/80"
          : "border-white/[0.07] bg-white/[0.025] text-white/50 group-hover/option:text-white/75"
      }`}>
        {icon ?? <span className="size-1.5 rounded-full bg-current" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center justify-between gap-2">
          <span className={`min-w-0 text-xs font-semibold ${active ? "text-white" : "text-white/72"}`}>{label}</span>
          {meta ? (
            <span className={`shrink-0 text-[9px] font-bold ${free ? "text-[#82F5A4]" : "text-amber-200/70"}`}>{meta}</span>
          ) : null}
        </span>
        {description ? (
          <span className="mt-1 block text-[10px] leading-4 text-white/38">{description}</span>
        ) : null}
      </span>
      <span className={`absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full border transition-colors ${
        active
          ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]"
          : "border-white/[0.10] bg-white/[0.015] text-transparent"
      }`}>
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      {active ? <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" /> : null}
    </button>
  );
}

function PlatformCard({
  active,
  value,
  label,
  onClick,
}: {
  active: boolean;
  value: string;
  label: string;
  onClick: () => void;
}) {
  const asset =
    value === "pc"
      ? "/platform-icons/steam.png"
      : value === "xbox"
        ? "/platform-icons/xbox.png"
        : value === "playstation"
          ? "/platform-icons/playstation.png"
          : "/platform-icons/nintendo-switch.webp";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative flex min-h-[4.6rem] min-w-0 items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,transform] duration-200 motion-reduce:transition-none ${
        active
          ? "border-amber-300/[0.22] bg-amber-300/[0.055]"
          : "border-white/[0.075] bg-[#080D0B] hover:-translate-y-px hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.075] bg-white/[0.025]">
        <Image src={asset} alt="" width={22} height={22} className="size-[1.15rem] object-contain opacity-90" />
      </span>
      <span className={`min-w-0 pr-5 text-xs font-semibold ${active ? "text-white" : "text-white/70"}`}>{label}</span>
      {active ? (
        <span className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      ) : null}
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
    <div className="rounded-xl border border-white/[0.07] bg-[#080D0B] p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.14em] text-white/42">{label}</p>
          <p className="mt-1 text-[10px] text-white/30">Range {min}–{max}</p>
        </div>
        <span className="font-gaming-value text-2xl font-bold tracking-[-0.035em] text-white">{value}</span>
      </div>
      <div className="mt-3 grid grid-cols-[3rem_1fr_3rem] gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-11 rounded-xl border border-white/[0.08] bg-black/20 text-lg font-semibold text-white/55 transition-colors hover:border-white/[0.15] hover:bg-white/[0.035] hover:text-white"
        >
          −
        </button>
        <div className="relative grid h-11 place-items-center overflow-hidden rounded-xl border border-amber-300/[0.16] bg-amber-300/[0.04]">
          <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-100/65">Selected quantity</span>
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-11 rounded-xl border border-white/[0.08] bg-black/20 text-lg font-semibold text-white/55 transition-colors hover:border-white/[0.15] hover:bg-white/[0.035] hover:text-white"
        >
          +
        </button>
      </div>
      {helper ? <p className="mt-2.5 text-[10px] leading-4 text-white/35">{helper}</p> : null}
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
      className={`group/extra relative flex min-h-[6.25rem] min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-3.5 text-left transition-[border-color,background-color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${
        checked
          ? "border-amber-300/[0.20] bg-amber-300/[0.05]"
          : "border-white/[0.07] bg-[#080D0B] hover:-translate-y-px hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl border ${
          checked
            ? "border-amber-300/[0.14] bg-black/20 text-amber-200/80"
            : "border-white/[0.07] bg-white/[0.025] text-white/55 group-hover/extra:text-white/75"
        }`}>
          {icon}
        </span>
        <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${
          checked
            ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]"
            : "border-white/[0.12] bg-white/[0.02] text-transparent"
        }`}>
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="min-w-0 text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${disabled ? "text-white/35" : free ? "text-[#82F5A4]" : "text-amber-200/70"}`}>
            {disabled ? "Account only" : price}
          </span>
        </div>
        <span className="mt-1 block text-[10px] leading-4 text-[#8E9892]">{description}</span>
      </div>
      {checked ? <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" /> : null}
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
    <div className={`min-w-0 rounded-[1.05rem] border p-4 sm:p-5 ${
      target
        ? "border-amber-300/[0.12] bg-amber-300/[0.018]"
        : "border-white/[0.07] bg-black/[0.12]"
    }`}>
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-amber-300/[0.12] bg-amber-400/[0.035]">
          {unrated ? (
            <span className="grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[9px] font-black tracking-[0.08em] text-white/45">NR</span>
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
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-200/60">
            {target ? "Target rank" : sourceLabel ?? "Current rank"}
          </p>
          <p className="font-gaming-value mt-1 break-words text-lg font-bold tracking-[-0.03em] text-[#F4F7F5] sm:text-xl">{rankLabel(value)}</p>
        </div>
      </div>

      {allowUnranked ? (
        <button
          type="button"
          aria-pressed={unrated}
          onClick={() => onChange("unranked")}
          className={`mt-4 flex min-h-11 w-full items-center justify-between rounded-xl border px-3.5 text-left text-xs font-semibold transition-colors ${
            unrated
              ? "border-amber-300/[0.18] bg-amber-300/[0.04] text-white"
              : "border-white/[0.08] bg-[#080D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[8px] font-black text-white/45">NR</span>
            <span>Unranked</span>
          </span>
          {unrated ? <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5">
        {rankFamilies.map((family) => {
          const active = selectedFamily?.key === family.key;
          const available = !target || firstAvailableRankForFamily(family.key, currentRank ?? "bronze-5") !== null;
          return (
            <button
              key={family.key}
              type="button"
              disabled={!available}
              onClick={() => chooseFamily(family.key)}
              title={family.label}
              aria-pressed={active}
              className={`group/rank relative flex min-h-[5.8rem] min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border px-1.5 py-2 text-center transition-[border-color,background-color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-20 motion-reduce:transition-none ${
                active
                  ? "border-amber-300/[0.22] bg-amber-300/[0.055]"
                  : "border-white/[0.075] bg-[#080D0B] hover:-translate-y-px hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
              <span className="mx-auto grid h-12 place-items-center">
                <RankBadge familyKey={family.key} label={family.label} mark={family.mark} badge={family.badge} />
              </span>
              <span className={`mt-1.5 line-clamp-2 min-h-6 w-full text-center text-[9px] font-semibold leading-3 ${active ? "text-white" : "text-white/58 group-hover/rank:text-white/85"}`}>{family.label}</span>
              {active ? (
                <>
                  <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span>
                  <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {!unrated && selectedFamily ? (
        <div className="mt-3 rounded-xl border border-white/[0.065] bg-black/15 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-gaming-label text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">Division</span>
            {divisions.map((division) => {
              const candidate = `${selectedFamily.key}-${division}`;
              const active = value === candidate;
              const aboveCurrent = !target || rankIndex(candidate) > currentIndex;
              const allowedTop = !(omitChampionOne && candidate === "champion-1");
              const available = aboveCurrent && allowedTop;
              return (
                <button
                  key={division}
                  type="button"
                  disabled={!available}
                  aria-pressed={active}
                  onClick={() => onChange(candidate)}
                  className={`h-9 min-w-10 flex-1 rounded-lg border px-2 text-xs font-bold transition-[border-color,background-color,color] disabled:cursor-not-allowed disabled:opacity-20 sm:flex-none sm:px-3 ${
                    active
                      ? "border-amber-300/[0.22] bg-amber-300/[0.06] text-[#F4F7F5]"
                      : "border-white/[0.075] bg-[#080D0B] text-white/50 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                  }`}
                >
                  {divisionLabel[division]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DriveRankSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const selected = rankFamilies.find((family) => family.key === value) ?? rankFamilies[0];
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/[0.12] p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-amber-300/[0.12] bg-amber-300/[0.035]">
          <RankBadge familyKey={selected.key} label={selected.label} mark={selected.mark} badge={selected.badge} compact />
        </div>
        <div>
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-amber-200/60">Drive Rank</p>
          <p className="font-gaming-value mt-1 text-lg font-bold text-white">{selected.label}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5">
        {rankFamilies.map((family) => {
          const active = value === family.key;
          return (
            <button
              key={family.key}
              type="button"
              onClick={() => onChange(family.key)}
              aria-pressed={active}
              className={`relative flex min-h-[5.8rem] min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border px-1.5 py-2 text-center transition-[border-color,background-color,transform] duration-200 motion-reduce:transition-none ${
                active
                  ? "border-amber-300/[0.22] bg-amber-300/[0.055]"
                  : "border-white/[0.075] bg-[#080D0B] hover:-translate-y-px hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span className="mx-auto grid h-12 place-items-center">
                <RankBadge familyKey={family.key} label={family.label} mark={family.mark} badge={family.badge} />
              </span>
              <span className={`mt-1.5 line-clamp-2 min-h-6 w-full text-center text-[9px] font-semibold leading-3 ${active ? "text-white" : "text-white/58"}`}>{family.label}</span>
              {active ? (
                <>
                  <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span>
                  <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DriveControl({ current, desired, onCurrent, onDesired }: { current: number; desired: number; onCurrent: (value: number) => void; onDesired: (value: number) => void }) {
  return (
    <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
      <div className="rounded-xl border border-white/[0.07] bg-[#080D0B] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-white/42">Current Drive Points</span>
            <p className="mt-1 text-[10px] text-white/30">50-point increments</p>
          </div>
          <span className="font-gaming-value text-xl font-bold text-white">{current.toLocaleString("en-US")}</span>
        </div>
        <input type="range" min={0} max={3950} step={50} value={current} onChange={(event) => onCurrent(Number(event.target.value))} className="mt-5 w-full accent-amber-400" />
      </div>
      <div className="hidden items-center justify-center md:flex">
        <span className="grid size-8 place-items-center rounded-full border border-amber-300/[0.12] bg-amber-300/[0.035] text-amber-200/55"><ArrowRight className="size-3.5" /></span>
      </div>
      <div className="rounded-xl border border-amber-300/[0.14] bg-amber-300/[0.035] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-amber-200/65">Desired Drive Points</span>
            <p className="mt-1 text-[10px] text-white/30">Must remain above current</p>
          </div>
          <span className="font-gaming-value text-xl font-bold text-white">{desired.toLocaleString("en-US")}</span>
        </div>
        <input type="range" min={Math.min(4000, current + 50)} max={4000} step={50} value={desired} onChange={(event) => onDesired(Number(event.target.value))} className="mt-5 w-full accent-amber-400" />
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
  const boosterCount = Math.min(5, Math.max(1, Number(selection.boosters) || 1));
  const duoModifier =
    OVERWATCH_EXTRA_PRICING.playWithBooster +
    Math.max(0, boosterCount - 1) * OVERWATCH_EXTRA_PRICING.additionalBooster;
  const duoMeta = `+${Math.round(duoModifier * 100)}%`;

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
                <SectionCard
                  eyebrow="Rank progression"
                  title="Current and target competitive rank"
                  description="Choose the exact progression for this order."
                  icon={<Trophy className="size-4" />}
                >
                  <div className="relative grid gap-3 lg:grid-cols-2 lg:gap-4">
                    <RankSelector value={currentRank} omitChampionOne onChange={(value) => update("currentRank", value)} />
                    <span className="pointer-events-none absolute left-1/2 top-7 z-10 hidden size-8 -translate-x-1/2 place-items-center rounded-full border border-amber-300/[0.12] bg-[#0D120F] text-amber-200/45 lg:grid"><ArrowRight className="size-3.5" /></span>
                    <RankSelector value={targetRank} currentRank={currentRank} target onChange={(value) => update("targetRank", value)} />
                  </div>
                </SectionCard>
              ) : null}

              {isWins ? (
                <>
                  <SectionCard
                    eyebrow="Current rank"
                    title="Rank where wins will be played"
                    description="Select your current competitive rank."
                    icon={<Trophy className="size-4" />}
                  >
                    <RankSelector value={currentRank} onChange={(value) => update("currentRank", value)} />
                  </SectionCard>
                  <SectionCard
                    eyebrow="Wins quantity"
                    title="Competitive Wins"
                    description="Choose how many wins you want at the selected rank."
                    icon={<Trophy className="size-4" />}
                  >
                    <QuantityControl value={Number(selection.wins)} min={1} max={5} label="Competitive Wins" helper="Maximum 5 wins per order." onChange={(value) => update("wins", value)} />
                  </SectionCard>
                </>
              ) : null}

              {isPlacements ? (
                <>
                  <SectionCard
                    eyebrow="Previous rank"
                    title="Your rank before placements"
                    description="Choose Unranked or your previous competitive rank."
                    icon={<Trophy className="size-4" />}
                  >
                    <RankSelector value={currentRank} allowUnranked sourceLabel="Previous rank" onChange={(value) => update("currentRank", value)} />
                  </SectionCard>
                  <SectionCard
                    eyebrow="Placement matches"
                    title="Number of placement matches"
                    description="Set the number of placements included in this order."
                    icon={<Gamepad2 className="size-4" />}
                  >
                    <QuantityControl value={Number(selection.matches)} min={1} max={10} label="Placement Matches" helper="Maximum 10 placement matches per order." onChange={(value) => update("matches", value)} />
                  </SectionCard>
                </>
              ) : null}

              {isDrives ? (
                <>
                  <SectionCard
                    eyebrow="Drive rank"
                    title="Competitive Drive rank"
                    description="Select the rank context for the drive progression."
                    icon={<Trophy className="size-4" />}
                  >
                    <DriveRankSelector value={String(selection.driveRank)} onChange={(value) => update("driveRank", value)} />
                  </SectionCard>
                  <SectionCard
                    eyebrow="Drive progression"
                    title="Current to desired Drive Points"
                    description="Adjust the exact 50-point progression for this order."
                    icon={<ArrowRight className="size-4" />}
                  >
                    <DriveControl current={Number(selection.currentDrive)} desired={Number(selection.desiredDrive)} onCurrent={updateDriveCurrent} onDesired={(value) => update("desiredDrive", value)} />
                  </SectionCard>
                </>
              ) : null}

              {isUnrated ? (
                <SectionCard
                  eyebrow="Number of matches"
                  title="Unrated Matches"
                  description="No competitive rank selection is required."
                  icon={<Gamepad2 className="size-4" />}
                >
                  <QuantityControl value={Number(selection.matches)} min={1} max={10} label="Unrated Matches" helper="No rank selection is required. Maximum 10 matches per order." onChange={(value) => update("matches", value)} />
                </SectionCard>
              ) : null}

              <SectionCard
                eyebrow="Boost method"
                title="Choose how the service is completed"
                description="Account access or play alongside your booster."
                icon={<Users className="size-4" />}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <OptionCard
                    active={accountBoostSelected}
                    onClick={() => update("boostMethod", "account")}
                    icon={<ShieldCheck className="size-4" />}
                    label="Account Boost"
                    description="Secure fulfillment on your account."
                    meta="Base"
                  />
                  <OptionCard
                    active={playWithBooster}
                    onClick={() => update("boostMethod", "duo")}
                    icon={<Users className="size-4" />}
                    label="Play With Booster"
                    description="Queue and play alongside your booster."
                    meta={duoMeta}
                  />
                </div>
                <AccountBoostTrust selected={accountBoostSelected} accent="gold" showDescription />
                {playWithBooster ? (
                  <div className="mt-4 rounded-xl border border-amber-300/[0.10] bg-amber-300/[0.02] p-3.5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/60">Number of Boosters</p>
                        <p className="mt-1 text-[10px] leading-4 text-white/35">1 booster +{OVERWATCH_EXTRA_PRICING.playWithBooster * 100}%. Each additional booster +{OVERWATCH_EXTRA_PRICING.additionalBooster * 100}%.</p>
                      </div>
                      <span className="rounded-lg border border-amber-300/[0.12] bg-black/15 px-2 py-1 text-[9px] font-bold text-amber-100/70">{duoMeta}</span>
                    </div>
                    <QuantityControl value={Number(selection.boosters)} min={1} max={5} label="Boosters" helper="Choose between 1 and 5 boosters." onChange={(value) => update("boosters", value)} />
                  </div>
                ) : null}
              </SectionCard>

              <SectionCard
                eyebrow="Role / Queue"
                title="Select your preferred competitive role"
                description="Role choice can affect the final quote."
                icon={<Crosshair className="size-4" />}
              >
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {roles.map((role) => (
                    <OptionCard
                      key={role.value}
                      active={selection.role === role.value}
                      onClick={() => update("role", role.value)}
                      icon={
                        role.value === "tank" ? <ShieldCheck className="size-4" /> :
                        role.value === "damage" ? <Crosshair className="size-4" /> :
                        role.value === "support" ? <Sparkles className="size-4" /> :
                        <Gamepad2 className="size-4" />
                      }
                      label={role.label}
                      meta={role.meta}
                    />
                  ))}
                </div>
              </SectionCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard
                  eyebrow="Server"
                  title="Where you play"
                  description="Choose your Overwatch server region."
                  icon={<Globe2 className="size-4" />}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {servers.map((server) => (
                      <OptionCard
                        key={server.value}
                        active={selection.server === server.value}
                        onClick={() => update("server", server.value)}
                        icon={<Globe2 className="size-4" />}
                        label={server.label}
                      />
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  eyebrow="Platform"
                  title="Your gaming platform"
                  description="Select the platform used for this order."
                  icon={<Gamepad2 className="size-4" />}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => (
                      <PlatformCard
                        key={platform.value}
                        active={selection.platform === platform.value}
                        value={platform.value}
                        label={platform.label}
                        onClick={() => update("platform", platform.value)}
                      />
                    ))}
                  </div>
                </SectionCard>
              </div>

              <SectionCard
                eyebrow="Extras"
                title="Optional service enhancements"
                description="Add only the options you want."
                icon={<Sparkles className="size-4" />}
                trailing={<span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/28">Optional</span>}
              >
                <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                  <ExtraCard checked={selection.playOffline === true} onChange={(value) => update("playOffline", value)} icon={<EyeOff className="size-4" />} title="Play Offline" price="FREE" description={playWithBooster ? "Available with Account Boost only." : "Keep the account activity discreet during fulfillment."} disabled={playWithBooster} />
                  <ExtraCard checked={selection.specificHeroes === true} onChange={(value) => update("specificHeroes", value)} icon={<Crosshair className="size-4" />} title="Specific Heroes" price="FREE" description="Save preferred heroes for the order." />
                  <ExtraCard checked={selection.streaming === true} onChange={(value) => update("streaming", value)} icon={<MonitorPlay className="size-4" />} title="Streaming" price={`+${formatPrice(OVERWATCH_EXTRA_PRICING.streaming)}`} description="Add streaming to your order." />
                  <ExtraCard checked={selection.expressDelivery === true} onChange={(value) => update("expressDelivery", value)} icon={<Zap className="size-4" />} title="Express Delivery" price={`+${OVERWATCH_EXTRA_PRICING.expressDelivery * 100}%`} description="Prioritize faster fulfillment when capacity is available." />
                  {showBonusAndInsurance ? <ExtraCard checked={selection.extraWin === true} onChange={(value) => update("extraWin", value)} icon={<Trophy className="size-4" />} title="+1 Bonus Win" price={`+${formatPrice(OVERWATCH_EXTRA_PRICING.bonusWin)}`} description="Add one additional win to your order." /> : null}
                  {showBonusAndInsurance ? <ExtraCard checked={selection.rankInsurance === true} onChange={(value) => update("rankInsurance", value)} icon={<ShieldCheck className="size-4" />} title="Rank Insurance" price={`+${OVERWATCH_EXTRA_PRICING.rankInsurance * 100}%`} description="Add the Overwatch rank insurance option." /> : null}
                </div>
              </SectionCard>
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
