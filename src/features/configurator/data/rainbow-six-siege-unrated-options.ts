import type { QuotePreview } from "../types/configurator";
import type { RainbowSixSiegeUnratedQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-unrated-pricing";
export type { RainbowSixSiegeUnratedQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-unrated-pricing";
import { rainbowSixSiegePlatformOptions, rainbowSixSiegeServerOptions } from "./rainbow-six-siege-rank-options";

export const R6_UNRATED_SERVICE_SLUG = "unrated-matches" as const;
export const rainbowSixSiegeUnratedPlatformOptions = rainbowSixSiegePlatformOptions.map((option) => ({ ...option, meta: "FREE" }));
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
  { key: "oneTrickPony", label: "One Trick Pony", meta: "+30%", description: "Request a single operator preference." },
  { key: "vipPriority", label: "VIP Priority", meta: "+50%", description: "Request priority assignment when available." },
  { key: "insaneClipDrop", label: "Insane Clip Drop", meta: "+15%", description: "Request an emphasis on clip-worthy plays." },
  { key: "eliteBoosterTier", label: "Elite Booster Tier", meta: "+50%", description: "Request a higher-tier eligible booster." },
] as const;
export type RainbowSixSiegeUnratedQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: RainbowSixSiegeUnratedQuoteMetadata;
  error?: string;
};
