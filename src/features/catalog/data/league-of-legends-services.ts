import type { CatalogGame, ServiceSummary } from "../types/catalog";

const leagueOfLegendsPhaseOneServices: ServiceSummary[] = [
  {
    id: "service_lol_rank",
    gameId: "game_lol",
    slug: "rank-boost",
    name: "Rank Boost",
    category: "rank",
    description: "League of Legends rank progression with LP, server, queue and boost-method configuration.",
    startingPrice: 2.89,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_lol_wins",
    gameId: "game_lol",
    slug: "wins",
    name: "Ranked Wins Boost",
    category: "wins",
    description: "Ranked wins priced from your current League of Legends rank and selected options.",
    startingPrice: 1.38,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_lol_placements",
    gameId: "game_lol",
    slug: "placement-matches",
    name: "Placements Boost",
    category: "placements",
    description: "Placement matches priced from your previous League of Legends rank.",
    startingPrice: 0.79,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_lol_unrated",
    gameId: "game_lol",
    slug: "unrated-matches",
    name: "Unrated Matches Boost",
    category: "wins",
    description: "Unrated match packages with server, queue, boost-method and optional extras.",
    startingPrice: 2.09,
    currency: "USD",
    status: "active",
  },
];

export function withLeagueOfLegendsServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "league-of-legends") return game;

  return {
    ...game,
    services: leagueOfLegendsPhaseOneServices,
    startingPrice: Math.min(...leagueOfLegendsPhaseOneServices.map((service) => service.startingPrice)),
  };
}
