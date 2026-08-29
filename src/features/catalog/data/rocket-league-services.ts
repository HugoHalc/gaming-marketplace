import type { CatalogGame, ServiceSummary } from "../types/catalog";

const rocketLeagueUpcomingServices: ServiceSummary[] = [
  {
    id: "service_rl_tournament_placeholder",
    gameId: "game_rocket_league",
    slug: "tournament-boost",
    name: "Tournament Boost",
    category: "wins",
    description: "Rocket League tournament progression service. Configuration will be added in a dedicated phase.",
    startingPrice: 0,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_rl_rewards_placeholder",
    gameId: "game_rocket_league",
    slug: "rewards-boost",
    name: "Rewards Boost",
    category: "wins",
    description: "Rocket League seasonal rewards progression. Configuration will be added in a dedicated phase.",
    startingPrice: 0,
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
    startingPrice: 0,
    currency: "USD",
    status: "active",
  },
];

export function withRocketLeagueServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "rocket-league") return game;

  const existingServices = game.services.filter(
    (service) =>
      service.slug !== "coaching" &&
      !rocketLeagueUpcomingServices.some((upcoming) => upcoming.slug === service.slug),
  );

  return {
    ...game,
    services: [...existingServices, ...rocketLeagueUpcomingServices],
    // Keep the real catalog minimum. Placeholder services must never affect price.
    startingPrice: game.startingPrice,
  };
}
