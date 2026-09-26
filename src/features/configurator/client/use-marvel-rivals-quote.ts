"use client";

import { useEffect, useState } from "react";
import type {
  ConfiguratorSelection,
  QuotePreview,
} from "@/features/configurator/types/configurator";

export function formatMarvelQuoteUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function useMarvelRivalsQuote(
  serviceSlug: string,
  selection: ConfiguratorSelection,
  enabled = true,
) {
  const requestKey = JSON.stringify([serviceSlug, selection]);
  const [quoteState, setQuoteState] = useState<{ key: string; quote: QuotePreview } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const quote = enabled && quoteState?.key === requestKey ? quoteState.quote : null;

  useEffect(() => {
    setQuoteState(null);
    setError(null);

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/quotes/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameSlug: "marvel-rivals",
            serviceSlug,
            selection,
          }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as { quote?: QuotePreview; error?: string };
        if (!response.ok || !payload.quote) {
          throw new Error(payload.error ?? "Unable to calculate quote.");
        }
        if (!active) return;
        setQuoteState({ key: requestKey, quote: payload.quote });
      } catch (requestError) {
        if (!active || (requestError instanceof DOMException && requestError.name === "AbortError")) return;
        setQuoteState(null);
        setError(requestError instanceof Error ? requestError.message : "Unable to calculate quote.");
      } finally {
        if (active) setIsLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, requestKey, selection, serviceSlug]);

  return { quote, error, isLoading };
}
