export type MarvelRivalsServiceSlug =
  | "rank-boost"
  | "placement-matches"
  | "wins"
  | "hero-boost"
  | "unrated-games";

export type MarvelRivalsServiceFoundation = {
  slug: MarvelRivalsServiceSlug;
  name: string;
  eyebrow: string;
  description: string;
  summary: string;
};

export const marvelRivalsServices: MarvelRivalsServiceFoundation[] = [
  {
    slug: "rank-boost",
    name: "Rank Boost",
    eyebrow: "Competitive progression",
    description:
      "Build a current-to-target competitive progression with the Marvel Rivals options required for your service.",
    summary: "Current rank → target rank",
  },
  {
    slug: "placement-matches",
    name: "Placements Boost",
    eyebrow: "Season placement",
    description:
      "Configure placement games from your previous-season rank or an unranked starting point.",
    summary: "Previous rank + number of games",
  },
  {
    slug: "wins",
    name: "Competitive Wins",
    eyebrow: "Competitive wins",
    description:
      "Choose your current competitive position and the number of wins you want to configure.",
    summary: "Current rank + number of wins",
  },
  {
    slug: "hero-boost",
    name: "Hero Boost",
    eyebrow: "Hero progression",
    description:
      "Configure a hero-level progression from your current level to your desired level.",
    summary: "Current level → desired level",
  },
  {
    slug: "unrated-games",
    name: "Unrated Games",
    eyebrow: "Unrated play",
    description:
      "Configure a straightforward package of unrated games without a competitive rank selection.",
    summary: "Number of games",
  },
];

export const marvelRivalsRanks = [
  { key: "bronze", label: "Bronze", mark: "B" },
  { key: "silver", label: "Silver", mark: "S" },
  { key: "gold", label: "Gold", mark: "G" },
  { key: "platinum", label: "Platinum", mark: "P" },
  { key: "diamond", label: "Diamond", mark: "D" },
  { key: "grandmaster", label: "Grandmaster", mark: "GM" },
  { key: "celestial", label: "Celestial", mark: "C" },
  { key: "eternity", label: "Eternity", mark: "E" },
] as const;

export const marvelRivalsDivisionOptions = ["III", "II", "I"] as const;

export function getMarvelRivalsService(slug: string) {
  return marvelRivalsServices.find((service) => service.slug === slug) ?? null;
}

export function isMarvelRivalsServiceSlug(slug: string): slug is MarvelRivalsServiceSlug {
  return marvelRivalsServices.some((service) => service.slug === slug);
}
