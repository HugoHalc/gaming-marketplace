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
      "Progress from your current rank to a higher target rank with the service options that fit how you want to play.",
    summary: "Current Rank → Target Rank",
  },
  {
    slug: "placement-matches",
    name: "Placements Boost",
    eyebrow: "Season placement",
    description:
      "Complete your Placement Matches from an Unranked or previous-rank starting point.",
    summary: "Previous Rank + Placement Matches",
  },
  {
    slug: "wins",
    name: "Competitive Wins",
    eyebrow: "Competitive wins",
    description:
      "Choose your current competitive rank and the exact number of Competitive Wins you want.",
    summary: "Current Rank + Competitive Wins",
  },
  {
    slug: "hero-boost",
    name: "Hero Boost",
    eyebrow: "Hero proficiency",
    description:
      "Progress a selected hero from your Current Proficiency to a higher Target Proficiency.",
    summary: "Current Proficiency → Target Proficiency",
  },
  {
    slug: "unrated-games",
    name: "Unrated Games",
    eyebrow: "Unrated play",
    description:
      "Choose the number of Unrated Games you want and configure the service around your preferred setup.",
    summary: "Unrated Games",
  },
];

export const marvelRivalsRanks = [
  { key: "bronze", label: "Bronze", badge: "/ranks/marvel-rivals/bronze.png", hasDivisions: true },
  { key: "silver", label: "Silver", badge: "/ranks/marvel-rivals/silver.png", hasDivisions: true },
  { key: "gold", label: "Gold", badge: "/ranks/marvel-rivals/gold.png", hasDivisions: true },
  { key: "platinum", label: "Platinum", badge: "/ranks/marvel-rivals/platinum.png", hasDivisions: true },
  { key: "diamond", label: "Diamond", badge: "/ranks/marvel-rivals/diamond.png", hasDivisions: true },
  { key: "grandmaster", label: "Grandmaster", badge: "/ranks/marvel-rivals/grandmaster.png", hasDivisions: true },
  { key: "celestial", label: "Celestial", badge: "/ranks/marvel-rivals/celestial.png", hasDivisions: true },
  { key: "eternity", label: "Eternity", badge: "/ranks/marvel-rivals/eternity.png", hasDivisions: false },
] as const;

export const marvelRivalsDivisionOptions = ["III", "II", "I"] as const;

export const marvelRivalsHeroes = [
  "Adam Warlock",
  "Angela",
  "Black Cat",
  "Black Panther",
  "Black Widow",
  "Blade",
  "Captain America",
  "Cloak & Dagger",
  "Cyclops",
  "Daredevil",
  "Deadpool",
  "Devil Dinosaur",
  "Doctor Strange",
  "Elsa Bloodstone",
  "Emma Frost",
  "Gambit",
  "Gorr the God Butcher",
  "Groot",
  "Hawkeye",
  "Hela",
  "Hulk",
  "Human Torch",
  "Invisible Woman",
  "Iron Fist",
  "Iron Man",
  "Jeff the Land Shark",
  "Jubilee",
  "Loki",
  "Luna Snow",
  "Magik",
  "Magneto",
  "Mantis",
  "Mister Fantastic",
  "Moon Knight",
  "Namor",
  "Peni Parker",
  "Phoenix",
  "Psylocke",
  "Rocket Raccoon",
  "Rogue",
  "Scarlet Witch",
  "Spider-Man",
  "Squirrel Girl",
  "Star-Lord",
  "Storm",
  "The Hood",
  "The Punisher",
  "The Thing",
  "Thor",
  "Ultron",
  "Venom",
  "White Fox",
  "Winter Soldier",
  "Wolverine",
] as const;

export function getMarvelRivalsService(slug: string) {
  return marvelRivalsServices.find((service) => service.slug === slug) ?? null;
}

export function isMarvelRivalsServiceSlug(slug: string): slug is MarvelRivalsServiceSlug {
  return marvelRivalsServices.some((service) => service.slug === slug);
}
