import type { CatalogGame, ServiceSummary } from "../types/catalog";

const valorantServices: ServiceSummary[] = [
  {
    id: "service_val_rank",
    gameId: "game_valorant",
    slug: "rank-boost",
    name: "Rank Boost",
    category: "rank",
    description: "Valorant rank progression from your current rank to your selected target rank.",
    startingPrice: 3.87,
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
    currency: "USD",
    status: "active",
  },
];

export function withValorantServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "valorant") return game;

  return {
    ...game,
    services: valorantServices,
    startingPrice: Math.min(...valorantServices.map((service) => service.startingPrice)),
  };
}
