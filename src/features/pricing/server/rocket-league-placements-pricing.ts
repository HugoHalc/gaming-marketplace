import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const PRICE_PER_MATCH: Record<string, number> = {
  unrated: 1.89,
  "bronze-1": 1.29,
  "bronze-2": 1.29,
  "bronze-3": 1.29,
  "silver-1": 1.29,
  "silver-2": 1.29,
  "silver-3": 1.29,
  "gold-1": 1.49,
  "gold-2": 1.49,
  "gold-3": 1.49,
  "platinum-1": 2.19,
  "platinum-2": 2.19,
  "platinum-3": 2.89,
  "diamond-1": 2.99,
  "diamond-2": 2.99,
  "diamond-3": 3.59,
  "champion-1": 4.29,
  "champion-2": 4.49,
  "champion-3": 4.59,
  "grand-champion-1": 4.79,
  "grand-champion-2": 5.49,
  "grand-champion-3": 5.49,
  "supersonic-legend": 6.49,
};

const PLAYLIST_MULTIPLIER: Record<string, number> = {
  "1v1": 1,
  "2v2": 1,
  "3v3": 1.2,
  rumble: 1.2,
  hoops: 1.2,
  dropshot: 1.2,
  "snow-day": 1.2,
  heatseeker: 1.2,
  "4v4": 1.3,
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function asInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

export function rocketLeaguePlacementsDiscount(matches: number) {
  if (matches >= 10) return 0.21;
  if (matches >= 8) return 0.20;
  if (matches >= 6) return 0.19;
  if (matches >= 4) return 0.18;
  if (matches >= 3) return 0.10;
  if (matches >= 2) return 0.05;
  return 0;
}

export function isRocketLeaguePlacementsQuote(input: {
  gameSlug: string;
  serviceSlug: string;
}) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "placements-boost";
}

export function calculateRocketLeaguePlacementsQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const previousRank = String(selection.previousRank ?? "");
  const matches = asInteger(selection.matches);
  const playlist = String(selection.playlist ?? "");
  const boostMethod = String(selection.boostMethod ?? "");
  const platform = String(selection.platform ?? "");

  const perMatch = PRICE_PER_MATCH[previousRank];
  if (!perMatch) throw new Error("Invalid previous season rank.");
  if (!Number.isFinite(matches) || matches < 1 || matches > 10) {
    throw new Error("Number of placement matches must be between 1 and 10.");
  }

  const playlistMultiplier = PLAYLIST_MULTIPLIER[playlist];
  if (!playlistMultiplier) throw new Error("Invalid playlist.");

  if (!["pc", "playstation", "xbox", "switch"].includes(platform)) {
    throw new Error("Invalid platform.");
  }

  if (!["account", "play-with-booster"].includes(boostMethod)) {
    throw new Error("Invalid boost method.");
  }

  if (boostMethod === "play-with-booster" && selection.appearOffline === true) {
    throw new Error("Appear Offline is not available with Play With Booster.");
  }

  const rawMatchesPrice = roundMoney(perMatch * matches);
  const discountRate = rocketLeaguePlacementsDiscount(matches);
  const volumeDiscount = roundMoney(rawMatchesPrice * discountRate);
  const discountedMatchesPrice = roundMoney(rawMatchesPrice - volumeDiscount);

  const baseServicePrice = discountedMatchesPrice;
  const playlistPrice = roundMoney(baseServicePrice * (playlistMultiplier - 1));
  const methodPrice =
    boostMethod === "play-with-booster" ? roundMoney(baseServicePrice * 0.45) : 0;
  const expressPrice =
    selection.expressDelivery === true ? roundMoney(baseServicePrice * 0.2) : 0;
  const servicePrice = roundMoney(baseServicePrice + playlistPrice + methodPrice);
  const liveStreamPrice = selection.liveStream === true ? 10 : 0;

  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${matches} placement match${matches === 1 ? "" : "es"} × $${perMatch.toFixed(2)}`,
      amount: rawMatchesPrice,
    },
  ];

  if (volumeDiscount > 0) {
    breakdown.push({
      label: `Volume discount (${Math.round(discountRate * 100)}% OFF)`,
      amount: -volumeDiscount,
    });
  }

  if (playlistPrice > 0) {
    breakdown.push({
      label: `Playlist modifier (+${Math.round((playlistMultiplier - 1) * 100)}%)`,
      amount: playlistPrice,
    });
  }

  if (methodPrice > 0) {
    breakdown.push({
      label: "Play With Booster (+45%)",
      amount: methodPrice,
    });
  }

  if (selection.appearOffline === true) {
    breakdown.push({ label: "Appear Offline", amount: 0 });
  }

  if (liveStreamPrice > 0) {
    breakdown.push({ label: "Live Stream", amount: liveStreamPrice });
  }

  if (expressPrice > 0) {
    breakdown.push({ label: "Express Delivery (+20%)", amount: expressPrice });
  }

  const subtotal = roundMoney(servicePrice + liveStreamPrice + expressPrice);

  return {
    currency: "USD",
    subtotal,
    discount: volumeDiscount,
    total: subtotal,
    breakdown,
    ruleSetVersion: "rocket-league-placements-v1.1",
  };
}
