"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crosshair,
  EyeOff,
  Layers3,
  MonitorPlay,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import {
  marvelRivalsDivisionOptions,
  marvelRivalsRanks,
  type MarvelRivalsServiceFoundation,
} from "@/features/catalog/data/marvel-rivals-foundation";
import {
  GameConfiguratorColumns,
  GameConfiguratorPanel,
  GameMobileOrderBar,
  GameOrderAside,
} from "./game-configurator-family-shell";

const rankOrder = marvelRivalsRanks.map((rank) => rank.key);
const platforms = [
  { value: "pc", label: "PC" },
  { value: "xbox", label: "Xbox" },
  { value: "playstation", label: "PlayStation" },
] as const;
const regions = [{ value: "north-america", label: "North America" }] as const;

type ExtraKey = "playOffline" | "specificHeroes" | "streaming" | "expressDelivery";
type BoostMethod = "solo" | "duo";

type Selection = {
  currentRank: string;
  currentDivision: string | null;
  targetRank: string;
  targetDivision: string | null;
  previousRank: string;
  previousDivision: string | null;
  wins: number;
  games: number;
  currentHeroLevel: number;
  desiredHeroLevel: number;
  specificHero: string;
  region: string;
  platform: string;
  boostMethod: BoostMethod;
  extras: Record<ExtraKey, boolean>;
};

const extraDefinitions: Array<{
  key: ExtraKey;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    key: "playOffline",
    title: "Play Offline",
    description: "Keep your account presence discreet during the service.",
    icon: <EyeOff className="size-4" />,
  },
  {
    key: "specificHeroes",
    title: "Specific Heroes",
    description: "Include hero preferences with your service configuration.",
    icon: <Crosshair className="size-4" />,
  },
  {
    key: "streaming",
    title: "Streaming",
    description: "Watch the service through the supported streaming option.",
    icon: <MonitorPlay className="size-4" />,
  },
  {
    key: "expressDelivery",
    title: "Express Delivery",
    description: "Prioritize your order when this option is available.",
    icon: <Zap className="size-4" />,
  },
];

function rankDefinition(rank: string) {
  return marvelRivalsRanks.find((item) => item.key === rank) ?? marvelRivalsRanks[0];
}

function rankLabel(rank: string) {
  return rankDefinition(rank).label;
}

function rankHasDivisions(rank: string) {
  return rankDefinition(rank).hasDivisions;
}

function firstHigherRank(currentRank: string) {
  const index = rankOrder.indexOf(currentRank as (typeof rankOrder)[number]);
  return rankOrder[Math.min(rankOrder.length - 1, Math.max(0, index + 1))] ?? rankOrder[1];
}

function RankBadge({
  rank,
  selected = false,
  size = "card",
}: {
  rank: string;
  selected?: boolean;
  size?: "card" | "summary";
}) {
  const definition = rankDefinition(rank);
  const imageSize = size === "summary" ? "h-9 w-9" : "h-[2.8rem] w-[2.8rem]";

  return (
    <span className={`relative grid ${size === "summary" ? "size-10" : "size-[3.2rem]"} place-items-center`}>
      {definition.badge ? (
        <Image
          src={definition.badge}
          alt=""
          width={52}
          height={52}
          className={`${imageSize} object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.42)]`}
        />
      ) : (
        <span
          className={`${imageSize} grid place-items-center rounded-xl border ${
            selected
              ? "border-[#39E56F]/25 bg-[#39E56F]/[0.035] text-white/80"
              : "border-white/[0.10] bg-white/[0.03] text-white/45"
          }`}
          aria-hidden="true"
        >
          <ShieldCheck className={size === "summary" ? "size-4.5" : "size-5"} strokeWidth={1.5} />
        </span>
      )}
      {selected ? (
        <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full border border-[#39E56F]/35 bg-[#39E56F] text-[#050807]">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#F4F7F5] sm:text-lg">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-[#A0AAA4] sm:text-sm">{description}</p>
      ) : null}
    </div>
  );
}

function DivisionSelector({
  rank,
  value,
  onChange,
}: {
  rank: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  if (!rankHasDivisions(rank)) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="mr-1 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        Division
      </span>
      <div className="flex items-center gap-1.5">
        {marvelRivalsDivisionOptions.map((division) => (
          <button
            key={division}
            type="button"
            aria-pressed={value === division}
            onClick={() => onChange(division)}
            className={`h-8 min-w-10 rounded-lg border px-2.5 text-[11px] font-bold transition-colors ${
              value === division
                ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
                : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
            }`}
          >
            {division}
          </button>
        ))}
      </div>
    </div>
  );
}

function RankSelector({
  value,
  target,
  currentRank,
  allowUnranked,
  onChange,
}: {
  value: string;
  target?: boolean;
  currentRank?: string;
  allowUnranked?: boolean;
  onChange: (rank: string) => void;
}) {
  const currentIndex = currentRank ? rankOrder.indexOf(currentRank as (typeof rankOrder)[number]) : -1;
  const isUnranked = value === "unranked";
  const selected = isUnranked ? null : rankDefinition(value);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        {isUnranked ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
            <span className="size-3 rounded-full border border-white/20 bg-white/[0.04]" />
          </span>
        ) : (
          <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-violet-300/[0.12] bg-violet-400/[0.035]">
            <RankBadge rank={value} size="summary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/65">
            {target ? "Target rank" : allowUnranked ? "Previous season rank" : "Current rank"}
          </p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
            {isUnranked ? "Unranked" : selected?.label}
          </p>
        </div>
      </div>

      {allowUnranked ? (
        <button
          type="button"
          onClick={() => onChange("unranked")}
          aria-pressed={isUnranked}
          className={`mt-4 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-semibold transition-colors ${
            isUnranked
              ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
              : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
          }`}
        >
          <span>Unranked</span>
          {isUnranked ? (
            <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
          ) : null}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {(target && currentRank
          ? marvelRivalsRanks.filter((_, index) => index > currentIndex)
          : marvelRivalsRanks
        ).map((rank) => {
          const active = value === rank.key;
          const disabled = false;
          return (
            <button
              key={rank.key}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(rank.key)}
              className={`group/rank relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 transition-[border-color,background-color,transform] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-25 ${
                active
                  ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span
                className={`pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent ${
                  active ? "opacity-80" : "opacity-35"
                }`}
              />
              {active ? (
                <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#39E56F]/55 to-transparent" />
              ) : null}
              <RankBadge rank={rank.key} selected={active} />
              <span
                className={`mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-semibold leading-3.5 ${
                  active ? "text-white" : "text-white/68 group-hover/rank:text-white/90"
                }`}
              >
                {rank.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuantityControl({
  value,
  min,
  max,
  label,
  onChange,
}: {
  value: number;
  min: number;
  max?: number;
  label: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <div className="mt-2 grid grid-cols-[2.75rem_1fr_2.75rem] gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
        >
          −
        </button>
        <div className="grid h-11 place-items-center rounded-xl border border-white/[0.10] bg-[#0E1411]">
          <span className="font-gaming-value text-lg font-bold text-white">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))}
          className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
        >
          +
        </button>
      </div>
    </div>
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

  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.2 8.05c1.1.48 2.26 1.3 3.78 2.77 1.5-1.46 2.68-2.28 3.82-2.77" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.85 16.25c.9-1.55 1.88-2.83 3.13-4.12 1.23 1.28 2.23 2.56 3.17 4.12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ServiceDetails({
  selection,
  showPlatform,
  onRegion,
  onPlatform,
}: {
  selection: Selection;
  showPlatform: boolean;
  onRegion: (value: string) => void;
  onPlatform: (value: string) => void;
}) {
  return (
    <div>
      <SectionHeader title="Service details" description="Choose the server and platform for this service." />
      <div className={`mt-4 grid gap-4 ${showPlatform ? "sm:grid-cols-2" : ""}`}>
        <label className="min-w-0">
          <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Server
          </span>
          <div className="relative mt-2">
            <select
              value={selection.region}
              onChange={(event) => onRegion(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs font-semibold text-white outline-none transition-colors hover:border-white/[0.14] focus:border-white/[0.22]"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          </div>
        </label>

        {showPlatform ? (
          <div>
            <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Platform
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {platforms.map((platform) => {
                const active = selection.platform === platform.value;
                return (
                  <button
                    key={platform.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onPlatform(platform.value)}
                    className={`flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition-colors ${
                      active
                        ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
                        : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                    }`}
                  >
                    <PlatformIcon platform={platform.value} />
                    <span className="truncate">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BoostMethod({
  value,
  onChange,
}: {
  value: BoostMethod;
  onChange: (value: BoostMethod) => void;
}) {
  const options = [
    {
      value: "solo" as const,
      title: "Solo",
      description: "Configure the service as a solo boost.",
      icon: <Target className="size-4" />,
    },
    {
      value: "duo" as const,
      title: "Duo",
      description: "Play alongside your booster.",
      icon: <Users className="size-4" />,
    },
  ];

  return (
    <div>
      <SectionHeader title="Boost Method" description="Choose how you want the service completed." />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {options.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(item.value)}
              className={`flex min-h-[4.4rem] items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg border ${
                  active
                    ? "border-[#A38CFF]/20 bg-[#7A63F2]/[0.06] text-[#CEC5FF]"
                    : "border-white/[0.08] bg-white/[0.025] text-white/50"
                }`}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[#F4F7F5]">{item.title}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">
                  {item.description}
                </span>
              </span>
              <span
                className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                  active
                    ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]"
                    : "border-white/[0.12] bg-white/[0.02] text-transparent"
                }`}
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Extras({
  selection,
  onToggle,
}: {
  selection: Selection;
  onToggle: (key: ExtraKey) => void;
}) {
  return (
    <div>
      <SectionHeader title="Extras" description="Add any optional preferences you want included." />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {extraDefinitions.map((extra) => {
          const checked = selection.extras[extra.key];
          return (
            <button
              key={extra.key}
              type="button"
              aria-pressed={checked}
              onClick={() => onToggle(extra.key)}
              className={`flex min-h-[4.4rem] min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                checked
                  ? "border-[#39E56F]/20 bg-[#39E56F]/[0.035]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg border ${
                  checked
                    ? "border-white/[0.10] bg-white/[0.035] text-white/70"
                    : "border-white/[0.08] bg-white/[0.025] text-white/50"
                }`}
              >
                {extra.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[#F4F7F5]">{extra.title}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">
                  {extra.description}
                </span>
              </span>
              <span
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
        })}
      </div>
    </div>
  );
}

function SummaryRankPair({
  currentRank,
  currentDivision,
  targetRank,
  targetDivision,
}: {
  currentRank: string;
  currentDivision: string | null;
  targetRank: string;
  targetDivision: string | null;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <RankBadge rank={currentRank} size="summary" />
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current</p>
            <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">
              {rankLabel(currentRank)} {currentDivision ?? ""}
            </p>
          </div>
        </div>
        <ArrowRight className="size-3.5 text-violet-200/35" />
        <div className="flex min-w-0 items-center justify-end gap-2 text-right">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Target</p>
            <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">
              {rankLabel(targetRank)} {targetDivision ?? ""}
            </p>
          </div>
          <RankBadge rank={targetRank} size="summary" />
        </div>
      </div>
    </div>
  );
}
function SummaryRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mt-2 divide-y divide-white/[0.06]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 py-2 text-[11px]">
          <span className="text-white/40">{label}</span>
          <span className="max-w-[12rem] text-right font-medium text-white/78">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function MarvelRivalsServiceConfigurator({
  service,
}: {
  service: MarvelRivalsServiceFoundation;
}) {
  const isRank = service.slug === "rank-boost";
  const isPlacements = service.slug === "placement-matches";
  const isWins = service.slug === "wins";
  const isHero = service.slug === "hero-boost";
  const isUnrated = service.slug === "unrated-games";

  const [selection, setSelection] = useState<Selection>({
    currentRank: "bronze",
    currentDivision: "III",
    targetRank: "silver",
    targetDivision: "III",
    previousRank: "unranked",
    previousDivision: null,
    wins: 1,
    games: 1,
    currentHeroLevel: 1,
    desiredHeroLevel: 2,
    specificHero: "",
    region: "north-america",
    platform: "pc",
    boostMethod: "solo",
    extras: {
      playOffline: false,
      specificHeroes: false,
      streaming: false,
      expressDelivery: false,
    },
  });

  function setCurrentRank(value: string) {
    setSelection((current) => {
      const nextTarget =
        rankOrder.indexOf(current.targetRank as (typeof rankOrder)[number]) <=
        rankOrder.indexOf(value as (typeof rankOrder)[number])
          ? firstHigherRank(value)
          : current.targetRank;

      return {
        ...current,
        currentRank: value,
        targetRank: nextTarget,
        currentDivision: rankHasDivisions(value) ? "III" : null,
        targetDivision: rankHasDivisions(nextTarget) ? "III" : null,
      };
    });
  }

  function toggleExtra(key: ExtraKey) {
    setSelection((current) => ({
      ...current,
      extras: { ...current.extras, [key]: !current.extras[key] },
    }));
  }

  const selectedExtras = useMemo(
    () => extraDefinitions.filter((item) => selection.extras[item.key]).map((item) => item.title),
    [selection.extras],
  );

  const serviceRows = useMemo(() => {
    const rows: Array<[string, string]> = [];

    if (isPlacements) {
      rows.push(
        [
          "Previous Rank",
          selection.previousRank === "unranked"
            ? "Unranked"
            : `${rankLabel(selection.previousRank)} ${selection.previousDivision ?? ""}`.trim(),
        ],
        ["Games", String(selection.games)],
      );
    }

    if (isWins) {
      rows.push(
        ["Current Rank", `${rankLabel(selection.currentRank)} ${selection.currentDivision ?? ""}`.trim()],
        ["Wins", String(selection.wins)],
      );
    }

    if (isHero) {
      rows.push(
        ["Hero Level", `${selection.currentHeroLevel} → ${selection.desiredHeroLevel}`],
        ["Specific Hero", selection.specificHero || "Not selected"],
      );
    }

    if (isUnrated) rows.push(["Games", String(selection.games)]);

    rows.push(["Region", "North America"]);

    if (!isHero) {
      rows.push([
        "Platform",
        platforms.find((platform) => platform.value === selection.platform)?.label ?? "PC",
      ]);
    }

    rows.push(["Boost Method", selection.boostMethod === "solo" ? "Solo" : "Duo"]);

    if (selectedExtras.length) rows.push(["Extras", selectedExtras.join(", ")]);

    return rows;
  }, [isHero, isPlacements, isUnrated, isWins, selectedExtras, selection]);

  return (
    <>
      <GameConfiguratorColumns>
        <GameConfiguratorPanel
          eyebrow={`Marvel Rivals ${service.name}`}
          description="Configure your full order without leaving this panel."
          accentTextClass="text-violet-200/65"
          accentGradientClass="from-violet-500/[0.055]"
          statusLabel="Pricing pending"
        >
          <div className={`${isRank ? "space-y-4 sm:space-y-5" : "space-y-6"} p-4 sm:p-5 lg:p-6`}>
            {isRank ? (
              <>
                <div className="relative grid gap-5 lg:grid-cols-2">
                  <span className="pointer-events-none absolute left-1/2 top-5 hidden size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-violet-200/45 lg:grid">
                    <ArrowRight className="size-3.5" />
                  </span>

                  <div>
                    <RankSelector value={selection.currentRank} onChange={setCurrentRank} />
                    <DivisionSelector
                      rank={selection.currentRank}
                      value={selection.currentDivision}
                      onChange={(value) =>
                        setSelection((current) => ({ ...current, currentDivision: value }))
                      }
                    />
                  </div>

                  <div className="relative border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <span
                      className="absolute left-1/2 top-0 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet-300/[0.12] bg-[#0E1411] text-violet-200/45 lg:hidden"
                      aria-hidden="true"
                    >
                      <ArrowRight className="size-3 rotate-90" />
                    </span>
                    <RankSelector
                      value={selection.targetRank}
                      target
                      currentRank={selection.currentRank}
                      onChange={(value) =>
                        setSelection((current) => ({
                          ...current,
                          targetRank: value,
                          targetDivision: rankHasDivisions(value) ? "III" : null,
                        }))
                      }
                    />
                    <DivisionSelector
                      rank={selection.targetRank}
                      value={selection.targetDivision}
                      onChange={(value) =>
                        setSelection((current) => ({ ...current, targetDivision: value }))
                      }
                    />
                  </div>
                </div>

                <div className="h-px bg-white/[0.07]" />

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                        Server
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">Choose your server.</p>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <select
                      value={selection.region}
                      onChange={(event) =>
                        setSelection((current) => ({ ...current, region: event.target.value }))
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs font-semibold text-white outline-none transition-colors hover:border-white/[0.14] focus:border-violet-300/[0.18]"
                    >
                      {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
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
                            onClick={() =>
                              setSelection((current) => ({ ...current, platform: platform.value }))
                            }
                            className={`flex h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left transition-colors ${
                              active
                                ? "border-violet-300/[0.18] bg-[#131B17] text-white"
                                : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                            }`}
                          >
                            <span
                              className={`grid size-7 place-items-center rounded-lg border ${
                                active
                                  ? "border-white/[0.12] bg-[#090D0B]"
                                  : "border-white/[0.08] bg-white/[0.02]"
                              } text-violet-200/75`}
                            >
                              <PlatformIcon platform={platform.value} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                              {platform.label}
                            </span>
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

                  <div className="lg:border-l lg:border-white/[0.07] lg:pl-5">
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                      Boost method
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        {
                          value: "solo" as const,
                          title: "Solo",
                          description: "Configure the service as a solo boost.",
                          icon: <Target className="size-4" />,
                        },
                        {
                          value: "duo" as const,
                          title: "Duo",
                          description: "Play alongside your booster.",
                          icon: <Users className="size-4" />,
                        },
                      ].map((method) => {
                        const active = selection.boostMethod === method.value;
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() =>
                              setSelection((current) => ({
                                ...current,
                                boostMethod: method.value,
                              }))
                            }
                            className={`min-h-[8.4rem] rounded-xl border p-4 text-left transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none ${
                              active
                                ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035]"
                                : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-violet-200/75">
                                {method.icon}
                              </span>
                              {active ? (
                                <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                                  <Check className="size-2.5" strokeWidth={3} />
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">{method.title}</p>
                            <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                              {method.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                        Customize
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">Optional upgrades.</p>
                    </div>
                    <span className="text-[10px] text-white/35">Nothing preselected</span>
                  </div>
                  <div className="mt-3">
                    <Extras selection={selection} onToggle={toggleExtra} />
                  </div>
                </div>
              </>
            ) : null}

            {isPlacements ? (
              <>
                <div>
                  <SectionHeader title="Previous Season Rank" description="Choose your previous rank or select Unranked." />
                  <div className="mt-5">
                    <RankSelector
                      value={selection.previousRank}
                      allowUnranked
                      onChange={(value) =>
                        setSelection((current) => ({
                          ...current,
                          previousRank: value,
                          previousDivision:
                            value === "unranked" ? null : rankHasDivisions(value) ? "III" : null,
                        }))
                      }
                    />
                    {selection.previousRank !== "unranked" ? (
                      <DivisionSelector
                        rank={selection.previousRank}
                        value={selection.previousDivision}
                        onChange={(value) =>
                          setSelection((current) => ({ ...current, previousDivision: value }))
                        }
                      />
                    ) : null}
                  </div>
                  <div className="mt-5 border-t border-white/[0.07] pt-5">
                    <QuantityControl
                      value={selection.games}
                      min={1}
                      max={10}
                      label="Games"
                      onChange={(games) => setSelection((current) => ({ ...current, games }))}
                    />
                  </div>
                </div>
                <div className="h-px bg-white/[0.07]" />
                <ServiceDetails
                  selection={selection}
                  showPlatform
                  onRegion={(region) => setSelection((current) => ({ ...current, region }))}
                  onPlatform={(platform) => setSelection((current) => ({ ...current, platform }))}
                />
                <div className="h-px bg-white/[0.07]" />
                <BoostMethod
                  value={selection.boostMethod}
                  onChange={(boostMethod) =>
                    setSelection((current) => ({ ...current, boostMethod }))
                  }
                />
                <div className="h-px bg-white/[0.07]" />
                <Extras selection={selection} onToggle={toggleExtra} />
              </>
            ) : null}

            {isWins ? (
              <>
                <div>
                  <SectionHeader title="Current Rank" description="Choose your current competitive position." />
                  <div className="mt-5">
                    <RankSelector value={selection.currentRank} onChange={setCurrentRank} />
                    <DivisionSelector
                      rank={selection.currentRank}
                      value={selection.currentDivision}
                      onChange={(value) =>
                        setSelection((current) => ({ ...current, currentDivision: value }))
                      }
                    />
                  </div>
                  <div className="mt-5 border-t border-white/[0.07] pt-5">
                    <QuantityControl
                      value={selection.wins}
                      min={1}
                      label="Wins"
                      onChange={(wins) => setSelection((current) => ({ ...current, wins }))}
                    />
                  </div>
                </div>
                <div className="h-px bg-white/[0.07]" />
                <ServiceDetails
                  selection={selection}
                  showPlatform
                  onRegion={(region) => setSelection((current) => ({ ...current, region }))}
                  onPlatform={(platform) => setSelection((current) => ({ ...current, platform }))}
                />
                <div className="h-px bg-white/[0.07]" />
                <BoostMethod
                  value={selection.boostMethod}
                  onChange={(boostMethod) =>
                    setSelection((current) => ({ ...current, boostMethod }))
                  }
                />
                <div className="h-px bg-white/[0.07]" />
                <Extras selection={selection} onToggle={toggleExtra} />
              </>
            ) : null}

            {isHero ? (
              <>
                <div>
                  <SectionHeader title="Hero Progression" description="Set your current and desired hero level." />
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <QuantityControl
                      value={selection.currentHeroLevel}
                      min={1}
                      label="Current hero level"
                      onChange={(currentHeroLevel) =>
                        setSelection((current) => ({
                          ...current,
                          currentHeroLevel,
                          desiredHeroLevel: Math.max(current.desiredHeroLevel, currentHeroLevel + 1),
                        }))
                      }
                    />
                    <QuantityControl
                      value={selection.desiredHeroLevel}
                      min={selection.currentHeroLevel + 1}
                      label="Desired hero level"
                      onChange={(desiredHeroLevel) =>
                        setSelection((current) => ({ ...current, desiredHeroLevel }))
                      }
                    />
                  </div>

                  <label className="mt-5 block">
                    <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      Specific Hero
                    </span>
                    <div className="relative mt-2">
                      <select
                        value={selection.specificHero}
                        onChange={(event) =>
                          setSelection((current) => ({
                            ...current,
                            specificHero: event.target.value,
                          }))
                        }
                        disabled
                        className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs text-white/50 outline-none disabled:cursor-not-allowed"
                      >
                        <option value="">Select hero</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                    </div>
                  </label>
                </div>
                <div className="h-px bg-white/[0.07]" />
                <ServiceDetails
                  selection={selection}
                  showPlatform={false}
                  onRegion={(region) => setSelection((current) => ({ ...current, region }))}
                  onPlatform={(platform) => setSelection((current) => ({ ...current, platform }))}
                />
                <div className="h-px bg-white/[0.07]" />
                <BoostMethod
                  value={selection.boostMethod}
                  onChange={(boostMethod) =>
                    setSelection((current) => ({ ...current, boostMethod }))
                  }
                />
                <div className="h-px bg-white/[0.07]" />
                <Extras selection={selection} onToggle={toggleExtra} />
              </>
            ) : null}

            {isUnrated ? (
              <>
                <div>
                  <SectionHeader title="Number of Games" description="Choose how many unrated games you need." />
                  <div className="mt-4 max-w-xl">
                    <QuantityControl
                      value={selection.games}
                      min={1}
                      label="Games"
                      onChange={(games) => setSelection((current) => ({ ...current, games }))}
                    />
                  </div>
                </div>
                <div className="h-px bg-white/[0.07]" />
                <ServiceDetails
                  selection={selection}
                  showPlatform
                  onRegion={(region) => setSelection((current) => ({ ...current, region }))}
                  onPlatform={(platform) => setSelection((current) => ({ ...current, platform }))}
                />
                <div className="h-px bg-white/[0.07]" />
                <BoostMethod
                  value={selection.boostMethod}
                  onChange={(boostMethod) =>
                    setSelection((current) => ({ ...current, boostMethod }))
                  }
                />
                <div className="h-px bg-white/[0.07]" />
                <Extras selection={selection} onToggle={toggleExtra} />
              </>
            ) : null}
          </div>
        </GameConfiguratorPanel>

        <GameOrderAside
          gameLabel={`Marvel Rivals ${service.name}`}
          statusLabel="Pending"
          progression={
            isRank ? (
              <SummaryRankPair
                currentRank={selection.currentRank}
                currentDivision={selection.currentDivision}
                targetRank={selection.targetRank}
                targetDivision={selection.targetDivision}
              />
            ) : undefined
          }
          metadata={<SummaryRows rows={serviceRows} />}
          totalLabel="Pricing pending"
        />
      </GameConfiguratorColumns>

      <GameMobileOrderBar label="Pricing pending" />
    </>
  );
}
