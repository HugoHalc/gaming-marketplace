"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crosshair,
  EyeOff,
  MonitorPlay,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { MarvelRivalsServiceFoundation } from "@/features/catalog/data/marvel-rivals-foundation";
import {
  GameConfiguratorColumns,
  GameConfiguratorPanel,
  GameMobileOrderBar,
  GameOrderAside,
} from "./game-configurator-family-shell";
import { AccountBoostTrust } from "./account-boost-trust";
import {
  calculateMarvelHeroProficiencyPrice,
  formatMarvelUsd,
} from "@/features/configurator/data/marvel-rivals-pricing";

type BoostMethod = "solo" | "duo";
type ExtraKey = "playOffline" | "streaming" | "expressDelivery";

type Selection = {
  hero: string;
  currentProficiency: number;
  targetProficiency: number;
  region: string;
  platform: string;
  boostMethod: BoostMethod;
  extras: Record<ExtraKey, boolean>;
};

const MAX_PROFICIENCY = 70;
const MAX_CURRENT_PROFICIENCY = MAX_PROFICIENCY - 1;

const heroes = [
  "Adam Warlock",
  "Angela",
  "Black Cat",
  "Black Panther",
  "Black Widow",
  "Blade",
  "Captain America",
  "Cloak & Dagger",
  "Cyclops",
  "Daredevil",
  "Deadpool",
  "Devil Dinosaur",
  "Doctor Strange",
  "Elsa Bloodstone",
  "Emma Frost",
  "Gambit",
  "Gorr the God Butcher",
  "Groot",
  "Hawkeye",
  "Hela",
  "Hulk",
  "Human Torch",
  "Invisible Woman",
  "Iron Fist",
  "Iron Man",
  "Jeff the Land Shark",
  "Jubilee",
  "Loki",
  "Luna Snow",
  "Magik",
  "Magneto",
  "Mantis",
  "Mister Fantastic",
  "Moon Knight",
  "Namor",
  "Peni Parker",
  "Phoenix",
  "Psylocke",
  "Rocket Raccoon",
  "Rogue",
  "Scarlet Witch",
  "Spider-Man",
  "Squirrel Girl",
  "Star-Lord",
  "Storm",
  "The Hood",
  "The Punisher",
  "The Thing",
  "Thor",
  "Ultron",
  "Venom",
  "White Fox",
  "Winter Soldier",
  "Wolverine",
] as const;

const regions = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "middle-east", label: "Middle East" },
  { value: "south-america", label: "South America" },
  { value: "asia-pacific", label: "Asia-Pacific" },
] as const;

const platforms = [
  {
    value: "pc",
    label: "PC",
    color: "text-sky-300",
  },
  {
    value: "xbox",
    label: "Xbox",
    color: "text-green-300",
  },
  {
    value: "playstation",
    label: "PlayStation",
    color: "text-blue-300",
  },
] as const;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function HeroSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#A38CFF]/[0.14] bg-[#7A63F2]/[0.045] text-[#CEC5FF]/80">
            <Crosshair className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CEC5FF]/65">
              Hero
            </p>
            <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
              {value || "Select your hero"}
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 text-[10px] font-medium text-white/35 sm:inline">
          54 heroes
        </span>
      </div>

      <div className="relative mt-4">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Hero"
          className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs font-semibold text-white outline-none transition-colors hover:border-white/[0.14] focus:border-[#A38CFF]/[0.22]"
        >
          <option value="">Select a hero</option>
          {heroes.map((hero) => (
            <option key={hero} value={hero}>
              {hero}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      </div>
    </div>
  );
}

function ProficiencyControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const range = Math.max(1, max - min);
  const progress = max === min ? 100 : ((value - min) / range) * 100;

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#090D0B] p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A0AAA4]">
            {label}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-gaming-value text-[2.35rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
              {value}
            </span>
            <span className="pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/35">
              proficiency
            </span>
          </div>
        </div>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value) || min, min, max))}
          className="font-gaming-value h-10 w-16 rounded-xl border border-white/[0.09] bg-black/20 px-2 text-center text-base font-bold text-white outline-none focus:border-[#A38CFF]/[0.22]"
        />
      </div>

      <input
        aria-label={`${label} slider`}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-transparent accent-[#7A63F2]"
        style={{
          background: `linear-gradient(to right, rgba(122,99,242,.68) 0%, rgba(122,99,242,.68) ${progress}%, rgba(255,255,255,.07) ${progress}%, rgba(255,255,255,.07) 100%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/30">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function ExtraCard({
  checked,
  onChange,
  icon,
  title,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onChange}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-200 ${
        disabled
          ? "cursor-not-allowed border-white/[0.05] bg-[#090D0B] opacity-40"
          : checked
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

function HeroSummary({ selection }: { selection: Selection }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.04] text-[#CEC5FF]/75">
          <Crosshair className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Hero</p>
          <p className="font-gaming-value mt-0.5 truncate text-sm font-bold text-[#F4F7F5]">
            {selection.hero || "Not selected"}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-white/[0.06] pt-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current</p>
          <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">
            {selection.currentProficiency}
          </p>
        </div>
        <ArrowRight className="size-3.5 text-[#CEC5FF]/35" />
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Target</p>
          <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">
            {selection.targetProficiency}
          </p>
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

export function MarvelRivalsHeroConfigurator({
  service,
}: {
  service: MarvelRivalsServiceFoundation;
}) {
  const [selection, setSelection] = useState<Selection>({
    hero: "",
    currentProficiency: 1,
    targetProficiency: 2,
    region: "north-america",
    platform: "pc",
    boostMethod: "solo",
    extras: {
      playOffline: false,
      streaming: false,
      expressDelivery: false,
    },
  });

  function setCurrentProficiency(currentProficiency: number) {
    const nextCurrent = clamp(currentProficiency, 1, MAX_CURRENT_PROFICIENCY);
    setSelection((current) => ({
      ...current,
      currentProficiency: nextCurrent,
      targetProficiency:
        current.targetProficiency <= nextCurrent
          ? Math.min(MAX_PROFICIENCY, nextCurrent + 1)
          : current.targetProficiency,
    }));
  }

  function setTargetProficiency(targetProficiency: number) {
    setSelection((current) => ({
      ...current,
      targetProficiency: clamp(
        targetProficiency,
        current.currentProficiency + 1,
        MAX_PROFICIENCY,
      ),
    }));
  }

  function toggleExtra(key: ExtraKey) {
    setSelection((current) => {
      if (key === "playOffline" && current.boostMethod === "duo") return current;

      return {
        ...current,
        extras: { ...current.extras, [key]: !current.extras[key] },
      };
    });
  }

  const selectedExtras = useMemo(
    () => extraDefinitions.filter((item) => selection.extras[item.key]).map((item) => item.title),
    [selection.extras],
  );

  const priceQuote = useMemo(
    () =>
      calculateMarvelHeroProficiencyPrice({
        currentProficiency: selection.currentProficiency,
        targetProficiency: selection.targetProficiency,
        boostMethod: selection.boostMethod,
        extras: selection.extras,
      }),
    [selection],
  );
  const totalPrice = formatMarvelUsd(priceQuote.total);

  const summaryRows = useMemo(() => {
    const serverLabel =
      regions.find((item) => item.value === selection.region)?.label ?? "North America";
    const platformLabel = platforms.find((item) => item.value === selection.platform)?.label ?? "PC";
    const rows: Array<[string, string]> = [
      ["Server", serverLabel],
      ["Platform", platformLabel],
      ["Boost Method", selection.boostMethod === "solo" ? "Solo" : "Duo"],
    ];

    if (selectedExtras.length) rows.push(["Extras", selectedExtras.join(", ")]);
    return rows;
  }, [selectedExtras, selection.boostMethod, selection.platform, selection.region]);

  return (
    <>
      <GameConfiguratorColumns>
        <GameConfiguratorPanel
          eyebrow={`Marvel Rivals ${service.name}`}
          description="Choose your hero and configure Hero Proficiency from your current level to your target level."
          accentTextClass="text-[#CEC5FF]/65"
          accentGradientClass="from-[#7A63F2]/[0.055]"
          statusLabel="Live pricing"
        >
          <div className="space-y-4 p-4 sm:space-y-5 sm:p-5 lg:p-6">
            <HeroSelector
              value={selection.hero}
              onChange={(hero) => setSelection((current) => ({ ...current, hero }))}
            />

            <div className="h-px bg-white/[0.07]" />

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                    Hero proficiency
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Set your current proficiency and target level from 1 to 70.
                  </p>
                </div>
                <span className="hidden text-[10px] font-medium text-white/35 sm:inline">1–70</span>
              </div>

              <div className="relative mt-3 grid gap-3 lg:grid-cols-2">
                <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-[#CEC5FF]/45 lg:grid">
                  <ArrowRight className="size-3.5" />
                </span>
                <ProficiencyControl
                  label="Current proficiency"
                  value={selection.currentProficiency}
                  min={1}
                  max={MAX_CURRENT_PROFICIENCY}
                  onChange={setCurrentProficiency}
                />
                <ProficiencyControl
                  label="Target proficiency"
                  value={selection.targetProficiency}
                  min={selection.currentProficiency + 1}
                  max={MAX_PROFICIENCY}
                  onChange={setTargetProficiency}
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
                          aria-hidden="true"
                        />
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
              <p className="mt-1 text-sm font-semibold text-white">
                Choose how you want the service completed.
              </p>
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
                        setSelection((current) => ({
                          ...current,
                          boostMethod: method.value,
                          extras:
                            method.value === "duo"
                              ? { ...current.extras, playOffline: false }
                              : current.extras,
                        }))
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
                        <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">
                          {method.description}
                        </span>
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

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {extraDefinitions.map((extra) => (
                  <ExtraCard
                    key={extra.key}
                    checked={selection.extras[extra.key]}
                    disabled={extra.key === "playOffline" && selection.boostMethod === "duo"}
                    onChange={() => toggleExtra(extra.key)}
                    icon={extra.icon}
                    title={extra.title}
                    description={
                      extra.key === "playOffline" && selection.boostMethod === "duo"
                        ? "Available with Solo only."
                        : extra.description
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </GameConfiguratorPanel>

        <GameOrderAside
          gameLabel={`Marvel Rivals ${service.name}`}
          statusLabel="Calculated"
          statusTone="ready"
          progression={<HeroSummary selection={selection} />}
          metadata={<SummaryRows rows={summaryRows} />}
          totalLabel="BoostingPedia price"
          totalValue={totalPrice}
        />
      </GameConfiguratorColumns>

      <GameMobileOrderBar label="USD" value={totalPrice} />
    </>
  );
}
