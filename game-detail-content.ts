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
    heroDescription:
      "Build a service around your competitive goal, from rank progression and wins to placements and one-on-one coaching.",
    categoryLabel: "MOBA",
    fulfillmentLabel: "Flexible queue options",
    trustPoints: ["Transparent starting prices", "Clear service scope", "Order progress visibility"],
    highlights: [
      {
        title: "Goal-based configuration",
        description: "Choose the service model that matches your current ladder objective instead of buying a generic package.",
      },
      {
        title: "Competitive context",
        description: "Service options are structured around rank, wins, placements, and coaching workflows used by competitive players.",
      },
      {
        title: "Clear next steps",
        description: "Every service shows its scope and starting price before you move into detailed configuration.",
      },
    ],
    serviceIntro: "Choose how you want to progress in League of Legends.",
    accent: "emerald",
  },
  valorant: {
    slug: "valorant",
    eyebrow: "VALORANT services",
    heroDescription:
      "Choose a competitive service built around rank, wins, placements, or focused coaching, with clear pricing before configuration.",
    categoryLabel: "Tactical FPS",
    fulfillmentLabel: "Region-aware options",
    trustPoints: ["Transparent starting prices", "Flexible competitive goals", "Order progress visibility"],
    highlights: [
      {
        title: "Rank-focused structure",
        description: "Start from your current competitive position and choose the service type that best matches your target.",
      },
      {
        title: "Flexible service paths",
        description: "Rank progression, competitive wins, placements, and coaching live under one consistent game experience.",
      },
      {
        title: "Pricing clarity",
        description: "You see a real starting point before detailed options and modifiers are introduced in the configurator.",
      },
    ],
    serviceIntro: "Pick the VALORANT service that matches your competitive objective.",
    accent: "rose",
  },
  "marvel-rivals": {
    slug: "marvel-rivals",
    eyebrow: "Marvel Rivals services",
    heroDescription:
      "Progress your competitive goals with flexible rank, wins, and coaching services designed around a clear purchase flow.",
    categoryLabel: "Hero shooter",
    fulfillmentLabel: "Competitive-focused options",
    trustPoints: ["Clear service scope", "Transparent starting prices", "Simple order tracking"],
    highlights: [
      {
        title: "Competitive progression",
        description: "Choose a service path based on whether you want rank movement, a target number of wins, or coaching.",
      },
      {
        title: "Simple comparison",
        description: "Compare available service models and starting prices without opening multiple disconnected pages.",
      },
      {
        title: "Built to expand",
        description: "The same data structure can support future game-specific options without rebuilding the storefront.",
      },
    ],
    serviceIntro: "Select the Marvel Rivals service that fits your current goal.",
    accent: "violet",
  },
  "rocket-league": {
    slug: "rocket-league",
    eyebrow: "Rocket League services",
    heroDescription:
      "Choose rank progression, competitive wins, or coaching with a storefront organized around playlists and measurable goals.",
    categoryLabel: "Competitive sports",
    fulfillmentLabel: "Playlist-aware options",
    trustPoints: ["Flexible competitive goals", "Transparent starting prices", "Clear order progress"],
    highlights: [
      {
        title: "Playlist-aware services",
        description: "The service model is prepared for game-specific choices such as preferred competitive playlists.",
      },
      {
        title: "Mechanics or progression",
        description: "Choose between outcome-driven competitive services and coaching focused on improving your own play.",
      },
      {
        title: "Consistent checkout path",
        description: "Every service follows the same predictable flow from selection to configuration and order tracking.",
      },
    ],
    serviceIntro: "Choose the Rocket League service that best matches your goal.",
    accent: "blue",
  },
  "overwatch-2": {
    slug: "overwatch-2",
    eyebrow: "Overwatch 2 services",
    heroDescription:
      "Explore competitive progression and coaching services designed to support role, queue, and target-rank preferences.",
    categoryLabel: "Hero shooter",
    fulfillmentLabel: "Role-aware options",
    trustPoints: ["Role-aware configuration", "Transparent starting prices", "Order progress visibility"],
    highlights: [
      {
        title: "Role-aware structure",
        description: "The catalog is prepared for service options that vary by role and competitive queue.",
      },
      {
        title: "Progress or improve",
        description: "Choose rank progression for an outcome-focused path or coaching for skill development.",
      },
      {
        title: "Clear service boundaries",
        description: "Each product communicates what it is for before configuration, reducing ambiguity at checkout.",
      },
    ],
    serviceIntro: "Choose how you want to approach your Overwatch 2 competitive goals.",
    accent: "amber",
  },
  "teamfight-tactics": {
    slug: "teamfight-tactics",
    eyebrow: "Teamfight Tactics services",
    heroDescription:
      "Choose competitive progression or coaching with a clean path from your current ladder position to the service you need.",
    categoryLabel: "Auto battler",
    fulfillmentLabel: "Ladder-focused options",
    trustPoints: ["Ladder-focused services", "Transparent starting prices", "Simple order tracking"],
    highlights: [
      {
        title: "Ladder-focused progression",
        description: "Rank services are structured around a current competitive tier and a clear target outcome.",
      },
      {
        title: "Improve decision-making",
        description: "Coaching provides a separate path for players focused on economy, tempo, composition choices, and positioning.",
      },
      {
        title: "Data-driven storefront",
        description: "New service models can be added later without changing the core page architecture.",
      },
    ],
    serviceIntro: "Pick the Teamfight Tactics service that fits your ladder objective.",
    accent: "cyan",
  },
};
