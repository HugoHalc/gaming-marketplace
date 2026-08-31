import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const PRICE_PER_WIN: Record<string, number> = {
  unrated: 1.79,
  "bronze-1": 1.23,
  "bronze-2": 1.23,
  "bronze-3": 1.23,
  "silver-1": 1.23,
  "silver-2": 1.23,
  "silver-3": 1.23,
  "gold-1": 1.42,
  "gold-2": 1.42,
  "gold-3": 1.42,
  "platinum-1": 2.08,
  "platinum-2": 2.08,
  "platinum-3": 2.75,
  "diamond-1": 2.84,
  "diamond-2": 2.84,
  "diamond-3": 3.41,
  "champion-1": 4.08,
  "champion-2": 4.27,
  "champion-3": 4.36,
  "grand-champion-1": 4.55,
  "grand-champion-2": 5.22,
  "grand-champion-3": 5.22,
  "supersonic-legend": 6.17,
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

export function rocketLeagueRewardsDiscount(wins: number) {
  if (wins >= 10) return 0.21;
  if (wins >= 8) return 0.20;
  if (wins >= 6) return 0.19;
  if (wins >= 4) return 0.18;
  if (wins >= 3) return 0.10;
  if (wins >= 2) return 0.05;
  return 0;
}

export function isRocketLeagueRewardsQuote(input: {
  gameSlug: string;
  serviceSlug: string;
}) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "rewards-boost";
}

export function calculateRocketLeagueRewardsQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "");
  const wins = asInteger(selection.wins);
  const playlist = String(selection.playlist ?? "");
  const boostMethod = String(selection.boostMethod ?? "");
  const platform = String(selection.platform ?? "");

  const perWin = PRICE_PER_WIN[currentRank];
  if (!perWin) throw new Error("Invalid current rank.");
  if (!Number.isFinite(wins) || wins < 1 || wins > 10) {
    throw new Error("Number of reward wins must be between 1 and 10.");
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
  const discountRate = rocketLeagueRewardsDiscount(wins);
  const packageDiscount = roundMoney(rawWinsPrice * discountRate);
  const discountedWinsPrice = roundMoney(rawWinsPrice - packageDiscount);

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
      label: `${wins} reward win${wins === 1 ? "" : "s"} × $${perWin.toFixed(2)}`,
      amount: rawWinsPrice,
    },
  ];

  if (packageDiscount > 0) {
    breakdown.push({
      label: `Rewards package discount (${Math.round(discountRate * 100)}% OFF)`,
      amount: -packageDiscount,
    });
  }

  if (playlistPrice > 0) {
    breakdown.push({
      label: `Playlist modifier (+${Math.round((playlistMultiplier - 1) * 100)}%)`,
      amount: playlistPrice,
    });
  }

  if (methodPrice > 0) {
    breakdown.push({ label: "Play With Booster (+45%)", amount: methodPrice });
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

  const total = roundMoney(servicePrice + liveStreamPrice + expressPrice);

  return {
    currency: "USD",
    subtotal: total,
    discount: packageDiscount,
    total,
    breakdown,
    ruleSetVersion: "rocket-league-rewards-v1.0",
  };
}
