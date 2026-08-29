import type { CatalogGame, GameAccent } from "../types/catalog";

export type LaunchGameCard = {
  slug: string;
  name: string;
  displayName: string;
  accent: GameAccent;
  category: string;
  ready: boolean;
};

export const launchGames: LaunchGameCard[] = [
  {
    slug: "rocket-league",
    name: "Rocket League",
    displayName: "Rocket League",
    accent: "blue",
    category: "Competitive sports",
    ready: true,
  },
  {
    slug: "league-of-legends",
    name: "League of Legends",
    displayName: "League of Legends",
    accent: "emerald",
    category: "MOBA",
    ready: false,
  },
  {
    slug: "valorant",
    name: "VALORANT",
    displayName: "Valorant",
    accent: "rose",
    category: "Tactical FPS",
    ready: false,
  },
  {
    slug: "marvel-rivals",
    name: "Marvel Rivals",
    displayName: "Marvel Rivals",
    accent: "violet",
    category: "Hero shooter",
    ready: false,
  },
  {
    slug: "overwatch-2",
    name: "Overwatch 2",
    displayName: "Overwatch",
    accent: "amber",
    category: "Hero shooter",
    ready: false,
  },
  {
    slug: "battlefield-6",
    name: "Battlefield 6",
    displayName: "Battlefield 6",
    accent: "cyan",
    category: "FPS",
    ready: false,
  },
  {
    slug: "rainbow-six-siege",
    name: "Rainbow Six Siege",
    displayName: "Rainbow Six Siege",
    accent: "emerald",
    category: "Tactical FPS",
    ready: false,
  },
];

const launchShells: Record<string, CatalogGame> = {
  "battlefield-6": {
    id: "game_battlefield_6_shell",
    slug: "battlefield-6",
    name: "Battlefield 6",
    shortDescription: "Marketplace structure prepared for Battlefield 6 services.",
    accent: "cyan",
    status: "active",
    featured: true,
    services: [],
    startingPrice: null,
  },
  "rainbow-six-siege": {
    id: "game_rainbow_six_siege_shell",
    slug: "rainbow-six-siege",
    name: "Rainbow Six Siege",
    shortDescription: "Marketplace structure prepared for Rainbow Six Siege services.",
    accent: "emerald",
    status: "active",
    featured: true,
    services: [],
    startingPrice: null,
  },
};

export function getLaunchGameShell(slug: string) {
  return launchShells[slug];
}

export function getLaunchGameDisplayName(slug: string, fallback: string) {
  return launchGames.find((game) => game.slug === slug)?.displayName ?? fallback;
}
