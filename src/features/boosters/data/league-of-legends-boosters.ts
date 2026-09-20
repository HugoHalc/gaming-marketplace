import type { PublicBooster } from "./boosters";

export const leagueOfLegendsBoosters = [
  {
    slug: "mapy",
    nickname: "Mapy",
    gameSlug: "league-of-legends",
    gameName: "League of Legends",
    rank: "Grandmaster",
    region: "North America",
    languages: ["English"],
    experience: "6 years",
    services: "All services",
    specialty: "High Win Rate",
    bio: "Professional League of Legends Booster | High-Level Jungle Main | Screen Sharing & Coaching Available. With over 6 years of experience, I ensure fast division pushes and high MMR growth.",
    image: "/avatars/avatar-01.webp",
    gameCard: "/game-cards/league-of-legends.webp",
  },
  {
    slug: "mykys",
    nickname: "Myκys",
    gameSlug: "league-of-legends",
    gameName: "League of Legends",
    rank: "Challenger",
    region: "North America",
    languages: ["English", "German"],
    experience: "4 years",
    services: "All services",
    specialty: "Communication & Fast Delivery",
    bio: "I’ve been playing League of Legends since Season 6 and peaked Challenger with over 1,000 LP in NA. I specialize in Mid/ADC macro control and fast climbing with high win rates.",
    image: "/avatars/avatar-02.webp",
    gameCard: "/game-cards/league-of-legends.webp",
  },
] as const satisfies readonly PublicBooster[];
