import type { CatalogGame, ServiceSummary } from "../types/catalog";

const leagueOfLegendsServices: ServiceSummary[] = [
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
  {
    id: "service_lol_arena",
    gameId: "game_lol",
    slug: "arena-boost",
    name: "Arena Boost",
    category: "wins",
    description: "Arena match packages with role, server, boost method and verified pricing options.",
    startingPrice: 10.50,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_lol_mastery",
    gameId: "game_lol",
    slug: "mastery-boost",
    name: "Mastery Boost",
    category: "rank",
    description: "Mastery Points Farm and Marks of Mastery with verified server-calculated pricing.",
    startingPrice: 3.50,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_lol_clash",
    gameId: "game_lol",
    slug: "clash-boost",
    name: "Clash Boost",
    category: "wins",
    description: "Clash progression configured by tier, games, boosters, server and boost method.",
    startingPrice: 2.09,
    currency: "USD",
    status: "active",
  },
];

export function withLeagueOfLegendsServiceNavigation(game: CatalogGame): CatalogGame {
  if (game.slug !== "league-of-legends") return game;

  return {
    ...game,
    accent: "amber",
    services: leagueOfLegendsServices,
    startingPrice: Math.min(...leagueOfLegendsServices.map((service) => service.startingPrice)),
  };
}
