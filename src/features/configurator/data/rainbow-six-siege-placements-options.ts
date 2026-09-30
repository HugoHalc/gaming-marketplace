import type { QuotePreview } from "../types/configurator";
import type { RainbowSixSiegePlacementsQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-placements-pricing";
export type { RainbowSixSiegePlacementsQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-placements-pricing";
import {
  rainbowSixSiegePlatformOptions,
  rainbowSixSiegeServerOptions,
} from "./rainbow-six-siege-rank-options";

export const R6_PLACEMENTS_SERVICE_SLUG = "placements-boost" as const;
export const rainbowSixSiegePlacementsRankOptions = [
  { value: "copper", label: "Copper" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "emerald", label: "Emerald" },
  { value: "diamond", label: "Diamond" },
  { value: "champion", label: "Champion" },
] as const;
export { rainbowSixSiegePlatformOptions, rainbowSixSiegeServerOptions };
export const rainbowSixSiegePlacementsModeOptions = [
  { value: "solo", label: "Solo", meta: "FREE", description: "A booster plays on your account." },
  { value: "duo", label: "Duo", meta: "+80%", description: "Play alongside a booster." },
] as const;
export const rainbowSixSiegePlacementsCustomizationOptions = [
  { key: "playOffline", label: "Play Offline", meta: "FREE", description: "Request offline status where supported." },
  { key: "specificOperators", label: "Specific Operators", meta: "FREE", description: "Add an operator preference to your order." },
  { key: "streaming", label: "Streaming", meta: "+$10.00", description: "Request a stream for the active session when available." },
  { key: "expressDelivery", label: "Express Delivery", meta: "+20%", description: "Prioritize the order in the eligible fulfillment queue." },
  { key: "highKillCount", label: "High Kill Count", meta: "+40%", description: "Request an emphasis on higher-kill match performance." },
] as const;
export type RainbowSixSiegePlacementsQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: RainbowSixSiegePlacementsQuoteMetadata;
  error?: string;
};
