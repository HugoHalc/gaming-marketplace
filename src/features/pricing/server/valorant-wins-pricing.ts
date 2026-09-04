import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "valorant-wins-v1.1";

const PRICE_PER_WIN: Record<string, number> = {
  "iron-1": 1.7,
  "iron-2": 1.7,
  "iron-3": 1.7,
  "bronze-1": 1.94,
  "bronze-2": 1.94,
  "bronze-3": 1.94,
  "silver-1": 2.68,
  "silver-2": 2.68,
  "silver-3": 2.68,
  "gold-1": 3.17,
  "gold-2": 3.17,
  "gold-3": 3.17,
  "platinum-1": 3.65,
  "platinum-2": 3.65,
  "platinum-3": 4.14,
  "diamond-1": 7.01,
  "diamond-2": 7.6,
  "diamond-3": 8.18,
  "ascendant-1": 8.77,
  "ascendant-2": 9.35,
  "ascendant-3": 9.94,
  immortal: 16.08,
};

const RR_GAIN_MODIFIER: Record<string, number> = {
  "10": 0.2,
  "20": 0,
  "30": 0,
  "45": -0.1,
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

function asInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

function assertBoolean(selection: ConfiguratorSelection, key: string) {
  if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
}

export function isValorantWinsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "valorant" && input.serviceSlug === "wins";
}

export function calculateValorantWinsQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "");
  const wins = asInteger(selection.wins);
  const queue = String(selection.queue ?? "");
  const rrGain = String(selection.rrGain ?? "");
  const server = String(selection.server ?? "");
  const platform = String(selection.platform ?? "");

  const perWin = PRICE_PER_WIN[currentRank];
  if (!perWin) throw new Error("Select a valid Valorant rank.");
  if (!Number.isFinite(wins) || wins < 1 || wins > 5) {
    throw new Error("Number of wins must be between 1 and 5.");
  }
  if (!["solo", "duo"].includes(queue)) throw new Error("Select Solo or Duo.");
  if (!(rrGain in RR_GAIN_MODIFIER)) throw new Error("Select a valid RR Gain.");
  if (!SERVERS.has(server)) throw new Error("Select a valid server.");
  if (platform !== "pc") throw new Error("Valorant boosting is available for PC only.");

  assertBoolean(selection, "playOffline");
  assertBoolean(selection, "agentPreferences");
  assertBoolean(selection, "liveStream");
  assertBoolean(selection, "expressDelivery");
  assertBoolean(selection, "extraWin");
  assertBoolean(selection, "rankInsurance");

  const baseServicePrice = roundMoney(perWin * wins);
  let percentageExtras = 0;
  let fixedExtras = 0;

  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${wins} competitive win${wins === 1 ? "" : "s"} × $${perWin.toFixed(2)}`,
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

  if (selection.playOffline === true) breakdown.push({ label: "Play Offline", amount: 0 });
  if (selection.agentPreferences === true) breakdown.push({ label: "Agents Preferences", amount: 0 });

  const total = roundMoney(baseServicePrice + percentageExtras + fixedExtras);

  return {
    currency: "USD",
    subtotal: total,
    discount: 0,
    total,
    breakdown,
    ruleSetVersion: VERSION,
  };
}
