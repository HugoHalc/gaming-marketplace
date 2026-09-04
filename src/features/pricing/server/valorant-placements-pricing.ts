import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "valorant-placements-v1.1";

const PRICE_PER_PLACEMENT: Record<string, number> = {
  unrated: 1.8,
  "iron-1": 1.32,
  "iron-2": 1.32,
  "iron-3": 1.32,
  "bronze-1": 1.49,
  "bronze-2": 1.49,
  "bronze-3": 1.49,
  "silver-1": 1.97,
  "silver-2": 1.97,
  "silver-3": 1.97,
  "gold-1": 2.08,
  "gold-2": 2.08,
  "gold-3": 2.08,
  "platinum-1": 2.37,
  "platinum-2": 2.37,
  "platinum-3": 2.37,
  "diamond-1": 3.5,
  "diamond-2": 3.5,
  "diamond-3": 3.5,
  "ascendant-1": 4.1,
  "ascendant-2": 4.1,
  "ascendant-3": 4.1,
  immortal: 5.17,
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

export function isValorantPlacementsQuote(input: {
  gameSlug: string;
  serviceSlug: string;
}) {
  return (
    input.gameSlug === "valorant" &&
    ["placement-matches", "placements-boost"].includes(input.serviceSlug)
  );
}

export function calculateValorantPlacementsQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "");
  const matches = asInteger(selection.matches);
  const queue = String(selection.queue ?? "");
  const server = String(selection.server ?? "");
  const platform = String(selection.platform ?? "");

  const perPlacement = PRICE_PER_PLACEMENT[currentRank];
  if (!perPlacement) throw new Error("Select a valid Valorant rank.");
  if (!Number.isFinite(matches) || matches < 1 || matches > 5) {
    throw new Error("Number of placements must be between 1 and 5.");
  }
  if (!["solo", "duo"].includes(queue)) throw new Error("Select Solo or Duo.");
  if (!SERVERS.has(server)) throw new Error("Select a valid server.");
  if (platform !== "pc") throw new Error("Valorant boosting is available for PC only.");

  assertBoolean(selection, "playOffline");
  assertBoolean(selection, "agentPreferences");
  assertBoolean(selection, "liveStream");
  assertBoolean(selection, "expressDelivery");
  assertBoolean(selection, "extraWin");
  assertBoolean(selection, "rankInsurance");

  const baseServicePrice = roundMoney(perPlacement * matches);
  let percentageExtras = 0;
  let fixedExtras = 0;

  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${matches} placement${matches === 1 ? "" : "s"} × $${perPlacement.toFixed(2)}`,
      amount: baseServicePrice,
    },
  ];

  if (queue === "duo") {
    const amount = roundMoney(baseServicePrice);
    percentageExtras += amount;
    breakdown.push({ label: "Duo (+100%)", amount });
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
