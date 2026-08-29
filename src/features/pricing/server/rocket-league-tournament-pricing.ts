import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const BASE_PRICE: Record<string, number> = {
  bronze: 11.19,
  silver: 13.69,
  gold: 20.79,
  platinum: 27.99,
  diamond: 34.29,
  champion: 41.09,
  "grand-champion": 54.69,
  "supersonic-legend": 92.29,
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

export function isRocketLeagueTournamentQuote(input: {
  gameSlug: string;
  serviceSlug: string;
}) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "tournament-boost";
}

export function calculateRocketLeagueTournamentQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "");
  const playlist = String(selection.playlist ?? "");
  const boostMethod = String(selection.boostMethod ?? "");
  const platform = String(selection.platform ?? "");

  const basePrice = BASE_PRICE[currentRank];
  if (!basePrice) throw new Error("Invalid current rank.");

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

  const playlistPrice = roundMoney(basePrice * (playlistMultiplier - 1));
  const afterPlaylist = roundMoney(basePrice + playlistPrice);

  const methodMultiplier = boostMethod === "play-with-booster" ? 1.45 : 1;
  const methodPrice = roundMoney(afterPlaylist * (methodMultiplier - 1));
  const servicePrice = roundMoney(afterPlaylist + methodPrice);

  const expressPrice =
    selection.expressDelivery === true ? roundMoney(servicePrice * 0.2) : 0;
  const liveStreamPrice = selection.liveStream === true ? 10 : 0;

  const breakdown: QuoteBreakdownItem[] = [
    { label: "Tournament base price", amount: basePrice },
  ];

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
    discount: 0,
    total,
    breakdown,
    ruleSetVersion: "rocket-league-tournament-v1.0",
  };
}
