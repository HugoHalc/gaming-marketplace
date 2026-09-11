import type { CatalogGame, ServiceSummary } from "../types/catalog";

const VERIFIED_BASE_PRICE_CONTEXT = "Based on the smallest base configuration.";

const overwatchServices: ServiceSummary[] = [
  {
    id: "service_ow_rank",
    gameId: "game_overwatch",
    slug: "rank-boost",
    name: "Rank Boost",
    category: "rank",
    description: "Progress from your current Overwatch rank to a selected target rank.",
    startingPrice: 3.62,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_ow_wins",
    gameId: "game_overwatch",
    slug: "wins",
    name: "Competitive Wins",
    category: "wins",
    description: "Purchase 1 to 5 competitive wins based on your current Overwatch rank.",
    startingPrice: 1.61,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_ow_drives",
    gameId: "game_overwatch",
    slug: "competitive-drives",
    name: "Competitive Drives",
    category: "wins",
    description: "Configure Competitive Drive progress in 50-point steps up to 4000.",
    startingPrice: 0.25,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_ow_placements",
    gameId: "game_overwatch",
    slug: "placement-matches",
    name: "Placements Boost",
    category: "placements",
    description: "Purchase 1 to 10 placement matches using your previous rank or Unranked.",
    startingPrice: 0.97,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_ow_unrated",
    gameId: "game_overwatch",
    slug: "unrated-matches",
    name: "Unrated Matches",
    category: "wins",
    description: "Purchase 1 to 10 unrated matches with no rank selection required.",
    startingPrice: 2.41,
    startingPriceContext: VERIFIED_BASE_PRICE_CONTEXT,
    currency: "USD",
    status: "active",
  },
];

export function withOverwatchServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "overwatch-2") return game;

  return {
    ...game,
    services: overwatchServices,
    startingPrice: Math.min(...overwatchServices.map((service) => service.startingPrice)),
  };
}
