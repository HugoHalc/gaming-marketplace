"use client";

import { useState } from "react";
import type { QuotePreview } from "@/features/configurator/types/configurator";

/** Keep the last server price visible while a fresh quote is pending.
 * This value is for rendering only; checkout always uses the current quote.
 */
export function usePresentedServiceQuote(quote: QuotePreview | null) {
  const [previousQuote, setPreviousQuote] = useState(quote);
  if (quote && quote !== previousQuote) setPreviousQuote(quote);
  return quote ?? previousQuote;
}
