"use client";

import Image from "next/image";
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
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDota2RankBadge } from "@/features/catalog/data/dota-2-foundation";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import { parseWholeNumberQuantity } from "../client/whole-number-quantity";
import {
  DOTA2_CURRENT_MMR_MAX,
  DOTA2_CURRENT_MMR_MIN,
  DOTA2_MAX_ROLE_PREFERENCES,
  DOTA2_MMR_SERVICE_SLUG,
  DOTA2_TARGET_MMR_MAX,
  DOTA2_TARGET_MMR_MIN,
  dota2BehaviorScoreOptions,
  dota2BoostMethodOptions,
  dota2ExtraOptions,
  dota2PreferenceOptions,
  getDota2MmrBracketName,
  dota2RoleOptions,
  dota2ServerOptions,
  type Dota2MmrQuoteApiResponse,
  type Dota2MmrQuoteMetadata,
} from "../data/dota-2-mmr-options";
import type { ConfiguratorSelection, QuotePreview } from "../types/configurator";
import { AccountBoostTrust } from "./account-boost-trust";
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
    <section className="rounded-xl border border-white/[0.08] bg-[#0A0E0C]/75 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-red-200/70">{title}</h2>
        {helper ? <p className="mt-1 text-[11px] leading-4 text-white/35">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Choice({ active, label, meta, description, onClick }: { active: boolean; label: string; meta?: string; description?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onKeyDown={handleRadioKeyDown}
      onClick={onClick}
      className={`min-h-11 min-w-0 rounded-xl border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 motion-reduce:transition-none ${
        active
          ? "border-red-300/30 bg-red-400/[0.07] text-white"
          : "border-white/[0.08] bg-[#090D0B] text-white/62 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-xs font-semibold leading-4">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          {meta ? <span className="text-[10px] font-bold text-white/42">{meta}</span> : null}
          {active ? <Check className="size-3.5 text-[#82F5A4]" aria-hidden="true" /> : null}
        </span>
      </span>
      {description ? <span className="mt-1 block text-[10px] leading-4 text-white/35">{description}</span> : null}
    </button>
  );
}

function normalizeMmrInputValue(value: string | number | boolean | undefined): string | number {
  return typeof value === "string" || typeof value === "number" ? value : "";
}

function MmrField({ id, label, value, min, max, error, onChange }: { id: string; label: string; value: string | number; min: number; max: number; error: string | null; onChange: (value: string) => void }) {
  const errorId = `${id}-error`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={String(value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-xl border bg-[#090D0B] px-3 font-gaming-value text-xl font-bold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/25 motion-reduce:transition-none ${error ? "border-rose-300/35" : "border-white/[0.09] focus:border-red-300/30"}`}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-[10px] leading-4 text-rose-200">{error}</p>
      ) : (
        <p className="mt-2 text-[10px] leading-4 text-white/30">Whole number from {min.toLocaleString("en-US")} to {max.toLocaleString("en-US")}.</p>
      )}
    </div>
  );
}

function Toggle({ checked, disabled, title, meta, description, icon, onChange }: { checked: boolean; disabled?: boolean; title: string; meta: string; description: string; icon: ReactNode; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[4.5rem] min-w-0 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 motion-reduce:transition-none ${checked ? "border-red-300/25 bg-red-400/[0.06]" : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-red-200/70">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-white">{title}</span>
          <span className={`text-[10px] font-bold ${meta === "FREE" ? "text-[#82F5A4]" : "text-red-100/65"}`}>{meta}</span>
        </span>
        <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">{description}</span>
      </span>
      <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]" : "border-white/[0.12] text-transparent"}`}>
        <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
      </span>
    </button>
  );
}

const defaultSelection: ConfiguratorSelection = {
  currentMmr: "1000",
  targetMmr: "2000",
  server: "europe-west",
  behaviorScore: "8000-12000",
  boostMethod: "solo",
  preference: "none",
  roles: "",
  heroName: "",
  privacyMode: false,
  soloQueueOnly: false,
  expressDelivery: false,
  streaming: false,
};

export function Dota2MmrConfigurator() {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>(defaultSelection);
  const [quoteState, setQuoteState] = useState<{ key: string; quote: QuotePreview; metadata: Dota2MmrQuoteMetadata } | null>(null);
  const [customState, setCustomState] = useState<{ key: string; state: NonNullable<Dota2MmrQuoteApiResponse["customQuote"]> } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const currentRaw = normalizeMmrInputValue(selection.currentMmr);
  const targetRaw = normalizeMmrInputValue(selection.targetMmr);
  const currentResult = parseWholeNumberQuantity(currentRaw, DOTA2_CURRENT_MMR_MIN, DOTA2_CURRENT_MMR_MAX);
  const targetResult = parseWholeNumberQuantity(targetRaw, DOTA2_TARGET_MMR_MIN, DOTA2_TARGET_MMR_MAX);
  const progressionValid = currentResult.valid && targetResult.valid && targetResult.value > currentResult.value;
  const currentInputBracket = currentResult.valid ? getDota2MmrBracketName(currentResult.value) : null;
  const targetInputBracket = targetResult.valid ? getDota2MmrBracketName(targetResult.value) : null;
  const currentInputRankBadge = getDota2RankBadge(currentInputBracket ?? undefined);
  const targetInputRankBadge = getDota2RankBadge(targetInputBracket ?? undefined);
  const currentError = currentResult.valid ? null : `Enter a whole number between ${DOTA2_CURRENT_MMR_MIN} and ${DOTA2_CURRENT_MMR_MAX}.`;
  const targetError = !targetResult.valid
    ? `Enter a whole number between ${DOTA2_TARGET_MMR_MIN} and ${DOTA2_TARGET_MMR_MAX}.`
    : currentResult.valid && targetResult.value <= currentResult.value
      ? "Desired MMR must be above Current MMR."
      : null;

  const serverValid = dota2ServerOptions.some((option) => option.value === selection.server);
  const behaviorValid = dota2BehaviorScoreOptions.some((option) => option.value === selection.behaviorScore);
  const methodValid = dota2BoostMethodOptions.some((option) => option.value === selection.boostMethod);
  const preferenceValid = dota2PreferenceOptions.some((option) => option.value === selection.preference);
  const selectedRoles = typeof selection.roles === "string" && selection.roles ? selection.roles.split(",") : [];
  const rolesValid = selection.preference !== "roles" || (selectedRoles.length >= 1 && selectedRoles.length <= DOTA2_MAX_ROLE_PREFERENCES && selectedRoles.every((role) => dota2RoleOptions.some((option) => option.value === role)));
  const heroValid = selection.preference !== "hero" || (typeof selection.heroName === "string" && selection.heroName.trim().length > 0);
  const booleansValid = [selection.privacyMode, selection.soloQueueOnly, selection.expressDelivery, selection.streaming].every((value) => typeof value === "boolean");
  const methodCompatibilityValid = selection.boostMethod !== "duo" || (selection.soloQueueOnly === false && selection.streaming === false);
  const quoteSelectionIsValid = progressionValid && serverValid && behaviorValid && methodValid && preferenceValid && booleansValid && methodCompatibilityValid;
  const configurationIsComplete = quoteSelectionIsValid && rolesValid && heroValid;

  const orderSelection = useMemo<ConfiguratorSelection>(() => ({
    ...selection,
    currentMmr: currentResult.valid ? currentResult.value : String(selection.currentMmr),
    targetMmr: targetResult.valid ? targetResult.value : String(selection.targetMmr),
  }), [currentResult.valid, currentResult.value, selection, targetResult.valid, targetResult.value]);
  const requestKey = JSON.stringify(orderSelection);
  const quoteIsCurrent = quoteSelectionIsValid && quoteState?.key === requestKey;
  const quote = quoteState?.quote ?? null;
  const currentQuote = quoteIsCurrent ? quote : null;
  const metadata = quoteState?.metadata ?? (customState?.key === requestKey ? customState.state : null);
  const customQuote = quoteSelectionIsValid && customState?.key === requestKey ? customState.state : null;

  useEffect(() => {
    setQuoteError(null);
    if (!quoteSelectionIsValid) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/dota-2/mmr-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selection: orderSelection }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as Dota2MmrQuoteApiResponse;
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
  }, [orderSelection, quoteSelectionIsValid, requestKey]);

  function update(key: string, value: string | number | boolean) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function selectBoostMethod(method: string) {
    setSelection((current) => ({
      ...current,
      boostMethod: method,
      ...(method === "duo" ? { soloQueueOnly: false, streaming: false } : {}),
    }));
  }

  function selectPreference(preference: string) {
    setSelection((current) => ({
      ...current,
      preference,
      roles: preference === "roles" ? String(current.roles ?? "") : "",
      heroName: preference === "hero" ? String(current.heroName ?? "") : "",
    }));
  }

  function toggleRole(role: string) {
    const current = selectedRoles;
    const exists = current.includes(role);
    const next = exists ? current.filter((item) => item !== role) : current.length < DOTA2_MAX_ROLE_PREFERENCES ? [...current, role] : current;
    update("roles", next.join(","));
  }

  const belowMinimum = Boolean(currentQuote && !meetsMinimumOrderTotal(currentQuote.total));
  const minimumShortfallCents = currentQuote ? minimumOrderShortfallCents(currentQuote.total) : 0;
  const canCheckout = Boolean(configurationIsComplete && currentQuote && !customQuote && !belowMinimum && !isLoading && !quoteError);

  async function createOrder() {
    if (!canCheckout || isCreatingOrder) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const response = await fetch("/api/dota-2/mmr-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: orderSelection }),
      });
      const payload = (await response.json()) as { order?: { id: string; orderNumber: string }; error?: string };
      if (response.status === 401) {
        checkoutIntent.saveForAuthentication();
        router.push(`/login?next=${encodeURIComponent("/games/dota-2/mmr-boost")}`);
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
    serviceSlug: DOTA2_MMR_SERVICE_SLUG,
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
  const methodLabel = dota2BoostMethodOptions.find((option) => option.value === selection.boostMethod)?.label ?? String(selection.boostMethod);
  const preferenceLabel = dota2PreferenceOptions.find((option) => option.value === selection.preference)?.label ?? String(selection.preference);
  const roleLabels = selectedRoles.map((role) => dota2RoleOptions.find((option) => option.value === role)?.label ?? role);
  const currentRankBadge = getDota2RankBadge(metadata?.currentBracket);
  const targetRankBadge = getDota2RankBadge(metadata?.targetBracket);
  const selectedExtras: string[] = [];
  if (selection.privacyMode === true) {
    selectedExtras.push(dota2ExtraOptions.privacyMode.label);
  }
  if (selection.soloQueueOnly === true) {
    selectedExtras.push(dota2ExtraOptions.soloQueueOnly.label);
  }
  if (selection.expressDelivery === true) {
    selectedExtras.push(dota2ExtraOptions.expressDelivery.label);
  }
  if (selection.streaming === true) {
    selectedExtras.push(dota2ExtraOptions.streaming.label);
  }

  return (
    <>
      <div className="grid gap-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:pb-0">
        <section className="min-w-0 space-y-5 sm:space-y-6">
          <ConfiguratorBlock title="MMR Progression" helper="Set a valid progression from Current MMR to Desired MMR.">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
              <div className="space-y-3">
                <MmrField id="dota2-current-mmr" label="Current MMR" value={currentRaw} min={DOTA2_CURRENT_MMR_MIN} max={DOTA2_CURRENT_MMR_MAX} error={currentError} onChange={(value) => update("currentMmr", value)} />
                <div aria-live="polite" className="flex min-h-[4.75rem] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-2.5">
                  {currentInputRankBadge ? (
                    <Image src={currentInputRankBadge} alt="" width={58} height={58} className="size-14 shrink-0 object-contain transition-opacity motion-reduce:transition-none" />
                  ) : (
                    <span className="size-14 shrink-0 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015]" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current bracket</p>
                    <p className="mt-1 text-sm font-semibold text-white/80">{currentInputBracket ?? "Enter valid MMR"}</p>
                  </div>
                </div>
              </div>
              <span className="grid size-9 place-items-center justify-self-center rounded-full border border-white/[0.07] bg-white/[0.025] text-red-100/45" aria-hidden="true">
                <ArrowRight className="size-3.5 rotate-90 md:rotate-0" />
              </span>
              <div className="space-y-3">
                <MmrField id="dota2-target-mmr" label="Desired MMR" value={targetRaw} min={DOTA2_TARGET_MMR_MIN} max={DOTA2_TARGET_MMR_MAX} error={targetError} onChange={(value) => update("targetMmr", value)} />
                <div aria-live="polite" className="flex min-h-[4.75rem] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-2.5">
                  {targetInputRankBadge ? (
                    <Image src={targetInputRankBadge} alt="" width={58} height={58} className="size-14 shrink-0 object-contain transition-opacity motion-reduce:transition-none" />
                  ) : (
                    <span className="size-14 shrink-0 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015]" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Desired bracket</p>
                    <p className="mt-1 text-sm font-semibold text-white/80">{targetInputBracket ?? "Enter valid MMR"}</p>
                  </div>
                </div>
              </div>
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Server" helper="All listed servers use the same base pricing in this release.">
            <div role="radiogroup" aria-label="Dota 2 server" className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:grid-cols-4">
              {dota2ServerOptions.map((option) => <Choice key={option.value} active={selection.server === option.value} label={option.label} onClick={() => update("server", option.value)} />)}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Behavior Score">
            <div role="radiogroup" aria-label="Behavior Score" className="grid gap-2 sm:grid-cols-2">
              {dota2BehaviorScoreOptions.map((option) => <Choice key={option.value} active={selection.behaviorScore === option.value} label={option.label} meta={option.meta} onClick={() => update("behaviorScore", option.value)} />)}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Boost Method">
            <div role="radiogroup" aria-label="Boost method" className="grid gap-2 min-[360px]:grid-cols-2">
              {dota2BoostMethodOptions.map((option) => <Choice key={option.value} active={selection.boostMethod === option.value} label={option.value === "duo" ? "Play With Booster" : option.label} meta={option.modifierPercent ? `+${option.modifierPercent}%` : "Base"} description={option.value === "duo" ? "You play together with the booster." : option.description} onClick={() => selectBoostMethod(option.value)} />)}
            </div>
            <AccountBoostTrust selected={selection.boostMethod === "solo"} accent="gold" showDescription methodLabel="Solo" />
            {selection.boostMethod === "duo" ? <p className="mt-3 text-[10px] leading-4 text-white/42">You play with the booster; account access is not required for the booster to play on your behalf.</p> : null}
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Play Preference" helper="Choose one preference type. Paid preferences are never preselected.">
            <div role="radiogroup" aria-label="Play preference" className="grid gap-2 sm:grid-cols-3">
              {dota2PreferenceOptions.map((option) => <Choice key={option.value} active={selection.preference === option.value} label={option.value === "none" ? "Any" : option.label} meta={option.meta} onClick={() => selectPreference(option.value)} />)}
            </div>

            {selection.preference === "roles" ? (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Select up to two roles</p>
                  <span className="text-[10px] text-white/35">{selectedRoles.length}/{DOTA2_MAX_ROLE_PREFERENCES}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {dota2RoleOptions.map((option) => {
                    const active = selectedRoles.includes(option.value);
                    const disabled = !active && selectedRoles.length >= DOTA2_MAX_ROLE_PREFERENCES;
                    return (
                      <button key={option.value} type="button" aria-pressed={active} disabled={disabled} onClick={() => toggleRole(option.value)} className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 motion-reduce:transition-none ${active ? "border-red-300/30 bg-red-400/[0.07] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/58 hover:border-white/[0.14] hover:text-white"} disabled:cursor-not-allowed disabled:opacity-35`}>
                        <span className="flex items-center justify-between gap-2">{option.label}{active ? <Check className="size-3.5 text-[#82F5A4]" aria-hidden="true" /> : null}</span>
                      </button>
                    );
                  })}
                </div>
                {!rolesValid ? <p className="mt-2 text-[10px] text-rose-200">Select at least one role.</p> : null}
              </div>
            ) : null}

            {selection.preference === "hero" ? (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <label htmlFor="dota2-specific-hero" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Hero name</label>
                <input id="dota2-specific-hero" type="text" value={String(selection.heroName)} aria-invalid={!heroValid} aria-describedby={!heroValid ? "dota2-hero-error" : undefined} onChange={(event) => update("heroName", event.target.value)} placeholder="Enter your preferred hero" className={`mt-2 h-11 w-full rounded-xl border bg-[#090D0B] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-red-300/25 ${heroValid ? "border-white/[0.08]" : "border-rose-300/35"}`} />
                {!heroValid ? <p id="dota2-hero-error" className="mt-2 text-[10px] text-rose-200">Select a hero to continue.</p> : null}
              </div>
            ) : null}
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Extras" helper="Only selected extras affect your order.">
            <div className="grid auto-rows-fr gap-2 sm:grid-cols-2">
              <Toggle checked={selection.privacyMode === true} onChange={(value) => update("privacyMode", value)} icon={<EyeOff className="size-3.5" />} title={dota2ExtraOptions.privacyMode.label} meta={dota2ExtraOptions.privacyMode.meta} description="Use the available privacy settings where supported." />
              <Toggle checked={selection.soloQueueOnly === true} disabled={selection.boostMethod === "duo"} onChange={(value) => update("soloQueueOnly", value)} icon={<Target className="size-3.5" />} title={dota2ExtraOptions.soloQueueOnly.label} meta={dota2ExtraOptions.soloQueueOnly.meta} description={selection.boostMethod === "duo" ? "Available with Solo only." : "Restrict eligible play to solo queue."} />
              <Toggle checked={selection.expressDelivery === true} onChange={(value) => update("expressDelivery", value)} icon={<Zap className="size-3.5" />} title={dota2ExtraOptions.expressDelivery.label} meta={dota2ExtraOptions.expressDelivery.meta} description="Prioritize faster fulfillment when available." />
              <Toggle checked={selection.streaming === true} disabled={selection.boostMethod === "duo"} onChange={(value) => update("streaming", value)} icon={<MonitorPlay className="size-3.5" />} title={dota2ExtraOptions.streaming.label} meta={dota2ExtraOptions.streaming.meta} description={selection.boostMethod === "duo" ? "Available with Solo only." : "Add streaming to your order."} />
            </div>
          </ConfiguratorBlock>
        </section>

        <aside id="boost-summary" className="scroll-mt-28 xl:scroll-mt-24 xl:sticky xl:top-24">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
              <div className="border-b border-white/[0.07] bg-gradient-to-br from-red-500/[0.05] via-transparent to-transparent px-4 py-4">
                <h2 className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-white">Order Summary</h2>
                <p className="mt-1.5 text-[11px] text-[#A0AAA4]">Dota 2 MMR Boost</p>
              </div>
              <div className="p-4" aria-busy={isLoading || (quoteSelectionIsValid && !quoteIsCurrent)}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Current MMR</p>
                    <p className="font-gaming-value mt-1 text-base font-bold text-white">{String(currentRaw) || "—"}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {currentRankBadge ? (
                        <Image src={currentRankBadge} alt="" width={24} height={24} className="size-6 shrink-0 object-contain" />
                      ) : null}
                      <p className="text-[9px] text-white/35">{metadata?.currentBracket ?? "—"}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-red-100/35" aria-hidden="true" />
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Desired MMR</p>
                    <p className="font-gaming-value mt-1 text-base font-bold text-white">{String(targetRaw) || "—"}</p>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <p className="text-[9px] text-white/35">{metadata?.targetBracket ?? "—"}</p>
                      {targetRankBadge ? (
                        <Image src={targetRankBadge} alt="" width={24} height={24} className="size-6 shrink-0 object-contain" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-2 divide-y divide-white/[0.06]">
                  {[
                    ["Server", serverLabel],
                    ["Behavior Score", behaviorLabel],
                    ["Boost method", methodLabel === "Duo" ? "Play With Booster" : methodLabel],
                    ["Play preference", selection.preference === "none" ? "Any" : preferenceLabel],
                    ...(selection.preference === "roles" ? [["Roles", roleLabels.join(", ") || "Select roles"]] : []),
                    ...(selection.preference === "hero" ? [["Hero", String(selection.heroName).trim() || "Enter hero"]] : []),
                  ].map(([label, value]) => <div key={label} className="flex min-h-9 items-center justify-between gap-4 py-2 text-[11px]"><span className="text-white/40">{label}</span><span className="min-w-0 text-right font-medium text-white/78">{value}</span></div>)}
                </div>

                {selectedExtras.length ? <div className="mt-3 border-t border-white/[0.06] pt-3"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Selected extras</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedExtras.map((extra) => <span key={extra} className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] text-white/58">{extra}</span>)}</div></div> : null}

                {quote ? <div className="mt-4 border-t border-white/[0.08] pt-3"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Price breakdown</p><div className="mt-2 divide-y divide-white/[0.05]">{quote.breakdown.map((item, index) => <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 py-2 text-[10px]"><span className="min-w-0 text-white/42">{item.label}</span><span className="shrink-0 font-medium text-white/72">{formatUsd(item.amount)}</span></div>)}</div></div> : null}

                {quoteError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{quoteError}</div> : null}

                <div className="my-4 h-px bg-white/[0.08]" />
                {customQuote ? (
                  <div className="rounded-xl border border-amber-200/15 bg-amber-200/[0.035] p-3">
                    <p className="text-sm font-semibold text-amber-50/85">{customQuote.message}</p>
                    <p className="mt-1 text-[10px] leading-4 text-amber-50/55">{customQuote.supportingCopy}</p>
                    <button type="button" onClick={openSupport} className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-amber-200/20 bg-amber-200/[0.05] px-3 text-xs font-semibold text-amber-50/80 outline-none focus-visible:ring-2 focus-visible:ring-amber-200/30"><MessageCircle className="mr-2 size-3.5" />Contact Support</button>
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-4" role="status" aria-live="polite" aria-atomic="true">
                    <div className="min-w-0"><p className="text-[11px] text-[#A0AAA4]">Total</p><p className={`font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] ${quote ? "text-white" : "text-white/30"}`}>{quote ? formatUsd(quote.total) : "—"}</p><p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-white/38">{isLoading ? "Updating price…" : quote && !quoteIsCurrent ? "Previous price" : "Server-Validated Price"}</p></div><span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] text-white/45">USD</span>
                  </div>
                )}

                <MinimumOrderNotice id="dota2-mmr-minimum-order" shortfallCents={belowMinimum ? minimumShortfallCents : 0} />
                {orderError ? <div className="mt-3 rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">{orderError}</div> : null}

                <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/15">
                  <div className="flex items-start gap-2.5 px-3 py-3"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-red-200/70" aria-hidden="true" /><p className="text-[10px] leading-4 text-white/45">{selection.boostMethod === "solo" ? "Account details are requested after checkout through the protected order workflow." : "You play with the booster; account access is not required for the booster to play on your behalf."}</p></div>
                  <div className="flex items-start gap-2.5 border-t border-white/[0.06] px-3 py-3"><Clock3 className="mt-0.5 size-3.5 shrink-0 text-red-200/65" aria-hidden="true" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200/65">Estimated timing</p><p className="mt-1 text-[10px] leading-4 text-white/42">Estimated start — Unavailable</p><p className="text-[10px] leading-4 text-white/42">Estimated completion — Unavailable</p><p className="mt-1 text-[9px] leading-4 text-white/30">No verified timing estimate is available for this configuration.</p></div></div>
                  <div className="border-t border-white/[0.06] px-3 py-3"><div className="flex items-start gap-2.5"><UsersRound className="mt-0.5 size-3.5 shrink-0 text-red-200/65" aria-hidden="true" /><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200/65">Verify before you order</p><p className="mt-1 text-[10px] leading-4 text-white/42">Confirm your MMR progression and boost method before checkout.</p><div className="mt-1 flex flex-wrap gap-x-3"><a href="https://www.trustpilot.com/review/boostingpedia.com" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[10px] text-white/50 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/30">Public Trustpilot reviews<ExternalLink className="ml-1 size-2.5" /></a><Link href="/refunds" className="inline-flex min-h-11 items-center text-[10px] text-white/50 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/30">Refund policy</Link></div></div></div></div>
                </div>

                {!customQuote ? <Button type="button" size="lg" onClick={createOrder} disabled={!canCheckout || isCreatingOrder} aria-describedby={belowMinimum ? "dota2-mmr-minimum-order" : undefined} className="mt-4 h-12 w-full rounded-xl font-semibold">{isCreatingOrder ? <>Preparing checkout<LoaderCircle className="ml-2 size-4 animate-spin motion-reduce:animate-none" /></> : <>Checkout<ArrowRight className="ml-2 size-4" /></>}</Button> : null}
              </div>
            </div>
            <PaymentMethodsTrustBlock />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_3.75rem] items-center gap-2">
          <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">{customQuote ? "Custom quote" : "Your total"}</p><p className="font-gaming-value mt-0.5 truncate text-[1.45rem] font-bold leading-none text-white">{customQuote ? "Required" : quote ? formatUsd(quote.total) : "—"}</p>{belowMinimum ? <p className="mt-1 text-[9px] leading-3 text-amber-100/70">Minimum $5.00</p> : null}</div>
          {customQuote ? <button type="button" onClick={openSupport} className="inline-flex h-11 items-center rounded-xl border border-amber-200/20 bg-amber-200/[0.07] px-3 text-[11px] font-semibold text-amber-50/80"><MessageCircle className="mr-1.5 size-3.5" />Support</button> : <Button type="button" size="md" onClick={createOrder} disabled={!canCheckout || isCreatingOrder} aria-describedby={belowMinimum ? "dota2-mmr-minimum-order" : undefined} className="h-11 px-3 text-[11px] font-semibold">{isCreatingOrder ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> : <>Checkout<ArrowRight className="ml-1.5 size-3.5" /></>}</Button>}
          <span aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
