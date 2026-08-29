import type { GameAccent } from "../types/catalog";

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
    eyebrow: "Overwatch services",
    heroDescription: "A dedicated storefront prepared for Overwatch competitive services.",
    categoryLabel: "Hero shooter",
    fulfillmentLabel: "Game-specific configuration",
    trustPoints: ["Clear service structure", "Server-calculated pricing", "Order progress visibility"],
    highlights: [
      { title: "Game-first discovery", description: "Start with Overwatch before choosing the service that matches your goal." },
      { title: "Visual service browsing", description: "Large service cards make the catalog easier to compare before configuration." },
      { title: "Expandable structure", description: "Game-specific content and artwork can be added later without rebuilding the page." },
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
  "battlefield-6": {
    slug: "battlefield-6",
    eyebrow: "Battlefield 6",
    heroDescription: "Marketplace structure prepared for Battlefield 6. Game-specific services and artwork can be added in a later phase.",
    categoryLabel: "FPS",
    fulfillmentLabel: "Structure ready",
    trustPoints: ["Dedicated game storefront", "Service rail prepared", "Responsive layout ready"],
    highlights: [
      { title: "Storefront ready", description: "The game page structure is ready for future service configuration." },
      { title: "Visual system ready", description: "Final Battlefield artwork can be introduced without changing the layout." },
      { title: "Catalog-ready architecture", description: "Service cards will populate from the catalog when the game is implemented." },
    ],
    serviceIntro: "Battlefield 6 service structure is ready for implementation.",
    accent: "cyan",
  },
  "rainbow-six-siege": {
    slug: "rainbow-six-siege",
    eyebrow: "Rainbow Six Siege",
    heroDescription: "Marketplace structure prepared for Rainbow Six Siege. Game-specific services and artwork can be added in a later phase.",
    categoryLabel: "Tactical FPS",
    fulfillmentLabel: "Structure ready",
    trustPoints: ["Dedicated game storefront", "Service rail prepared", "Responsive layout ready"],
    highlights: [
      { title: "Storefront ready", description: "The game page structure is ready for future service configuration." },
      { title: "Visual system ready", description: "Final Rainbow Six Siege artwork can be introduced without changing the layout." },
      { title: "Catalog-ready architecture", description: "Service cards will populate from the catalog when the game is implemented." },
    ],
    serviceIntro: "Rainbow Six Siege service structure is ready for implementation.",
    accent: "emerald",
  },
};
