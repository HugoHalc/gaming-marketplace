"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  EyeOff,
  Gamepad2,
  Gauge,
  LoaderCircle,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection, QuotePreview } from "../types/configurator";

const rankFamilies = [
  { key: "bronze", label: "Bronze", short: "B", accent: "from-amber-900/60 to-amber-500/15", tiers: ["1", "2", "3"] },
  { key: "silver", label: "Silver", short: "S", accent: "from-slate-500/45 to-white/5", tiers: ["1", "2", "3"] },
  { key: "gold", label: "Gold", short: "G", accent: "from-yellow-500/45 to-amber-400/5", tiers: ["1", "2", "3"] },
  { key: "platinum", label: "Platinum", short: "P", accent: "from-cyan-500/40 to-teal-300/5", tiers: ["1", "2", "3"] },
  { key: "diamond", label: "Diamond", short: "D", accent: "from-blue-500/45 to-cyan-300/5", tiers: ["1", "2", "3"] },
  { key: "champion", label: "Champion", short: "C", accent: "from-fuchsia-600/45 to-rose-400/5", tiers: ["1", "2", "3"] },
  { key: "grand-champion", label: "Grand Champion", short: "GC", accent: "from-red-600/50 to-fuchsia-500/5", tiers: ["1", "2", "3"] },
  { key: "supersonic-legend", label: "Supersonic Legend", short: "SSL", accent: "from-violet-500/55 to-cyan-300/10", tiers: [] },
] as const;

const rankOrder = [
  "bronze-1", "bronze-2", "bronze-3",
  "silver-1", "silver-2", "silver-3",
  "gold-1", "gold-2", "gold-3",
  "platinum-1", "platinum-2", "platinum-3",
  "diamond-1", "diamond-2", "diamond-3",
  "champion-1", "champion-2", "champion-3",
  "grand-champion-1", "grand-champion-2", "grand-champion-3",
  "supersonic-legend",
] as const;

type RankId = (typeof rankOrder)[number];

const playlists = [
  { value: "1v1", label: "1v1 Duel", group: "Competitive", surcharge: "Base" },
  { value: "2v2", label: "2v2 Doubles", group: "Competitive", surcharge: "Base" },
  { value: "3v3", label: "3v3 Standard", group: "Competitive", surcharge: "+20%" },
  { value: "rumble", label: "Rumble", group: "Extra Modes", surcharge: "+20%" },
  { value: "hoops", label: "Hoops", group: "Extra Modes", surcharge: "+20%" },
  { value: "dropshot", label: "Dropshot", group: "Extra Modes", surcharge: "+20%" },
  { value: "snow-day", label: "Snow Day", group: "Extra Modes", surcharge: "+20%" },
  { value: "heatseeker", label: "Heatseeker", group: "Extra Modes", surcharge: "+20%" },
  { value: "4v4", label: "4v4 Squads", group: "Extra Modes", surcharge: "+30%" },
] as const;

const platforms = [
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "switch", label: "Nintendo Switch" },
] as const;

function rankIndex(rank: string) {
  return rankOrder.indexOf(rank as RankId);
}

function familyForRank(rank: string) {
  return rankFamilies.find((family) => rank === family.key || rank.startsWith(`${family.key}-`)) ?? rankFamilies[0];
}

function rankLabel(rank: string) {
  if (rank === "supersonic-legend") return "Supersonic Legend";
  const family = familyForRank(rank);
  const tier = rank.split("-").at(-1);
  return `${family.label} ${tier === "1" ? "I" : tier === "2" ? "II" : "III"}`;
}

function firstRankForFamily(familyKey: string) {
  if (familyKey === "supersonic-legend") return "supersonic-legend";
  return `${familyKey}-1`;
}

function firstAvailableRankForFamily(familyKey: string, currentRank: string) {
  if (familyKey === "supersonic-legend") {
    return rankIndex("supersonic-legend") > rankIndex(currentRank) ? "supersonic-legend" : null;
  }

  for (const tier of ["1", "2", "3"]) {
    const candidate = `${familyKey}-${tier}`;
    if (rankIndex(candidate) > rankIndex(currentRank)) return candidate;
  }
  return null;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function RankBadge({ family, selected, locked }: {
  family: (typeof rankFamilies)[number];
  selected: boolean;
  locked?: boolean;
}) {
  return (
    <span
      className={`relative grid size-16 place-items-center rounded-[1.35rem] border bg-gradient-to-br ${family.accent} ${
        selected ? "border-cyan-300/45 shadow-[0_0_35px_-10px_rgba(34,211,238,.7)]" : "border-white/[0.09]"
      } ${locked ? "opacity-35" : ""}`}
    >
      <span className="text-sm font-black tracking-[-0.04em] text-white">{family.short}</span>
      {selected ? (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cyan-300 text-[#071019]">
          <Check className="size-3" />
        </span>
      ) : null}
    </span>
  );
}

function RankSelector({
  title,
  value,
  currentRank,
  target,
  onChange,
}: {
  title: string;
  value: string;
  currentRank?: string;
  target?: boolean;
  onChange: (value: string) => void;
}) {
  const selectedFamily = familyForRank(value);
  const currentIndex = currentRank ? rankIndex(currentRank) : -1;

  function chooseFamily(familyKey: string) {
    if (!target) {
      if (familyKey === "supersonic-legend") return;
      onChange(firstRankForFamily(familyKey));
      return;
    }

    const next = firstAvailableRankForFamily(familyKey, currentRank ?? "");
    if (next) onChange(next);
  }

  const availableTiers = selectedFamily.tiers.filter((tier) => {
    const candidate = `${selectedFamily.key}-${tier}`;
    return !target || rankIndex(candidate) > currentIndex;
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">{title}</p>
          <p className="mt-1 text-xl font-bold tracking-[-0.035em] text-white">{rankLabel(value)}</p>
        </div>
        {target ? (
          <span className="rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Higher ranks only
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rankFamilies.map((family) => {
          const available = target
            ? firstAvailableRankForFamily(family.key, currentRank ?? "") !== null
            : family.key !== "supersonic-legend";
          const selected = selectedFamily.key === family.key;

          return (
            <button
              key={family.key}
              type="button"
              disabled={!available}
              onClick={() => chooseFamily(family.key)}
              className={`group flex min-h-32 flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                selected
                  ? "border-cyan-300/35 bg-cyan-400/[0.06]"
                  : "border-white/[0.08] bg-black/15 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.025]"
              } disabled:cursor-not-allowed disabled:opacity-35`}
            >
              <RankBadge family={family} selected={selected} locked={!available} />
              <span className="mt-3 text-xs font-semibold text-white/85">{family.label}</span>
            </button>
          );
        })}
      </div>

      {selectedFamily.key !== "supersonic-legend" ? (
        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Tier</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {selectedFamily.tiers.map((tier) => {
              const candidate = `${selectedFamily.key}-${tier}`;
              const available = !target || rankIndex(candidate) > currentIndex;
              const active = value === candidate;
              return (
                <button
                  key={tier}
                  type="button"
                  disabled={!available}
                  onClick={() => onChange(candidate)}
                  className={`h-11 rounded-xl border text-sm font-bold transition-colors ${
                    active
                      ? "border-cyan-300/40 bg-cyan-400/[0.10] text-cyan-100"
                      : "border-white/[0.08] bg-white/[0.02] text-white/65 hover:border-white/[0.16] hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-25`}
                >
                  {tier === "1" ? "I" : tier === "2" ? "II" : "III"}
                </button>
              );
            })}
          </div>
          {target && availableTiers.length === 0 ? (
            <p className="mt-3 text-xs text-white/40">Choose a higher rank family.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SelectionCard({
  active,
  onClick,
  title,
  detail,
  badge,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  detail?: string;
  badge?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition-all ${
        active
          ? "border-cyan-300/35 bg-cyan-400/[0.07] shadow-[0_18px_50px_-35px_rgba(34,211,238,.85)]"
          : "border-white/[0.08] bg-black/15 hover:-translate-y-0.5 hover:border-white/[0.16]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-9 place-items-center rounded-xl border ${active ? "border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-200" : "border-white/[0.08] bg-white/[0.025] text-white/55"}`}>
          {icon ?? <Gamepad2 className="size-4" />}
        </span>
        <div className="flex items-center gap-2">
          {badge ? <span className="text-xs font-bold text-cyan-200">{badge}</span> : null}
          {active ? <CheckCircle2 className="size-4 text-cyan-300" /> : null}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-white">{title}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p> : null}
    </button>
  );
}

function ExtraCard({
  checked,
  disabled,
  onChange,
  icon,
  title,
  price,
  description,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
  title: string;
  price: string;
  description: string;
}) {
  return (
    <label className={`flex min-h-36 cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all ${
      checked ? "border-violet-300/35 bg-violet-400/[0.07]" : "border-white/[0.08] bg-black/15"
    } ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-white/[0.16]"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/65">
          {icon}
        </span>
        <span className="text-xs font-bold text-violet-200">{disabled ? "Not needed" : price}</span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">{title}</p>
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            className="size-5 accent-violet-500"
          />
        </div>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{description}</p>
      </div>
    </label>
  );
}

interface RocketLeagueRankConfiguratorProps {
  gameSlug: string;
  service: ServiceSummary;
}

export function RocketLeagueRankConfigurator({ gameSlug, service }: RocketLeagueRankConfiguratorProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>({
    currentRank: "gold-1",
    targetRank: "platinum-1",
    playlist: "2v2",
    platform: "pc",
    boostMethod: "account",
    appearOffline: false,
    liveStream: false,
    expressDelivery: false,
    rankInsurance: false,
  });
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const currentRank = String(selection.currentRank);
  const targetRank = String(selection.targetRank);
  const boostMethod = String(selection.boostMethod);

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.value === selection.playlist) ?? playlists[1],
    [selection.playlist],
  );

  useEffect(() => {
    if (rankIndex(targetRank) <= rankIndex(currentRank)) {
      const nextIndex = rankIndex(currentRank) + 1;
      const next = rankOrder[nextIndex];
      if (next) {
        setSelection((current) => ({ ...current, targetRank: next }));
      }
    }
  }, [currentRank, targetRank]);

  useEffect(() => {
    if (boostMethod === "play-with-booster" && selection.appearOffline === true) {
      setSelection((current) => ({ ...current, appearOffline: false }));
    }
  }, [boostMethod, selection.appearOffline]);

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

  function update(key: string, value: string | boolean) {
    setSelection((current) => ({ ...current, [key]: value }));
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

      const payload = (await response.json()) as {
        order?: { id: string; orderNumber: string };
        error?: string;
      };

      if (response.status === 401) {
        const next = `/games/${gameSlug}/${service.slug}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[1.75rem] border border-cyan-300/10 bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-cyan-500/[0.09] via-transparent to-blue-500/[0.05] p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
                  <Sparkles className="size-3.5" />
                  Rocket League Rank Boost
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.045em] text-white sm:text-3xl">
                  Build your boost around your exact goal.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Pick your current rank, target rank, playlist and preferred boost method. Your price updates automatically.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
                Live server pricing
              </span>
            </div>
          </div>

          <div className="space-y-8 p-5 sm:p-7">
            <RankSelector
              title="Current rank"
              value={currentRank}
              onChange={(value) => update("currentRank", value)}
            />

            <div className="h-px bg-white/[0.07]" />

            <RankSelector
              title="Desired rank"
              value={targetRank}
              currentRank={currentRank}
              target
              onChange={(value) => update("targetRank", value)}
            />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">Select playlist</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.035em] text-white">Choose where you want to climb.</h3>

          {["Competitive", "Extra Modes"].map((group) => (
            <div key={group} className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{group}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {playlists.filter((playlist) => playlist.group === group).map((playlist) => (
                  <SelectionCard
                    key={playlist.value}
                    active={selection.playlist === playlist.value}
                    onClick={() => update("playlist", playlist.value)}
                    title={playlist.label}
                    badge={playlist.surcharge}
                    icon={<Gamepad2 className="size-4" />}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">Platform</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.035em] text-white">Where do you play?</h3>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {platforms.map((platform) => (
              <SelectionCard
                key={platform.value}
                active={selection.platform === platform.value}
                onClick={() => update("platform", platform.value)}
                title={platform.label}
                icon={<Gamepad2 className="size-4" />}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">Boost method</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.035em] text-white">How do you want to boost?</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SelectionCard
              active={boostMethod === "account"}
              onClick={() => update("boostMethod", "account")}
              title="Account Boost"
              detail="Our booster plays directly on your account to complete the selected rank progression."
              badge="Base price"
              icon={<Gauge className="size-4" />}
            />
            <SelectionCard
              active={boostMethod === "play-with-booster"}
              onClick={() => update("boostMethod", "play-with-booster")}
              title="Play With Booster"
              detail="Play alongside an experienced booster while keeping full control of your account."
              badge="+45%"
              icon={<Users className="size-4" />}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/15 p-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {boostMethod === "account"
              ? "Account access and fulfillment details are provided securely after checkout."
              : "No account access is required. Session details are coordinated with your assigned booster after purchase."}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300/80">Customize your boost</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.035em] text-white">Optional upgrades.</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Nothing is preselected. Add only what is useful for your order.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ExtraCard
              checked={selection.appearOffline === true}
              disabled={boostMethod === "play-with-booster"}
              onChange={(checked) => update("appearOffline", checked)}
              icon={<EyeOff className="size-4" />}
              title="Appear Offline"
              price="FREE"
              description="Use offline or invisible status when possible to reduce unwanted invites and keep the session discreet."
            />
            <ExtraCard
              checked={selection.liveStream === true}
              onChange={(checked) => update("liveStream", checked)}
              icon={<MonitorPlay className="size-4" />}
              title="Live Stream"
              price="+$10"
              description="Watch your boost live through Twitch or Discord. Details are coordinated after purchase."
            />
            <ExtraCard
              checked={selection.expressDelivery === true}
              onChange={(checked) => update("expressDelivery", checked)}
              icon={<Zap className="size-4" />}
              title="Express Delivery"
              price="+20%"
              description="Move your order ahead of standard orders in the fulfillment queue."
            />
            <ExtraCard
              checked={selection.rankInsurance === true}
              onChange={(checked) => update("rankInsurance", checked)}
              icon={<ShieldCheck className="size-4" />}
              title="Rank Insurance"
              price="+50%"
              description="Get 2–3 additional wins after the selected target rank has been reached."
            />
          </div>
        </section>

        <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Final pricing is recalculated on the server.",
              "No optional upgrade is selected automatically.",
              "Order progress is available from your dashboard.",
            ].map((note) => (
              <div key={note} className="flex gap-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-[1.75rem] border border-cyan-300/15 bg-[#0d0e18] shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-cyan-500/[0.14] via-blue-500/[0.04] to-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-cyan-200">Your boost</p>
                <p className="mt-1 text-lg font-semibold text-white">Rocket League Rank Boost</p>
              </div>
              {isLoading ? <LoaderCircle className="size-4 animate-spin text-cyan-300" /> : null}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/35">Current</p>
                <p className="mt-1 text-sm font-semibold text-white">{rankLabel(currentRank)}</p>
              </div>
              <ArrowRight className="size-4 text-cyan-300/70" />
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/35">Target</p>
                <p className="mt-1 text-sm font-semibold text-white">{rankLabel(targetRank)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-white/40">Playlist</span>
                <span className="font-medium text-white/75">{selectedPlaylist.label}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/40">Platform</span>
                <span className="font-medium text-white/75">{platforms.find((item) => item.value === selection.platform)?.label}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/40">Method</span>
                <span className="font-medium text-white/75">{boostMethod === "account" ? "Account Boost" : "Play With Booster"}</span>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {error}
              </div>
            ) : null}

            {quote ? (
              <>
                <div className="my-5 h-px bg-white/[0.08]" />
                <div className="space-y-3">
                  {quote.breakdown.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--muted-foreground)]">{item.label}</span>
                      <span className={item.amount < 0 ? "font-medium text-emerald-300" : "font-medium text-white"}>
                        {item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-5 h-px bg-white/[0.08]" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Total</p>
                    <p className="mt-1 text-3xl font-bold tracking-[-0.045em] text-white">{formatPrice(quote.total)}</p>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-white/50">USD</span>
                </div>
              </>
            ) : null}

            {orderError ? (
              <div className="mt-5 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {orderError}
              </div>
            ) : null}

            <Button className="mt-6 w-full" size="lg" disabled={!quote || isLoading || isCreatingOrder} onClick={createOrder}>
              {isCreatingOrder ? (
                <>Creating order<LoaderCircle className="ml-2 size-4 animate-spin" /></>
              ) : (
                <>Create secure order<ArrowRight className="ml-2 size-4" /></>
              )}
            </Button>

            <div className="mt-4 flex gap-2 text-[11px] leading-5 text-white/40">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              <span>Final price is calculated securely on the server. Payment is completed through Stripe after the order is created.</span>
            </div>

            {quote ? <p className="mt-3 text-[10px] text-white/25">Pricing version: {quote.ruleSetVersion}</p> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
