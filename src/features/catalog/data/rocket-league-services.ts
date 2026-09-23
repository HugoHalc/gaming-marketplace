import type { CatalogGame, ServiceSummary } from "../types/catalog";

const VERIFIED_BASE_PRICE_CONTEXT = "Based on the smallest base configuration.";

const rocketLeagueAdditionalServices: ServiceSummary[] = [
  {
    id: "service_rl_tournament_placeholder",
    gameId: "game_rocket_league",
    slug: "tournament-boost",
    name: "Tournament Boost",
    category: "wins",
    description: "One Tournament Win configured for your current rank, playlist and preferred boost method.",
    startingPrice: 11.19,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
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
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
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
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
];

export function withRocketLeagueServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "rocket-league") return game;

  const existingBySlug = new Map(game.services.map((service) => [service.slug, service]));
  const additionalServices = rocketLeagueAdditionalServices.map((blueprint) => {
    const canonical = existingBySlug.get(blueprint.slug);

    if (!canonical) {
      return {
        ...blueprint,
        gameId: game.id,
      };
    }

    return {
      ...blueprint,
      ...canonical,
      slug: blueprint.slug,
      name: blueprint.name,
      category: blueprint.category,
      description: blueprint.description,
      startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    };
  });

  const existingServices = game.services.filter(
    (service) =>
      service.slug !== "coaching" &&
      !rocketLeagueAdditionalServices.some((additional) => additional.slug === service.slug),
  );

  return {
    ...game,
    services: [...existingServices, ...additionalServices],
    startingPrice: game.startingPrice,
  };
}
