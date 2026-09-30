// Approved public game identity. Legacy catalog/order assets remain independent.
export const gamePresentation = {
  "rocket-league": {
    artwork: "/game-cards/rocket-league-home-card.webp",
    logo: "/game-cards/rocket-league-logo-transparent.png",
    thumbnailPosition: "72% 50%",
  },
  "league-of-legends": {
    artwork: "/game-cards/league-of-legends-home-card.webp",
    logo: "/game-cards/league-of-legends-home-logo.png",
    thumbnailPosition: "76% 40%",
  },
  "valorant": {
    artwork: "/game-cards/valorant-home-card.webp",
    logo: "/game-cards/valorant-home-logo.png",
    thumbnailPosition: "78% 45%",
  },
  "marvel-rivals": {
    artwork: "/game-cards/marvel-rivals-home-background.webp",
    logo: "/game-cards/marvel-rivals-home-logo.png",
    thumbnailPosition: "75% 35%",
    subject: "/game-cards/marvel-rivals-home-iron-man.png",
  },
  "overwatch-2": {
    artwork: "/game-cards/overwatch-home-card.webp",
    logo: "/game-cards/overwatch-home-logo-light.png",
    thumbnailPosition: "77% 42%",
  },
  "dota-2": {
    artwork: "/game-cards/dota-2-home-card.webp",
    logo: "/game-cards/dota-2-home-logo.png",
    thumbnailPosition: "77% 42%",
  },
  "rainbow-six-siege": {
    artwork: "/game-cards/rainbow-six-siege-home.webp",
    logo: "/game-cards/rainbow-six-siege-logo.png",
    thumbnailPosition: "78% 40%",
  },
} as const;

export type PresentedGameSlug = keyof typeof gamePresentation;
