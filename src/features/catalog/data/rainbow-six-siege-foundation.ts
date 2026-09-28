export const RAINBOW_SIX_SIEGE_GAME_SLUG = "rainbow-six-siege" as const;

export type RainbowSixSiegeServiceSlug =
  | "rank-boost"
  | "ranked-wins"
  | "placement-matches"
  | "competitive-rewards";

export type RainbowSixSiegeServiceStatus = "coming-soon";

export interface RainbowSixSiegeServiceFoundation {
  id: string;
  gameSlug: typeof RAINBOW_SIX_SIEGE_GAME_SLUG;
  slug: RainbowSixSiegeServiceSlug;
  name: string;
  description: string;
  status: RainbowSixSiegeServiceStatus;
}

export const rainbowSixSiegeServiceFoundations: readonly RainbowSixSiegeServiceFoundation[] = [
  {
    id: "service_rainbow_six_siege_rank_boost_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "rank-boost",
    name: "Rank Boost",
    description:
      "Progress through the competitive ladder with a service tailored to your target rank.",
    status: "coming-soon",
  },
  {
    id: "service_rainbow_six_siege_ranked_wins_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "ranked-wins",
    name: "Ranked Wins",
    description:
      "Secure the number of Ranked victories you need with clear order tracking.",
    status: "coming-soon",
  },
  {
    id: "service_rainbow_six_siege_placement_matches_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "placement-matches",
    name: "Placement Matches",
    description:
      "Complete your seasonal placement matches with an experienced Siege player.",
    status: "coming-soon",
  },
  {
    id: "service_rainbow_six_siege_competitive_rewards_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "competitive-rewards",
    name: "Competitive Rewards",
    description:
      "Build progress through the seasonal Competitive Rewards track.",
    status: "coming-soon",
  },
] as const;

export const rainbowSixSiegeServiceSlugs = rainbowSixSiegeServiceFoundations.map(
  (service) => service.slug,
);

export function findRainbowSixSiegeServiceFoundation(slug: string) {
  return rainbowSixSiegeServiceFoundations.find((service) => service.slug === slug);
}

export const rainbowSixSiegeAssetFoundation = {
  gameCard: "/game-cards/rainbow-six-siege.webp",
  overviewHero: "/game-cards/rainbow-six-siege.webp",
  serviceHero: null,
  rankBadges: null,
} as const;

export const rainbowSixSiegeGameFoundation = {
  id: "game_rainbow_six_siege_foundation",
  slug: RAINBOW_SIX_SIEGE_GAME_SLUG,
  name: "Rainbow Six Siege",
  displayName: "Rainbow Six Siege",
  title: "Rainbow Six Siege Boosting Services",
  shortDescription: "Tactical boosting services built for competitive Siege players.",
  categoryLabel: "Tactical FPS",
  rankedSystemLabel: "Ranked 3.0",
  publicAvailability: "overview-preview",
  serviceAvailability: "coming-soon",
  finalAssetStatus: "provisional",
  assets: rainbowSixSiegeAssetFoundation,
  services: rainbowSixSiegeServiceFoundations,
} as const;

export const rainbowSixSiegePublicGameCard = {
  slug: RAINBOW_SIX_SIEGE_GAME_SLUG,
  name: rainbowSixSiegeGameFoundation.name,
  displayName: rainbowSixSiegeGameFoundation.displayName,
  accent: "emerald",
  category: rainbowSixSiegeGameFoundation.categoryLabel,
  ready: false,
  overviewReady: true,
} as const;

export const rainbowSixSiegeGameDetailContent = {
  slug: RAINBOW_SIX_SIEGE_GAME_SLUG,
  eyebrow: "Rainbow Six Siege services",
  heroDescription: rainbowSixSiegeGameFoundation.shortDescription,
  categoryLabel: rainbowSixSiegeGameFoundation.categoryLabel,
  fulfillmentLabel: "Ranked 3.0 foundation",
  trustPoints: [
    "Four planned service paths",
    "Purchasing remains disabled",
    "Service configuration coming later",
  ],
  highlights: [
    {
      title: "Ranked 3.0 foundation",
      description:
        "The catalog is structured around the current competitive system without locking in rank or pricing rules yet.",
    },
    {
      title: "Four service paths",
      description:
        "Rank Boost, Ranked Wins, Placement Matches, and Competitive Rewards are registered in one ordered foundation.",
    },
    {
      title: "Safe staged rollout",
      description:
        "Each service remains unavailable for purchase until its configurator and server-authoritative pricing are implemented.",
    },
  ],
  serviceIntro: "Planned Rainbow Six Siege services.",
  accent: "emerald" as const,
};
