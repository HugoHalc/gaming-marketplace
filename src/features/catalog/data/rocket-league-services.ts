import type { CatalogGame, ServiceSummary } from "../types/catalog";

const rocketLeagueAdditionalServices: ServiceSummary[] = [
  {
    id: "service_rl_tournament_placeholder",
    gameId: "game_rocket_league",
    slug: "tournament-boost",
    name: "Tournament Boost",
    category: "wins",
    description: "Tournament progression configured by your current rank, playlist and preferred boost method.",
    startingPrice: 11.19,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_rl_rewards_placeholder",
    gameId: "game_rocket_league",
    slug: "rewards-boost",
    name: "Rewards Boost",
    category: "wins",
    description: "Season reward progression with flexible win packages and automatic package discounts.",
    startingPrice: 1.23,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_rl_placements_placeholder",
    gameId: "game_rocket_league",
    slug: "placements-boost",
    name: "Placements Boost",
    category: "placements",
    description: "Complete your Rocket League placement matches with a dedicated service flow.",
    startingPrice: 1.29,
    currency: "USD",
    status: "active",
  },
];

export function withRocketLeagueServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "rocket-league") return game;

  const existingServices = game.services.filter(
    (service) =>
      service.slug !== "coaching" &&
      !rocketLeagueAdditionalServices.some((additional) => additional.slug === service.slug),
  );

  return {
    ...game,
    services: [...existingServices, ...rocketLeagueAdditionalServices],
    startingPrice: game.startingPrice,
  };
}
