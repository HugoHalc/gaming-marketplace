"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  EyeOff,
  LoaderCircle,
  MessageCircle,
  Minus,
  MonitorPlay,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import { parseWholeNumberQuantity } from "../client/whole-number-quantity";
import {
  dota2BehaviorScoreOptions,
  dota2ExtraOptions,
  dota2ServerOptions,
} from "../data/dota-2-mmr-options";
import {
  DOTA2_CURRENT_HERO_LEVEL_MAX,
  DOTA2_CURRENT_HERO_LEVEL_MIN,
  DOTA2_HERO_LEVEL_SERVICE_SLUG,
  DOTA2_HERO_NAME_MAX_LENGTH,
  DOTA2_TARGET_HERO_LEVEL_MAX,
  DOTA2_TARGET_HERO_LEVEL_MIN,
  type Dota2HeroLevelQuoteApiResponse,
  type Dota2HeroLevelQuoteMetadata,
} from "../data/dota-2-hero-level-options";
import type { ConfiguratorSelection, QuotePreview } from "../types/configurator";
import { MinimumOrderNotice } from "./minimum-order-notice";
import { PaymentMethodsTrustBlock } from "./payment-methods-trust-block";
import {
  meetsMinimumOrderTotal,
  minimumOrderShortfallCents,
} from "@/features/orders/minimum-order";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function handleRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const group = event.currentTarget.closest('[role="radiogroup"]');
  if (!group) return;
  const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
  if (!radios.length) return;
  const currentIndex = radios.indexOf(event.currentTarget);
  if (currentIndex < 0) return;
  event.preventDefault();
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? radios.length - 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (currentIndex - 1 + radios.length) % radios.length
          : (currentIndex + 1) % radios.length;
  radios[nextIndex]?.focus();
  radios[nextIndex]?.click();
}

function ConfiguratorBlock({ title, helper, children }: { title: string; helper?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-black/10 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-red-200/70">{title}</h2>
        {helper ? <p className="mt-1 text-[11px] leading-4 text-white/35">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Choice({ active, label, meta, onClick }: { active: boolean; label: string; meta?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onKeyDown={handleRadioKeyDown}
      onClick={onClick}
      className={`min-h-11 min-w-0 rounded-xl border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 motion-reduce:transition-none ${active ? "border-red-300/30 bg-red-400/[0.07] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/62 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-xs font-semibold leading-4">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          {meta ? <span className="text-[10px] font-bold text-white/42">{meta}</span> : null}
          {active ? <Check className="size-3.5 text-[#82F5A4]" aria-hidden="true" /> : null}
        </span>
      </span>
    </button>
  );
}

function normalizeNumericInputValue(value: string | number | boolean | undefined): string | number {
  return typeof value === "string" || typeof value === "number" ? value : "";
}

function LevelField({
  id,
  label,
  value,
  min,
  max,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string | number;
  min: number;
  max: number;
  error: string | null;
  onChange: (value: string | number) => void;
}) {
  const errorId = `${id}-error`;
  const parsed = parseWholeNumberQuantity(value, min, max);
  const sliderValue = parsed.valid ? parsed.value : min;

  function step(delta: number) {
    if (!parsed.valid) return;
    const next = parsed.value + delta;
    if (next < min || next > max) return;
    onChange(next);
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</label>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={!parsed.valid || parsed.value <= min}
          onClick={() => step(-1)}
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#090D0B] text-white/65 outline-none hover:border-white/[0.14] focus-visible:ring-2 focus-visible:ring-red-300/30 disabled:cursor-not-allowed disabled:opacity-35"
        ><Minus className="size-4" /></button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          autoComplete="off"
          value={String(value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 min-w-0 flex-1 rounded-xl border bg-[#090D0B] px-3 text-center font-gaming-value text-lg font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-red-300/25 ${error ? "border-rose-300/35" : "border-white/[0.08]"}`}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={!parsed.valid || parsed.value >= max}
          onClick={() => step(1)}
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#090D0B] text-white/65 outline-none hover:border-white/[0.14] focus-visible:ring-2 focus-visible:ring-red-300/30 disabled:cursor-not-allowed disabled:opacity-35"
        ><Plus className="size-4" /></button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={sliderValue}
        aria-label={`${label} slider`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-11 w-full cursor-pointer accent-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/25"
      />
      <div className="-mt-2 flex justify-between text-[9px] text-white/28"><span>{min}</span><span>{max}</span></div>
      {error ? <p id={errorId} className="mt-2 text-[10px] leading-4 text-rose-200">{error}</p> : null}
    </div>
  );
}

function Toggle({ checked, title, meta, description, icon, onChange }: { checked: boolean; title: string; meta: string; description: string; icon: ReactNode; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[4.5rem] min-w-0 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 motion-reduce:transition-none ${checked ? "border-red-300/25 bg-red-400/[0.06]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"}`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-red-200/70">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-white">{title}</span><span className={`text-[10px] font-bold ${meta === "FREE" ? "text-[#82F5A4]" : "text-red-100/65"}`}>{meta}</span></span>
        <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">{description}</span>
      </span>
      <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]" : "border-white/[0.12] text-transparent"}`}><Check className="size-2.5" strokeWidth={3} aria-hidden="true" /></span>
    </button>
  );
}

const defaultSelection: ConfiguratorSelection = {
  heroName: "Anti-Mage",
  currentLevel: "1",
  desiredLevel: "5",
  dotaPlusConfirmed: false,
  server: "europe-west",
  behaviorScore: "8000-12000",
  privacyMode: false,
  expressDelivery: false,
  streaming: false,
};

export function Dota2HeroLevelConfigurator() {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>(defaultSelection);
  const [quoteState, setQuoteState] = useState<{ key: string; quote: QuotePreview; metadata: Dota2HeroLevelQuoteMetadata } | null>(null);
  const [customState, setCustomState] = useState<{ key: string; state: NonNullable<Dota2HeroLevelQuoteApiResponse["customQuote"]> } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const heroRaw = typeof selection.heroName === "string" ? selection.heroName : "";
  const trimmedHero = heroRaw.trim();
  const heroValid = trimmedHero.length > 0 && trimmedHero.length <= DOTA2_HERO_NAME_MAX_LENGTH && !trimmedHero.includes(",");
  const currentRaw = normalizeNumericInputValue(selection.currentLevel);
  const desiredRaw = normalizeNumericInputValue(selection.desiredLevel);
  const currentResult = parseWholeNumberQuantity(currentRaw, DOTA2_CURRENT_HERO_LEVEL_MIN, DOTA2_CURRENT_HERO_LEVEL_MAX);
  const desiredResult = parseWholeNumberQuantity(desiredRaw, DOTA2_TARGET_HERO_LEVEL_MIN, DOTA2_TARGET_HERO_LEVEL_MAX);
  const progressionValid = currentResult.valid && desiredResult.valid && desiredResult.value > currentResult.value;
  const currentError = currentResult.valid ? null : "Enter a whole level between 1 and 39.";
  const desiredError = !desiredResult.valid
    ? "Enter a whole level between 2 and 40."
    : currentResult.valid && desiredResult.value <= currentResult.value
      ? "Desired Hero Level must be above Current Hero Level."
      : null;
  const serverValid = dota2ServerOptions.some((option) => option.value === selection.server);
  const behaviorValid = dota2BehaviorScoreOptions.some((option) => option.value === selection.behaviorScore);
  const booleansValid = [selection.dotaPlusConfirmed, selection.privacyMode, selection.expressDelivery, selection.streaming].every((value) => typeof value === "boolean");
  const selectionIsValid = heroValid && progressionValid && serverValid && behaviorValid && booleansValid;

  const orderSelection = useMemo<ConfiguratorSelection>(() => ({
    heroName: trimmedHero,
    currentLevel: currentResult.valid ? currentResult.value : String(selection.currentLevel),
    desiredLevel: desiredResult.valid ? desiredResult.value : String(selection.desiredLevel),
    dotaPlusConfirmed: selection.dotaPlusConfirmed === true,
    server: String(selection.server),
    behaviorScore: String(selection.behaviorScore),
    privacyMode: selection.privacyMode === true,
    expressDelivery: selection.expressDelivery === true,
    streaming: selection.streaming === true,
  }), [currentResult.valid, currentResult.value, desiredResult.valid, desiredResult.value, selection, trimmedHero]);

  const requestKey = JSON.stringify(orderSelection);
  const quoteIsCurrent = selectionIsValid && quoteState?.key === requestKey;
  const quote = quoteState?.quote ?? null;
  const currentQuote = quoteIsCurrent ? quote : null;
  const customQuote = selectionIsValid && customState?.key === requestKey ? customState.state : null;
  const metadata = quoteState?.metadata ?? (customState?.key === requestKey ? customState.state : null);

  useEffect(() => {
    setQuoteError(null);
    if (!selectionIsValid) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/dota-2/hero-level-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selection: orderSelection }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as Dota2HeroLevelQuoteApiResponse;
        if (!response.ok) throw new Error(payload.error ?? "Unable to calculate quote.");
        if (!active) return;
        if (payload.customQuote) {
          setCustomState({ key: requestKey, state: payload.customQuote });
          return;
        }
        if (!payload.quote || !payload.metadata) throw new Error("Unable to calculate quote.");
        setQuoteState({ key: requestKey, quote: payload.quote, metadata: payload.metadata });
      } catch (requestError) {
        if (!active || (requestError instanceof DOMException && requestError.name === "AbortError")) return;
        setQuoteError(requestError instanceof Error ? requestError.message : "Unable to calculate quote.");
      } finally {
        if (active) setIsLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [orderSelection, requestKey, selectionIsValid]);

  function update(key: string, value: string | number | boolean) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  const belowMinimum = Boolean(currentQuote && !meetsMinimumOrderTotal(currentQuote.total));
  const minimumShortfallCents = currentQuote ? minimumOrderShortfallCents(currentQuote.total) : 0;
  const requirementConfirmed = selection.dotaPlusConfirmed === true;
  const canCheckout = Boolean(selectionIsValid && requirementConfirmed && currentQuote && !customQuote && !belowMinimum && !isLoading && !quoteError);

  async function createOrder() {
    if (!canCheckout || isCreatingOrder) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const response = await fetch("/api/dota-2/hero-level-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: orderSelection }),
      });
      const payload = (await response.json()) as { order?: { id: string; orderNumber: string }; error?: string };
      if (response.status === 401) {
        checkoutIntent.saveForAuthentication();
        router.push(`/login?next=${encodeURIComponent("/games/dota-2/hero-level-boost")}`);
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
    gameSlug: "dota-2",
    serviceSlug: DOTA2_HERO_LEVEL_SERVICE_SLUG,
    selection,
    setSelection,
    canAutoResume: canCheckout,
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  function openSupport() {
    document.querySelector<HTMLButtonElement>('button[aria-label="Open support chat"]')?.click();
  }

  const serverLabel = dota2ServerOptions.find((option) => option.value === selection.server)?.label ?? String(selection.server);
  const behaviorLabel = dota2BehaviorScoreOptions.find((option) => option.value === selection.behaviorScore)?.label ?? String(selection.behaviorScore);
  const selectedExtras: string[] = [];
  if (selection.privacyMode === true) selectedExtras.push(dota2ExtraOptions.privacyMode.label);
  if (selection.expressDelivery === true) selectedExtras.push(dota2ExtraOptions.expressDelivery.label);
  if (selection.streaming === true) selectedExtras.push(dota2ExtraOptions.streaming.label);
  const progressionLevels = currentResult.valid && desiredResult.valid && desiredResult.value > currentResult.value ? desiredResult.value - currentResult.value : null;

  return (
    <>
      <div className="grid gap-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:pb-0">
        <section className="min-w-0 space-y-4">
          <ConfiguratorBlock title="Selected Hero" helper="One hero per order.">
            <label htmlFor="dota2-hero-level-name" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Hero</label>
            <input
              id="dota2-hero-level-name"
              type="text"
              value={heroRaw}
              aria-invalid={!heroValid}
              aria-describedby={!heroValid ? "dota2-hero-level-name-error" : undefined}
              onChange={(event) => update("heroName", event.target.value)}
              placeholder="Anti-Mage"
              className={`mt-2 h-11 w-full rounded-xl border bg-[#090D0B] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-red-300/25 ${heroValid ? "border-white/[0.08]" : "border-rose-300/35"}`}
            />
            {!heroValid ? <p id="dota2-hero-level-name-error" className="mt-2 text-[10px] text-rose-200">Enter the hero you want to level.</p> : null}
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Hero Level Progression" helper="Choose the current and desired Dota Plus Hero Level.">
            <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <LevelField id="dota2-current-hero-level" label="Current Hero Level" value={currentRaw} min={DOTA2_CURRENT_HERO_LEVEL_MIN} max={DOTA2_CURRENT_HERO_LEVEL_MAX} error={currentError} onChange={(value) => update("currentLevel", value)} />
              <div className="hidden min-h-11 items-center justify-center self-center pt-5 text-red-100/35 md:flex"><ArrowRight className="size-5" aria-hidden="true" /></div>
              <LevelField id="dota2-desired-hero-level" label="Desired Hero Level" value={desiredRaw} min={DOTA2_TARGET_HERO_LEVEL_MIN} max={DOTA2_TARGET_HERO_LEVEL_MAX} error={desiredError} onChange={(value) => update("desiredLevel", value)} />
            </div>
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40">{progressionLevels === null ? "Select a valid progression." : `${progressionLevels} level${progressionLevels === 1 ? "" : "s"} of progression`}</p>
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Dota Plus Requirement">
            <button
              type="button"
              role="checkbox"
              aria-checked={requirementConfirmed}
              onClick={() => update("dotaPlusConfirmed", !requirementConfirmed)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-xl border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-red-300/30 ${requirementConfirmed ? "border-[#39E56F]/25 bg-[#39E56F]/[0.045]" : "border-white/[0.08] bg-[#090D0B]"}`}
            >
              <span className={`grid size-5 shrink-0 place-items-center rounded border ${requirementConfirmed ? "border-[#39E56F]/45 bg-[#39E56F] text-[#050807]" : "border-white/[0.18] text-transparent"}`}><Check className="size-3" strokeWidth={3} /></span>
              <span><span className="block text-xs font-semibold text-white">I have an active Dota Plus subscription.</span><span className="mt-1 block text-[10px] leading-4 text-white/38">Dota Plus Hero Level progression requires an active Dota Plus subscription on the account.</span></span>
            </button>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Server">
            <div role="radiogroup" aria-label="Dota 2 server" className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:grid-cols-4">
              {dota2ServerOptions.map((option) => <Choice key={option.value} active={selection.server === option.value} label={option.label} onClick={() => update("server", option.value)} />)}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Behavior Score">
            <div role="radiogroup" aria-label="Behavior Score" className="grid gap-2 sm:grid-cols-2">
              {dota2BehaviorScoreOptions.map((option) => <Choice key={option.value} active={selection.behaviorScore === option.value} label={option.label} meta={option.meta} onClick={() => update("behaviorScore", option.value)} />)}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Extras" helper="Only extras compatible with account-based Hero Level progression are shown.">
            <div className="grid auto-rows-fr gap-2 sm:grid-cols-2">
              <Toggle checked={selection.privacyMode === true} onChange={(value) => update("privacyMode", value)} icon={<EyeOff className="size-3.5" />} title={dota2ExtraOptions.privacyMode.label} meta={dota2ExtraOptions.privacyMode.meta} description="Use the available privacy settings where supported." />
              <Toggle checked={selection.expressDelivery === true} onChange={(value) => update("expressDelivery", value)} icon={<Zap className="size-3.5" />} title={dota2ExtraOptions.expressDelivery.label} meta={dota2ExtraOptions.expressDelivery.meta} description="Prioritize faster fulfillment when available." />
              <Toggle checked={selection.streaming === true} onChange={(value) => update("streaming", value)} icon={<MonitorPlay className="size-3.5" />} title={dota2ExtraOptions.streaming.label} meta={dota2ExtraOptions.streaming.meta} description="Add streaming to your order." />
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-semibold text-white/65">What you receive</p>
              <p className="mt-1 text-[10px] leading-4 text-white/38">Progression for one selected hero from your current Dota Plus Hero Level to the chosen target level.</p>
              <p className="mt-1 text-[9px] leading-4 text-white/30">An active Dota Plus subscription is required on the account.</p>
            </div>
          </ConfiguratorBlock>
        </section>

        <aside id="boost-summary" className="scroll-mt-28 xl:sticky xl:top-24">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-red-500/[0.05] via-transparent to-transparent px-4 py-4">
                <h2 className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-white">Order Summary</h2>
                <p className="mt-1.5 text-[11px] text-[#A0AAA4]">Dota Plus Hero Level</p>
              </div>
              <div className="p-4" aria-busy={isLoading || (selectionIsValid && !quoteIsCurrent)}>
                <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Hero</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">{(metadata?.heroName ?? trimmedHero) || "—"}</p>
                  <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <div><p className="text-[9px] text-white/30">Current</p><p className="font-gaming-value mt-1 text-base font-bold text-white">{String(currentRaw) || "—"}</p></div>
                    <ArrowRight className="size-3.5 text-red-100/35" />
                    <div className="text-right"><p className="text-[9px] text-white/30">Desired</p><p className="font-gaming-value mt-1 text-base font-bold text-white">{String(desiredRaw) || "—"}</p></div>
                  </div>
                  <p className="mt-2 text-[9px] text-white/35">{metadata ? `${metadata.progressionLevels} level${metadata.progressionLevels === 1 ? "" : "s"} of progression` : "—"}</p>
                </div>

                <div className="mt-2 divide-y divide-white/[0.06]">
                  {[["Server", serverLabel], ["Behavior Score", behaviorLabel], ["Service method", "Account-based"], ["Dota Plus", requirementConfirmed ? "Confirmed" : "Confirmation required"]].map(([label, value]) => <div key={label} className="flex min-h-9 items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">{label}</span><span className="min-w-0 text-right font-medium text-white/78">{value}</span></div>)}
                </div>

                {selectedExtras.length ? <div className="mt-3 border-t border-white/[0.06] pt-3"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Selected extras</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedExtras.map((extra) => <span key={extra} className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] text-white/58">{extra}</span>)}</div></div> : null}
                {quote ? <div className="mt-4 border-t border-white/[0.08] pt-3"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Price breakdown</p><div className="mt-2 divide-y divide-white/[0.05]">{quote.breakdown.map((item, index) => <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 py-2 text-[10px]"><span className="min-w-0 text-white/42">{item.label}</span><span className="shrink-0 font-medium text-white/72">{formatUsd(item.amount)}</span></div>)}</div></div> : null}
                {quoteError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{quoteError}</div> : null}

                <div className="my-4 h-px bg-white/[0.08]" />
                {customQuote ? (
                  <div className="rounded-xl border border-amber-200/15 bg-amber-200/[0.035] p-3"><p className="text-sm font-semibold text-amber-50/85">{customQuote.message}</p><p className="mt-1 text-[10px] leading-4 text-amber-50/55">{customQuote.supportingCopy}</p><button type="button" onClick={openSupport} className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-amber-200/20 bg-amber-200/[0.05] px-3 text-xs font-semibold text-amber-50/80 outline-none focus-visible:ring-2 focus-visible:ring-amber-200/30"><MessageCircle className="mr-2 size-3.5" />Contact Support</button></div>
                ) : (
                  <div className="flex items-end justify-between gap-4" role="status" aria-live="polite" aria-atomic="true"><div className="min-w-0"><p className="text-[11px] text-[#A0AAA4]">Total</p><p className={`font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] ${quote ? "text-white" : "text-white/30"}`}>{quote ? formatUsd(quote.total) : "—"}</p><p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-white/38">{isLoading ? "Updating price…" : quote && !quoteIsCurrent ? "Previous price" : "Server-Validated Price"}</p></div><span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] text-white/45">USD</span></div>
                )}

                <MinimumOrderNotice id="dota2-hero-level-minimum-order" shortfallCents={belowMinimum ? minimumShortfallCents : 0} />
                {!requirementConfirmed && quote && !customQuote ? <div className="mt-3 rounded-lg border border-amber-200/15 bg-amber-200/[0.035] p-2.5 text-[10px] leading-4 text-amber-50/65">Confirm your active Dota Plus subscription before Checkout.</div> : null}
                {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{orderError}</div> : null}

                <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/15">
                  <div className="flex items-start gap-2.5 px-3 py-3"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-red-200/70" /><p className="text-[10px] leading-4 text-white/45">Account details are requested after checkout through the protected order workflow.</p></div>
                  <div className="flex items-start gap-2.5 border-t border-white/[0.06] px-3 py-3"><Clock3 className="mt-0.5 size-3.5 shrink-0 text-red-200/65" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200/65">Estimated timing</p><p className="mt-1 text-[10px] leading-4 text-white/42">Estimated start — Unavailable</p><p className="text-[10px] leading-4 text-white/42">Estimated completion — Unavailable</p><p className="mt-1 text-[9px] leading-4 text-white/30">No verified timing estimate is available for this configuration.</p></div></div>
                  <div className="border-t border-white/[0.06] px-3 py-3"><div className="flex items-start gap-2.5"><UsersRound className="mt-0.5 size-3.5 shrink-0 text-red-200/65" /><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200/65">Verify before you order</p><p className="mt-1 text-[10px] leading-4 text-white/42">One hero per order. An active Dota Plus subscription is required before Checkout.</p><div className="mt-1 flex flex-wrap gap-x-3"><a href="https://www.trustpilot.com/review/boostingpedia.com" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[10px] text-white/50 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/30">Public Trustpilot reviews<ExternalLink className="ml-1 size-2.5" /></a><Link href="/refunds" className="inline-flex min-h-11 items-center text-[10px] text-white/50 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/30">Refund policy</Link></div></div></div></div>
                </div>

                {!customQuote ? <Button type="button" size="lg" onClick={createOrder} disabled={!canCheckout || isCreatingOrder} aria-describedby={belowMinimum ? "dota2-hero-level-minimum-order" : undefined} className="mt-4 h-12 w-full rounded-xl font-semibold">{isCreatingOrder ? <>Preparing checkout<LoaderCircle className="ml-2 size-4 animate-spin motion-reduce:animate-none" /></> : <>Checkout<ArrowRight className="ml-2 size-4" /></>}</Button> : null}
              </div>
            </div>
            <PaymentMethodsTrustBlock />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_3.75rem] items-center gap-2">
          <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">{customQuote ? "Custom quote" : "Your total"}</p><p className="font-gaming-value mt-0.5 truncate text-[1.45rem] font-bold leading-none text-white">{customQuote ? "Required" : quote ? formatUsd(quote.total) : "—"}</p>{belowMinimum ? <p className="mt-1 text-[9px] leading-3 text-amber-100/70">Minimum $5.00</p> : !requirementConfirmed && quote ? <p className="mt-1 text-[9px] leading-3 text-amber-100/70">Confirm Dota Plus</p> : null}</div>
          {customQuote ? <button type="button" onClick={openSupport} className="inline-flex h-11 items-center rounded-xl border border-amber-200/20 bg-amber-200/[0.07] px-3 text-[11px] font-semibold text-amber-50/80"><MessageCircle className="mr-1.5 size-3.5" />Support</button> : <Button type="button" size="md" onClick={createOrder} disabled={!canCheckout || isCreatingOrder} className="h-11 px-3 text-[11px] font-semibold">{isCreatingOrder ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> : <>Checkout<ArrowRight className="ml-1.5 size-3.5" /></>}</Button>}
          <span aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
