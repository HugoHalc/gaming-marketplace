import type { QuotePreview } from "../types/configurator";

export const R6_RANK_SERVICE_SLUG = "rank-boost" as const;

export const rainbowSixSiegeRankOptions = [
  { value: "copper-v", label: "Copper V", tier: "Copper", division: "V" },
  { value: "copper-iv", label: "Copper IV", tier: "Copper", division: "IV" },
  { value: "copper-iii", label: "Copper III", tier: "Copper", division: "III" },
  { value: "copper-ii", label: "Copper II", tier: "Copper", division: "II" },
  { value: "copper-i", label: "Copper I", tier: "Copper", division: "I" },
  { value: "bronze-v", label: "Bronze V", tier: "Bronze", division: "V" },
  { value: "bronze-iv", label: "Bronze IV", tier: "Bronze", division: "IV" },
  { value: "bronze-iii", label: "Bronze III", tier: "Bronze", division: "III" },
  { value: "bronze-ii", label: "Bronze II", tier: "Bronze", division: "II" },
  { value: "bronze-i", label: "Bronze I", tier: "Bronze", division: "I" },
  { value: "silver-v", label: "Silver V", tier: "Silver", division: "V" },
  { value: "silver-iv", label: "Silver IV", tier: "Silver", division: "IV" },
  { value: "silver-iii", label: "Silver III", tier: "Silver", division: "III" },
  { value: "silver-ii", label: "Silver II", tier: "Silver", division: "II" },
  { value: "silver-i", label: "Silver I", tier: "Silver", division: "I" },
  { value: "gold-v", label: "Gold V", tier: "Gold", division: "V" },
  { value: "gold-iv", label: "Gold IV", tier: "Gold", division: "IV" },
  { value: "gold-iii", label: "Gold III", tier: "Gold", division: "III" },
  { value: "gold-ii", label: "Gold II", tier: "Gold", division: "II" },
  { value: "gold-i", label: "Gold I", tier: "Gold", division: "I" },
  { value: "platinum-v", label: "Platinum V", tier: "Platinum", division: "V" },
  { value: "platinum-iv", label: "Platinum IV", tier: "Platinum", division: "IV" },
  { value: "platinum-iii", label: "Platinum III", tier: "Platinum", division: "III" },
  { value: "platinum-ii", label: "Platinum II", tier: "Platinum", division: "II" },
  { value: "platinum-i", label: "Platinum I", tier: "Platinum", division: "I" },
  { value: "emerald-v", label: "Emerald V", tier: "Emerald", division: "V" },
  { value: "emerald-iv", label: "Emerald IV", tier: "Emerald", division: "IV" },
  { value: "emerald-iii", label: "Emerald III", tier: "Emerald", division: "III" },
  { value: "emerald-ii", label: "Emerald II", tier: "Emerald", division: "II" },
  { value: "emerald-i", label: "Emerald I", tier: "Emerald", division: "I" },
  { value: "diamond-v", label: "Diamond V", tier: "Diamond", division: "V" },
  { value: "diamond-iv", label: "Diamond IV", tier: "Diamond", division: "IV" },
  { value: "diamond-iii", label: "Diamond III", tier: "Diamond", division: "III" },
  { value: "diamond-ii", label: "Diamond II", tier: "Diamond", division: "II" },
  { value: "diamond-i", label: "Diamond I", tier: "Diamond", division: "I" },
  { value: "champion-v", label: "Champion V", tier: "Champion", division: "V" },
  { value: "champion-iv", label: "Champion IV", tier: "Champion", division: "IV" },
  { value: "champion-iii", label: "Champion III", tier: "Champion", division: "III" },
  { value: "champion-ii", label: "Champion II", tier: "Champion", division: "II" },
  { value: "champion-i", label: "Champion I", tier: "Champion", division: "I" },
] as const;

export const rainbowSixSiegePlatformOptions = [
  { value: "pc", label: "PC", meta: "Free" },
  { value: "xbox", label: "Xbox", meta: "+20%" },
  { value: "playstation", label: "PlayStation", meta: "+20%" },
] as const;

export const rainbowSixSiegeModeOptions = [
  { value: "solo", label: "Solo", meta: "Free", description: "Booster plays on the account used for the order." },
  { value: "duo", label: "Duo", meta: "+57%", description: "Play alongside the booster." },
] as const;

export const rainbowSixSiegeRpGainOptions = [
  { value: "21-plus", label: "21+ RP", meta: "Free" },
  { value: "11-20", label: "11–20 RP", meta: "+36%" },
  { value: "1-10", label: "1–10 RP", meta: "+50%" },
] as const;

export const rainbowSixSiegeServerOptions = [
  { value: "europe", label: "Europe", meta: "Free" },
  { value: "north-america", label: "North America", meta: "Free" },
  { value: "latin-america", label: "Latin America", meta: "Free" },
  { value: "asia", label: "Asia", meta: "Free" },
  { value: "oceania", label: "Oceania", meta: "+10%" },
  { value: "brazil", label: "Brazil", meta: "Free" },
  { value: "middle-east", label: "Middle East", meta: "Free" },
] as const;

export const rainbowSixSiegeCustomizationOptions = [
  { key: "playOffline", label: "Play Offline", meta: "FREE", description: "Request offline status where the platform supports it." },
  { key: "specificOperators", label: "Specific Operators", meta: "FREE", description: "Add an operator preference to the order." },
  { key: "streaming", label: "Streaming", meta: "+$10.00", description: "Request a stream for the active boost session when available." },
  { key: "expressDelivery", label: "Express Delivery", meta: "+20%", description: "Prioritize the order in the eligible fulfillment queue." },
  { key: "highKillCount", label: "High Kill Count", meta: "+40%", description: "Request an emphasis on higher-kill match performance." },
  { key: "oneTrickPony", label: "One Trick Pony", meta: "+30%", description: "Request a focused operator preference for the service." },
  { key: "rankInsurance", label: "Rank Insurance", meta: "+50%", description: "Add the Rank Insurance service option to the order." },
  { key: "vipPriority", label: "VIP Priority", meta: "+50%", description: "Apply the VIP Priority service option to the order." },
  { key: "insaneClipDrop", label: "Insane Clip Drop", meta: "+15%", description: "Add the optional clip-focused service preference." },
  { key: "eliteBoosterTier", label: "Elite Booster Tier", meta: "+50%", description: "Request the Elite Booster Tier option for fulfillment." },
] as const;

export type RainbowSixSiegeRankId = (typeof rainbowSixSiegeRankOptions)[number]["value"];
export type RainbowSixSiegePlatform = (typeof rainbowSixSiegePlatformOptions)[number]["value"];
export type RainbowSixSiegeMode = (typeof rainbowSixSiegeModeOptions)[number]["value"];
export type RainbowSixSiegeRpGain = (typeof rainbowSixSiegeRpGainOptions)[number]["value"];
export type RainbowSixSiegeServer = (typeof rainbowSixSiegeServerOptions)[number]["value"];
export type RainbowSixSiegeCustomizationKey = (typeof rainbowSixSiegeCustomizationOptions)[number]["key"];

export type RainbowSixSiegeRankPercentageModifier = {
  label: string;
  display: string;
  amountCents: number;
};

export type RainbowSixSiegeRankQuoteMetadata = {
  currentRank: RainbowSixSiegeRankId;
  desiredRank: RainbowSixSiegeRankId;
  currentRankLabel: string;
  desiredRankLabel: string;
  platformLabel: string;
  modeLabel: string;
  rpGainLabel: string;
  serverLabel: string;
  selectedCustomizationLabels: string[];
  basePriceCents: number;
  percentageAdjustedCents: number;
  totalModifierBps: number;
  percentageModifiers: RainbowSixSiegeRankPercentageModifier[];
  fixedChargesCents: number;
  preDiscountSubtotalCents: number;
  discountBps: number;
  discountCents: number;
  finalTotalCents: number;
};

export type RainbowSixSiegeRankQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: RainbowSixSiegeRankQuoteMetadata;
  error?: string;
};
