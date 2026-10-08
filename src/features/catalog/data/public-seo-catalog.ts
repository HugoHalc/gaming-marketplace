export type PublicSeoService = {
  slug: string;
  name: string;
};

export type PublicSeoGame = {
  slug: string;
  name: string;
  socialImage: string;
  services: readonly PublicSeoService[];
};

/**
 * Static, deploy-time inventory of the public game and service routes.
 * Keep this aligned with the active storefront navigation. Tests protect the
 * expected seven games and 33 services from accidental sitemap regressions.
 */
export const publicSeoGames = [
  {
    slug: "rocket-league",
    name: "Rocket League",
    socialImage: "/game-heroes/rocket-league-storefront.jpeg",
    services: [
      { slug: "rank-boost", name: "Rank Boost" },
      { slug: "wins", name: "Competitive Wins" },
      { slug: "tournament-boost", name: "Tournament Boost" },
      { slug: "rewards-boost", name: "Rewards Boost" },
      { slug: "placements-boost", name: "Placements Boost" },
    ],
  },
  {
    slug: "league-of-legends",
    name: "League of Legends",
    socialImage: "/game-heroes/league-of-legends-storefront.jpeg",
    services: [
      { slug: "rank-boost", name: "Rank Boost" },
      { slug: "wins", name: "Ranked Wins Boost" },
      { slug: "placement-matches", name: "Placements Boost" },
      { slug: "unrated-matches", name: "Unrated Matches Boost" },
      { slug: "arena-boost", name: "Arena Boost" },
      { slug: "mastery-boost", name: "Mastery Boost" },
      { slug: "clash-boost", name: "Clash Boost" },
    ],
  },
  {
    slug: "valorant",
    name: "Valorant",
    socialImage: "/game-heroes/valorant-storefront.jpeg",
    services: [
      { slug: "rank-boost", name: "Rank Boost" },
      { slug: "wins", name: "Competitive Wins" },
      { slug: "placement-matches", name: "Placements Boost" },
    ],
  },
  {
    slug: "marvel-rivals",
    name: "Marvel Rivals",
    socialImage: "/game-heroes/marvel-rivals-storefront.webp",
    services: [
      { slug: "rank-boost", name: "Rank Boost" },
      { slug: "placement-matches", name: "Placements Boost" },
      { slug: "wins", name: "Competitive Wins" },
      { slug: "hero-boost", name: "Hero Boost" },
      { slug: "unrated-games", name: "Unrated Games" },
    ],
  },
  {
    slug: "overwatch-2",
    name: "Overwatch 2",
    socialImage: "/game-heroes/overwatch-hero.jpg",
    services: [
      { slug: "rank-boost", name: "Rank Boost" },
      { slug: "wins", name: "Competitive Wins" },
      { slug: "competitive-drives", name: "Competitive Drives" },
      { slug: "placement-matches", name: "Placements Boost" },
      { slug: "unrated-matches", name: "Unrated Matches" },
    ],
  },
  {
    slug: "dota-2",
    name: "Dota 2",
    socialImage: "/game-heroes/dota-2-storefront.webp",
    services: [
      { slug: "mmr-boost", name: "MMR Boost" },
      { slug: "net-wins", name: "Net Wins" },
      { slug: "calibration-matches", name: "Calibration Matches" },
      { slug: "hero-level-boost", name: "Dota Plus Hero Level" },
    ],
  },
  {
    slug: "rainbow-six-siege",
    name: "Rainbow Six Siege",
    socialImage: "/game-heroes/rainbow-six-siege-overview-hero.webp",
    services: [
      { slug: "rank-boost", name: "Rank Boost" },
      { slug: "competitive-wins", name: "Competitive Wins" },
      { slug: "placements-boost", name: "Placements Boost" },
      { slug: "unrated-matches", name: "Unrated Matches" },
    ],
  },
] as const satisfies readonly PublicSeoGame[];

export const publicServicePaths = publicSeoGames.flatMap((game) =>
  game.services.map((service) => `/games/${game.slug}/${service.slug}` as const),
);

export const publicSeoPaths = [
  "/",
  "/games",
  ...publicSeoGames.map((game) => `/games/${game.slug}` as const),
  ...publicServicePaths,
  "/contact",
] as const;

export function findPublicSeoGame(slug: string) {
  return publicSeoGames.find((game) => game.slug === slug);
}

