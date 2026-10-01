import type { ConfiguratorSelection, QuoteBreakdownItem, QuotePreview } from "@/features/configurator/types/configurator";
import { ROCKET_LEAGUE_WINS_MAX } from "@/features/configurator/data/rocket-league-limits";
import {
  ROCKET_LEAGUE_REFERENCE_UNITS_PER_CENT,
  rocketLeagueRankOrder,
  rocketLeagueRankReferenceUnits,
  rocketLeagueWinsReferenceUnits,
  rocketLeagueTournamentReferenceUnits,
  rocketLeagueRewardsReferenceUnits,
  rocketLeaguePlacementsReferenceUnits,
} from "./rocket-league-reference";

export type RocketLeaguePricingFamily = "rank" | "wins" | "tournament" | "rewards" | "placements";
export const ROCKET_LEAGUE_PRICING_VERSION = "rocket-league-reference-2026-10-01-v2";
export const ROCKET_LEAGUE_PERMANENT_DISCOUNT_BPS = 4500;

const queueBps: Readonly<Record<string, number>> = {
  "1v1": 0, "2v2": 0, "3v3": 2000, rumble: 2000, hoops: 2000,
  dropshot: 2000, "snow-day": 2000, heatseeker: 2000, "4v4": 3000,
};
const tables = {
  wins: rocketLeagueWinsReferenceUnits,
  tournament: rocketLeagueTournamentReferenceUnits,
  rewards: rocketLeagueRewardsReferenceUnits,
  placements: rocketLeaguePlacementsReferenceUnits,
};

export function roundHalfUp(numerator: number, denominator: number): number {
  if (!Number.isSafeInteger(numerator) || numerator < 0
    || !Number.isSafeInteger(denominator) || denominator <= 0
    || !Number.isSafeInteger(numerator + Math.floor(denominator / 2))) {
    throw new Error("Invalid integer price calculation.");
  }
  return Math.floor((numerator + Math.floor(denominator / 2)) / denominator);
}

export function rocketLeagueProgressiveDiscountBps(subtotalCents: number): number {
  if (subtotalCents >= 20000) return 1200;
  if (subtotalCents >= 15000) return 900;
  if (subtotalCents >= 10000) return 600;
  if (subtotalCents >= 5000) return 300;
  return 0;
}

export function rocketLeaguePriceFromReferenceSubtotal(referenceSubtotalCents: number) {
  if (!Number.isSafeInteger(referenceSubtotalCents) || referenceSubtotalCents < 0) {
    throw new Error("Invalid reference subtotal cents.");
  }
  const progressiveDiscountBps = rocketLeagueProgressiveDiscountBps(referenceSubtotalCents);
  const combinedDiscountBps = ROCKET_LEAGUE_PERMANENT_DISCOUNT_BPS + progressiveDiscountBps;
  const discountedReferenceCents = roundHalfUp(referenceSubtotalCents * (10000 - combinedDiscountBps), 10000);
  const totalCents = roundHalfUp(discountedReferenceCents * 6000, 10000);
  return { referenceSubtotalCents, progressiveDiscountBps, combinedDiscountBps, discountedReferenceCents, totalCents };
}

function quantity(value: unknown, maximum: number): number {
  if ((typeof value !== "number" && typeof value !== "string") || value === "") {
    throw new Error(`Quantity must be a whole number between 1 and ${maximum}.`);
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error(`Quantity must be a whole number between 1 and ${maximum}.`);
  }
  return parsed;
}

export function rocketLeagueReferenceBaseUnits(family: RocketLeaguePricingFamily, selection: ConfiguratorSelection): number {
  if (family === "rank") {
    const from = rocketLeagueRankOrder.indexOf(String(selection.currentRank) as typeof rocketLeagueRankOrder[number]);
    const to = rocketLeagueRankOrder.indexOf(String(selection.targetRank) as typeof rocketLeagueRankOrder[number]);
    if (from < 0 || to < 0) throw new Error("Select a valid Rocket League rank.");
    if (to <= from) throw new Error("Target rank must be above current rank.");
    return rocketLeagueRankOrder.slice(from, to).reduce((total, rank) => total + rocketLeagueRankReferenceUnits[rank], 0);
  }
  const key = String(family === "placements" ? selection.previousRank : selection.currentRank);
  const rate = tables[family][key];
  if (rate === undefined) throw new Error("Select a valid Rocket League rank or tier.");
  const count = family === "tournament" ? 1
    : quantity(family === "placements" ? selection.matches : selection.wins, family === "wins" ? ROCKET_LEAGUE_WINS_MAX : 10);
  return rate * count;
}

export function calculateRocketLeagueReferenceQuote(family: RocketLeaguePricingFamily, selection: ConfiguratorSelection): QuotePreview {
  const baseUnits = rocketLeagueReferenceBaseUnits(family, selection);
  const playlist = String(selection.playlist);
  if (!Object.hasOwn(queueBps, playlist)) throw new Error("Select a valid Rocket League playlist.");
  if (!["pc", "playstation", "xbox", "switch"].includes(String(selection.platform))) throw new Error("Select a valid platform.");
  if (!["account", "play-with-booster"].includes(String(selection.boostMethod))) throw new Error("Select a valid boost method.");
  const extras = ["appearOffline", "liveStream", "expressDelivery", ...(family === "rank" ? ["rankInsurance"] : [])];
  for (const key of extras) {
    // Non-rank services historically accept omitted extras as unselected.
    if (family !== "rank" && selection[key] === undefined) continue;
    if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
  }
  if (selection.boostMethod === "play-with-booster" && selection.appearOffline === true) {
    throw new Error("Appear Offline is not available with Play With Booster.");
  }

  // All percentage components use the unrounded base independently, exactly once.
  // Fixed Streaming enters this same subtotal before both reference discounts.
  const components: Array<{ label: string; bps: number; fixedUnits: number }> = [];
  if (queueBps[playlist]) components.push({ label: `Playlist (${playlist})`, bps: queueBps[playlist], fixedUnits: 0 });
  if (selection.boostMethod === "play-with-booster") components.push({ label: "Play With Booster", bps: 4500, fixedUnits: 0 });
  if (selection.expressDelivery === true) components.push({ label: "Express Delivery", bps: 2000, fixedUnits: 0 });
  if (family === "rank" && selection.rankInsurance === true) components.push({ label: "Rank Insurance", bps: 5000, fixedUnits: 0 });
  if (selection.liveStream === true) components.push({ label: "Live Stream", bps: 0, fixedUnits: 1000 * ROCKET_LEAGUE_REFERENCE_UNITS_PER_CENT });

  const denominator = 10000 * ROCKET_LEAGUE_REFERENCE_UNITS_PER_CENT;
  let numerator = baseUnits * 10000;
  let cumulativeCents = roundHalfUp(numerator, denominator);
  const baseLabel = family === "rank" ? "Rank boost" : family === "tournament" ? "Tournament boost"
    : family === "placements" ? `${selection.matches} placement matches`
      : `${selection.wins} ${family === "wins" ? "competitive" : "reward"} wins`;
  const breakdown: QuoteBreakdownItem[] = [{ label: baseLabel, amount: cumulativeCents / 100 }];
  for (const component of components) {
    numerator += baseUnits * component.bps + component.fixedUnits * 10000;
    const nextCents = roundHalfUp(numerator, denominator);
    breakdown.push({ label: component.label, amount: (nextCents - cumulativeCents) / 100 });
    cumulativeCents = nextCents;
  }
  if (selection.appearOffline === true) breakdown.push({ label: "Appear Offline", amount: 0 });
  const { totalCents } = rocketLeaguePriceFromReferenceSubtotal(cumulativeCents);
  const discountCents = cumulativeCents - totalCents;
  breakdown.push({ label: "Automatic price adjustment", amount: -discountCents / 100 });
  // Convert only at the existing QuotePreview API boundary; every calculation above is integer-based.
  return {
    currency: "USD", subtotal: cumulativeCents / 100, discount: discountCents / 100,
    total: totalCents / 100, breakdown, ruleSetVersion: `${ROCKET_LEAGUE_PRICING_VERSION}-${family}`,
  };
}

export function assertRocketLeagueQuoteFresh(quote: QuotePreview, expectedTotalCents: unknown, expectedRuleSetVersion: unknown) {
  if (!Number.isSafeInteger(expectedTotalCents) || expectedTotalCents !== Math.round(quote.total * 100)
    || expectedRuleSetVersion !== quote.ruleSetVersion) {
    throw new Error("Your quote has changed. Refresh your price before checkout.");
  }
}
