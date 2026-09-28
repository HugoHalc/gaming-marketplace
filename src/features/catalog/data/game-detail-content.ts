import type { GameAccent } from "../types/catalog";
import { rainbowSixSiegeGameDetailContent } from "./rainbow-six-siege-foundation";

export interface GameDetailContent {
  slug: string;
  eyebrow: string;
  heroDescription: string;
  categoryLabel: string;
  fulfillmentLabel: string;
  trustPoints: string[];
  highlights: Array<{
    title: string;
    description: string;
  }>;
  serviceIntro: string;
  accent: GameAccent;
}

export const gameDetailContent: Record<string, GameDetailContent> = {
  "league-of-legends": {
    slug: "league-of-legends",
    eyebrow: "League of Legends services",
    heroDescription: "A dedicated storefront prepared for League of Legends competitive services.",
    categoryLabel: "MOBA",
    fulfillmentLabel: "Game-specific configuration",
    trustPoints: ["Clear service structure", "Server-calculated pricing", "Order progress visibility"],
    highlights: [
      { title: "Game-first discovery", description: "Start with League of Legends before choosing the service that matches your goal." },
      { title: "Visual service browsing", description: "Large service cards make the catalog easier to compare before configuration." },
      { title: "Expandable structure", description: "Game-specific content and artwork can be added later without rebuilding the page." },
    ],
    serviceIntro: "Choose the League of Legends service that matches your goal.",
    accent: "emerald",
  },
  valorant: {
    slug: "valorant",
    eyebrow: "VALORANT services",
    heroDescription: "A dedicated storefront prepared for VALORANT competitive services.",
    categoryLabel: "Tactical FPS",
    fulfillmentLabel: "Game-specific configuration",
    trustPoints: ["Clear service structure", "Server-calculated pricing", "Order progress visibility"],
    highlights: [
      { title: "Game-first discovery", description: "Start with VALORANT before choosing the service that matches your goal." },
      { title: "Visual service browsing", description: "Large service cards make the catalog easier to compare before configuration." },
      { title: "Expandable structure", description: "Game-specific content and artwork can be added later without rebuilding the page." },
    ],
    serviceIntro: "Choose the VALORANT service that matches your goal.",
    accent: "rose",
  },
  "marvel-rivals": {
    slug: "marvel-rivals",
    eyebrow: "Marvel Rivals services",
    heroDescription: "A dedicated storefront prepared for Marvel Rivals competitive services.",
    categoryLabel: "Hero shooter",
    fulfillmentLabel: "Game-specific configuration",
    trustPoints: ["Clear service structure", "Server-calculated pricing", "Order progress visibility"],
    highlights: [
      { title: "Game-first discovery", description: "Start with Marvel Rivals before choosing the service that matches your goal." },
      { title: "Visual service browsing", description: "Large service cards make the catalog easier to compare before configuration." },
      { title: "Expandable structure", description: "Game-specific content and artwork can be added later without rebuilding the page." },
    ],
    serviceIntro: "Choose the Marvel Rivals service that matches your goal.",
    accent: "violet",
  },
  "rocket-league": {
    slug: "rocket-league",
    eyebrow: "Rocket League services",
    heroDescription: "Choose from the Rocket League service catalog without changing the configurators and pricing already completed.",
    categoryLabel: "Competitive sports",
    fulfillmentLabel: "Playlist-aware configuration",
    trustPoints: ["Existing Rocket League services preserved", "Server-calculated pricing", "Order progress visibility"],
    highlights: [
      { title: "Existing services preserved", description: "This phase changes the Rocket League overview presentation only, not its service logic." },
      { title: "Stronger service discovery", description: "The service catalog is presented as a more visual, game-specific showcase." },
      { title: "Same configuration flow", description: "Each Rocket League service continues into the configurator already built for it." },
    ],
    serviceIntro: "Choose the Rocket League service that matches your goal.",
    accent: "blue",
  },
  "overwatch-2": {
    slug: "overwatch-2",
    eyebrow: "Overwatch boosting services",
    heroDescription: "Choose Rank Boost, Competitive Wins, Competitive Drives, Placements Boost, or Unrated Matches and configure the service around your role, server, platform, and preferred boost method.",
    categoryLabel: "Hero shooter",
    fulfillmentLabel: "Role & queue configuration",
    trustPoints: ["Five active services", "Server-validated pricing", "Order progress visibility"],
    highlights: [
      { title: "Five service paths", description: "Choose rank progression, wins, Competitive Drives, placements, or unrated matches from one Overwatch storefront." },
      { title: "Overwatch-specific options", description: "Configure role or Open Queue, server, platform, boost method, and only the extras you want." },
      { title: "Same BoostingPedia flow", description: "Pricing is validated server-side and the resulting order stays connected to the existing checkout and dashboard workflow." },
    ],
    serviceIntro: "Choose the Overwatch service that matches your goal.",
    accent: "amber",
  },
  "teamfight-tactics": {
    slug: "teamfight-tactics",
    eyebrow: "Teamfight Tactics services",
    heroDescription: "Existing catalog page retained for compatibility.",
    categoryLabel: "Auto battler",
    fulfillmentLabel: "Ladder-focused options",
    trustPoints: ["Clear service structure", "Server-calculated pricing", "Order progress visibility"],
    highlights: [
      { title: "Existing catalog", description: "This title is not part of the new launch showcase." },
      { title: "Compatible structure", description: "The route remains compatible with the marketplace architecture." },
      { title: "No launch promotion", description: "It is intentionally omitted from the new Home and Games launch lineup." },
    ],
    serviceIntro: "Available services.",
    accent: "cyan",
  },
  "rainbow-six-siege": rainbowSixSiegeGameDetailContent,
};
