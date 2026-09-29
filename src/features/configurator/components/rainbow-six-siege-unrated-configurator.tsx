"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutIntentContinuity } from "../client/checkout-intent";
import {
  R6_UNRATED_SERVICE_SLUG,
  rainbowSixSiegeUnratedCustomizationOptions,
  rainbowSixSiegeUnratedModeOptions,
  rainbowSixSiegeUnratedPlatformOptions,
  rainbowSixSiegeUnratedServerOptions,
  type RainbowSixSiegeUnratedQuoteApiResponse,
  type RainbowSixSiegeUnratedQuoteMetadata,
} from "../data/rainbow-six-siege-unrated-options";
import {
  R6_STARTING_TIME_DISCLAIMER,
  R6_STARTING_TIME_RANGES,
} from "../data/rainbow-six-siege-starting-time";
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

function formatUsdCents(cents: number) {
  return formatUsd(cents / 100);
}

function handleRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const group = event.currentTarget.closest('[role="radiogroup"]');
  if (!group) return;
  const radios = Array.from(
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
  );
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

function ConfiguratorBlock({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-black/10 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200/70">
          {title}
        </h2>
        {helper ? <p className="mt-1 text-[11px] leading-4 text-white/35">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Choice({
  active,
  disabled,
  label,
  meta,
  description,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  meta?: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      tabIndex={active ? 0 : -1}
      onKeyDown={handleRadioKeyDown}
      onClick={onClick}
      className={`min-h-11 min-w-0 rounded-xl border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300/30 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "border-emerald-300/30 bg-emerald-400/[0.07] text-white"
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

function Toggle({
  checked,
  title,
  meta,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  meta: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[4.5rem] min-w-0 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300/30 motion-reduce:transition-none ${
        checked
          ? "border-emerald-300/25 bg-emerald-400/[0.06]"
          : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-emerald-100/70">
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-white">{title}</span>
          <span className={`text-[10px] font-bold ${meta === "FREE" ? "text-[#82F5A4]" : "text-emerald-100/65"}`}>
            {meta}
          </span>
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
  games: 1,
  platform: "pc",
  gameMode: "solo",
  server: "north-america",
  playOffline: false,
  specificOperators: false,
  streaming: false,
  expressDelivery: false,
  highKillCount: false,
  oneTrickPony: false,
  vipPriority: false,
  insaneClipDrop: false,
  eliteBoosterTier: false,
};

export function RainbowSixSiegeUnratedConfigurator() {
  const router = useRouter();
  const [selection, setSelection] = useState<ConfiguratorSelection>(defaultSelection);
  const [quoteState, setQuoteState] = useState<{
    key: string;
    quote: QuotePreview;
    metadata: RainbowSixSiegeUnratedQuoteMetadata;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const verifyCloseRef = useRef<HTMLButtonElement>(null);

  const platformValid = rainbowSixSiegeUnratedPlatformOptions.some((option) => option.value === selection.platform);
  const modeValid = rainbowSixSiegeUnratedModeOptions.some((option) => option.value === selection.gameMode);
  const serverValid = rainbowSixSiegeUnratedServerOptions.some((option) => option.value === selection.server);
  const customizationsValid = rainbowSixSiegeUnratedCustomizationOptions.every(
    (option) => typeof selection[option.key] === "boolean",
  );
  const gamesValid = typeof selection.games === "number" && Number.isInteger(selection.games) && selection.games >= 1 && selection.games <= 10;
  const selectionIsValid = platformValid && modeValid && serverValid && customizationsValid && gamesValid;

  const orderSelection = useMemo<ConfiguratorSelection>(() => ({ ...selection }), [selection]);
  const requestKey = JSON.stringify(orderSelection);
  const quoteIsCurrent = selectionIsValid && quoteState?.key === requestKey;
  const quote = quoteState?.quote ?? null;
  const currentQuote = quoteIsCurrent ? quote : null;
  const metadata = quoteState?.metadata ?? null;

  useEffect(() => {
    if (!selectionIsValid) return;

    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/rainbow-six-siege/unrated-matches-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selection: orderSelection }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as RainbowSixSiegeUnratedQuoteApiResponse;
        if (!response.ok) throw new Error(payload.error ?? "Unable to calculate quote.");
        if (!active) return;
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

  useEffect(() => {
    if (!verifyOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => verifyCloseRef.current?.focus());
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setVerifyOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [verifyOpen]);

  function update(key: string, value: string | number | boolean) {
    setQuoteError(null);
    setOrderError(null);
    setVerifyOpen(false);
    setSelection((current) => ({ ...current, [key]: value }));
  }

  const belowMinimum = Boolean(currentQuote && !meetsMinimumOrderTotal(currentQuote.total));
  const minimumShortfallCents = currentQuote ? minimumOrderShortfallCents(currentQuote.total) : 0;
  const canCheckout = Boolean(selectionIsValid && currentQuote && metadata && !belowMinimum && !isLoading && !quoteError && quoteIsCurrent);

  async function createOrder() {
    if (!canCheckout || isCreatingOrder) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const response = await fetch("/api/rainbow-six-siege/unrated-matches-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: orderSelection }),
      });
      const payload = (await response.json()) as {
        order?: { id: string; orderNumber: string };
        error?: string;
      };
      if (response.status === 401) {
        checkoutIntent.saveForAuthentication();
        router.push(`/login?next=${encodeURIComponent("/games/rainbow-six-siege/unrated-matches")}`);
        return;
      }
      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to create order.");
      }
      checkoutIntent.clearAfterOrder();
      setVerifyOpen(false);
      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const checkoutIntent = useCheckoutIntentContinuity({
    gameSlug: "rainbow-six-siege",
    serviceSlug: R6_UNRATED_SERVICE_SLUG,
    selection,
    setSelection,
    canAutoResume: canCheckout,
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  const platformLabel =
    rainbowSixSiegeUnratedPlatformOptions.find((option) => option.value === selection.platform)?.label ?? "—";
  const modeLabel =
    rainbowSixSiegeUnratedModeOptions.find((option) => option.value === selection.gameMode)?.label ?? "—";
  const serverLabel =
    rainbowSixSiegeUnratedServerOptions.find((option) => option.value === selection.server)?.label ?? "—";
  const selectedCustomizations = rainbowSixSiegeUnratedCustomizationOptions.filter(
    (option) => selection[option.key] === true,
  );

  const quoteStatus = !selectionIsValid
    ? "Complete your selection"
    : quoteError
      ? "Quote unavailable"
      : (isLoading || !quoteIsCurrent)
        ? "Updating price…"
        : belowMinimum
          ? "Below minimum"
          : quote
            ? "Price confirmed"
            : "Waiting for quote";

  return (
    <>
      <div className="grid gap-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:pb-0">
        <section className="min-w-0 space-y-4">
          <ConfiguratorBlock title="Number of Games" helper="Choose between one and ten completed unrated matches. Ranked games are not included.">
            <div role="radiogroup" aria-label="Number of Games" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((games) => <Choice key={games} active={selection.games === games} label={String(games)} onClick={() => update("games", games)} />)}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Platform" helper="Choose the platform used for this order.">
            <div role="radiogroup" aria-label="Platform" className="grid gap-2 sm:grid-cols-3">
              {rainbowSixSiegeUnratedPlatformOptions.map((option) => (
                <Choice
                  key={option.value}
                  active={selection.platform === option.value}
                  label={option.label}
                  meta={option.meta}
                  onClick={() => update("platform", option.value)}
                />
              ))}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Game mode" helper="Choose how the service will be fulfilled.">
            <div role="radiogroup" aria-label="Game mode" className="grid gap-2 sm:grid-cols-2">
              {rainbowSixSiegeUnratedModeOptions.map((option) => (
                <Choice
                  key={option.value}
                  active={selection.gameMode === option.value}
                  label={option.label}
                  meta={option.meta}
                  description={option.description}
                  onClick={() => update("gameMode", option.value)}
                />
              ))}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock title="Server" helper="Select the server region for the order.">
            <div role="radiogroup" aria-label="Server" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rainbowSixSiegeUnratedServerOptions.map((option) => (
                <Choice
                  key={option.value}
                  active={selection.server === option.value}
                  label={option.label}
                  meta={option.meta}
                  onClick={() => update("server", option.value)}
                />
              ))}
            </div>
          </ConfiguratorBlock>

          <ConfiguratorBlock
            title="Optional customizations"
            helper="Nothing is preselected. Add only the options you want."
          >
            <div className="grid gap-2 md:grid-cols-2">
              {rainbowSixSiegeUnratedCustomizationOptions.map((option) => (
                <Toggle
                  key={option.key}
                  checked={selection[option.key] === true}
                  title={option.label}
                  meta={option.meta}
                  description={option.description}
                  onChange={(checked) => update(option.key, checked)}
                />
              ))}
            </div>
          </ConfiguratorBlock>
        </section>

        <aside className="min-w-0 xl:sticky xl:top-24">
          <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09]">
            <div className="border-b border-white/[0.07] bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-transparent px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                    Order Summary
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">Rainbow Six Siege Unrated Matches</p>
                </div>
                <span aria-live="polite" role="status" className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-[#A0AAA4]">
                  {isLoading ? <LoaderCircle className="mr-1 inline size-3 animate-spin motion-reduce:animate-none" /> : null}
                  {quoteStatus}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4" aria-busy={isLoading || (selectionIsValid && !quoteIsCurrent)}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                {[
                  ["Number of Games", String(selection.games)],
                  ["Platform", platformLabel],
                  ["Mode", modeLabel],
                  ["Server", serverLabel],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <p className="text-white/32">{label}</p>
                    <p className="mt-1 truncate font-semibold text-white/75">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Customizations</p>
                <p className="mt-2 text-[11px] leading-5 text-white/58">
                  {selectedCustomizations.length
                    ? selectedCustomizations.map((option) => option.label).join(", ")
                    : "None selected"}
                </p>
              </div>

              {metadata && quote ? (
                <div className="space-y-2.5 border-t border-white/[0.06] pt-4 text-[11px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/42">Base price</span>
                    <span className="font-semibold text-white/75">{formatUsdCents(metadata.basePriceCents)}</span>
                  </div>
                  {metadata.percentageModifiers.map((modifier) => (
                    <div key={`${modifier.label}-${modifier.display}`} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-white/42">{modifier.label} {modifier.display}</span>
                      <span className="font-semibold text-white/65">+{formatUsdCents(modifier.amountCents)}</span>
                    </div>
                  ))}
                  {metadata.fixedChargesCents > 0 ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/42">Streaming</span>
                      <span className="font-semibold text-white/65">+{formatUsdCents(metadata.fixedChargesCents)}</span>
                    </div>
                  ) : null}
                  {metadata.discountCents > 0 ? (
                    <div className="flex items-center justify-between gap-3 text-emerald-100/75">
                      <span>Progressive discount ({metadata.discountBps / 100}%)</span>
                      <span className="font-semibold">−{formatUsdCents(metadata.discountCents)}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {quoteError ? (
                <div role="alert" className="rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] leading-4 text-rose-200">
                  {quoteError} <button type="button" className="underline" onClick={() => { setQuoteError(null); setSelection((current) => ({ ...current })); }}>Retry</button>
                </div>
              ) : null}

              <div className="border-t border-white/[0.06] pt-4" role="status" aria-live="polite" aria-atomic="true">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#A0AAA4]">Final total</p>
                    <p className={`font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] ${quote ? "text-white" : "text-white/30"}`}>
                      {quote ? formatUsd(quote.total) : "—"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] text-white/45">USD</span>
                </div>
              </div>

              <MinimumOrderNotice
                id="r6-unrated-minimum-order"
                shortfallCents={belowMinimum ? minimumShortfallCents : 0}
              />

              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/15">
                <div className="flex items-start gap-2.5 px-3 py-3">
                  <Clock3 className="mt-0.5 size-3.5 shrink-0 text-emerald-200/65" aria-hidden="true" />
                  <div
                    className="min-w-0"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200/65">
                      Estimated starting time
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-white/72">
                      {selectionIsValid ? (selection.expressDelivery === true ? R6_STARTING_TIME_RANGES.priority : R6_STARTING_TIME_RANGES.standard) : "Unavailable"}
                    </p>
                    <p className="mt-1 text-[9px] leading-4 text-white/30">
                      {selectionIsValid
                        ? R6_STARTING_TIME_DISCLAIMER
                        : "Select a valid configuration to view an estimate."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 border-t border-white/[0.06] px-3 py-3">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-200/65" aria-hidden="true" />
                  <p className="text-[10px] leading-4 text-white/42">
                    Your final price is confirmed when the order is placed.
                  </p>
                </div>
              </div>

              {orderError ? (
                <div role="alert" className="rounded-lg border border-rose-300/15 bg-rose-400/[0.06] p-2.5 text-[10px] text-rose-200">
                  {orderError}
                </div>
              ) : null}

              <Button
                type="button"
                size="lg"
                onClick={() => setVerifyOpen(true)}
                disabled={!canCheckout || isCreatingOrder}
                aria-describedby={belowMinimum ? "r6-unrated-minimum-order" : undefined}
                className="h-12 w-full rounded-xl font-semibold"
              >
                Checkout
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <PaymentMethodsTrustBlock />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_3.75rem] items-center gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p>
            <p className="font-gaming-value mt-0.5 truncate text-[1.45rem] font-bold leading-none text-white">
              {quote ? formatUsd(quote.total) : "—"}
            </p>
            {belowMinimum ? <p className="mt-1 text-[9px] leading-3 text-amber-100/70">Minimum $5.00</p> : null}
          </div>
          <Button
            type="button"
            size="md"
            onClick={() => setVerifyOpen(true)}
            disabled={!canCheckout || isCreatingOrder}
            aria-describedby={belowMinimum ? "r6-unrated-minimum-order" : undefined}
            className="h-11 px-3 text-[11px] font-semibold"
          >
            Checkout
            <ArrowRight className="ml-1.5 size-3.5" aria-hidden="true" />
          </Button>
          <span aria-hidden="true" />
        </div>
      </div>

      {verifyOpen && quote && metadata ? (
        <div className="fixed inset-0 z-[10000] grid place-items-center bg-black/78 px-3 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setVerifyOpen(false);
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="r6-unrated-verify-order-title"
            className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[1.4rem] border border-white/[0.10] bg-[#080B09] shadow-[0_30px_100px_rgba(0,0,0,.55)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
              <div>
                <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-emerald-200/65">Final check</p>
                <h2 id="r6-unrated-verify-order-title" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white">
                  Verify your order
                </h2>
              </div>
              <button
                ref={verifyCloseRef}
                type="button"
                onClick={() => setVerifyOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] text-white/55 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-300/30"
                aria-label="Close order verification"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Number of Games", String(metadata.games)],
                  ["Platform", metadata.platformLabel],
                  ["Mode", metadata.modeLabel],
                  ["Server", metadata.serverLabel],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-3">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-white/80">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">Customizations</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  {metadata.selectedCustomizationLabels.length
                    ? metadata.selectedCustomizationLabels.join(", ")
                    : "None selected"}
                </p>
              </div>

              <div className="space-y-2 border-t border-white/[0.07] pt-4 text-xs">
                {quote.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-white/45">{item.label}</span>
                    <span className={item.amount < 0 ? "font-semibold text-emerald-100/75" : "font-semibold text-white/70"}>
                      {item.amount < 0 ? "−" : item.amount > 0 && !item.label.startsWith("Unrated matches ·") ? "+" : ""}
                      {formatUsd(Math.abs(item.amount))}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
                  <span className="text-sm font-semibold text-white/65">Final total</span>
                  <span className="font-gaming-value text-3xl font-bold tracking-[-0.04em] text-white">{formatUsd(quote.total)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-300/[0.10] bg-emerald-400/[0.025] p-3 text-[10px] leading-5 text-white/48">
                Review your selections and total. Changes to your configuration require a new price confirmation before checkout.
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" size="lg" onClick={() => setVerifyOpen(false)} className="h-12 rounded-xl">
                  Back to configuration
                </Button>
                <Button type="button" size="lg" onClick={createOrder} disabled={!canCheckout || isCreatingOrder} className="h-12 rounded-xl font-semibold">
                  {isCreatingOrder ? (
                    <>
                      Preparing checkout
                      <LoaderCircle className="ml-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Checkout
                      <LockKeyhole className="ml-2 size-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-[10px] leading-4 text-white/30">
                Payment is handled through secure checkout after your order is confirmed.
              </p>
            </div>
          </section>
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite">
        {quoteIsCurrent && currentQuote ? `Quote updated to ${formatUsd(currentQuote.total)}.` : quoteStatus}
      </div>
    </>
  );
}
