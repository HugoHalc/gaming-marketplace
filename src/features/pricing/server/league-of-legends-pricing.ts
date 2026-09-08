import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";

const BOOSTINGPEDIA_FACTOR = 0.70;
const RULE_SET_VERSION = "lol-pricing-v1.0";

export const LOL_RANK_ORDER = ["Iron IV", "Iron III", "Iron II", "Iron I", "Bronze IV", "Bronze III", "Bronze II", "Bronze I", "Silver IV", "Silver III", "Silver II", "Silver I", "Gold IV", "Gold III", "Gold II", "Gold I", "Platinum IV", "Platinum III", "Platinum II", "Platinum I", "Emerald IV", "Emerald III", "Emerald II", "Emerald I", "Diamond IV", "Diamond III", "Diamond II", "Diamond I"] as const;
export const LOL_CURRENT_RANK_OPTIONS = ["Iron IV", "Iron III", "Iron II", "Iron I", "Bronze IV", "Bronze III", "Bronze II", "Bronze I", "Silver IV", "Silver III", "Silver II", "Silver I", "Gold IV", "Gold III", "Gold II", "Gold I", "Platinum IV", "Platinum III", "Platinum II", "Platinum I", "Emerald IV", "Emerald III", "Emerald II", "Emerald I", "Diamond IV", "Diamond III", "Diamond II", "Diamond I", "Master"] as const;

const RANK_STEP_BM_BASE: Record<string, number> = {
  "Iron IV": 4.13,
  "Iron III": 4.23,
  "Iron II": 4.23,
  "Iron I": 4.76,
  "Bronze IV": 4.96,
  "Bronze III": 4.96,
  "Bronze II": 5.12,
  "Bronze I": 5.63,
  "Silver IV": 5.73,
  "Silver III": 6.00,
  "Silver II": 6.28,
  "Silver I": 8.66,
  "Gold IV": 9.17,
  "Gold III": 9.83,
  "Gold II": 11.70,
  "Gold I": 13.14,
  "Platinum IV": 14.02,
  "Platinum III": 16.14,
  "Platinum II": 18.27,
  "Platinum I": 22.83,
  "Emerald IV": 23.95,
  "Emerald III": 24.57,
  "Emerald II": 26.78,
  "Emerald I": 27.95,
  "Diamond IV": 34.00,
  "Diamond III": 46.91,
  "Diamond II": 63.09,
};

const WINS_BM_BASE: Record<string, number> = {
  "Iron IV": 1.97,
  "Iron III": 1.97,
  "Iron II": 1.97,
  "Iron I": 1.97,
  "Bronze IV": 2.09,
  "Bronze III": 2.09,
  "Bronze II": 2.09,
  "Bronze I": 2.09,
  "Silver IV": 2.32,
  "Silver III": 2.32,
  "Silver II": 2.64,
  "Silver I": 3.08,
  "Gold IV": 2.91,
  "Gold III": 3.18,
  "Gold II": 3.66,
  "Gold I": 3.99,
  "Platinum IV": 4.85,
  "Platinum III": 4.85,
  "Platinum II": 5.30,
  "Platinum I": 5.82,
  "Emerald IV": 6.97,
  "Emerald III": 7.05,
  "Emerald II": 7.20,
  "Emerald I": 7.45,
  "Diamond IV": 10.02,
  "Diamond III": 11.61,
  "Diamond II": 13.62,
  "Diamond I": 14.02,
  "Master": 19.54,
};

const PLACEMENTS_BM_BASE: Record<string, number> = {
  "Unranked": 2.15,
  "Iron IV": 1.90,
  "Iron III": 1.13,
  "Iron II": 1.13,
  "Iron I": 1.13,
  "Bronze IV": 1.13,
  "Bronze III": 1.13,
  "Bronze II": 1.13,
  "Bronze I": 1.13,
  "Silver IV": 2.13,
  "Silver III": 2.90,
  "Silver II": 2.90,
  "Silver I": 2.90,
  "Gold IV": 3.90,
  "Gold III": 3.45,
  "Gold II": 3.45,
  "Gold I": 3.45,
  "Platinum IV": 4.45,
  "Platinum III": 4.21,
  "Platinum II": 4.21,
  "Platinum I": 5.21,
  "Emerald IV": 5.21,
  "Emerald III": 5.21,
  "Emerald II": 5.21,
  "Emerald I": 5.21,
  "Diamond IV": 6.21,
  "Diamond III": 6.70,
  "Diamond II": 6.90,
  "Diamond I": 6.98,
  "Master": 7.82,
};

const REGION_PERCENT: Record<string, number> = {
  "north-america": 0.10,
  oceania: 0.10,
};

const CURRENT_LP_PERCENT: Record<string, number> = {
  "1": 0,
  "20": 0,
  "40": -0.02,
  "60": -0.05,
  "80": -0.07,
};

const LP_GAIN_PERCENT: Record<string, number> = {
  "37": -0.15,
  "34": -0.10,
  "31": -0.05,
  "27": 0,
  "23": 0,
  "19": 0.05,
  "14": 0.15,
  "9": 0.50,
  "8": 0.90,
};

const COMMON_EXTRA_PERCENT: Record<string, number> = {
  expressDelivery: 0.20,
  soloQueueOnly: 0.40,
};

function roundMoney(value: number) {
  return Math.round((value + 1e-9) * 100) / 100;
}

function bp(value: number) {
  return roundMoney(value * BOOSTINGPEDIA_FACTOR);
}

function asString(selection: ConfiguratorSelection, key: string, fallback = "") {
  const value = selection[key];
  return typeof value === "string" ? value : fallback;
}

function asNumber(selection: ConfiguratorSelection, key: string, fallback: number) {
  const value = Number(selection[key]);
  return Number.isFinite(value) ? value : fallback;
}

function isEnabled(selection: ConfiguratorSelection, key: string) {
  return selection[key] === true;
}

function standardDiscountRate(subtotal: number, unrated = false) {
  if (subtotal >= 200) return unrated ? 0.20 : 0.12;
  if (subtotal >= 150) return unrated ? 0.15 : 0.09;
  if (subtotal >= 100) return unrated ? 0.10 : 0.06;
  if (subtotal >= 50) return unrated ? 0.05 : 0.03;
  return 0;
}

function baseModifierPercent(selection: ConfiguratorSelection, service: "rank" | "wins" | "placements" | "unrated") {
  let percentage = REGION_PERCENT[asString(selection, "server")] ?? 0;

  if (asString(selection, "boostMethod") === "duo") {
    percentage += service === "wins" ? 0.75 : service === "unrated" ? 0.30 : 0.50;
  }

  for (const [key, value] of Object.entries(COMMON_EXTRA_PERCENT)) {
    if (isEnabled(selection, key)) percentage += value;
  }

  if (service === "rank" && isEnabled(selection, "rankInsurance")) percentage += 0.50;
  if (service === "wins" && isEnabled(selection, "demotionShield")) percentage += 0.20;

  return percentage;
}

function fixedExtras(selection: ConfiguratorSelection) {
  // BoostingMarket exposes Streaming at $10. BoostingPedia follows the confirmed 70% rule.
  return isEnabled(selection, "streaming") ? 10 : 0;
}

function finalizeQuote(input: {
  label: string;
  bmBase: number;
  selection: ConfiguratorSelection;
  service: "rank" | "wins" | "placements" | "unrated";
  extraPercent?: number;
  unratedDiscount?: boolean;
}): QuotePreview {
  const percent = baseModifierPercent(input.selection, input.service) + (input.extraPercent ?? 0);
  const bmVariableAmount = input.bmBase * percent;
  const bmFixedAmount = fixedExtras(input.selection);
  const bmSubtotal = input.bmBase + bmVariableAmount + bmFixedAmount;
  const discountRate = standardDiscountRate(bmSubtotal, input.unratedDiscount);
  const bmDiscount = bmSubtotal * discountRate;

  const base = bp(input.bmBase);
  const variableAmount = bp(bmVariableAmount);
  const fixedAmount = bp(bmFixedAmount);
  const subtotal = bp(bmSubtotal);
  const discount = bp(bmDiscount);
  const total = bp(bmSubtotal - bmDiscount);

  const breakdown: QuotePreview["breakdown"] = [
    { label: input.label, amount: base },
  ];

  if (variableAmount !== 0) {
    breakdown.push({
      label: variableAmount > 0 ? "Selected modifiers" : "LP adjustments",
      amount: variableAmount,
    });
  }

  if (fixedAmount > 0) breakdown.push({ label: "Streaming", amount: fixedAmount });
  if (discount > 0) breakdown.push({ label: "Progressive discount", amount: -discount });

  return {
    currency: "USD",
    subtotal,
    discount,
    total,
    breakdown,
    ruleSetVersion: RULE_SET_VERSION,
  };
}

function calculateRankBase(currentRank: string, targetRank: string) {
  const currentIndex = LOL_RANK_ORDER.indexOf(currentRank as (typeof LOL_RANK_ORDER)[number]);
  const targetIndex = LOL_RANK_ORDER.indexOf(targetRank as (typeof LOL_RANK_ORDER)[number]);
  if (currentIndex < 0 || targetIndex < 0 || targetIndex <= currentIndex) {
    throw new Error("Target rank must be above current rank.");
  }

  let bmBase = 0;
  for (let index = currentIndex; index < targetIndex; index += 1) {
    const step = LOL_RANK_ORDER[index];
    const price = RANK_STEP_BM_BASE[step];
    if (price === undefined) throw new Error("Pricing is not available for the selected rank step.");
    bmBase += price;
  }
  return bmBase;
}

function validateQuantity(value: number, max: number, label: string) {
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`${label} must be between 1 and ${max}.`);
  }
}

export function isLeagueOfLegendsPhaseOneQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "league-of-legends" &&
    ["rank-boost", "wins", "placement-matches", "unrated-matches"].includes(input.serviceSlug);
}

export function calculateLeagueOfLegendsPhaseOneQuote(
  serviceSlug: string,
  selection: ConfiguratorSelection,
): QuotePreview {
  if (serviceSlug === "rank-boost") {
    const currentRank = asString(selection, "currentRank");
    const targetRank = asString(selection, "targetRank");
    const base = calculateRankBase(currentRank, targetRank);
    const lpPercent =
      (CURRENT_LP_PERCENT[asString(selection, "currentLp", "1")] ?? 0) +
      (LP_GAIN_PERCENT[asString(selection, "lpGain", "23")] ?? 0);

    return finalizeQuote({
      label: `${currentRank} → ${targetRank}`,
      bmBase: base,
      selection,
      service: "rank",
      extraPercent: lpPercent,
    });
  }

  if (serviceSlug === "wins") {
    const currentRank = asString(selection, "currentRank");
    const quantity = asNumber(selection, "wins", 1);
    validateQuantity(quantity, 5, "Wins");
    const bmUnit = WINS_BM_BASE[currentRank];
    if (bmUnit === undefined) throw new Error("Pricing is not available for the selected rank.");

    const lpPercent = LP_GAIN_PERCENT[asString(selection, "lpGain", "23")] ?? 0;
    return finalizeQuote({
      label: `${quantity} ranked win${quantity === 1 ? "" : "s"}`,
      bmBase: bmUnit * quantity,
      selection,
      service: "wins",
      extraPercent: lpPercent,
    });
  }

  if (serviceSlug === "placement-matches") {
    const previousRank = asString(selection, "currentRank", "Unranked");
    const quantity = asNumber(selection, "matches", 1);
    validateQuantity(quantity, 5, "Placement matches");
    const bmUnit = PLACEMENTS_BM_BASE[previousRank];
    if (bmUnit === undefined) throw new Error("Pricing is not available for the selected previous rank.");

    return finalizeQuote({
      label: `${quantity} placement match${quantity === 1 ? "" : "es"}`,
      bmBase: bmUnit * quantity,
      selection,
      service: "placements",
    });
  }

  if (serviceSlug === "unrated-matches") {
    const quantity = asNumber(selection, "matches", 1);
    validateQuantity(quantity, 10, "Unrated matches");

    return finalizeQuote({
      label: `${quantity} unrated match${quantity === 1 ? "" : "es"}`,
      bmBase: 2.99 * quantity,
      selection,
      service: "unrated",
      unratedDiscount: true,
    });
  }

  throw new Error("League of Legends pricing is not available for this service.");
}

const CLASH_BM_RATE: Record<string, number> = {
  "1": 9.99,
  "2": 6.99,
  "3": 5.99,
  "4": 2.99,
};

function phaseTwoModifierPercent(
  selection: ConfiguratorSelection,
  options: { allowDuo: boolean },
) {
  let percentage = REGION_PERCENT[asString(selection, "server")] ?? 0;

  if (options.allowDuo && asString(selection, "boostMethod") === "duo") {
    percentage += 0.50;
  }

  for (const [key, value] of Object.entries(COMMON_EXTRA_PERCENT)) {
    if (isEnabled(selection, key)) percentage += value;
  }

  return percentage;
}

function finalizePhaseTwoQuote(input: {
  label: string;
  bmBase: number;
  selection: ConfiguratorSelection;
  allowDuo: boolean;
}): QuotePreview {
  const modifierPercent = phaseTwoModifierPercent(input.selection, { allowDuo: input.allowDuo });
  const bmVariableAmount = input.bmBase * modifierPercent;
  const bmFixedAmount = fixedExtras(input.selection);
  const bmSubtotal = input.bmBase + bmVariableAmount + bmFixedAmount;
  const discountRate = standardDiscountRate(bmSubtotal);
  const bmDiscount = bmSubtotal * discountRate;

  const base = bp(input.bmBase);
  const variableAmount = bp(bmVariableAmount);
  const fixedAmount = bp(bmFixedAmount);
  const subtotal = bp(bmSubtotal);
  const discount = bp(bmDiscount);
  const total = bp(bmSubtotal - bmDiscount);

  const breakdown: QuotePreview["breakdown"] = [{ label: input.label, amount: base }];
  if (variableAmount > 0) breakdown.push({ label: "Selected modifiers", amount: variableAmount });
  if (fixedAmount > 0) breakdown.push({ label: "Streaming", amount: fixedAmount });
  if (discount > 0) breakdown.push({ label: "Progressive discount", amount: -discount });

  return {
    currency: "USD",
    subtotal,
    discount,
    total,
    breakdown,
    ruleSetVersion: "lol-pricing-v2.0",
  };
}

export function isLeagueOfLegendsPhaseTwoQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "league-of-legends" &&
    ["arena-boost", "mastery-boost", "clash-boost"].includes(input.serviceSlug);
}

export function calculateLeagueOfLegendsPhaseTwoQuote(
  serviceSlug: string,
  selection: ConfiguratorSelection,
): QuotePreview {
  if (serviceSlug === "arena-boost") {
    const games = asNumber(selection, "games", 3);
    validateQuantity(games, 60, "Arena games");
    if (games < 3) throw new Error("Arena games must be between 3 and 60.");

    return finalizePhaseTwoQuote({
      label: `${games} Arena game${games === 1 ? "" : "s"}`,
      bmBase: 5 * games,
      selection,
      allowDuo: true,
    });
  }

  if (serviceSlug === "mastery-boost") {
    const mode = asString(selection, "masteryMode", "marks");

    if (mode === "points") {
      const points = asNumber(selection, "masteryPoints", 10000);
      if (!Number.isInteger(points) || points < 10000 || points > 1000000 || points % 10000 !== 0) {
        throw new Error("Mastery Points must be between 10,000 and 1,000,000 in 10,000-point steps.");
      }

      return finalizePhaseTwoQuote({
        label: `${points.toLocaleString("en-US")} mastery points`,
        bmBase: points * 0.0015,
        selection,
        allowDuo: false,
      });
    }

    if (mode === "marks") {
      const marks = asNumber(selection, "marks", 1);
      validateQuantity(marks, 25, "Marks of Mastery");

      return finalizePhaseTwoQuote({
        label: `${marks} Mark${marks === 1 ? "" : "s"} of Mastery`,
        bmBase: marks * 5,
        selection,
        allowDuo: false,
      });
    }

    throw new Error("Tier Boost pricing is not enabled because the verified data is incomplete for that mode.");
  }

  if (serviceSlug === "clash-boost") {
    const tier = asString(selection, "clashTier", "1");
    const games = asNumber(selection, "games", 1);
    const boosters = asNumber(selection, "boosters", 1);
    validateQuantity(games, 10, "Clash games");
    validateQuantity(boosters, 5, "Boosters");

    const rate = CLASH_BM_RATE[tier];
    if (rate === undefined) throw new Error("Pricing is not available for the selected Clash tier.");

    return finalizePhaseTwoQuote({
      label: `Tier ${tier}: ${games} game${games === 1 ? "" : "s"} × ${boosters} booster${boosters === 1 ? "" : "s"}`,
      bmBase: rate * games * boosters,
      selection,
      allowDuo: true,
    });
  }

  throw new Error("League of Legends pricing is not available for this service.");
}
