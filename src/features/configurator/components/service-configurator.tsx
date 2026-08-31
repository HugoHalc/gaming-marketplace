"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceSummary } from "@/features/catalog/types/catalog";
import { getDefaultSelection } from "../data/mock-configurators";
import type {
  ConfiguratorSelection,
  QuotePreview,
  ServiceConfiguratorSchema,
} from "../types/configurator";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

interface ServiceConfiguratorProps {
  gameSlug: string;
  service: ServiceSummary;
  schema: ServiceConfiguratorSchema;
}

export function ServiceConfigurator({ gameSlug, service, schema }: ServiceConfiguratorProps) {
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="rounded-[1.75rem] border border-white/[0.08] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-violet-300">Configure service</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
              Build your {service.name} order
            </h2>
          </div>
          <span className="hidden rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300 sm:inline-flex">
            Live preview
          </span>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {schema.fields.map((field) => (
            <div key={field.key} className={field.type === "toggle" ? "sm:col-span-2" : undefined}>
              {field.type === "select" ? (
                <label className="block">
                  <span className="text-sm font-semibold text-white">{field.label}</span>
                  {field.description ? (
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{field.description}</span>
                  ) : null}
                  <select
                    value={String(selection[field.key])}
                    onChange={(event) => updateSelection(field.key, event.target.value)}
                    className="mt-3 h-12 w-full rounded-xl border border-white/[0.09] bg-[#0b0c14] px-3.5 text-sm text-white outline-none transition-colors focus:border-violet-300/35 focus:ring-2 focus:ring-violet-400/15"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              ) : null}

              {field.type === "number" ? (
                <label className="block">
                  <span className="text-sm font-semibold text-white">{field.label}</span>
                  {field.description ? (
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{field.description}</span>
                  ) : null}
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={Number(selection[field.key])}
                    onChange={(event) => updateSelection(field.key, Number(event.target.value))}
                    className="mt-3 h-12 w-full rounded-xl border border-white/[0.09] bg-[#0b0c14] px-3.5 text-sm text-white outline-none transition-colors focus:border-violet-300/35 focus:ring-2 focus:ring-violet-400/15"
                  />
                </label>
              ) : null}

              {field.type === "toggle" ? (
                <label className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-white/[0.08] bg-black/15 p-4 sm:p-5">
                  <span>
                    <span className="block text-sm font-semibold text-white">{field.label}</span>
                    {field.description ? (
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{field.description}</span>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={selection[field.key] === true}
                    onChange={(event) => updateSelection(field.key, event.target.checked)}
                    className="mt-0.5 size-5 accent-violet-500"
                  />
                </label>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-black/15 p-5">
          <p className="text-sm font-semibold text-white">Before checkout</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {schema.notes.map((note) => (
              <div key={note} className="flex gap-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-[1.75rem] border border-violet-300/15 bg-[#0d0e18] shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-violet-500/[0.13] to-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-violet-200">Order preview</p>
                <p className="mt-1 text-lg font-semibold text-white">{service.name}</p>
              </div>
              {isLoading ? <LoaderCircle className="size-4 animate-spin text-violet-300" /> : null}
            </div>
          </div>

          <div className="p-5 sm:p-6">
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
                      <span className={item.amount < 0 ? "font-medium text-emerald-300" : "font-medium text-white"}>
                        {item.amount < 0 ? "−" : ""}{formatPrice(Math.abs(item.amount))}
                      </span>
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
            ) : (
              <div className="py-6 text-sm text-[var(--muted-foreground)]">Adjust the configuration to generate a valid quote.</div>
            )}

            {orderError ? (
              <div className="mt-5 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">{orderError}</div>
            ) : null}

            <Button className="mt-6 w-full" size="lg" disabled={!quote || isLoading || isCreatingOrder} onClick={createOrder}>
              {isCreatingOrder ? <>Creating order<LoaderCircle className="ml-2 size-4 animate-spin" /></> : <>Create order<ArrowRight className="ml-2 size-4" /></>}
            </Button>
            <div className="mt-4 flex gap-2 text-[11px] leading-5 text-white/40">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              <span>Your price is recalculated on the server before the order is stored. Payment is completed separately.</span>
            </div>
            {quote ? (
              <p className="mt-3 text-[10px] text-white/25">Pricing rules: {quote.ruleSetVersion}</p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
