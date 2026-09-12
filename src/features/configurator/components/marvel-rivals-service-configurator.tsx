"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crosshair,
  EyeOff,
  Gamepad2,
  Layers3,
  Monitor,
  MonitorPlay,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  marvelRivalsDivisionOptions,
  marvelRivalsRanks,
  marvelRivalsServices,
  type MarvelRivalsServiceFoundation,
} from "@/features/catalog/data/marvel-rivals-foundation";

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
              ? "border-[#A38CFF]/30 bg-[#7A63F2]/[0.10] text-[#D4CCFF]"
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
    <div className="mt-3">
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        Division
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {marvelRivalsDivisionOptions.map((division) => (
          <button
            key={division}
            type="button"
            aria-pressed={value === division}
            onClick={() => onChange(division)}
            className={`h-9 rounded-lg border text-xs font-bold transition-colors ${
              value === division
                ? "border-[#A38CFF]/30 bg-[#7A63F2]/[0.08] text-white"
                : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:text-white"
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
          <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.035]">
            <RankBadge rank={value} size="summary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BDB2FF]/60">
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
        {marvelRivalsRanks.map((rank, index) => {
          const active = value === rank.key;
          const disabled = target && currentRank ? index <= currentIndex : false;
          return (
            <button
              key={rank.key}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(rank.key)}
              className={`group/rank relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 transition-[border-color,background-color,transform] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-25 ${
                active
                  ? "border-[#A38CFF]/30 bg-[#7A63F2]/[0.065]"
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
        <div className="grid h-11 place-items-center rounded-xl border border-[#A38CFF]/[0.16] bg-[#7A63F2]/[0.04]">
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
  if (platform === "pc") return <Monitor className="size-4" />;
  return <Gamepad2 className="size-4" />;
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
              className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs font-semibold text-white outline-none transition-colors hover:border-white/[0.14] focus:border-[#A38CFF]/30"
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
                        ? "border-[#A38CFF]/30 bg-[#7A63F2]/[0.065] text-white"
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
                  ? "border-[#A38CFF]/30 bg-[#7A63F2]/[0.065]"
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
                  ? "border-[#A38CFF]/[0.20] bg-[#7A63F2]/[0.05]"
                  : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg border ${
                  checked
                    ? "border-[#A38CFF]/[0.18] bg-[#7A63F2]/[0.05] text-[#CEC5FF]"
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

function ServiceSidebar({ activeSlug }: { activeSlug: string }) {
  return (
    <aside className="hidden xl:block">
      <nav
        aria-label="Marvel Rivals services"
        className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5"
      >
        <div className="px-2.5 pb-3 pt-2">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BDB2FF]/60">
            Marvel Rivals
          </p>
          <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
        </div>

        <div className="space-y-1.5">
          {marvelRivalsServices.map((item) => {
            const active = item.slug === activeSlug;
            return (
              <Link
                key={item.slug}
                href={`/games/marvel-rivals/${item.slug}`}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-200 ${
                  active
                    ? "border-[#A38CFF]/[0.20] bg-[#131B17] text-[#F4F7F5]"
                    : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.name}</span>
                {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" /> : null}
              </Link>
            );
          })}
        </div>

        <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
        <Link
          href="/games/marvel-rivals"
          className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 transition-colors hover:text-white/65"
        >
          <ArrowRight className="mr-2 size-3 rotate-180" />
          Marvel Rivals overview
        </Link>
      </nav>
    </aside>
  );
}

function MobileServiceNav({ activeSlug }: { activeSlug: string }) {
  return (
    <nav aria-label="Marvel Rivals services" className="mb-3 sm:mb-4 xl:hidden">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2">
          {marvelRivalsServices.map((item) => {
            const active = item.slug === activeSlug;
            return (
              <Link
                key={item.slug}
                href={`/games/marvel-rivals/${item.slug}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-colors sm:h-10 ${
                  active
                    ? "border-[#A38CFF]/[0.20] bg-[#131B17] text-[#F4F7F5]"
                    : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                }`}
              >
                {active ? <span className="mr-2 size-1.5 rounded-full bg-[#39E56F]" /> : null}
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
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
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-3.5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
            <RankBadge rank={currentRank} size="summary" />
          </div>
          <p className="mt-2 truncate text-[11px] font-semibold text-white/80">
            {rankLabel(currentRank)} {currentDivision ?? ""}
          </p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/30">Current</p>
        </div>
        <ArrowRight className="size-4 text-white/25" />
        <div className="min-w-0 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-xl border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.035]">
            <RankBadge rank={targetRank} size="summary" />
          </div>
          <p className="mt-2 truncate text-[11px] font-semibold text-white/80">
            {rankLabel(targetRank)} {targetDivision ?? ""}
          </p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/30">Target</p>
        </div>
      </div>
    </div>
  );
}

function SummaryRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="space-y-2.5">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 text-xs">
          <span className="text-white/38">{label}</span>
          <span className="max-w-[12rem] text-right font-medium text-white/72">{value}</span>
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
    <div className="pb-[calc(5.75rem+env(safe-area-inset-bottom))] xl:pb-0">
      <MobileServiceNav activeSlug={service.slug} />

      <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
        <ServiceSidebar activeSlug={service.slug} />

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#080B09]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-[#7A63F2]/[0.055] via-transparent to-transparent px-4 py-4 sm:px-5 lg:px-6">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BDB2FF]/60">
                Marvel Rivals · {service.name}
              </p>
              <p className="mt-1.5 text-sm text-[#A0AAA4]">{service.summary}</p>
            </div>

            <div className="space-y-6 p-4 sm:p-5 lg:p-6">
              {isRank ? (
                <div>
                  <SectionHeader title="Current → Target" description="Choose your current rank and the rank you want to reach." />
                  <div className="relative mt-5 grid gap-5 lg:grid-cols-2">
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
                      <span className="pointer-events-none absolute left-1/2 top-[-0.8rem] grid size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-[#BDB2FF]/60 lg:left-[-0.85rem] lg:top-5 lg:translate-x-0">
                        <ArrowRight className="size-3.5" />
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
                </div>
              ) : null}

              {isPlacements ? (
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
                    <SectionHeader title="Number of Games" description="Choose how many placement games you need." />
                    <div className="mt-4">
                      <QuantityControl
                        value={selection.games}
                        min={1}
                        max={10}
                        label="Games"
                        onChange={(games) => setSelection((current) => ({ ...current, games }))}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {isWins ? (
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
                    <SectionHeader title="Number of Wins" description="Choose how many competitive wins you need." />
                    <div className="mt-4">
                      <QuantityControl
                        value={selection.wins}
                        min={1}
                        label="Wins"
                        onChange={(wins) => setSelection((current) => ({ ...current, wins }))}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {isHero ? (
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
                          setSelection((current) => ({ ...current, specificHero: event.target.value }))
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
              ) : null}

              {isUnrated ? (
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
              ) : null}

              <div className="h-px bg-white/[0.07]" />

              <ServiceDetails
                selection={selection}
                showPlatform={!isHero}
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
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0B0C0A]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-[#7A63F2]/[0.055] to-transparent p-5">
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.15em] text-[#BDB2FF]/60">
                  Order Summary
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{service.name}</p>
              </div>

              <div className="p-5">
                {isRank ? (
                  <SummaryRankPair
                    currentRank={selection.currentRank}
                    currentDivision={selection.currentDivision}
                    targetRank={selection.targetRank}
                    targetDivision={selection.targetDivision}
                  />
                ) : null}

                <div className={isRank ? "mt-4" : ""}>
                  <SummaryRows rows={serviceRows} />
                </div>

                <div className="my-5 h-px bg-white/[0.08]" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/30">
                      Pricing
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/62">
                      Available after final configuration
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-5 w-full cursor-not-allowed border border-white/[0.06] bg-white/[0.055] text-white/35 opacity-100 shadow-none hover:bg-white/[0.055] hover:text-white/35"
                  size="lg"
                  disabled
                >
                  Checkout unavailable
                </Button>

                <div className="mt-4 flex gap-2 text-[10px] leading-4 text-white/35">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                  <span>Your selected options stay visible here before checkout.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#080B09]/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">{service.name}</p>
            <p className="truncate text-sm font-semibold text-white/65">Pricing pending</p>
          </div>
          <Button
            disabled
            className="min-w-[10rem] cursor-not-allowed border border-white/[0.06] bg-white/[0.055] text-white/35 opacity-100 shadow-none hover:bg-white/[0.055] hover:text-white/35"
          >
            Checkout unavailable
          </Button>
        </div>
      </div>
    </div>
  );
}
