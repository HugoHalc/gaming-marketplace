import type { CatalogGame, ServiceSummary } from "../types/catalog";

const VERIFIED_BASE_PRICE_CONTEXT = "Based on one Competitive Win at the lowest available rank rate.";

const overwatchServices: ServiceSummary[] = [
  {
    id: "service_ow_wins",
    gameId: "game_overwatch",
    slug: "wins",
    name: "Competitive Wins",
    category: "wins",
    description: "Choose your current Overwatch rank and the number of competitive wins you want to complete.",
    startingPrice: 2.2,
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
