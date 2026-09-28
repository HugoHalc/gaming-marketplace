import type { CatalogGame, GameAccent } from "../types/catalog";
import { dota2PublicGameCard } from "./dota-2-foundation";
import {
  rainbowSixSiegeGameFoundation,
  rainbowSixSiegePublicGameCard,
} from "./rainbow-six-siege-foundation";

export type LaunchGameCard = {
  slug: string;
  name: string;
  displayName: string;
  accent: GameAccent;
  category: string;
  ready: boolean;
  overviewReady?: boolean;
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
    accent: "amber",
    category: "MOBA",
    ready: true,
  },
  {
    slug: "valorant",
    name: "VALORANT",
    displayName: "Valorant",
    accent: "rose",
    category: "Tactical FPS",
    ready: true,
  },
  {
    slug: "marvel-rivals",
    name: "Marvel Rivals",
    displayName: "Marvel Rivals",
    accent: "violet",
    category: "Hero shooter",
    ready: true,
  },
  {
    slug: "overwatch-2",
    name: "Overwatch 2",
    displayName: "Overwatch",
    accent: "amber",
    category: "Hero shooter",
    ready: true,
  },
  dota2PublicGameCard,
];

export const publicGameNavigation: LaunchGameCard[] = [
  ...launchGames,
  rainbowSixSiegePublicGameCard,
];

const launchShells: Record<string, CatalogGame> = {
  [rainbowSixSiegeGameFoundation.slug]: {
    id: rainbowSixSiegeGameFoundation.id,
    slug: rainbowSixSiegeGameFoundation.slug,
    name: rainbowSixSiegeGameFoundation.name,
    shortDescription: rainbowSixSiegeGameFoundation.shortDescription,
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
  return publicGameNavigation.find((game) => game.slug === slug)?.displayName ?? fallback;
}
