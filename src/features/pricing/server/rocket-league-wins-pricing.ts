import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const PRICE_PER_WIN: Record<string, number> = {
  "bronze-1": 1.29,
  "bronze-2": 1.29,
  "bronze-3": 1.29,
  "silver-1": 1.89,
  "silver-2": 1.89,
  "silver-3": 1.89,
  "gold-1": 2.49,
  "gold-2": 2.49,
  "gold-3": 2.49,
  "platinum-1": 3.19,
  "platinum-2": 3.19,
  "platinum-3": 3.19,
  "diamond-1": 3.19,
  "diamond-2": 3.19,
  "diamond-3": 3.19,
  "champion-1": 4.49,
  "champion-2": 4.49,
  "champion-3": 4.99,
  "grand-champion-1": 5.49,
  "grand-champion-2": 5.79,
  "grand-champion-3": 7.99,
  "supersonic-legend": 12.49,
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

export function rocketLeagueWinsDiscount(wins: number) {
  if (wins >= 16) return 0.18;
  if (wins >= 11) return 0.15;
  if (wins >= 8) return 0.12;
  if (wins >= 5) return 0.08;
  if (wins >= 3) return 0.05;
  return 0;
}

export function isRocketLeagueWinsQuote(input: {
  gameSlug: string;
  serviceSlug: string;
}) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "wins";
}

export function calculateRocketLeagueWinsQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "");
  const wins = asInteger(selection.wins);
  const playlist = String(selection.playlist ?? "");
  const boostMethod = String(selection.boostMethod ?? "");
  const platform = String(selection.platform ?? "");

  const perWin = PRICE_PER_WIN[currentRank];
  if (!perWin) throw new Error("Invalid current rank.");
  if (!Number.isFinite(wins) || wins < 1 || wins > 20) {
    throw new Error("Number of wins must be between 1 and 20.");
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

  const rawWinsPrice = roundMoney(perWin * wins);
  const discountRate = rocketLeagueWinsDiscount(wins);
  const volumeDiscount = roundMoney(rawWinsPrice * discountRate);
  const discountedWinsPrice = roundMoney(rawWinsPrice - volumeDiscount);

  const playlistPrice = roundMoney(discountedWinsPrice * (playlistMultiplier - 1));
  const afterPlaylist = roundMoney(discountedWinsPrice + playlistPrice);

  const methodMultiplier = boostMethod === "play-with-booster" ? 1.45 : 1;
  const methodPrice = roundMoney(afterPlaylist * (methodMultiplier - 1));
  const servicePrice = roundMoney(afterPlaylist + methodPrice);

  const expressPrice =
    selection.expressDelivery === true ? roundMoney(servicePrice * 0.2) : 0;
  const liveStreamPrice = selection.liveStream === true ? 10 : 0;

  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${wins} competitive win${wins === 1 ? "" : "s"} × $${perWin.toFixed(2)}`,
      amount: rawWinsPrice,
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
    ruleSetVersion: "rocket-league-wins-v1.0",
  };
}
