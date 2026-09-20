import type { PublicBooster } from "./boosters";

type LegacyRocketLeagueBooster = PublicBooster & {
  rating: number;
  status: "Online";
};

export const rocketLeagueBoosters = [
  {
    slug: "brunspart",
    nickname: "Brunspart",
    gameSlug: "rocket-league",
    gameName: "Rocket League",
    rank: "Supersonic Legend",
    rating: 5,
    status: "Online",
    region: "North America",
    languages: ["English", "Spanish"],
    experience: "5 years",
    services: "All services",
    specialty: "SSL • RLCS & CRL experience",
    bio: "I’ve been playing Rocket League for over 5 years and reached SSL with 2.1k MMR. I’ve also competed in RLCS and CRL, which gave me a lot of high-level experience and understanding of the game.",
    image: "/boosters/rocket-league/brunspart.jpeg",
    gameCard: "/game-cards/rocket-league.webp",
  },
  {
    slug: "fastbooster",
    nickname: "FastBooster",
    gameSlug: "rocket-league",
    gameName: "Rocket League",
    rank: "Supersonic Legend",
    rating: 5,
    status: "Online",
    region: "North America",
    languages: ["English", "Spanish"],
    experience: "4 years",
    services: "All services",
    specialty: "High-Level Player • Screen Sharing Available",
    bio: "Professional Rocket League Booster | High-Level Player | Screen Sharing Available | With years of Rocket League experience, I specialize in Rocket League boosting services.",
    image: "/boosters/rocket-league/fastbooster.jpg",
    gameCard: "/game-cards/rocket-league.webp",
  },
] as const satisfies readonly LegacyRocketLeagueBooster[];
