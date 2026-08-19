import type { GameSummary, ServiceSummary } from "../types/catalog";

export const mockGames: GameSummary[] = [
  {
    id: "game_lol",
    slug: "league-of-legends",
    name: "League of Legends",
    shortDescription: "Rank progression, wins, placements, and coaching.",
    accent: "emerald",
    status: "active",
  },
  {
    id: "game_valorant",
    slug: "valorant",
    name: "VALORANT",
    shortDescription: "Competitive rank services and personalized coaching.",
    accent: "rose",
    status: "active",
  },
  {
    id: "game_marvel",
    slug: "marvel-rivals",
    name: "Marvel Rivals",
    shortDescription: "Competitive progression and performance services.",
    accent: "violet",
    status: "active",
  },
];

export const mockServices: ServiceSummary[] = [
  {
    id: "service_lol_rank",
    gameId: "game_lol",
    slug: "rank-boost",
    name: "Rank Boost",
    description: "Configure your current and target rank with transparent pricing.",
    startingPrice: 12.99,
    currency: "USD",
    status: "active",
  },
  {
    id: "service_val_coaching",
    gameId: "game_valorant",
    slug: "coaching",
    name: "Coaching",
    description: "One-on-one sessions focused on mechanics, decisions, and consistency.",
    startingPrice: 24.99,
    currency: "USD",
    status: "active",
  },
];
