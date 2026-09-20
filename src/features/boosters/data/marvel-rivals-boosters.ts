import type { PublicBooster } from "./boosters";

export const marvelRivalsBoosters = [
  {
    slug: "itslatx",
    nickname: "ItSlatX",
    gameSlug: "marvel-rivals",
    gameName: "Marvel Rivals",
    rank: "One Above All",
    region: "North America",
    languages: ["English"],
    experience: "4 years",
    services: "All services",
    specialty: "One Above All • Vanguard Specialist • Screen Sharing Available",
    bio: "High-tier competitive player specializing in Marvel Rivals hero synergy and dominant Vanguard/Vanguard flex roles. Fast order completion with top-tier mechanics and screen sharing options.",
    image: "/avatars/avatar-06.webp",
    gameCard: "/game-cards/marvel-rivals.webp",
  },
] as const satisfies readonly PublicBooster[];
