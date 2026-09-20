import type { PublicBooster } from "./boosters";

export const valorantBoosters = [
  {
    slug: "daytona",
    nickname: "Daytona",
    gameSlug: "valorant",
    gameName: "Valorant",
    rank: "Radiant",
    region: "North America / LATAM",
    languages: ["English", "Spanish"],
    experience: "3 years",
    services: "All services",
    specialty: "Radiant • Competitive Exp • Duelist Main",
    bio: "Radiant player since Episode 1 with competitive tier-2 tournament experience. Master of Duelist and Initiator roles, focused on quick rank-ups, solid communication, and clean gameplay.",
    image: "/avatars/avatar-03.webp",
    gameCard: "/game-cards/valorant.webp",
  },
] as const satisfies readonly PublicBooster[];
