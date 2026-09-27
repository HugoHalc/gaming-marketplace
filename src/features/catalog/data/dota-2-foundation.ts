export const DOTA_2_GAME_SLUG = "dota-2" as const;

export const dota2PublicGameCard = {
  slug: DOTA_2_GAME_SLUG,
  name: "Dota 2",
  displayName: "Dota 2",
  accent: "rose",
  category: "MOBA",
  ready: true,
} as const;

export const dota2GameFoundation = {
  id: "game_dota_2_foundation",
  slug: DOTA_2_GAME_SLUG,
  name: "Dota 2",
  title: "Dota 2 Boosting Services",
  shortDescription:
    "Choose a focused Dota 2 service for MMR progression, net wins, calibration matches, or Dota Plus hero progression.",
  categoryLabel: "MOBA",
  publicAvailability: "foundation-preview",
  finalAssetStatus: "integrated",
} as const;

export type Dota2ServiceSlug =
  | "mmr-boost"
  | "net-wins"
  | "calibration-matches"
  | "hero-level-boost";

export type Dota2ServiceCategory =
  | "mmr-progression"
  | "net-wins"
  | "calibration"
  | "hero-progression";

export interface Dota2ServiceFoundation {
  id: string;
  gameSlug: typeof DOTA_2_GAME_SLUG;
  slug: Dota2ServiceSlug;
  name: string;
  category: Dota2ServiceCategory;
  description: string;
  purpose: string;
  route: `/games/dota-2/${Dota2ServiceSlug}`;
  requirements?: readonly string[];
  safetyNotes?: readonly string[];
}

export const dota2ServiceFoundations: readonly Dota2ServiceFoundation[] = [
  {
    id: "service_dota_2_mmr_boost_foundation",
    gameSlug: DOTA_2_GAME_SLUG,
    slug: "mmr-boost",
    name: "MMR Boost",
    category: "mmr-progression",
    description: "Move from your current MMR to a selected target.",
    purpose: "Move from the customer’s current MMR or rank to a selected target.",
    route: "/games/dota-2/mmr-boost",
  },
  {
    id: "service_dota_2_net_wins_foundation",
    gameSlug: DOTA_2_GAME_SLUG,
    slug: "net-wins",
    name: "Net Wins",
    category: "net-wins",
    description: "Purchase a fixed number of net ranked wins.",
    purpose: "Purchase a selected number of net ranked wins.",
    route: "/games/dota-2/net-wins",
  },
  {
    id: "service_dota_2_calibration_matches_foundation",
    gameSlug: DOTA_2_GAME_SLUG,
    slug: "calibration-matches",
    name: "Calibration Matches",
    category: "calibration",
    description: "Configure professional play for a selected number of calibration matches.",
    purpose: "Professional play for a selected number of calibration matches.",
    route: "/games/dota-2/calibration-matches",
    safetyNotes: [
      "No final rank is promised.",
      "No fixed win rate or guaranteed placement is promised.",
    ],
  },
  {
    id: "service_dota_2_hero_level_foundation",
    gameSlug: DOTA_2_GAME_SLUG,
    slug: "hero-level-boost",
    name: "Dota Plus Hero Level",
    category: "hero-progression",
    description: "Progress a selected hero toward your chosen Dota Plus Hero Level.",
    purpose:
      "Progress one selected hero from its current Dota Plus Hero Level toward a selected target.",
    route: "/games/dota-2/hero-level-boost",
    requirements: ["An active Dota Plus subscription is required for this service."],
  },
] as const;

export const dota2ServiceSlugs = dota2ServiceFoundations.map((service) => service.slug);

export function findDota2ServiceFoundation(slug: string) {
  return dota2ServiceFoundations.find((service) => service.slug === slug);
}

export const dota2AssetFoundation = {
  gameCard: "/game-cards/dota-2.webp",
  landingHero: "/game-heroes/dota-2-storefront.webp",
  serviceHero: "/game-heroes/dota-2-service-hero.webp",
  rankBadges: {
    herald: "/ranks/dota-2/herald.webp",
    guardian: "/ranks/dota-2/guardian.webp",
    crusader: "/ranks/dota-2/crusader.webp",
    archon: "/ranks/dota-2/archon.webp",
    legend: "/ranks/dota-2/legend.webp",
    ancient: "/ranks/dota-2/ancient.webp",
    divine: "/ranks/dota-2/divine.webp",
    immortal: "/ranks/dota-2/immortal.webp",
  },
} as const;

export function getDota2RankBadge(rank: string | undefined) {
  switch (rank) {
    case "Herald":
      return dota2AssetFoundation.rankBadges.herald;
    case "Guardian":
      return dota2AssetFoundation.rankBadges.guardian;
    case "Crusader":
      return dota2AssetFoundation.rankBadges.crusader;
    case "Archon":
      return dota2AssetFoundation.rankBadges.archon;
    case "Legend":
      return dota2AssetFoundation.rankBadges.legend;
    case "Ancient":
      return dota2AssetFoundation.rankBadges.ancient;
    case "Divine":
      return dota2AssetFoundation.rankBadges.divine;
    case "Immortal":
      return dota2AssetFoundation.rankBadges.immortal;
    default:
      return null;
  }
}
