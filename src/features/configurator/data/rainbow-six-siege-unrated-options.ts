import type { QuotePreview } from "../types/configurator";
import type { RainbowSixSiegeUnratedQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-unrated-pricing";
export type { RainbowSixSiegeUnratedQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-unrated-pricing";
import { rainbowSixSiegePlatformOptions, rainbowSixSiegeServerOptions } from "./rainbow-six-siege-rank-options";

export const R6_UNRATED_SERVICE_SLUG = "unrated-matches" as const;
export const rainbowSixSiegeUnratedPlatformOptions = rainbowSixSiegePlatformOptions;
export const rainbowSixSiegeUnratedServerOptions = rainbowSixSiegeServerOptions.map((option) => ({ ...option, meta: "FREE" }));
export const rainbowSixSiegeUnratedModeOptions = [
  { value: "solo", label: "Solo", meta: "FREE", description: "The booster completes the matches on your account." },
  { value: "duo", label: "Duo", meta: "+80%", description: "Play alongside the booster." },
] as const;
export const rainbowSixSiegeUnratedCustomizationOptions = [
  { key: "playOffline", label: "Play Offline", meta: "FREE", description: "Request offline status where supported." },
  { key: "specificOperators", label: "Specific Operators", meta: "FREE", description: "Add an operator preference to your order." },
  { key: "streaming", label: "Streaming", meta: "+$10.00", description: "Request a stream when available." },
  { key: "expressDelivery", label: "Express Delivery", meta: "+20%", description: "Prioritize the order in the eligible queue." },
  { key: "highKillCount", label: "High Kill Count", meta: "+40%", description: "Request an emphasis on higher-kill match performance." },
] as const;
export type RainbowSixSiegeUnratedQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: RainbowSixSiegeUnratedQuoteMetadata;
  error?: string;
};
