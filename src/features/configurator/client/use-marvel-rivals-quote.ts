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
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setQuote(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
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
        setQuote(payload.quote);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setQuote(null);
        setError(requestError instanceof Error ? requestError.message : "Unable to calculate quote.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, selection, serviceSlug]);

  return { quote, error, isLoading };
}
