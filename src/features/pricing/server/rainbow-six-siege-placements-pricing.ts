import { meetsMinimumOrderTotal } from "../../orders/minimum-order";
import {
  BOOSTINGPEDIA_REFERENCE_SHARE_BPS,
  progressiveDiscountBps,
  roundHalfUp,
  type RainbowSixSiegeRankQuote,
} from "./rainbow-six-siege-rank-pricing";

export const R6_PLACEMENTS_RULE_SET_VERSION = "rainbow-six-siege-placements-v1";

// Frozen permanent-discount competitor display prices, by 1–5 games.
export const R6_PLACEMENTS_REFERENCE_CENTS = {
  copper: [113, 225, 338, 450, 563],
  bronze: [113, 225, 338, 450, 563],
  silver: [113, 225, 338, 450, 563],
  gold: [150, 300, 450, 600, 750],
  platinum: [188, 375, 563, 750, 938],
  emerald: [338, 675, 1013, 1350, 1688],
  diamond: [450, 900, 1350, 1800, 2250],
  champion: [750, 1500, 2250, 3000, 3750],
} as const satisfies Record<string, readonly [number, number, number, number, number]>;

export type RainbowSixSiegePlacementsRank = keyof typeof R6_PLACEMENTS_REFERENCE_CENTS;
export type RainbowSixSiegePlacementsSelection = Record<string, string | number | boolean>;

const platforms = {
  pc: { label: "PC", bps: 0 },
  xbox: { label: "Xbox", bps: 2000 },
  playstation: { label: "PlayStation", bps: 2000 },
} as const;
const modes = {
  solo: { label: "Solo", bps: 0 },
  duo: { label: "Duo", bps: 8000 },
} as const;
const servers = {
  europe: { label: "Europe", bps: 0 },
  "north-america": { label: "North America", bps: 0 },
  "latin-america": { label: "Latin America", bps: 0 },
  asia: { label: "Asia", bps: 0 },
  oceania: { label: "Oceania", bps: 1000 },
  brazil: { label: "Brazil", bps: 0 },
  "middle-east": { label: "Middle East", bps: 0 },
} as const;
const extras = {
  playOffline: { label: "Play Offline", bps: 0 },
  specificOperators: { label: "Specific Operators", bps: 0 },
  streaming: { label: "Streaming", bps: 1000 },
  expressDelivery: { label: "Express Delivery", bps: 2000 },
  highKillCount: { label: "High Kill Count", bps: 4000 },
} as const;
const allowedKeys = new Set([
  "previousSeasonRank", "games", "platform", "gameMode", "server", ...Object.keys(extras),
]);

function option<T extends Record<string, { label: string; bps: number }>>(
  values: T,
  value: unknown,
  label: string,
): T[keyof T] {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(values, value)) {
    throw new Error(`Select a valid ${label}.`);
  }
  return values[value as keyof T];
}

function dollars(cents: number) {
  return cents / 100;
}

export type RainbowSixSiegePlacementsQuoteMetadata = {
  previousSeasonRank: RainbowSixSiegePlacementsRank;
  previousSeasonRankLabel: string;
  games: number;
  platformLabel: string;
  modeLabel: string;
  serverLabel: string;
  selectedCustomizationLabels: string[];
  referenceCents: number;
  basePriceCents: number;
  totalModifierBps: number;
  percentageModifiers: Array<{ label: string; display: string; amountCents: number }>;
  percentageAdjustedCents: number;
  preDiscountSubtotalCents: number;
  discountBps: number;
  discountCents: number;
  finalTotalCents: number;
  checkoutEligible: boolean;
  pricingVersion: typeof R6_PLACEMENTS_RULE_SET_VERSION;
};

export function calculateRainbowSixSiegePlacementsPricing(
  selection: RainbowSixSiegePlacementsSelection,
): { quote: RainbowSixSiegeRankQuote; metadata: RainbowSixSiegePlacementsQuoteMetadata } {
  if (!selection || typeof selection !== "object" || Array.isArray(selection) ||
      Object.keys(selection).some((key) => !allowedKeys.has(key))) {
    throw new Error("Invalid Rainbow Six Siege Placements Boost selection.");
  }

  const rank = selection.previousSeasonRank;
  if (typeof rank !== "string" || !Object.prototype.hasOwnProperty.call(R6_PLACEMENTS_REFERENCE_CENTS, rank)) {
    throw new Error("Select a valid previous season rank.");
  }
  const previousSeasonRank = rank as RainbowSixSiegePlacementsRank;
  const games = selection.games;
  if (typeof games !== "number" || !Number.isInteger(games) || games < 1 || games > 5) {
    throw new Error("Select 1 to 5 games.");
  }
  const platform = option(platforms, selection.platform, "platform");
  const mode = option(modes, selection.gameMode, "game mode");
  const server = option(servers, selection.server, "server");
  const selectedExtras = (Object.keys(extras) as Array<keyof typeof extras>).filter((key) => {
    if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
    return selection[key] === true;
  }).map((key) => extras[key]);

  const referenceCents = R6_PLACEMENTS_REFERENCE_CENTS[previousSeasonRank][games - 1];
  const basePriceCents = roundHalfUp(referenceCents * BOOSTINGPEDIA_REFERENCE_SHARE_BPS, 10000);
  const percentageSources = [platform, mode, server, ...selectedExtras].filter((item) => item.bps > 0);
  const totalModifierBps = percentageSources.reduce((sum, item) => sum + item.bps, 0);
  const percentageAdjustedCents = roundHalfUp(basePriceCents * (10000 + totalModifierBps), 10000);
  const percentageModifiers = percentageSources.map((item) => ({
    label: item.label,
    display: `+${item.bps / 100}%`,
    amountCents: roundHalfUp(basePriceCents * item.bps, 10000),
  }));
  const delta = percentageAdjustedCents - basePriceCents -
    percentageModifiers.reduce((sum, item) => sum + item.amountCents, 0);
  if (delta !== 0 && percentageModifiers.length) {
    percentageModifiers[percentageModifiers.length - 1].amountCents += delta;
  }
  const preDiscountSubtotalCents = percentageAdjustedCents;
  const discountBps = progressiveDiscountBps(preDiscountSubtotalCents);
  const discountCents = roundHalfUp(preDiscountSubtotalCents * discountBps, 10000);
  const finalTotalCents = preDiscountSubtotalCents - discountCents;
  const checkoutEligible = meetsMinimumOrderTotal(dollars(finalTotalCents));
  const previousSeasonRankLabel = previousSeasonRank[0].toUpperCase() + previousSeasonRank.slice(1);
  const quote: RainbowSixSiegeRankQuote = {
    currency: "USD",
    subtotal: dollars(preDiscountSubtotalCents),
    discount: dollars(discountCents),
    total: dollars(finalTotalCents),
    ruleSetVersion: R6_PLACEMENTS_RULE_SET_VERSION,
    breakdown: [
      { label: `Placements · ${previousSeasonRankLabel} · ${games} ${games === 1 ? "game" : "games"}`, amount: dollars(basePriceCents) },
      ...percentageModifiers.map((item) => ({ label: `${item.label} (${item.display})`, amount: dollars(item.amountCents) })),
      ...selectedExtras.filter((item) => item.bps === 0).map((item) => ({ label: item.label, amount: 0 })),
      ...(discountCents ? [{ label: `Progressive discount (${discountBps / 100}% OFF)`, amount: -dollars(discountCents) }] : []),
    ],
  };
  return {
    quote,
    metadata: {
      previousSeasonRank, previousSeasonRankLabel, games,
      platformLabel: platform.label, modeLabel: mode.label, serverLabel: server.label,
      selectedCustomizationLabels: selectedExtras.map((item) => item.label),
      referenceCents, basePriceCents, totalModifierBps, percentageModifiers,
      percentageAdjustedCents, preDiscountSubtotalCents, discountBps, discountCents,
      finalTotalCents, checkoutEligible, pricingVersion: R6_PLACEMENTS_RULE_SET_VERSION,
    },
  };
}
