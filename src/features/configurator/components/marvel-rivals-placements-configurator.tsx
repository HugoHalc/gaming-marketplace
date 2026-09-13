"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Crosshair,
  EyeOff,
  MonitorPlay,
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
import { AccountBoostTrust } from "./account-boost-trust";

type RankKey = (typeof marvelRivalsRanks)[number]["key"];
type Division = (typeof marvelRivalsDivisionOptions)[number];
type PreviousRank = RankKey | "unranked";
type BoostMethod = "solo" | "duo";
type Role = "duelist" | "vanguard" | "strategist" | "any";
type ExtraKey = "playOffline" | "specificHeroes" | "streaming" | "expressDelivery";

type Selection = {
  previousRank: PreviousRank;
  previousDivision: Division | null;
  matches: number;
  region: string;
  platform: string;
  boostMethod: BoostMethod;
  role: Role;
  extras: Record<ExtraKey, boolean>;
};

const MAX_PLACEMENT_MATCHES = 10;

const regions = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "middle-east", label: "Middle East" },
  { value: "south-america", label: "South America" },
  { value: "asia-pacific", label: "Asia-Pacific" },
] as const;

const platforms = [
  { value: "pc", label: "PC", color: "text-sky-300" },
  { value: "xbox", label: "Xbox", color: "text-green-300" },
  { value: "playstation", label: "PlayStation", color: "text-blue-300" },
] as const;

const roles: Array<{ value: Role; label: string }> = [
  { value: "duelist", label: "Duelist" },
  { value: "vanguard", label: "Vanguard" },
  { value: "strategist", label: "Strategist" },
  { value: "any", label: "Any" },
];

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

function rankDefinition(rank: RankKey) {
  return marvelRivalsRanks.find((item) => item.key === rank) ?? marvelRivalsRanks[0];
}

function rankHasDivisions(rank: RankKey) {
  return rankDefinition(rank).hasDivisions;
}

function previousRankLabel(rank: PreviousRank, division: Division | null) {
  if (rank === "unranked") return "Unranked";
  const label = rankDefinition(rank).label;
  return division ? `${label} ${division}` : label;
}

function RankBadge({
  rank,
  selected = false,
  compact = false,
}: {
  rank: RankKey;
  selected?: boolean;
  compact?: boolean;
}) {
  const definition = rankDefinition(rank);
  const imageClass = compact ? "h-10 w-10" : "h-[2.7rem] w-[2.7rem]";

  return (
    <span className={`relative grid ${compact ? "size-11" : "size-[3.1rem]"} place-items-center`}>
      <Image
        src={definition.badge}
        alt=""
        width={52}
        height={52}
        className={`${imageClass} object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,.45)]`}
      />
      {selected ? (
        <span className="absolute -right-0.5 -top-0.5 z-[2] grid size-4 place-items-center rounded-full border border-[#39E56F]/35 bg-[#39E56F] text-[#050807]">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}

function PreviousRankSelector({
  rank,
  division,
  onRankChange,
  onDivisionChange,
}: {
  rank: PreviousRank;
  division: Division | null;
  onRankChange: (rank: PreviousRank) => void;
  onDivisionChange: (division: Division) => void;
}) {
  const unranked = rank === "unranked";

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.035]">
          {unranked ? (
            <span className="grid size-9 place-items-center rounded-full border border-white/[0.10] bg-white/[0.025] text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
              NR
            </span>
          ) : (
            <RankBadge rank={rank} compact />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CEC5FF]/65">
            Previous rank
          </p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
            {previousRankLabel(rank, division)}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={unranked}
        onClick={() => onRankChange("unranked")}
        className={`mt-4 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-semibold transition-colors ${
          unranked
            ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white"
            : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
        }`}
      >
        <span>Unranked</span>
        {unranked ? (
          <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        ) : null}
      </button>

      <div className="mt-2 grid grid-cols-4 gap-2">
        {marvelRivalsRanks.map((item) => {
          const active = rank === item.key;
          return (
            <button
              key={item.key}
              type="button"
              title={item.label}
              aria-pressed={active}
              onClick={() => onRankChange(item.key)}
              className={`group/rank relative flex min-w-0 flex-col items-center overflow-hidden rounded-xl border px-1.5 py-2 transition-[border-color,background-color,transform] duration-200 ease-out motion-reduce:transition-none ${
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
              <RankBadge rank={item.key} selected={active} />
              <span
                className={`mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-semibold leading-3.5 transition-colors ${
                  active ? "text-white" : "text-white/68 group-hover/rank:text-white/90"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {!unranked && rankHasDivisions(rank) ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Division
          </span>
          {marvelRivalsDivisionOptions.map((item) => {
            const active = division === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onDivisionChange(item)}
                className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-[border-color,background-color,color] ${
                  active
                    ? "border-[#39E56F]/28 bg-[#39E56F]/[0.04] text-[#F4F7F5]"
                    : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PlacementMatches({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const sliderProgress = ((value - 1) / (MAX_PLACEMENT_MATCHES - 1)) * 100;

  return (
    <div className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0AAA4]">
            Placement matches
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-gaming-value text-[2.5rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
              {value}
            </span>
            <span className="pb-1 text-xs font-medium text-[#A0AAA4]">matches selected</span>
          </div>
        </div>

        <div className="flex h-10 items-center rounded-xl border border-white/[0.09] bg-black/20 px-3">
          <input
            aria-label="Placement matches"
            type="number"
            min={1}
            max={MAX_PLACEMENT_MATCHES}
            value={value}
            onChange={(event) => {
              const next = Math.max(1, Math.min(MAX_PLACEMENT_MATCHES, Number(event.target.value) || 1));
              onChange(next);
            }}
            className="font-gaming-value w-12 bg-transparent text-center text-base font-bold text-white outline-none"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-[#090D0B] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.13em] text-[#CEC5FF]/65">
            Placement matches
          </p>
          <span className="text-[10px] font-medium text-white/38">1–10 matches</span>
        </div>
        <div className="mt-3 grid grid-cols-10 gap-1.5">
          {Array.from({ length: MAX_PLACEMENT_MATCHES }).map((_, index) => {
            const included = index < value;
            const finalIncluded = included && index === value - 1;
            return (
              <span
                key={index}
                className={`grid h-3.5 w-full place-items-center rounded-full border transition-[border-color,background-color] duration-200 ${
                  included
                    ? finalIncluded
                      ? "border-[#A38CFF]/55 bg-[#7A63F2]/80"
                      : "border-[#A38CFF]/35 bg-[#7A63F2]/45"
                    : "border-white/[0.10] bg-white/[0.03]"
                }`}
              >
                {finalIncluded && value === MAX_PLACEMENT_MATCHES ? (
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
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-transparent accent-[#7A63F2]"
        style={{
          background: `linear-gradient(to right, rgba(122,99,242,.68) 0%, rgba(122,99,242,.68) ${sliderProgress}%, rgba(255,255,255,.07) ${sliderProgress}%, rgba(255,255,255,.07) 100%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/30">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>10</span>
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

function ExtraCard({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-200 ${
        checked
          ? "border-[#A38CFF]/[0.16] bg-[#131B17]"
          : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg border ${
          checked
            ? "border-[#A38CFF]/[0.14] bg-black/20 text-[#CEC5FF]/80"
            : "border-white/[0.07] bg-white/[0.025] text-white/55 group-hover/extra:text-white/75"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]" title={description}>
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
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
}

function PreviousRankSummary({ selection }: { selection: Selection }) {
  const previousRank = selection.previousRank;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {previousRank === "unranked" ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
            NR
          </span>
        ) : (
          <RankBadge rank={previousRank} compact />
        )}
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">
            Previous rank
          </p>
          <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">
            {previousRankLabel(selection.previousRank, selection.previousDivision)}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Matches</p>
          <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">{selection.matches}</p>
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

export function MarvelRivalsPlacementsConfigurator({
  service,
}: {
  service: MarvelRivalsServiceFoundation;
}) {
  const [selection, setSelection] = useState<Selection>({
    previousRank: "unranked",
    previousDivision: null,
    matches: 1,
    region: "north-america",
    platform: "pc",
    boostMethod: "solo",
    role: "any",
    extras: {
      playOffline: false,
      specificHeroes: false,
      streaming: false,
      expressDelivery: false,
    },
  });

  function setPreviousRank(previousRank: PreviousRank) {
    setSelection((current) => ({
      ...current,
      previousRank,
      previousDivision:
        previousRank === "unranked" || !rankHasDivisions(previousRank) ? null : "III",
    }));
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

  const summaryRows = useMemo(() => {
    const serverLabel = regions.find((item) => item.value === selection.region)?.label ?? "North America";
    const platformLabel = platforms.find((item) => item.value === selection.platform)?.label ?? "PC";
    const roleLabel = roles.find((item) => item.value === selection.role)?.label ?? "Any";
    const rows: Array<[string, string]> = [
      ["Server", serverLabel],
      ["Platform", platformLabel],
      ["Boost Method", selection.boostMethod === "solo" ? "Solo" : "Duo"],
      ["Role", roleLabel],
    ];

    if (selectedExtras.length) rows.push(["Extras", selectedExtras.join(", ")]);
    return rows;
  }, [selectedExtras, selection.boostMethod, selection.platform, selection.region, selection.role]);

  return (
    <>
      <GameConfiguratorColumns>
        <GameConfiguratorPanel
          eyebrow={`Marvel Rivals ${service.name}`}
          description="Choose your previous rank and configure up to 10 placement matches."
          accentTextClass="text-[#CEC5FF]/65"
          accentGradientClass="from-[#7A63F2]/[0.055]"
          statusLabel="Pricing pending"
        >
          <div className="space-y-4 p-4 sm:space-y-5 sm:p-5 lg:p-6">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
              <PreviousRankSelector
                rank={selection.previousRank}
                division={selection.previousDivision}
                onRankChange={setPreviousRank}
                onDivisionChange={(previousDivision) =>
                  setSelection((current) => ({ ...current, previousDivision }))
                }
              />

              <div className="border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <PlacementMatches
                  value={selection.matches}
                  onChange={(matches) => setSelection((current) => ({ ...current, matches }))}
                />
              </div>
            </div>

            <div className="h-px bg-white/[0.07]" />

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Server
                </p>
                <div className="relative mt-3">
                  <select
                    value={selection.region}
                    onChange={(event) =>
                      setSelection((current) => ({ ...current, region: event.target.value }))
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs font-semibold text-white outline-none transition-colors hover:border-white/[0.14] focus:border-[#A38CFF]/[0.18]"
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

              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Platform
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {platforms.map((platform) => {
                    const active = selection.platform === platform.value;
                    return (
                      <button
                        key={platform.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setSelection((current) => ({ ...current, platform: platform.value }))
                        }
                        className={`flex h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 text-left transition-colors ${
                          active
                            ? "border-[#A38CFF]/[0.18] bg-[#131B17] text-white"
                            : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                        }`}
                      >
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-lg border ${
                            active
                              ? "border-white/[0.12] bg-[#090D0B]"
                              : "border-white/[0.08] bg-white/[0.02]"
                          } ${platform.color}`}
                        >
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
            </div>

            <div className="h-px bg-white/[0.07]" />

            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Boost method
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Choose how you want the service completed.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    value: "solo" as const,
                    title: "Solo",
                    description: "Our booster plays directly on your account.",
                    icon: <Target className="size-4" />,
                  },
                  {
                    value: "duo" as const,
                    title: "Duo",
                    description: "You play alongside your booster.",
                    icon: <Users className="size-4" />,
                  },
                ].map((method) => {
                  const active = selection.boostMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setSelection((current) => ({ ...current, boostMethod: method.value }))
                      }
                      className={`flex min-h-[4.4rem] items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-200 ${
                        active
                          ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035]"
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
                        {method.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-[#F4F7F5]">{method.title}</span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">{method.description}</span>
                      </span>
                      <span
                        aria-hidden="true"
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
              <AccountBoostTrust
                selected={selection.boostMethod === "solo"}
                accent="violet"
                showDescription
                methodLabel="Solo"
              />
            </div>

            <div className="h-px bg-white/[0.07]" />

            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Role
              </p>
              <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/10 p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {roles.map((role) => {
                    const active = selection.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelection((current) => ({ ...current, role: role.value }))}
                        className={`flex h-10 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ${
                          active
                            ? "border-[#A38CFF]/40 bg-[#7A63F2]/[0.10] text-white"
                            : "border-white/[0.06] bg-white/[0.035] text-white/65 hover:border-white/[0.12] hover:bg-white/[0.055] hover:text-white"
                        }`}
                      >
                        {role.label}
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
                    Extras
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Optional upgrades.</p>
                </div>
                <span className="text-[10px] text-white/35">
                  {selectedExtras.length ? `${selectedExtras.length} selected` : "Nothing preselected"}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {extraDefinitions.map((extra) => (
                  <ExtraCard
                    key={extra.key}
                    checked={selection.extras[extra.key]}
                    onChange={() => toggleExtra(extra.key)}
                    icon={extra.icon}
                    title={extra.title}
                    description={extra.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </GameConfiguratorPanel>

        <GameOrderAside
          gameLabel={`Marvel Rivals ${service.name}`}
          statusLabel="Pending"
          progression={<PreviousRankSummary selection={selection} />}
          metadata={<SummaryRows rows={summaryRows} />}
          totalLabel="Pricing pending"
        />
      </GameConfiguratorColumns>

      <GameMobileOrderBar label="Pricing pending" />
    </>
  );
}
