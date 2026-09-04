import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "rocket-league-rank-v1.1";

const rankOrder = [
  "bronze-1", "bronze-2", "bronze-3",
  "silver-1", "silver-2", "silver-3",
  "gold-1", "gold-2", "gold-3",
  "platinum-1", "platinum-2", "platinum-3",
  "diamond-1", "diamond-2", "diamond-3",
  "champion-1", "champion-2", "champion-3",
  "grand-champion-1", "grand-champion-2", "grand-champion-3",
  "supersonic-legend",
] as const;

type RankId = (typeof rankOrder)[number];

const stepPrice: Record<Exclude<RankId, "supersonic-legend">, number> = {
  "bronze-1": 1.99,
  "bronze-2": 1.99,
  "bronze-3": 2.49,
  "silver-1": 1.99,
  "silver-2": 2.49,
  "silver-3": 2.49,
  "gold-1": 2.99,
  "gold-2": 2.99,
  "gold-3": 4.49,
  "platinum-1": 3.99,
  "platinum-2": 6.99,
  "platinum-3": 7.49,
  "diamond-1": 7.49,
  "diamond-2": 9.49,
  "diamond-3": 12.49,
  "champion-1": 12.99,
  "champion-2": 28.49,
  "champion-3": 30.99,
  "grand-champion-1": 31.49,
  "grand-champion-2": 70.99,
  "grand-champion-3": 74.99,
};

const packageCeilings: Record<string, number> = {
  "bronze-1>silver-1": 5.99,
  "silver-1>gold-1": 6.49,
  "gold-1>platinum-1": 9.99,
  "platinum-1>diamond-1": 13.99,
  "diamond-1>champion-1": 28.99,
  "champion-1>grand-champion-1": 48.99,
  "grand-champion-1>supersonic-legend": 119.99,
};

const playlistConfig = {
  "1v1": { label: "1v1 Duel", multiplier: 1 },
  "2v2": { label: "2v2 Doubles", multiplier: 1 },
  "3v3": { label: "3v3 Standard", multiplier: 1.2 },
  "rumble": { label: "Rumble", multiplier: 1.2 },
  "hoops": { label: "Hoops", multiplier: 1.2 },
  "dropshot": { label: "Dropshot", multiplier: 1.2 },
  "snow-day": { label: "Snow Day", multiplier: 1.2 },
  "heatseeker": { label: "Heatseeker", multiplier: 1.2 },
  "4v4": { label: "4v4 Squads", multiplier: 1.3 },
} as const;

const platforms = new Set(["pc", "playstation", "xbox", "switch"]);
const methods = new Set(["account", "play-with-booster"]);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertBoolean(selection: ConfiguratorSelection, key: string) {
  if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
}

function rankIndex(value: unknown) {
  return rankOrder.indexOf(String(value) as RankId);
}

function progressDiscountPercentage(steps: number) {
  if (steps >= 10) return 0.2;
  if (steps >= 7) return 0.15;
  if (steps >= 5) return 0.1;
  if (steps >= 3) return 0.05;
  return 0;
}

function calculateRankProgression(currentRank: RankId, targetRank: RankId) {
  const currentIndex = rankOrder.indexOf(currentRank);
  const targetIndex = rankOrder.indexOf(targetRank);
  if (currentIndex < 0 || targetIndex < 0) throw new Error("Invalid Rocket League rank.");
  if (targetIndex <= currentIndex) throw new Error("Target rank must be above current rank.");

  let raw = 0;
  for (let index = currentIndex; index < targetIndex; index += 1) {
    const from = rankOrder[index];
    if (from === "supersonic-legend") break;
    raw += stepPrice[from];
  }

  raw = roundMoney(raw);
  const steps = targetIndex - currentIndex;
  const volumeDiscount = roundMoney(raw * progressDiscountPercentage(steps));
  let packagePrice = roundMoney(raw - volumeDiscount);

  const ceiling = packageCeilings[`${currentRank}>${targetRank}`];
  if (ceiling !== undefined) packagePrice = Math.min(packagePrice, ceiling);

  return { raw, steps, packagePrice };
}

export function isRocketLeagueRankQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "rank-boost";
}

export function calculateRocketLeagueRankQuote(selection: ConfiguratorSelection): QuotePreview {
  const currentRank = String(selection.currentRank) as RankId;
  const targetRank = String(selection.targetRank) as RankId;
  const currentIndex = rankIndex(currentRank);
  const targetIndex = rankIndex(targetRank);

  if (currentIndex < 0 || targetIndex < 0) throw new Error("Select a valid Rocket League rank.");
  if (targetIndex <= currentIndex) throw new Error("Target rank must be above current rank.");

  const playlist = playlistConfig[String(selection.playlist) as keyof typeof playlistConfig];
  if (!playlist) throw new Error("Select a valid Rocket League playlist.");

  if (!platforms.has(String(selection.platform))) throw new Error("Select a valid platform.");
  if (!methods.has(String(selection.boostMethod))) throw new Error("Select a valid boost method.");

  assertBoolean(selection, "appearOffline");
  assertBoolean(selection, "liveStream");
  assertBoolean(selection, "expressDelivery");
  assertBoolean(selection, "rankInsurance");

  if (selection.boostMethod === "play-with-booster" && selection.appearOffline === true) {
    throw new Error("Appear Offline is not available with Play With Booster.");
  }

  const progression = calculateRankProgression(currentRank, targetRank);
  const breakdown: QuoteBreakdownItem[] = [
    { label: `Rank boost · ${progression.steps} tier step${progression.steps === 1 ? "" : "s"}`, amount: progression.packagePrice },
  ];

  const baseServicePrice = progression.packagePrice;
  let percentageExtras = 0;

  if (playlist.multiplier > 1) {
    const playlistAmount = roundMoney(baseServicePrice * (playlist.multiplier - 1));
    percentageExtras += playlistAmount;
    breakdown.push({ label: playlist.label, amount: playlistAmount });
  }

  if (selection.boostMethod === "play-with-booster") {
    const methodAmount = roundMoney(baseServicePrice * 0.45);
    percentageExtras += methodAmount;
    breakdown.push({ label: "Play With Booster", amount: methodAmount });
  }

  if (selection.expressDelivery === true) {
    const amount = roundMoney(baseServicePrice * 0.2);
    percentageExtras += amount;
    breakdown.push({ label: "Express Delivery", amount });
  }

  if (selection.rankInsurance === true) {
    const amount = roundMoney(baseServicePrice * 0.5);
    percentageExtras += amount;
    breakdown.push({ label: "Rank Insurance", amount });
  }

  const liveStreamPrice = selection.liveStream === true ? 10 : 0;
  if (liveStreamPrice > 0) {
    breakdown.push({ label: "Live Stream", amount: liveStreamPrice });
  }

  if (selection.appearOffline === true) {
    breakdown.push({ label: "Appear Offline", amount: 0 });
  }

  const total = roundMoney(baseServicePrice + percentageExtras + liveStreamPrice);

  return {
    currency: "USD",
    subtotal: total,
    discount: 0,
    total,
    ruleSetVersion: VERSION,
    breakdown,
  };
}
