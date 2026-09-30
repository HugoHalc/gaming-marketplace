import { meetsMinimumOrderTotal } from "../../orders/minimum-order";
import {
  BOOSTINGPEDIA_REFERENCE_SHARE_BPS,
  STREAMING_FIXED_CENTS,
  progressiveDiscountBps,
  roundHalfUp,
  type RainbowSixSiegeRankQuote,
} from "./rainbow-six-siege-rank-pricing";

export const R6_UNRATED_RULE_SET_VERSION = "rainbow-six-siege-unrated-v1";
// Frozen, permanently discounted displayed reference for 1–10 completed matches.
export const R6_UNRATED_REFERENCE_CENTS = [179, 359, 538, 718, 897, 1076, 1256, 1435, 1615, 1794] as const;
export type RainbowSixSiegeUnratedSelection = Record<string, string | number | boolean>;

const platforms = {
  pc: { label: "PC", bps: 0 },
  xbox: { label: "Xbox", bps: 2000 },
  playstation: { label: "PlayStation", bps: 2000 },
} as const;
const servers = {
  europe: "Europe", "north-america": "North America", "latin-america": "Latin America",
  asia: "Asia", oceania: "Oceania", brazil: "Brazil", "middle-east": "Middle East",
} as const;
const modes = { solo: { label: "Solo", bps: 0 }, duo: { label: "Duo", bps: 8000 } } as const;
const extras = {
  playOffline: { label: "Play Offline", bps: 0, fixedCents: 0 },
  specificOperators: { label: "Specific Operators", bps: 0, fixedCents: 0 },
  streaming: { label: "Streaming", bps: 0, fixedCents: STREAMING_FIXED_CENTS },
  expressDelivery: { label: "Express Delivery", bps: 2000, fixedCents: 0 },
  highKillCount: { label: "High Kill Count", bps: 4000, fixedCents: 0 },
} as const;
const allowedKeys = new Set(["games", "platform", "server", "gameMode", ...Object.keys(extras)]);
function option<T extends Record<string, unknown>>(values: T, value: unknown, label: string): T[keyof T] {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(values, value)) {
    throw new Error(`Select a valid ${label}.`);
  }
  return values[value as keyof T];
}
const dollars = (cents: number) => cents / 100;

export type RainbowSixSiegeUnratedQuoteMetadata = {
  games: number;
  platformLabel: string;
  serverLabel: string;
  modeLabel: string;
  selectedCustomizationLabels: string[];
  referenceCents: number;
  basePriceCents: number;
  percentageModifiers: Array<{ label: string; display: string; amountCents: number }>;
  totalModifierBps: number;
  percentageAdjustedCents: number;
  fixedChargesCents: number;
  preDiscountSubtotalCents: number;
  discountBps: number;
  discountCents: number;
  finalTotalCents: number;
  checkoutEligible: boolean;
  pricingVersion: typeof R6_UNRATED_RULE_SET_VERSION;
};

export function calculateRainbowSixSiegeUnratedPricing(
  selection: RainbowSixSiegeUnratedSelection,
): { quote: RainbowSixSiegeRankQuote; metadata: RainbowSixSiegeUnratedQuoteMetadata } {
  if (!selection || typeof selection !== "object" || Array.isArray(selection) ||
      Object.keys(selection).some((key) => !allowedKeys.has(key))) {
    throw new Error("Invalid Rainbow Six Siege Unrated Matches selection.");
  }
  const games = selection.games;
  if (typeof games !== "number" || !Number.isInteger(games) || games < 1 || games > 10) {
    throw new Error("Select 1 to 10 games.");
  }
  const platform = option(platforms, selection.platform, "platform");
  const serverLabel = option(servers, selection.server, "server");
  const mode = option(modes, selection.gameMode, "game mode");
  const selectedExtras = (Object.keys(extras) as Array<keyof typeof extras>).filter((key) => {
    if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
    return selection[key];
  }).map((key) => extras[key]);

  const referenceCents = R6_UNRATED_REFERENCE_CENTS[games - 1];
  const basePriceCents = roundHalfUp(referenceCents * BOOSTINGPEDIA_REFERENCE_SHARE_BPS, 10000);
  const percentageSources = [platform, mode, ...selectedExtras].filter((item) => item.bps > 0);
  const totalModifierBps = percentageSources.reduce((sum, item) => sum + item.bps, 0);
  const percentageAdjustedCents = roundHalfUp(basePriceCents * (10000 + totalModifierBps), 10000);
  const percentageModifiers = percentageSources.map((item) => ({
    label: item.label, display: `+${item.bps / 100}%`,
    amountCents: roundHalfUp(basePriceCents * item.bps, 10000),
  }));
  const delta = percentageAdjustedCents - basePriceCents -
    percentageModifiers.reduce((sum, item) => sum + item.amountCents, 0);
  if (delta && percentageModifiers.length) percentageModifiers[percentageModifiers.length - 1].amountCents += delta;
  const fixedChargesCents = selectedExtras.reduce((sum, item) => sum + item.fixedCents, 0);
  const preDiscountSubtotalCents = percentageAdjustedCents + fixedChargesCents;
  const discountBps = progressiveDiscountBps(preDiscountSubtotalCents);
  const discountCents = roundHalfUp(preDiscountSubtotalCents * discountBps, 10000);
  const finalTotalCents = preDiscountSubtotalCents - discountCents;
  const checkoutEligible = meetsMinimumOrderTotal(dollars(finalTotalCents));
  const quote: RainbowSixSiegeRankQuote = {
    currency: "USD", subtotal: dollars(preDiscountSubtotalCents), discount: dollars(discountCents),
    total: dollars(finalTotalCents), ruleSetVersion: R6_UNRATED_RULE_SET_VERSION,
    breakdown: [
      { label: `Unrated matches · ${games} ${games === 1 ? "game" : "games"}`, amount: dollars(basePriceCents) },
      ...percentageModifiers.map((item) => ({ label: `${item.label} (${item.display})`, amount: dollars(item.amountCents) })),
      ...selectedExtras.filter((item) => item.fixedCents > 0).map((item) => ({ label: `${item.label} (+$10.00)`, amount: dollars(item.fixedCents) })),
      ...selectedExtras.filter((item) => item.bps === 0 && item.fixedCents === 0).map((item) => ({ label: item.label, amount: 0 })),
      ...(discountCents ? [{ label: `Progressive discount (${discountBps / 100}% OFF)`, amount: -dollars(discountCents) }] : []),
    ],
  };
  return {
    quote,
    metadata: {
      games, platformLabel: platform.label, serverLabel, modeLabel: mode.label,
      selectedCustomizationLabels: selectedExtras.map((item) => item.label),
      referenceCents, basePriceCents, percentageModifiers, totalModifierBps,
      percentageAdjustedCents, fixedChargesCents, preDiscountSubtotalCents,
      discountBps, discountCents, finalTotalCents, checkoutEligible,
      pricingVersion: R6_UNRATED_RULE_SET_VERSION,
    },
  };
}
