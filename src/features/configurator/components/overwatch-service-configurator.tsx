"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Gamepad2,
  LoaderCircle,
  Minus,
  Monitor,
  Plus,
  Server,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import type {
  ConfiguratorSelection,
  QuotePreview,
  ServiceConfiguratorSchema,
} from "../types/configurator";

const ranks = [
  { value: "unranked", label: "Unranked", rate: 2.2 },
  { value: "bronze", label: "Bronze", rate: 2.2 },
  { value: "silver", label: "Silver", rate: 2.2 },
  { value: "gold", label: "Gold", rate: 2.85 },
  { value: "platinum", label: "Platinum", rate: 3.1 },
  { value: "diamond", label: "Diamond", rate: 3.35 },
  { value: "master", label: "Master", rate: 3.6 },
  { value: "grandmaster", label: "Grandmaster", rate: 4 },
] as const;

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function SelectionButton({
  active,
  label,
  meta,
  onClick,
}: {
  active: boolean;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex min-h-14 items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,color] duration-200 ${
        active
          ? "border-amber-300/[0.22] bg-amber-300/[0.055] text-[#F4F7F5]"
          : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold">{label}</span>
        {meta ? <span className="mt-1 block text-[10px] font-medium text-amber-200/55">{meta}</span> : null}
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
  const [selection, setSelection] = useState<ConfiguratorSelection>({
    currentRank: "bronze",
    wins: 1,
    server: "north-america",
    platform: "pc",
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

        if (!response.ok || !payload.quote) {
          throw new Error(payload.error ?? "Unable to calculate quote.");
        }

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

  function update(key: string, value: string | number) {
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
        checkoutIntent.saveForAuthentication();
        const next = `/games/${gameSlug}/${service.slug}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to create order.");
      }

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

  const wins = Math.max(1, Number(selection.wins) || 1);
  const selectedRank = ranks.find((rank) => rank.value === selection.currentRank) ?? ranks[1];
  const selectedServer = servers.find((server) => server.value === selection.server) ?? servers[0];
  const selectedPlatform = platforms.find((platform) => platform.value === selection.platform) ?? platforms[0];

  const summaryRows = useMemo(
    () => [
      ["Current rank", selectedRank.label],
      ["Competitive wins", String(wins)],
      ["Server", selectedServer.label],
      ["Platform", selectedPlatform.label],
    ] as Array<[string, string]>,
    [selectedPlatform.label, selectedRank.label, selectedServer.label, wins],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
      <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080b09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
        <div className="flex flex-col gap-2 border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.07] via-transparent to-transparent px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/70">
              <Trophy className="size-3.5" />
              Overwatch Competitive Wins
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Build your order around your current rank, server and platform.
            </p>
          </div>
          <span className="hidden w-fit items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-medium text-emerald-300 sm:inline-flex">
            Live server pricing
          </span>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Current rank
                </p>
                <p className="mt-1 text-sm font-semibold text-white">Select the rank used for your win rate.</p>
              </div>
              <span className="hidden text-xs font-semibold text-amber-200/65 sm:block">
                {formatPrice(selectedRank.rate)} / win
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ranks.map((rank) => (
                <SelectionButton
                  key={rank.value}
                  active={selection.currentRank === rank.value}
                  label={rank.label}
                  meta={`${formatPrice(rank.rate)} / win`}
                  onClick={() => update("currentRank", rank.value)}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Competitive wins
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Choose how many wins you need.</p>
              <div className="mt-3 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] gap-2">
                <button
                  type="button"
                  aria-label="Decrease wins"
                  onClick={() => update("wins", Math.max(1, wins - 1))}
                  disabled={wins <= 1}
                  className="grid h-12 place-items-center rounded-xl border border-white/[0.08] bg-[#090D0B] text-white/60 transition-colors hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  aria-label="Number of competitive wins"
                  type="number"
                  min={1}
                  step={1}
                  value={wins}
                  onChange={(event) => update("wins", Math.max(1, Math.trunc(Number(event.target.value) || 1)))}
                  className="h-12 min-w-0 rounded-xl border border-amber-300/[0.18] bg-[#131B17] px-3 text-center font-gaming-value text-lg font-bold text-white outline-none focus:border-amber-300/35 focus:ring-2 focus:ring-amber-300/10"
                />
                <button
                  type="button"
                  aria-label="Increase wins"
                  onClick={() => update("wins", wins + 1)}
                  className="grid h-12 place-items-center rounded-xl border border-white/[0.08] bg-[#090D0B] text-white/60 transition-colors hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Platform
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Select where you play Overwatch.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <SelectionButton
                    key={platform.value}
                    active={selection.platform === platform.value}
                    label={platform.label}
                    onClick={() => update("platform", platform.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div>
            <div className="flex items-center gap-2">
              <Server className="size-4 text-amber-200/60" />
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Server
              </p>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">Choose the server region for this order.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {servers.map((server) => (
                <SelectionButton
                  key={server.value}
                  active={selection.server === server.value}
                  label={server.label}
                  onClick={() => update("server", server.value)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="size-4 text-emerald-300" />
              Before checkout
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="flex gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                Server-validated pricing before order creation.
              </div>
              <div className="flex gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                <Gamepad2 className="mt-0.5 size-3.5 shrink-0 text-amber-200/70" />
                Platform and server stay attached to the order.
              </div>
              <div className="flex gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                <Monitor className="mt-0.5 size-3.5 shrink-0 text-amber-200/70" />
                Track your order from the BoostingPedia dashboard.
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-24">
        <div className="overflow-hidden rounded-[1.6rem] border border-amber-300/[0.13] bg-[#0D0E0B] shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-amber-500/[0.09] to-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-amber-200/65">Order preview</p>
                <p className="mt-1 text-lg font-semibold text-white">Competitive Wins</p>
              </div>
              {isLoading ? <LoaderCircle className="size-4 animate-spin text-amber-200" /> : null}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="space-y-2.5">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-[var(--muted-foreground)]">{label}</span>
                  <span className="text-right font-semibold text-white/85">{value}</span>
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-white/[0.08]" />

            {error ? (
              <div className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {error}
              </div>
            ) : null}

            {quote ? (
              <>
                <div className="space-y-3">
                  {quote.breakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--muted-foreground)]">{item.label}</span>
                      <span className="font-medium text-white">{formatPrice(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="my-5 h-px bg-white/[0.08]" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Estimated total</p>
                    <p className="mt-1 text-3xl font-bold tracking-[-0.045em] text-white">{formatPrice(quote.total)}</p>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-white/50">USD</span>
                </div>
              </>
            ) : !error ? (
              <div className="py-4 text-sm text-[var(--muted-foreground)]">Calculating your order...</div>
            ) : null}

            {orderError ? (
              <div className="mt-5 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">{orderError}</div>
            ) : null}

            <Button
              className="mt-6 w-full"
              size="lg"
              disabled={!quote || isLoading || isCreatingOrder}
              onClick={createOrder}
            >
              {isCreatingOrder ? (
                <>
                  Preparing checkout
                  <LoaderCircle className="ml-2 size-4 animate-spin" />
                </>
              ) : (
                <>
                  Continue to secure checkout
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            <div className="mt-4 flex gap-2 text-[11px] leading-5 text-white/40">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              <span>Your price is recalculated on the server before the order is stored.</span>
            </div>
            {quote ? <p className="mt-3 text-[10px] text-white/25">Pricing rules: {quote.ruleSetVersion}</p> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
