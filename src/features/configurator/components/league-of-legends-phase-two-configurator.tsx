"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  ["1", "Tier 1", "$9.99 BM rate"],
  ["2", "Tier 2", "$6.99 BM rate"],
  ["3", "Tier 3", "$5.99 BM rate"],
  ["4", "Tier 4", "$2.99 BM rate"],
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
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
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-10 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
        active
          ? "border-amber-300/[0.22] bg-[#15170E] text-white"
          : "border-white/[0.08] bg-[#090D0B] text-white/62 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {meta ? <span className="text-[10px] font-bold text-white/42">{meta}</span> : null}
        {active ? <Check className="size-3.5 text-[#82F5A4]" /> : null}
      </span>
    </button>
  );
}

function Quantity({ value, min, max, label, helper, onChange }: {
  value: number;
  min: number;
  max: number;
  label: string;
  helper: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">{label}</p>
          <p className="mt-1 text-[10px] text-white/30">{helper}</p>
        </div>
        <span className="font-gaming-value text-xl font-bold text-amber-100">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-amber-500"
      />
      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/28"><span>{min}</span><span>{max}</span></div>
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
      className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        checked ? "border-amber-300/[0.20] bg-[#15170E]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-amber-100/65">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span className={`shrink-0 text-[10px] font-bold ${price === "FREE" ? "text-[#82F5A4]" : "text-amber-100/60"}`}>{price}</span>
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]">{description}</span>
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
    ...(isMastery ? { masteryMode: "marks", marks: 2, masteryPoints: 10000 } : {}),
    ...(isClash ? { clashTier: "1", games: 1, boosters: 1, boostMethod: "account" } : {}),
    playOffline: false,
    championsPreferences: false,
    streaming: false,
    expressDelivery: false,
    oneTrickPony: false,
    soloQueueOnly: false,
    scoreMasking: false,
    insaneClipDrop: false,
  });
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

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
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [gameSlug, service.slug, selection]);

  function update(key: string, value: string | number | boolean) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  async function createOrder() {
    if (!quote || quote.total < 5 || isLoading || isCreatingOrder) return;
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
        router.push(`/login?next=${encodeURIComponent(`/games/${gameSlug}/${service.slug}`)}`);
        return;
      }
      if (!response.ok || !payload.order) throw new Error(payload.error ?? "Unable to create order.");
      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const serviceLabel = isArena
    ? "League of Legends Arena Boost"
    : isMastery
      ? "League of Legends Mastery Boost"
      : "League of Legends Clash Boost";

  const serverLabel = servers.find(([value]) => value === selection.server)?.[1] ?? "Europe West";
  const summaryRows = useMemo(() => {
    const rows: Array<[string, string]> = [["Server", serverLabel], ["Platform", "PC"]];
    if (isArena) {
      rows.unshift(["Arena games", String(selection.games)], ["Role", roles.find(([value]) => value === selection.role)?.[1] ?? "Top"], ["Boost method", selection.boostMethod === "duo" ? "Play with Booster" : "Account Boost"]);
    }
    if (isMastery) {
      const mode = selection.masteryMode === "points" ? "Mastery Points Farm" : "Marks of Mastery";
      rows.unshift(["Boost option", mode], [selection.masteryMode === "points" ? "Points" : "Marks", Number(selection.masteryMode === "points" ? selection.masteryPoints : selection.marks).toLocaleString("en-US")]);
    }
    if (isClash) {
      rows.unshift(["Clash tier", `Tier ${selection.clashTier}`], ["Games", String(selection.games)], ["Boosters", String(selection.boosters)], ["Boost method", selection.boostMethod === "duo" ? "Play with Booster" : "Account Boost"]);
    }
    return rows;
  }, [isArena, isMastery, isClash, selection, serverLabel]);

  const belowMinimum = Boolean(quote && quote.total < 5);

  return (
    <>
      <nav aria-label="League of Legends services" className="mb-4 xl:hidden">
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {serviceNavigation.map((item) => {
              const active = service.slug === item.slug;
              return (
                <Link key={item.slug} href={`/games/league-of-legends/${item.slug}`} aria-current={active ? "page" : undefined} className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-colors ${active ? "border-amber-300/[0.22] bg-[#15170E] text-[#F4F7F5]" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}>
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
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/70">League of Legends</p>
              <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
            </div>
            <div className="space-y-1.5">
              {serviceNavigation.map((item) => {
                const active = service.slug === item.slug;
                return (
                  <Link key={item.slug} href={`/games/league-of-legends/${item.slug}`} aria-current={active ? "page" : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${active ? "border-amber-300/[0.22] bg-[#15170E] text-[#F4F7F5]" : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"}`}>
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

        <div className="grid min-w-0 gap-4 pb-24 2xl:grid-cols-[minmax(0,1fr)_23rem] 2xl:items-start 2xl:pb-0">
          <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080B09]">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.055] via-transparent to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/70"><Sparkles className="size-3.5" />{serviceLabel}</div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Verified League of Legends pricing inside the BoostingPedia configurator family.</p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300">Server-calculated pricing</span>
            </div>

            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
              {isArena ? (
                <>
                  <Quantity value={Number(selection.games)} min={3} max={60} label="Arena games" helper="Verified public range: 3–60 games." onChange={(value) => update("games", value)} />
                  <div>
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Role</p>
                    <p className="mt-1 text-sm font-semibold text-white">Role selection is price-neutral in the public LoL data.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{roles.map(([value, label]) => <Choice key={value} active={selection.role === value} label={label} onClick={() => update("role", value)} />)}</div>
                  </div>
                </>
              ) : null}

              {isMastery ? (
                <>
                  <div>
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Boost option</p>
                    <p className="mt-1 text-sm font-semibold text-white">Only fully verified Mastery modes are enabled.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Choice active={selection.masteryMode === "points"} label="Mastery Points Farm" onClick={() => update("masteryMode", "points")} />
                      <Choice active={selection.masteryMode === "marks"} label="Marks of Mastery" onClick={() => update("masteryMode", "marks")} />
                      <Choice active={false} label="Tier Boost" meta="Pricing pending" disabled onClick={() => {}} />
                    </div>
                  </div>
                  {selection.masteryMode === "points" ? (
                    <div>
                      <div className="flex items-end justify-between gap-4">
                        <div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Mastery points</p><p className="mt-1 text-sm font-semibold text-white">10,000–1,000,000 points</p></div>
                        <span className="font-gaming-value text-xl font-bold text-amber-100">{Number(selection.masteryPoints).toLocaleString("en-US")}</span>
                      </div>
                      <input type="range" min={10000} max={1000000} step={10000} value={Number(selection.masteryPoints)} onChange={(event) => update("masteryPoints", Number(event.target.value))} className="mt-4 w-full accent-amber-500" />
                    </div>
                  ) : (
                    <Quantity value={Number(selection.marks)} min={1} max={25} label="Marks of Mastery" helper="Verified public range: 1–25 marks." onChange={(value) => update("marks", value)} />
                  )}
                </>
              ) : null}

              {isClash ? (
                <>
                  <div>
                    <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Clash tier</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{clashTiers.map(([value, label, meta]) => <Choice key={value} active={selection.clashTier === value} label={label} meta={meta} onClick={() => update("clashTier", value)} />)}</div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Quantity value={Number(selection.games)} min={1} max={10} label="Clash games" helper="Verified matrix: 1–10 games." onChange={(value) => update("games", value)} />
                    <Quantity value={Number(selection.boosters)} min={1} max={5} label="Boosters" helper="Verified matrix: 1–5 boosters." onChange={(value) => update("boosters", value)} />
                  </div>
                </>
              ) : null}

              {(isArena || isClash) ? (
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Boost method</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Choice active={selection.boostMethod === "account"} label="Account Boost" meta="Base" onClick={() => update("boostMethod", "account")} />
                    <Choice active={selection.boostMethod === "duo"} label="Play with Booster" meta="+50%" onClick={() => update("boostMethod", "duo")} />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-2">
                <label>
                  <span className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Server</span>
                  <select value={String(selection.server)} onChange={(event) => update("server", event.target.value)} className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-xs font-semibold text-white outline-none transition-colors focus:border-amber-300/30 focus:ring-2 focus:ring-amber-400/10">
                    {servers.map(([value, label]) => <option key={value} value={value}>{label}{value === "north-america" || value === "oceania" ? " (+10%)" : ""}</option>)}
                  </select>
                </label>
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Platform</p>
                  <div className="mt-3 flex h-11 items-center justify-between rounded-xl border border-amber-300/[0.18] bg-[#15170E] px-3 text-xs font-semibold text-white"><span>PC</span><Check className="size-3.5 text-[#82F5A4]" /></div>
                </div>
              </div>

              <div className="h-px bg-white/[0.07]" />
              <div>
                <div className="flex items-center justify-between gap-4"><div><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">Customize extras</p><p className="mt-1 text-sm font-semibold text-white">Optional modifiers backed by the public service payload.</p></div><Zap className="size-4 text-amber-200/55" /></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Extra checked={selection.playOffline === true} onChange={(checked) => update("playOffline", checked)} icon={<EyeOff className="size-3.5" />} title="Play Offline" price="FREE" description="Keep activity discreet where the service exposes this option." />
                  {isArena || isClash ? <Extra checked={selection.championsPreferences === true} onChange={(checked) => update("championsPreferences", checked)} icon={<Users className="size-3.5" />} title="Champions Preferences" price="FREE" description="Provide champion preferences for the order." /> : null}
                  <Extra checked={selection.streaming === true} onChange={(checked) => update("streaming", checked)} icon={<MonitorPlay className="size-3.5" />} title="Streaming" price="+$7.00" description="BoostingPedia price follows the 70% pricing rule." />
                  <Extra checked={selection.expressDelivery === true} onChange={(checked) => update("expressDelivery", checked)} icon={<Zap className="size-3.5" />} title="Express Delivery" price="+20%" description="Prioritize faster fulfillment." />
                  <Extra checked={selection.oneTrickPony === true} onChange={(checked) => update("oneTrickPony", checked)} icon={<Trophy className="size-3.5" />} title="One Trick Pony" price="+30%" description="Use the documented one-trick modifier." />
                  <Extra checked={selection.soloQueueOnly === true} onChange={(checked) => update("soloQueueOnly", checked)} icon={<Swords className="size-3.5" />} title="Solo Queue Only" price="+40%" description="Use the documented solo-queue-only modifier." />
                  <Extra checked={selection.scoreMasking === true} onChange={(checked) => update("scoreMasking", checked)} icon={<ShieldCheck className="size-3.5" />} title="Score Masking" price="+50%" description="Add the documented score-masking modifier." />
                  <Extra checked={selection.insaneClipDrop === true} onChange={(checked) => update("insaneClipDrop", checked)} icon={<Trophy className="size-3.5" />} title="Insane Clip Drop" price="+15%" description="Add the documented clip-drop modifier." />
                </div>
              </div>

              <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:grid-cols-3">
                {["Stable base pricing without temporary campaign pricing.", "Server-validated BoostingPedia totals.", "Progressive discounts applied server-side."].map((note) => <div key={note} className="flex items-center gap-2 text-[10px] text-white/40"><Check className="size-3 shrink-0 text-emerald-300" /><span>{note}</span></div>)}
              </div>
            </div>
          </section>

          <aside id="boost-summary" className="scroll-mt-24 2xl:sticky 2xl:top-24">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.055] via-transparent to-transparent px-4 py-4">
                <div className="flex items-start justify-between gap-4"><div><p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">Order Summary</p><p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">{serviceLabel}</p></div>{isLoading ? <LoaderCircle className="size-4 animate-spin text-amber-200" /> : <Check className="size-4 text-[#82F5A4]" />}</div>
              </div>
              <div className="p-4">
                <div className="divide-y divide-white/[0.06]">{summaryRows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">{label}</span><span className="text-right font-medium text-white/78">{value}</span></div>)}</div>
                {error ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{error}</div> : null}
                {quote ? (
                  <>
                    <div className="my-4 h-px bg-white/[0.08]" />
                    <div className="space-y-2">{quote.breakdown.map((item, index) => <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 text-[11px]"><span className="text-[#A0AAA4]">{item.label}</span><span className={item.amount < 0 ? "font-medium text-[#82F5A4]" : "font-medium text-white/78"}>{item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}</span></div>)}</div>
                    <div className="my-4 h-px bg-white/[0.08]" />
                    <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-medium text-[#A0AAA4]">Total</p><p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-[#F4F7F5]">{formatPrice(quote.total)}</p></div><span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">USD</span></div>
                  </>
                ) : <div className="py-6 text-sm text-white/40">Adjust the configuration to generate a quote.</div>}
                {belowMinimum ? <div className="mt-3 rounded-lg border border-amber-300/15 bg-amber-400/[0.05] p-2.5 text-[10px] leading-4 text-amber-100/80">Minimum order total is $5.00. Increase the configuration before creating the order.</div> : null}
                {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">{orderError}</div> : null}
                <Button className="mt-4 h-12 w-full rounded-xl bg-[#39E56F] font-semibold text-[#050807] shadow-none hover:bg-[#20C95A] hover:text-[#050807]" size="lg" disabled={!quote || belowMinimum || isLoading || isCreatingOrder} onClick={createOrder}>{isCreatingOrder ? <>Creating order<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Create secure order<ArrowRight className="ml-2 size-4" /></>}</Button>
                <p className="mt-3 text-center text-[10px] leading-4 text-white/35">Final price is recalculated and validated on the server.</p>
              </div>
            </div>
            <div className="mt-3 rounded-[1.25rem] border border-white/[0.08] bg-[#080B09] p-3.5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-amber-300/[0.14] bg-amber-400/[0.045] text-amber-200/75"><ShieldCheck className="size-4" /></span><div><p className="text-xs font-semibold text-[#F4F7F5]">Secure payment</p><p className="mt-1 text-[10px] leading-4 text-white/40">Payment is processed by Stripe after your order is created.</p></div></div></div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-4 py-3 backdrop-blur-xl 2xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p><p className="font-gaming-value mt-0.5 whitespace-nowrap text-[1.55rem] font-bold leading-none text-[#F4F7F5]">{quote ? formatPrice(quote.total) : "—"}</p></div><a href="#boost-summary" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#39E56F]/35 bg-[#39E56F] px-5 text-sm font-bold text-[#050807]">View order<ArrowRight className="ml-2 size-4" /></a></div>
      </div>

    </>
  );
}
