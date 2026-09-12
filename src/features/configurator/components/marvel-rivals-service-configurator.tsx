"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crosshair,
  EyeOff,
  Gamepad2,
  Layers3,
  LockKeyhole,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
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

type ExtraKey = "playOffline" | "specificHeroes" | "streaming" | "expressDelivery";

type FoundationSelection = {
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
    description: "Stay discreet and reduce unwanted friend invites.",
    icon: <EyeOff className="size-4" />,
  },
  {
    key: "specificHeroes",
    title: "Specific Heroes",
    description: "Save hero preferences for applicable service fulfillment.",
    icon: <Crosshair className="size-4" />,
  },
  {
    key: "streaming",
    title: "Streaming",
    description: "Watch your service progress through the supported streaming method.",
    icon: <MonitorPlay className="size-4" />,
  },
  {
    key: "expressDelivery",
    title: "Express Delivery",
    description: "Keep the expedited-delivery option ready for the pricing phase.",
    icon: <Zap className="size-4" />,
  },
];

function rankLabel(rank: string) {
  return marvelRivalsRanks.find((item) => item.key === rank)?.label ?? rank;
}

function firstHigherRank(currentRank: string) {
  const index = rankOrder.indexOf(currentRank as (typeof rankOrder)[number]);
  return rankOrder[Math.min(rankOrder.length - 1, Math.max(0, index + 1))] ?? rankOrder[1];
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A38CFF]/75">{eyebrow}</p>
      <h2 className="mt-1.5 text-base font-semibold text-[#F4F7F5] sm:text-lg">{title}</h2>
      {description ? <p className="mt-1 text-xs leading-5 text-[#A0AAA4] sm:text-sm">{description}</p> : null}
    </div>
  );
}

function RankMark({ mark, selected }: { mark: string; selected?: boolean }) {
  return (
    <span className={`relative grid size-11 place-items-center rounded-xl border text-[10px] font-black tracking-[-0.04em] ${selected ? "border-[#A38CFF]/25 bg-[#7A63F2]/[0.10] text-[#D5CCFF]" : "border-white/[0.08] bg-white/[0.025] text-white/45"}`}>
      <ShieldCheck className="absolute size-7 opacity-[0.08]" strokeWidth={1.2} />
      <span className="relative">{mark}</span>
    </span>
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
  const selected = marvelRivalsRanks.find((rank) => rank.key === value);
  const isUnranked = value === "unranked";

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        {isUnranked ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[10px] font-black text-white/45">NR</span>
        ) : (
          <RankMark mark={selected?.mark ?? "?"} selected />
        )}
        <div className="min-w-0">
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A38CFF]/70">{target ? "Target rank" : allowUnranked ? "Previous season rank" : "Current rank"}</p>
          <p className="font-gaming-value mt-0.5 truncate text-xl font-bold tracking-[-0.035em] text-[#F4F7F5]">{isUnranked ? "Unranked" : rankLabel(value)}</p>
        </div>
      </div>

      {allowUnranked ? (
        <button
          type="button"
          onClick={() => onChange("unranked")}
          aria-pressed={isUnranked}
          className={`mt-4 flex min-h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold transition-colors ${isUnranked ? "border-[#39E56F]/30 bg-[#39E56F]/[0.04] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/60 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}
        >
          <span>Unranked</span>
          {isUnranked ? <span className="grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
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
              className={`group/rank relative flex min-w-0 flex-col items-center rounded-xl border px-1.5 py-2 transition-[border-color,background-color] disabled:cursor-not-allowed disabled:opacity-25 ${active ? "border-[#A38CFF]/25 bg-[#7A63F2]/[0.075]" : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"}`}
            >
              <RankMark mark={rank.mark} selected={active} />
              <span className={`mt-1.5 line-clamp-2 min-h-7 w-full text-center text-[10px] font-semibold leading-3.5 ${active ? "text-white" : "text-white/60"}`}>{rank.label}</span>
              {active ? <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#39E56F] text-[#050807]"><Check className="size-2.5" strokeWidth={3} /></span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DivisionSelector({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Division when applicable</span>
      {marvelRivalsDivisionOptions.map((division) => (
        <button
          key={division}
          type="button"
          aria-pressed={value === division}
          onClick={() => onChange(value === division ? null : division)}
          className={`h-8 min-w-10 rounded-lg border px-3 text-xs font-bold transition-colors ${value === division ? "border-[#A38CFF]/25 bg-[#7A63F2]/[0.075] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:text-white"}`}
        >
          {division}
        </button>
      ))}
      <span className="basis-full text-[10px] leading-4 text-white/30">Division availability will follow the confirmed Marvel Rivals rank rules before purchase is enabled.</span>
    </div>
  );
}

function QuantityControl({ value, min, max, label, onChange }: { value: number; min: number; max?: number; label: string; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">{label}</p>
      <div className="mt-3 grid grid-cols-[2.75rem_1fr_2.75rem] gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white">−</button>
        <div className="grid h-11 place-items-center rounded-xl border border-[#A38CFF]/[0.16] bg-[#7A63F2]/[0.045]">
          <span className="font-gaming-value text-lg font-bold text-white">{value}</span>
        </div>
        <button type="button" onClick={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))} className="h-11 rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white">+</button>
      </div>
    </div>
  );
}

function PendingField({ title, message, icon }: { title: string; message: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-3.5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#A38CFF]/[0.10] bg-[#7A63F2]/[0.035] text-[#B6A8FF]">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#F4F7F5]">{title}</p>
          <p className="mt-1 text-[10px] leading-4 text-[#A0AAA4]">{message}</p>
        </div>
        <LockKeyhole className="ml-auto mt-1 size-3.5 shrink-0 text-white/25" />
      </div>
    </div>
  );
}

function BoostMethodFoundation() {
  return (
    <div>
      <SectionHeader eyebrow="Boost method" title="Solo / Duo foundation" description="Selection will be enabled when the available service methods are finalized." />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[{ title: "Solo", icon: <Target className="size-4" /> }, { title: "Duo", icon: <Users className="size-4" /> }].map((item) => (
          <button key={item.title} type="button" disabled className="flex min-h-12 items-center gap-3 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 text-left text-white/45 disabled:cursor-not-allowed">
            <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025]">{item.icon}</span>
            <span className="text-xs font-semibold">{item.title}</span>
            <LockKeyhole className="ml-auto size-3.5 text-white/20" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Extras({ selection, onToggle }: { selection: FoundationSelection; onToggle: (key: ExtraKey) => void }) {
  return (
    <div>
      <SectionHeader eyebrow="Customize" title="Optional upgrades" description="Choose the options you want to include. Pricing will appear once service pricing is available." />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {extraDefinitions.map((extra) => {
          const checked = selection.extras[extra.key];
          return (
            <button
              key={extra.key}
              type="button"
              aria-pressed={checked}
              onClick={() => onToggle(extra.key)}
              className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${checked ? "border-[#A38CFF]/[0.18] bg-[#7A63F2]/[0.055]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"}`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg border ${checked ? "border-[#A38CFF]/[0.16] bg-[#7A63F2]/[0.06] text-[#C7B9FF]" : "border-white/[0.07] bg-white/[0.025] text-white/50"}`}>{extra.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[#F4F7F5]">{extra.title}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">{extra.description}</span>
              </span>
              <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]" : "border-white/[0.12] bg-white/[0.02] text-transparent"}`}><Check className="size-2.5" strokeWidth={3} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ServiceSidebar({ activeSlug }: { activeSlug: string }) {
  return (
    <aside className="hidden xl:block xl:w-[13.5rem] 2xl:w-[14.5rem]">
      <div className="sticky top-24 rounded-[1.25rem] border border-white/[0.07] bg-[#080B09] p-3">
        <div className="px-2 pb-3 pt-1">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.15em] text-[#A38CFF]/70">Marvel Rivals</p>
          <p className="mt-1 text-sm font-semibold text-white">Services</p>
        </div>
        <nav aria-label="Marvel Rivals services" className="space-y-1">
          {marvelRivalsServices.map((item) => {
            const active = item.slug === activeSlug;
            return (
              <Link key={item.slug} href={`/games/marvel-rivals/${item.slug}`} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${active ? "border-[#A38CFF]/[0.18] bg-[#7A63F2]/[0.06] text-white" : "border-transparent text-white/50 hover:border-white/[0.07] hover:bg-white/[0.025] hover:text-white/80"}`}>
                <span className={`size-1.5 rounded-full ${active ? "bg-[#39E56F]" : "bg-white/15"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function MobileServiceNav({ activeSlug }: { activeSlug: string }) {
  return (
    <nav aria-label="Marvel Rivals services" className="mb-3 xl:hidden">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max snap-x snap-mandatory gap-2">
          {marvelRivalsServices.map((item) => {
            const active = item.slug === activeSlug;
            return (
              <Link key={item.slug} href={`/games/marvel-rivals/${item.slug}`} aria-current={active ? "page" : undefined} className={`inline-flex h-10 snap-start items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-colors ${active ? "border-[#A38CFF]/[0.20] bg-[#7A63F2]/[0.065] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:text-white"}`}>
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

export function MarvelRivalsServiceConfigurator({ service }: { service: MarvelRivalsServiceFoundation }) {
  const isRank = service.slug === "rank-boost";
  const isPlacements = service.slug === "placement-matches";
  const isWins = service.slug === "wins";
  const isHero = service.slug === "hero-boost";
  const isUnrated = service.slug === "unrated-games";

  const [selection, setSelection] = useState<FoundationSelection>({
    currentRank: "bronze",
    currentDivision: null,
    targetRank: "silver",
    targetDivision: null,
    previousRank: "unranked",
    previousDivision: null,
    wins: 1,
    games: 1,
    currentHeroLevel: 1,
    desiredHeroLevel: 2,
    extras: {
      playOffline: false,
      specificHeroes: false,
      streaming: false,
      expressDelivery: false,
    },
  });

  function setCurrentRank(value: string) {
    setSelection((current) => ({
      ...current,
      currentRank: value,
      targetRank: rankOrder.indexOf(current.targetRank as (typeof rankOrder)[number]) <= rankOrder.indexOf(value as (typeof rankOrder)[number]) ? firstHigherRank(value) : current.targetRank,
      currentDivision: null,
      targetDivision: null,
    }));
  }

  function toggleExtra(key: ExtraKey) {
    setSelection((current) => ({ ...current, extras: { ...current.extras, [key]: !current.extras[key] } }));
  }

  const selectedExtras = useMemo(() => extraDefinitions.filter((item) => selection.extras[item.key]).map((item) => item.title), [selection.extras]);

  const serviceRows = useMemo(() => {
    const rows: Array<[string, string]> = [];
    if (isRank) {
      rows.push(["Progression", `${rankLabel(selection.currentRank)}${selection.currentDivision ? ` ${selection.currentDivision}` : ""} → ${rankLabel(selection.targetRank)}${selection.targetDivision ? ` ${selection.targetDivision}` : ""}`]);
    }
    if (isPlacements) {
      rows.push(["Previous rank", selection.previousRank === "unranked" ? "Unranked" : `${rankLabel(selection.previousRank)}${selection.previousDivision ? ` ${selection.previousDivision}` : ""}`], ["Games", String(selection.games)]);
    }
    if (isWins) rows.push(["Current rank", `${rankLabel(selection.currentRank)}${selection.currentDivision ? ` ${selection.currentDivision}` : ""}`], ["Wins", String(selection.wins)]);
    if (isHero) rows.push(["Hero level", `${selection.currentHeroLevel} → ${selection.desiredHeroLevel}`], ["Specific hero", "Available before ordering"]);
    if (isUnrated) rows.push(["Games", String(selection.games)]);
    rows.push(["Region", "Available before ordering"], ["Platform", "Available before ordering"], ["Boost method", "Available before ordering"]);
    if (selectedExtras.length) rows.push(["Extras", selectedExtras.join(", ")]);
    return rows;
  }, [isHero, isPlacements, isRank, isUnrated, isWins, selectedExtras, selection]);

  return (
    <div className="pb-[calc(5.75rem+env(safe-area-inset-bottom))] xl:pb-0">
      <MobileServiceNav activeSlug={service.slug} />

      <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
        <ServiceSidebar activeSlug={service.slug} />

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#080B09]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-[#7A63F2]/[0.07] via-transparent to-transparent px-4 py-4 sm:px-5 lg:px-6">
              <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A38CFF]/75">
                <Sparkles className="size-3.5" />
                Marvel Rivals · {service.name}
              </div>
              <p className="mt-1.5 text-sm text-[#A0AAA4]">Configure the service foundation. Pricing and purchase remain safely disabled.</p>
            </div>

            <div className="space-y-6 p-4 sm:p-5 lg:p-6">
              {isRank ? (
                <div>
                  <SectionHeader eyebrow="Competitive progression" title="Current → Target" description="Choose a valid target above your current rank. Division selection is prepared without assuming top-rank rules." />
                  <div className="relative mt-5 grid gap-5 lg:grid-cols-2">
                    <RankSelector value={selection.currentRank} onChange={setCurrentRank} />
                    <div className="relative border-t border-white/[0.07] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <span className="pointer-events-none absolute left-1/2 top-[-0.8rem] grid size-7 -translate-x-1/2 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-[#A38CFF]/60 lg:left-[-0.85rem] lg:top-5 lg:translate-x-0"><ArrowRight className="size-3.5" /></span>
                      <RankSelector value={selection.targetRank} target currentRank={selection.currentRank} onChange={(value) => setSelection((current) => ({ ...current, targetRank: value, targetDivision: null }))} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <DivisionSelector value={selection.currentDivision} onChange={(value) => setSelection((current) => ({ ...current, currentDivision: value }))} />
                    <DivisionSelector value={selection.targetDivision} onChange={(value) => setSelection((current) => ({ ...current, targetDivision: value }))} />
                  </div>
                </div>
              ) : null}

              {isPlacements ? (
                <div>
                  <SectionHeader eyebrow="Placement setup" title="Previous season rank" description="Use Unranked or select the previous competitive tier. Division remains optional until rank rules are confirmed." />
                  <div className="mt-5">
                    <RankSelector value={selection.previousRank} allowUnranked onChange={(value) => setSelection((current) => ({ ...current, previousRank: value, previousDivision: null }))} />
                    {selection.previousRank !== "unranked" ? <DivisionSelector value={selection.previousDivision} onChange={(value) => setSelection((current) => ({ ...current, previousDivision: value }))} /> : null}
                  </div>
                  <div className="mt-5 border-t border-white/[0.07] pt-5"><QuantityControl value={selection.games} min={1} label="Number of games" onChange={(games) => setSelection((current) => ({ ...current, games }))} /></div>
                </div>
              ) : null}

              {isWins ? (
                <div>
                  <SectionHeader eyebrow="Competitive wins" title="Current competitive position" description="Competitive Wins is quantity-based and does not introduce a desired-rank control." />
                  <div className="mt-5"><RankSelector value={selection.currentRank} onChange={setCurrentRank} /><DivisionSelector value={selection.currentDivision} onChange={(value) => setSelection((current) => ({ ...current, currentDivision: value }))} /></div>
                  <div className="mt-5 border-t border-white/[0.07] pt-5"><QuantityControl value={selection.wins} min={1} label="Number of wins" onChange={(wins) => setSelection((current) => ({ ...current, wins }))} /></div>
                </div>
              ) : null}

              {isHero ? (
                <div>
                  <SectionHeader eyebrow="Hero progression" title="Current → Desired hero level" description="Hero Boost uses BoostingPedia's compact progression controls. A canonical hero dataset is required before hero selection is enabled." />
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <QuantityControl value={selection.currentHeroLevel} min={1} label="Current hero level" onChange={(currentHeroLevel) => setSelection((current) => ({ ...current, currentHeroLevel, desiredHeroLevel: Math.max(current.desiredHeroLevel, currentHeroLevel + 1) }))} />
                    <QuantityControl value={selection.desiredHeroLevel} min={selection.currentHeroLevel + 1} label="Desired hero level" onChange={(desiredHeroLevel) => setSelection((current) => ({ ...current, desiredHeroLevel }))} />
                  </div>
                  <div className="mt-5">
                    <label className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]" htmlFor="marvel-specific-hero">Specific Hero</label>
                    <div className="relative mt-3">
                      <select id="marvel-specific-hero" disabled className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs text-white/45 outline-none disabled:cursor-not-allowed">
                        <option>Hero roster required before launch</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/25" />
                    </div>
                  </div>
                </div>
              ) : null}

              {isUnrated ? (
                <div>
                  <SectionHeader eyebrow="Unrated games" title="Simple game quantity" description="No rank selector is required for this service." />
                  <div className="mt-5"><QuantityControl value={selection.games} min={1} label="Number of games" onChange={(games) => setSelection((current) => ({ ...current, games }))} /></div>
                </div>
              ) : null}

              <div className="h-px bg-white/[0.07]" />

              <div>
                <SectionHeader eyebrow="Service details" title="Region & platform foundation" description="Region and platform options will be enabled before ordering." />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <PendingField title="Region / Server" message="Region options will be available before ordering." icon={<Layers3 className="size-4" />} />
                  {!isHero ? <PendingField title="Platform" message="Platform options will be available before ordering." icon={<Gamepad2 className="size-4" />} /> : null}
                </div>
              </div>

              <div className="h-px bg-white/[0.07]" />
              <BoostMethodFoundation />
              <div className="h-px bg-white/[0.07]" />
              <Extras selection={selection} onToggle={toggleExtra} />
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0B0C0A]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-[#7A63F2]/[0.075] to-transparent p-5">
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.15em] text-[#A38CFF]/70">Order Summary</p>
                <p className="mt-1 text-lg font-semibold text-white">{service.name}</p>
              </div>
              <div className="p-5">
                <div className="space-y-2.5">
                  {serviceRows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 text-xs">
                      <span className="text-white/38">{label}</span>
                      <span className="max-w-[12rem] text-right font-medium text-white/72">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="my-5 h-px bg-white/[0.08]" />
                <div className="rounded-xl border border-[#55D7E8]/[0.10] bg-[#55D7E8]/[0.025] p-3.5">
                  <div className="flex items-start gap-2.5">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#8BE4EF]/70" />
                    <div>
                      <p className="text-xs font-semibold text-white">Pricing not available yet</p>
                      <p className="mt-1 text-[10px] leading-4 text-[#A0AAA4]">This Marvel Rivals service is not purchasable yet. Checkout will remain disabled until pricing is available.</p>
                    </div>
                  </div>
                </div>

                <Button className="mt-5 w-full" size="lg" disabled>
                  Checkout unavailable
                </Button>
                <div className="mt-4 flex gap-2 text-[10px] leading-4 text-white/35">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                  <span>No payment or account-access request is triggered while checkout is unavailable.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#080B09]/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Marvel Rivals</p>
            <p className="truncate text-sm font-semibold text-white">Pricing unavailable</p>
          </div>
          <Button disabled className="min-w-[11rem]">Checkout unavailable</Button>
        </div>
      </div>
    </div>
  );
}
