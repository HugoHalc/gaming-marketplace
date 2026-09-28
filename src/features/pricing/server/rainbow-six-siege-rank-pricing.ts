export type RainbowSixSiegeRankSelection = Record<string, string | number | boolean>;

export interface RainbowSixSiegeRankQuoteBreakdownItem {
  label: string;
  amount: number;
}

export interface RainbowSixSiegeRankQuote {
  currency: "USD";
  subtotal: number;
  discount: number;
  total: number;
  ruleSetVersion: string;
  breakdown: RainbowSixSiegeRankQuoteBreakdownItem[];
}

export interface RainbowSixSiegeRankQuoteMetadata {
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
  percentageModifiers: Array<{ label: string; display: string; amountCents: number }>;
  fixedChargesCents: number;
  preDiscountSubtotalCents: number;
  discountBps: number;
  discountCents: number;
  finalTotalCents: number;
}

export type RainbowSixSiegeRankPricingResult = {
  quote: RainbowSixSiegeRankQuote;
  metadata: RainbowSixSiegeRankQuoteMetadata;
};

export const R6_RANK_RULE_SET_VERSION = "rainbow-six-siege-rank-v2";
export const BOOSTING_MARKET_DISPLAY_DISCOUNT_BPS = 5000;
export const BOOSTINGPEDIA_REFERENCE_SHARE_BPS = 7000;
export const STREAMING_FIXED_CENTS = 1000;

export const R6_RANK_BENCHMARK_CENTS = {
  "copper-v": 0,
  "copper-iv": 469,
  "copper-iii": 938,
  "copper-ii": 1407,
  "copper-i": 1876,
  "bronze-v": 2345,
  "bronze-iv": 2814,
  "bronze-iii": 3283,
  "bronze-ii": 3752,
  "bronze-i": 4221,
  "silver-v": 4690,
  "silver-iv": 5159,
  "silver-iii": 5747,
  "silver-ii": 6483,
  "silver-i": 7220,
  "gold-v": 7956,
  "gold-iv": 8737,
  "gold-iii": 9519,
  "gold-ii": 10300,
  "gold-i": 11229,
  "platinum-v": 12191,
  "platinum-iv": 13149,
  "platinum-iii": 14073,
  "platinum-ii": 14997,
  "platinum-i": 16173,
  "emerald-v": 18133,
  "emerald-iv": 20335,
  "emerald-iii": 22497,
  "emerald-ii": 24686,
  "emerald-i": 27583,
  "diamond-v": 32621,
  "diamond-iv": 37724,
  "diamond-iii": 42462,
  "diamond-ii": 47494,
  "diamond-i": 53411,
  "champion-v": 65605,
  "champion-iv": 79645,
  "champion-iii": 95810,
  "champion-ii": 114531,
  "champion-i": 135920,
} as const;

export type RainbowSixSiegeRankId = keyof typeof R6_RANK_BENCHMARK_CENTS;

const RANK_ORDER = Object.keys(R6_RANK_BENCHMARK_CENTS) as RainbowSixSiegeRankId[];

const RANK_LABELS: Record<RainbowSixSiegeRankId, string> = Object.fromEntries(
  RANK_ORDER.map((rank) => [
    rank,
    rank
      .split("-")
      .map((part, index) =>
        index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.toUpperCase(),
      )
      .join(" "),
  ]),
) as Record<RainbowSixSiegeRankId, string>;

const PLATFORM = {
  pc: { label: "PC", bps: 0 },
  xbox: { label: "Xbox", bps: 2000 },
  playstation: { label: "PlayStation", bps: 2000 },
} as const;

const MODE = {
  solo: { label: "Solo", bps: 0 },
  duo: { label: "Duo", bps: 5700 },
} as const;

const RP_GAIN = {
  "21-plus": { label: "21+ RP", bps: 0 },
  "11-20": { label: "11–20 RP", bps: 3600 },
  "1-10": { label: "1–10 RP", bps: 5000 },
} as const;

const SERVER = {
  europe: { label: "Europe", bps: 0 },
  "north-america": { label: "North America", bps: 0 },
  "latin-america": { label: "Latin America", bps: 0 },
  asia: { label: "Asia", bps: 0 },
  oceania: { label: "Oceania", bps: 1000 },
  brazil: { label: "Brazil", bps: 0 },
  "middle-east": { label: "Middle East", bps: 0 },
} as const;

const EXTRAS = {
  playOffline: { label: "Play Offline", bps: 0, fixedCents: 0 },
  specificOperators: { label: "Specific Operators", bps: 0, fixedCents: 0 },
  streaming: { label: "Streaming", bps: 0, fixedCents: STREAMING_FIXED_CENTS },
  expressDelivery: { label: "Express Delivery", bps: 2000, fixedCents: 0 },
  highKillCount: { label: "High Kill Count", bps: 4000, fixedCents: 0 },
  oneTrickPony: { label: "One Trick Pony", bps: 3000, fixedCents: 0 },
  rankInsurance: { label: "Rank Insurance", bps: 5000, fixedCents: 0 },
  vipPriority: { label: "VIP Priority", bps: 5000, fixedCents: 0 },
  insaneClipDrop: { label: "Insane Clip Drop", bps: 1500, fixedCents: 0 },
  eliteBoosterTier: { label: "Elite Booster Tier", bps: 5000, fixedCents: 0 },
} as const;

const ALLOWED_SELECTION_KEYS = new Set([
  "currentRank",
  "desiredRank",
  "platform",
  "gameMode",
  "rpGain",
  "server",
  ...Object.keys(EXTRAS),
]);

function dollars(cents: number) {
  return cents / 100;
}

export function roundHalfUp(numerator: number, denominator: number) {
  if (!Number.isSafeInteger(numerator) || numerator < 0) {
    throw new Error("Invalid pricing numerator.");
  }
  if (!Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new Error("Invalid pricing denominator.");
  }
  return Math.floor((numerator + Math.floor(denominator / 2)) / denominator);
}

function assertSelectionKeys(selection: RainbowSixSiegeRankSelection) {
  for (const key of Object.keys(selection)) {
    if (!ALLOWED_SELECTION_KEYS.has(key)) {
      throw new Error("Invalid Rainbow Six Siege Rank Boost selection.");
    }
  }
}

function parseString(selection: RainbowSixSiegeRankSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid value for ${key}.`);
  }
  return value;
}

function parseBoolean(selection: RainbowSixSiegeRankSelection, key: keyof typeof EXTRAS) {
  const value = selection[key];
  if (typeof value !== "boolean") throw new Error(`Invalid value for ${key}.`);
  return value;
}

function getRecordOption<T extends Record<string, { label: string; bps: number }>>(
  record: T,
  value: string,
  message: string,
) {
  if (!Object.prototype.hasOwnProperty.call(record, value)) throw new Error(message);
  return record[value as keyof T];
}

function rankIndex(rank: string) {
  return RANK_ORDER.indexOf(rank as RainbowSixSiegeRankId);
}

function rankLabel(rank: RainbowSixSiegeRankId) {
  return RANK_LABELS[rank];
}

export function progressiveDiscountBps(preDiscountSubtotalCents: number) {
  if (preDiscountSubtotalCents >= 20000) return 1200;
  if (preDiscountSubtotalCents >= 15000) return 900;
  if (preDiscountSubtotalCents >= 10000) return 600;
  if (preDiscountSubtotalCents >= 5000) return 300;
  return 0;
}

function percentDisplay(bps: number) {
  return `+${bps / 100}%`;
}

export function calculateDiscountedReferenceBaseCents(normalBenchmarkCents: number) {
  if (!Number.isSafeInteger(normalBenchmarkCents) || normalBenchmarkCents <= 0) {
    throw new Error("Invalid normal benchmark price.");
  }

  const discountedReferenceCents = roundHalfUp(
    normalBenchmarkCents * BOOSTING_MARKET_DISPLAY_DISCOUNT_BPS,
    10000,
  );
  const boostingPediaBaseCents = roundHalfUp(
    discountedReferenceCents * BOOSTINGPEDIA_REFERENCE_SHARE_BPS,
    10000,
  );

  return {
    normalBenchmarkCents,
    discountedReferenceCents,
    boostingPediaBaseCents,
  };
}

export function calculateRainbowSixSiegeRankPricing(
  selection: RainbowSixSiegeRankSelection,
): RainbowSixSiegeRankPricingResult {
  assertSelectionKeys(selection);

  const currentRankRaw = parseString(selection, "currentRank");
  const desiredRankRaw = parseString(selection, "desiredRank");
  const currentRankIndex = rankIndex(currentRankRaw);
  const desiredRankIndex = rankIndex(desiredRankRaw);
  if (currentRankIndex < 0 || desiredRankIndex < 0) {
    throw new Error("Select valid Rainbow Six Siege ranks.");
  }
  if (desiredRankIndex <= currentRankIndex) {
    throw new Error("Desired rank must be above current rank.");
  }

  const currentRank = currentRankRaw as RainbowSixSiegeRankId;
  const desiredRank = desiredRankRaw as RainbowSixSiegeRankId;
  const platform = getRecordOption(PLATFORM, parseString(selection, "platform"), "Select a valid platform.");
  const mode = getRecordOption(MODE, parseString(selection, "gameMode"), "Select a valid game mode.");
  const rpGain = getRecordOption(RP_GAIN, parseString(selection, "rpGain"), "Select a valid RP gain range.");
  const server = getRecordOption(SERVER, parseString(selection, "server"), "Select a valid server.");

  const selectedExtras = (Object.keys(EXTRAS) as Array<keyof typeof EXTRAS>)
    .filter((key) => parseBoolean(selection, key))
    .map((key) => ({ key, ...EXTRAS[key] }));

  const normalBenchmarkCents =
    R6_RANK_BENCHMARK_CENTS[desiredRank] - R6_RANK_BENCHMARK_CENTS[currentRank];
  if (normalBenchmarkCents <= 0) throw new Error("Invalid rank progression.");

  const { boostingPediaBaseCents: basePriceCents } =
    calculateDiscountedReferenceBaseCents(normalBenchmarkCents);

  const percentageSources = [
    { label: platform.label, bps: platform.bps },
    { label: mode.label, bps: mode.bps },
    { label: rpGain.label, bps: rpGain.bps },
    { label: server.label, bps: server.bps },
    ...selectedExtras.map((extra) => ({ label: extra.label, bps: extra.bps })),
  ].filter((item) => item.bps > 0);

  const totalModifierBps = percentageSources.reduce((sum, item) => sum + item.bps, 0);
  const percentageAdjustedCents = roundHalfUp(
    basePriceCents * (10000 + totalModifierBps),
    10000,
  );
  const totalPercentageModifierCents = percentageAdjustedCents - basePriceCents;

  const percentageModifiers = percentageSources.map((item) => ({
    label: item.label,
    display: percentDisplay(item.bps),
    amountCents: roundHalfUp(basePriceCents * item.bps, 10000),
  }));
  const independentlyRoundedModifierCents = percentageModifiers.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  );
  if (
    percentageModifiers.length > 0 &&
    independentlyRoundedModifierCents !== totalPercentageModifierCents
  ) {
    const lastIndex = percentageModifiers.length - 1;
    const last = percentageModifiers[lastIndex];
    percentageModifiers[lastIndex] = {
      ...last,
      amountCents:
        last.amountCents + (totalPercentageModifierCents - independentlyRoundedModifierCents),
    };
  }

  const fixedChargesCents = selectedExtras.reduce(
    (sum, extra) => sum + extra.fixedCents,
    0,
  );
  const preDiscountSubtotalCents = percentageAdjustedCents + fixedChargesCents;
  const discountBps = progressiveDiscountBps(preDiscountSubtotalCents);
  const discountCents = roundHalfUp(preDiscountSubtotalCents * discountBps, 10000);
  const finalTotalCents = preDiscountSubtotalCents - discountCents;

  const breakdown: RainbowSixSiegeRankQuoteBreakdownItem[] = [
    {
      label: `Rank progression · ${rankLabel(currentRank)} → ${rankLabel(desiredRank)}`,
      amount: dollars(basePriceCents),
    },
    ...percentageModifiers.map((modifier) => ({
      label: `${modifier.label} (${modifier.display})`,
      amount: dollars(modifier.amountCents),
    })),
  ];

  for (const extra of selectedExtras) {
    if (extra.fixedCents > 0) {
      breakdown.push({ label: `${extra.label} (+$10.00)`, amount: dollars(extra.fixedCents) });
    } else if (extra.bps === 0) {
      breakdown.push({ label: extra.label, amount: 0 });
    }
  }

  if (discountCents > 0) {
    breakdown.push({
      label: `Progressive discount (${discountBps / 100}% OFF)`,
      amount: -dollars(discountCents),
    });
  }

  return {
    quote: {
      currency: "USD",
      subtotal: dollars(preDiscountSubtotalCents),
      discount: dollars(discountCents),
      total: dollars(finalTotalCents),
      ruleSetVersion: R6_RANK_RULE_SET_VERSION,
      breakdown,
    },
    metadata: {
      currentRank,
      desiredRank,
      currentRankLabel: rankLabel(currentRank),
      desiredRankLabel: rankLabel(desiredRank),
      platformLabel: platform.label,
      modeLabel: mode.label,
      rpGainLabel: rpGain.label,
      serverLabel: server.label,
      selectedCustomizationLabels: selectedExtras.map((extra) => extra.label),
      basePriceCents,
      percentageAdjustedCents,
      totalModifierBps,
      percentageModifiers,
      fixedChargesCents,
      preDiscountSubtotalCents,
      discountBps,
      discountCents,
      finalTotalCents,
    },
  };
}
