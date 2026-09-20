import type { PublicBooster } from "./boosters";

export const overwatchBoosters = [
  {
    slug: "mistouf",
    nickname: "Mistouf",
    gameSlug: "overwatch-2",
    gameName: "Overwatch 2",
    rank: "Champion",
    region: "North America / Europe",
    languages: ["English", "French"],
    experience: "6 years",
    services: "All services",
    specialty: "Top 500 • Hitscan/Tank • Duo Queue Ready",
    bio: "Top 500 Hitscan & Tank main with years of competitive Overwatch experience. I specialize in duo boosting, rapid rank ascension, and maintaining elite win rates across all roles.",
    image: "/avatars/avatar-04.webp",
    gameCard: "/game-cards/overwatch.webp",
  },
  {
    slug: "jahztoon",
    nickname: "Jahztoon",
    gameSlug: "overwatch-2",
    gameName: "Overwatch 2",
    rank: "Champion",
    region: "North America / Europe",
    languages: ["English"],
    experience: "2 years",
    services: "All services",
    specialty: "Support Specialist • Fast Order Delivery",
    bio: "Professional Overwatch Booster specializing in Support & Flex roles. I bring deep game-sense, ultimate tracking, and efficient rank progression for any account level.",
    image: "/avatars/avatar-05.webp",
    gameCard: "/game-cards/overwatch.webp",
  },
] as const satisfies readonly PublicBooster[];
