"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  Monitor,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import { getDefaultSelection } from "../data/mock-configurators";
import type {
  ConfiguratorField,
  ConfiguratorSelection,
  QuotePreview,
  ServiceConfiguratorSchema,
} from "../types/configurator";
import { ValorantRankValue } from "./valorant-rank-value";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function isRankField(key: string) {
  return key === "currentRank" || key === "targetRank";
}

function FieldLabel({ field }: { field: ConfiguratorField }) {
  return (
    <>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/48">
        {field.label}
      </span>
      {field.description ? (
        <span className="mt-1 block text-xs leading-5 text-white/32">{field.description}</span>
      ) : null}
    </>
  );
}

export function ValorantServiceConfigurator({
  gameSlug,
  service,
  schema,
}: {
  gameSlug: string;
  service: ServiceSummary;
  schema: ServiceConfiguratorSchema;
}) {
  const router = useRouter();
  const defaults = useMemo(() => getDefaultSelection(schema), [schema]);
  const [selection, setSelection] = useState<ConfiguratorSelection>(defaults);
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

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

  function updateSelection(key: string, value: string | number | boolean) {
    setSelection((current) => {
      const next = { ...current, [key]: value };

      if (key === "currentRank" && service.slug === "rank-boost") {
        const rankField = schema.fields.find((field) => field.key === "currentRank");
        const targetField = schema.fields.find((field) => field.key === "targetRank");
        const currentIndex = rankField?.options?.findIndex((option) => option.value === String(value)) ?? -1;
        const targetIndex = targetField?.options?.findIndex(
          (option) => option.value === String(current.targetRank),
        ) ?? -1;

        if (currentIndex >= 0 && targetIndex <= currentIndex && targetField?.options) {
          const nextTarget = targetField.options[currentIndex + 1];
          if (nextTarget) next.targetRank = nextTarget.value;
        }
      }

      return next;
    });
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

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to create order.");
      }

      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(requestError instanceof Error ? requestError.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const rankFields = schema.fields.filter((field) => isRankField(field.key));
  const standardFields = schema.fields.filter(
    (field) => field.type !== "toggle" && !isRankField(field.key) && field.key !== "platform",
  );
  const toggleFields = schema.fields.filter((field) => field.type === "toggle");

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <div className="overflow-hidden rounded-[1.55rem] border border-white/[0.07] bg-[#080B0D]">
        <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-300/70">
                <Sparkles className="size-3.5" />
                Valorant Configuration
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5]">
                {service.name}
              </h2>
              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-white/38">
                Configure only the options that affect this service. Pricing updates automatically from the server.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-medium text-white/45">
              <Monitor className="size-3.5 text-rose-300/70" />
              PC only
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {rankFields.length ? (
            <div className={`grid gap-3 ${rankFields.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {rankFields.map((field) => (
                <label
                  key={field.key}
                  className="group rounded-2xl border border-white/[0.07] bg-[#0B1012] p-4 transition-colors hover:border-rose-300/[0.16]"
                >
                  <ValorantRankValue
                    value={selection[field.key]}
                    label={field.key === "targetRank" ? "Target Rank" : "Current Rank"}
                  />
                  <select
                    value={String(selection[field.key])}
                    onChange={(event) => updateSelection(field.key, event.target.value)}
                    className="mt-4 h-10 w-full rounded-xl border border-white/[0.07] bg-[#070A0C] px-3 text-xs font-medium text-white outline-none transition-colors focus:border-rose-300/30 focus:ring-2 focus:ring-rose-400/10"
                  >
                    {field.options?.map((option) => {
                      const currentRankField = schema.fields.find((item) => item.key === "currentRank");
                      const currentIndex =
                        currentRankField?.options?.findIndex(
                          (item) => item.value === String(selection.currentRank),
                        ) ?? -1;
                      const optionIndex = field.options?.findIndex((item) => item.value === option.value) ?? -1;
                      const disabled =
                        field.key === "targetRank" && currentIndex >= 0 && optionIndex <= currentIndex;

                      return (
                        <option key={option.value} value={option.value} disabled={disabled}>
                          {option.label}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ))}
            </div>
          ) : null}

          {standardFields.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {standardFields.map((field) => (
                <label
                  key={field.key}
                  className="rounded-2xl border border-white/[0.065] bg-[#0A0E10] p-4"
                >
                  <FieldLabel field={field} />
                  {field.type === "select" ? (
                    <select
                      value={String(selection[field.key])}
                      onChange={(event) => updateSelection(field.key, event.target.value)}
                      className="mt-3 h-10 w-full rounded-xl border border-white/[0.07] bg-[#070A0C] px-3 text-xs font-medium text-white outline-none focus:border-rose-300/30 focus:ring-2 focus:ring-rose-400/10"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {field.type === "number" ? (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelection(
                            field.key,
                            Math.max(field.min ?? 1, Number(selection[field.key]) - (field.step ?? 1)),
                          )
                        }
                        className="grid size-10 place-items-center rounded-xl border border-white/[0.07] bg-[#070A0C] text-sm font-bold text-white/65 hover:text-white"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={Number(selection[field.key])}
                        onChange={(event) => updateSelection(field.key, Number(event.target.value))}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-[#070A0C] px-3 text-center text-sm font-bold text-white outline-none focus:border-rose-300/30"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateSelection(
                            field.key,
                            Math.min(field.max ?? 5, Number(selection[field.key]) + (field.step ?? 1)),
                          )
                        }
                        className="grid size-10 place-items-center rounded-xl border border-white/[0.07] bg-[#070A0C] text-sm font-bold text-white/65 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  ) : null}
                </label>
              ))}
            </div>
          ) : null}

          {toggleFields.length ? (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/38">
                    Optional Extras
                  </p>
                  <p className="mt-1 text-xs text-white/28">Choose only what you want added to this order.</p>
                </div>
                <Zap className="size-4 text-rose-300/55" />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {toggleFields.map((field) => {
                  const active = selection[field.key] === true;
                  return (
                    <label
                      key={field.key}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                        active
                          ? "border-rose-300/[0.18] bg-rose-400/[0.055]"
                          : "border-white/[0.06] bg-[#0A0E10] hover:border-white/[0.11]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-[#F4F7F5]">{field.label}</span>
                        {field.description ? (
                          <span className="mt-1 block text-[10px] leading-4 text-white/30">
                            {field.description}
                          </span>
                        ) : null}
                      </span>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(event) => updateSelection(field.key, event.target.checked)}
                        className="size-4 shrink-0 accent-rose-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4 sm:grid-cols-3">
            {schema.notes.map((note) => (
              <div key={note} className="flex gap-2 text-[10px] leading-4 text-white/30">
                <Check className="mt-0.5 size-3 shrink-0 text-emerald-300/70" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="xl:sticky xl:top-24">
        <div className="overflow-hidden rounded-[1.55rem] border border-rose-300/[0.14] bg-[#090C0E]">
          <div className="border-b border-white/[0.06] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-300/65">
                  Order Summary
                </p>
                <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">{service.name}</p>
              </div>
              {isLoading ? <LoaderCircle className="size-4 animate-spin text-rose-300" /> : null}
            </div>

            {selection.currentRank ? (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <ValorantRankValue value={selection.currentRank} label="Current" compact />
                {service.slug === "rank-boost" && selection.targetRank ? (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                    <ArrowRight className="size-3.5 text-white/25" />
                    <ValorantRankValue value={selection.targetRank} label="Target" compact />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="p-5">
            {error ? (
              <div className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {error}
              </div>
            ) : null}

            {quote ? (
              <>
                <div className="space-y-2.5">
                  {quote.breakdown.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 text-xs">
                      <span className="leading-5 text-white/38">{item.label}</span>
                      <span
                        className={`shrink-0 font-semibold ${
                          item.amount < 0 ? "text-emerald-300" : "text-white/80"
                        }`}
                      >
                        {item.amount < 0 ? "−" : ""}
                        {formatPrice(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-4 h-px bg-white/[0.07]" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">Total</p>
                    <p className="mt-1 text-3xl font-bold tracking-[-0.05em] text-[#F4F7F5]">
                      {formatPrice(quote.total)}
                    </p>
                  </div>
                  <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] font-medium text-white/35">
                    USD
                  </span>
                </div>
              </>
            ) : (
              <div className="py-5 text-xs leading-5 text-white/35">
                Adjust your configuration to generate a valid quote.
              </div>
            )}

            {orderError ? (
              <div className="mt-4 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {orderError}
              </div>
            ) : null}

            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!quote || isLoading || isCreatingOrder}
              onClick={createOrder}
            >
              {isCreatingOrder ? (
                <>
                  Creating order
                  <LoaderCircle className="ml-2 size-4 animate-spin" />
                </>
              ) : (
                <>
                  Continue to Checkout
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            <div className="mt-4 flex gap-2 text-[10px] leading-4 text-white/28">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-300/60" />
              <span>Final price is recalculated server-side before the order is stored.</span>
            </div>

            {quote ? (
              <p className="mt-3 text-[9px] text-white/18">Pricing rules: {quote.ruleSetVersion}</p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
