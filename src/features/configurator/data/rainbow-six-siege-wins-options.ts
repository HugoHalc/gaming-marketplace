import type { QuotePreview } from "../types/configurator";
import { rainbowSixSiegeRankOptions, rainbowSixSiegePlatformOptions, rainbowSixSiegeServerOptions, rainbowSixSiegeCustomizationOptions } from "./rainbow-six-siege-rank-options";
import type { RainbowSixSiegeRankQuoteMetadata } from "@/features/pricing/server/rainbow-six-siege-rank-pricing";
export const R6_WINS_SERVICE_SLUG = "competitive-wins" as const;
export { rainbowSixSiegeRankOptions, rainbowSixSiegePlatformOptions, rainbowSixSiegeServerOptions };
export const rainbowSixSiegeModeOptions = [
  { value: "solo", label: "Solo", meta: "FREE", description: "A booster plays on your account." },
  { value: "duo", label: "Duo", meta: "+80%", description: "Play alongside a booster." },
] as const;
export const rainbowSixSiegeWinsCustomizationOptions = rainbowSixSiegeCustomizationOptions.filter((option) => option.key !== "rankInsurance");
export type RainbowSixSiegeWinsQuoteMetadata = Omit<RainbowSixSiegeRankQuoteMetadata, "desiredRank" | "desiredRankLabel" | "rpGainLabel"> & { wins: number; normalBenchmarkCents: number; discountedReferenceCents: number; pricingVersion: string };
export type RainbowSixSiegeWinsQuoteApiResponse = {quote?: QuotePreview; metadata?: RainbowSixSiegeWinsQuoteMetadata; error?: string};
