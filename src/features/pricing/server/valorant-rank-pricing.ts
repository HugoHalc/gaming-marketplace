import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "valorant-rank-v1.0";

const RANK_ORDER = [
  "iron-1",
  "iron-2",
  "iron-3",
  "bronze-1",
  "bronze-2",
  "bronze-3",
  "silver-1",
  "silver-2",
  "silver-3",
  "gold-1",
  "gold-2",
  "gold-3",
  "platinum-1",
  "platinum-2",
  "platinum-3",
  "diamond-1",
  "diamond-2",
  "diamond-3",
  "ascendant-1",
  "ascendant-2",
  "ascendant-3",
  "immortal",
] as const;

type RankId = (typeof RANK_ORDER)[number];

const STEP_PRICE: Record<Exclude<RankId, "immortal">, number> = {
  "iron-1": 3.87,
  "iron-2": 3.87,
  "iron-3": 3.87,
  "bronze-1": 4.07,
  "bronze-2": 4.07,
  "bronze-3": 4.5,
  "silver-1": 4.95,
  "silver-2": 4.95,
  "silver-3": 5.4,
  "gold-1": 6.36,
  "gold-2": 6.79,
  "gold-3": 7.73,
  "platinum-1": 7.79,
  "platinum-2": 8.22,
  "platinum-3": 12.97,
  "diamond-1": 13.64,
  "diamond-2": 16.89,
  "diamond-3": 25.34,
  "ascendant-1": 29.89,
  "ascendant-2": 32.42,
  "ascendant-3": 38.99,
};

const RR_GAIN_MODIFIER: Record<string, number> = {
  "10": 0.2,
  "20": 0,
  "30": 0,
  "45": -0.1,
};

const RR_AMOUNT_MODIFIER: Record<string, number> = {
  "0-20": 0,
  "21-40": -0.04,
  "41-60": -0.05,
  "61-80": -0.06,
  "81-100": -0.08,
};

const SERVERS = new Set([
  "europe",
  "north-america",
  "brazil",
  "korea",
  "sea-oce",
  "latin-america",
]);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertBoolean(selection: ConfiguratorSelection, key: string) {
  if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
}

function calculateProgression(currentRank: RankId, targetRank: RankId) {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  const targetIndex = RANK_ORDER.indexOf(targetRank);

  if (currentIndex < 0 || targetIndex < 0) throw new Error("Select a valid Valorant rank.");
  if (targetIndex <= currentIndex) throw new Error("Target rank must be above current rank.");

  let price = 0;
  for (let index = currentIndex; index < targetIndex; index += 1) {
    const from = RANK_ORDER[index];
    if (from === "immortal") break;
    price += STEP_PRICE[from];
  }

  return {
    steps: targetIndex - currentIndex,
    price: roundMoney(price),
  };
}

export function isValorantRankQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "valorant" && input.serviceSlug === "rank-boost";
}

export function calculateValorantRankQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "") as RankId;
  const targetRank = String(selection.targetRank ?? "") as RankId;
  const queue = String(selection.queue ?? "");
  const rrGain = String(selection.rrGain ?? "");
  const rrAmount = String(selection.rrAmount ?? "");
  const server = String(selection.server ?? "");

  const progression = calculateProgression(currentRank, targetRank);

  if (!["solo", "duo"].includes(queue)) throw new Error("Select Solo or Duo.");
  if (!(rrGain in RR_GAIN_MODIFIER)) throw new Error("Select a valid RR Gain.");
  if (!(rrAmount in RR_AMOUNT_MODIFIER)) throw new Error("Select a valid RR Amount.");
  if (!SERVERS.has(server)) throw new Error("Select a valid server.");

  assertBoolean(selection, "playOffline");
  assertBoolean(selection, "agentPreferences");
  assertBoolean(selection, "liveStream");
  assertBoolean(selection, "expressDelivery");
  assertBoolean(selection, "extraWin");
  assertBoolean(selection, "rankInsurance");

  const baseServicePrice = progression.price;
  let percentageExtras = 0;
  let fixedExtras = 0;

  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `Rank boost · ${progression.steps} tier step${progression.steps === 1 ? "" : "s"}`,
      amount: baseServicePrice,
    },
  ];

  if (queue === "duo") {
    const amount = roundMoney(baseServicePrice);
    percentageExtras += amount;
    breakdown.push({ label: "Duo (+100%)", amount });
  }

  const rrGainModifier = RR_GAIN_MODIFIER[rrGain];
  if (rrGainModifier !== 0) {
    const amount = roundMoney(baseServicePrice * rrGainModifier);
    percentageExtras += amount;
    breakdown.push({
      label: `RR Gain ${rrGain}+ RR (${rrGainModifier > 0 ? "+" : ""}${Math.round(rrGainModifier * 100)}%)`,
      amount,
    });
  }

  const rrAmountModifier = RR_AMOUNT_MODIFIER[rrAmount];
  if (rrAmountModifier !== 0) {
    const amount = roundMoney(baseServicePrice * rrAmountModifier);
    percentageExtras += amount;
    breakdown.push({
      label: `RR Amount ${rrAmount} RR (${Math.round(rrAmountModifier * 100)}%)`,
      amount,
    });
  }

  if (selection.expressDelivery === true) {
    const amount = roundMoney(baseServicePrice * 0.3);
    percentageExtras += amount;
    breakdown.push({ label: "Express Delivery (+30%)", amount });
  }

  if (selection.rankInsurance === true) {
    const amount = roundMoney(baseServicePrice * 0.5);
    percentageExtras += amount;
    breakdown.push({ label: "Rank Insurance (+50%)", amount });
  }

  if (selection.liveStream === true) {
    fixedExtras += 10;
    breakdown.push({ label: "Streaming", amount: 10 });
  }

  if (selection.extraWin === true) {
    fixedExtras += 6;
    breakdown.push({ label: "+1 Extra Win", amount: 6 });
  }

  if (selection.playOffline === true) {
    breakdown.push({ label: "Play Offline", amount: 0 });
  }

  if (selection.agentPreferences === true) {
    breakdown.push({ label: "Agents Preferences", amount: 0 });
  }

  const total = roundMoney(baseServicePrice + percentageExtras + fixedExtras);

  return {
    currency: "USD",
    subtotal: total,
    discount: 0,
    total,
    ruleSetVersion: VERSION,
    breakdown,
  };
}
