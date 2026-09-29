export const RAINBOW_SIX_SIEGE_GAME_SLUG = "rainbow-six-siege" as const;

export type RainbowSixSiegeServiceSlug =
  | "rank-boost"
  | "competitive-wins"
  | "placements-boost"
  | "unrated-matches";

export type RainbowSixSiegeServiceStatus = "active" | "coming-soon";

export interface RainbowSixSiegeServiceFoundation {
  id: string;
  gameSlug: typeof RAINBOW_SIX_SIEGE_GAME_SLUG;
  slug: RainbowSixSiegeServiceSlug;
  route: `/games/${typeof RAINBOW_SIX_SIEGE_GAME_SLUG}/${RainbowSixSiegeServiceSlug}`;
  name: string;
  description: string;
  status: RainbowSixSiegeServiceStatus;
}

export const rainbowSixSiegeServiceFoundations: readonly RainbowSixSiegeServiceFoundation[] = [
  {
    id: "service_rainbow_six_siege_rank_boost_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "rank-boost",
    route: "/games/rainbow-six-siege/rank-boost",
    name: "Rank Boost",
    description:
      "Progress through the competitive ladder with a service tailored to your target rank.",
    status: "active",
  },
  {
    id: "service_rainbow_six_siege_competitive_wins_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "competitive-wins",
    route: "/games/rainbow-six-siege/competitive-wins",
    name: "Competitive Wins",
    description:
      "Choose one to five competitive wins for your current rank, platform, and region.",
    status: "active",
  },
  {
    id: "service_rainbow_six_siege_placements_boost_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "placements-boost",
    route: "/games/rainbow-six-siege/placements-boost",
    name: "Placements Boost",
    description:
      "Complete your Rainbow Six Siege placement matches with experienced boosters, flexible service options, secure checkout, and transparent pricing.",
    status: "active",
  },
  {
    id: "service_rainbow_six_siege_unrated_matches_foundation",
    gameSlug: RAINBOW_SIX_SIEGE_GAME_SLUG,
    slug: "unrated-matches",
    route: "/games/rainbow-six-siege/unrated-matches",
    name: "Unrated Matches",
    description:
      "Play Rainbow Six Siege unrated matches with experienced boosters, flexible service options, secure checkout, and transparent pricing.",
    status: "active",
  },
] as const;

export const rainbowSixSiegeServiceSlugs = rainbowSixSiegeServiceFoundations.map(
  (service) => service.slug,
);

export function findRainbowSixSiegeServiceFoundation(slug: string) {
  return rainbowSixSiegeServiceFoundations.find((service) => service.slug === slug);
}

export function isRainbowSixSiegeServiceActive(slug: string) {
  return findRainbowSixSiegeServiceFoundation(slug)?.status === "active";
}

export const rainbowSixSiegeAssetFoundation = {
  gameCard: "/game-cards/rainbow-six-siege.webp",
  overviewHero: "/game-heroes/rainbow-six-siege-overview-hero.webp",
  serviceHero: "/game-heroes/rainbow-six-siege-services-hero.webp",
  rankBadges: {
    copper: "/ranks/rainbow-six-siege/copper.webp",
    bronze: "/ranks/rainbow-six-siege/bronze.webp",
    silver: "/ranks/rainbow-six-siege/silver.webp",
    gold: "/ranks/rainbow-six-siege/gold.webp",
    platinum: "/ranks/rainbow-six-siege/platinum.webp",
    emerald: "/ranks/rainbow-six-siege/emerald.webp",
    diamond: "/ranks/rainbow-six-siege/diamond.webp",
    champion: "/ranks/rainbow-six-siege/champion.webp",
  },
} as const;

export function getRainbowSixSiegeRankBadge(rank: string) {
  const tier = rank.split("-")[0];
  const badges = rainbowSixSiegeAssetFoundation.rankBadges;
  return Object.prototype.hasOwnProperty.call(badges, tier)
    ? badges[tier as keyof typeof badges]
    : null;
}

export const rainbowSixSiegeGameFoundation = {
  id: "game_rainbow_six_siege_foundation",
  slug: RAINBOW_SIX_SIEGE_GAME_SLUG,
  name: "Rainbow Six Siege",
  displayName: "Rainbow Six Siege",
  title: "Rainbow Six Siege Boosting Services",
  shortDescription: "Tactical boosting services built for competitive Siege players.",
  categoryLabel: "Tactical FPS",
  rankedSystemLabel: "Ranked 3.0",
  publicAvailability: "available",
  serviceAvailability: "available",
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
  ready: true,
  overviewReady: true,
} as const;

export const rainbowSixSiegeGameDetailContent = {
  slug: RAINBOW_SIX_SIEGE_GAME_SLUG,
  eyebrow: "Rainbow Six Siege services",
  heroDescription: rainbowSixSiegeGameFoundation.shortDescription,
  categoryLabel: rainbowSixSiegeGameFoundation.categoryLabel,
  fulfillmentLabel: "Ranked 3.0",
  trustPoints: [
    "Four ways to play Siege",
    "Review the price for your selections",
    "Choose the service that fits your goal",
  ],
  highlights: [
    {
      title: "Ranked 3.0 foundation",
      description:
        "Choose the rank progression that matches your current position and goal.",
    },
    {
      title: "Four service paths",
      description:
      "Choose Rank Boost, Competitive Wins, Placements Boost or Unrated Matches.",
    },
    {
      title: "Clear checkout",
      description:
        "Review your selections and price before checkout.",
    },
  ],
  serviceIntro: "Choose your Rainbow Six Siege service.",
  accent: "emerald" as const,
};
