import type { CatalogGame, ServiceSummary } from "../types/catalog";

const VERIFIED_BASE_PRICE_CONTEXT = "Based on the smallest base configuration.";

const valorantServices: ServiceSummary[] = [
  {
    id: "service_val_rank",
    gameId: "game_valorant",
    slug: "rank-boost",
    name: "Rank Boost",
    category: "rank",
    description: "Valorant rank progression from your current rank to your selected target rank.",
    startingPrice: 3.87,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_val_wins",
    gameId: "game_valorant",
    slug: "wins",
    name: "Competitive Wins",
    category: "wins",
    description: "Purchase 1 to 5 competitive wins based on your current Valorant rank.",
    startingPrice: 1.7,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_val_placements",
    gameId: "game_valorant",
    slug: "placement-matches",
    name: "Placements Boost",
    category: "placements",
    description: "Purchase 1 to 5 Valorant placement matches based on your current rank.",
    startingPrice: 1.32,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
];

export function withValorantServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "valorant") return game;

  const existingBySlug = new Map(game.services.map((service) => [service.slug, service]));
  const services = valorantServices.map((blueprint) => {
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

  return {
    ...game,
    services,
    startingPrice: Math.min(...services.map((service) => service.startingPrice)),
  };
}
