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
      "Choose your current rank and target rank, then configure the service around the way you want to play.",
    summary: "Current rank → target rank",
  },
  {
    slug: "placement-matches",
    name: "Placements Boost",
    eyebrow: "Season placement",
    description:
      "Configure your placement matches from your previous-season rank or an unranked starting point.",
    summary: "Previous rank + number of games",
  },
  {
    slug: "wins",
    name: "Competitive Wins",
    eyebrow: "Competitive wins",
    description:
      "Choose your current competitive rank and the number of wins you want.",
    summary: "Current rank + number of wins",
  },
  {
    slug: "hero-boost",
    name: "Hero Boost",
    eyebrow: "Hero progression",
    description:
      "Configure progression from your current hero level to the level you want to reach.",
    summary: "Current level → desired level",
  },
  {
    slug: "unrated-games",
    name: "Unrated Games",
    eyebrow: "Unrated play",
    description:
      "Choose the number of unrated games you want and configure the service around your preferred setup.",
    summary: "Number of games",
  },
];

export const marvelRivalsRanks = [
  { key: "bronze", label: "Bronze", badge: null, hasDivisions: true },
  { key: "silver", label: "Silver", badge: null, hasDivisions: true },
  { key: "gold", label: "Gold", badge: null, hasDivisions: true },
  { key: "platinum", label: "Platinum", badge: null, hasDivisions: true },
  { key: "diamond", label: "Diamond", badge: null, hasDivisions: true },
  { key: "grandmaster", label: "Grandmaster", badge: null, hasDivisions: true },
  { key: "celestial", label: "Celestial", badge: null, hasDivisions: true },
  { key: "eternity", label: "Eternity", badge: null, hasDivisions: false },
] as const;

export const marvelRivalsDivisionOptions = ["III", "II", "I"] as const;

export function getMarvelRivalsService(slug: string) {
  return marvelRivalsServices.find((service) => service.slug === slug) ?? null;
}

export function isMarvelRivalsServiceSlug(slug: string): slug is MarvelRivalsServiceSlug {
  return marvelRivalsServices.some((service) => service.slug === slug);
}
