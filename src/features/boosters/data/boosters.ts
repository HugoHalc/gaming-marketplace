import { leagueOfLegendsBoosters } from "./league-of-legends-boosters";
import { marvelRivalsBoosters } from "./marvel-rivals-boosters";
import { overwatchBoosters } from "./overwatch-boosters";
import { rocketLeagueBoosters } from "./rocket-league-boosters";
import { valorantBoosters } from "./valorant-boosters";

export type PublicBooster = {
  slug: string;
  nickname: string;
  gameSlug: string;
  gameName: string;
  rank: string;
  region: string;
  languages: readonly string[];
  experience: string;
  services: string;
  specialty: string;
  bio: string;
  image: string;
  gameCard: string;
};

function toPublicBooster(booster: PublicBooster): PublicBooster {
  return {
    slug: booster.slug,
    nickname: booster.nickname,
    gameSlug: booster.gameSlug,
    gameName: booster.gameName,
    rank: booster.rank,
    region: booster.region,
    languages: booster.languages,
    experience: booster.experience,
    services: booster.services,
    specialty: booster.specialty,
    bio: booster.bio,
    image: booster.image,
    gameCard: booster.gameCard,
  };
}

export const publicBoosters: readonly PublicBooster[] = [
  ...rocketLeagueBoosters.map(toPublicBooster),
  ...leagueOfLegendsBoosters,
  ...valorantBoosters,
  ...overwatchBoosters,
  ...marvelRivalsBoosters,
];

export function getPublicBooster(gameSlug: string, boosterSlug: string) {
  return (
    publicBoosters.find(
      (booster) =>
        booster.gameSlug === gameSlug && booster.slug === boosterSlug,
    ) ?? null
  );
}

export function getPublicBoostersByGame(gameSlug: string) {
  return publicBoosters.filter((booster) => booster.gameSlug === gameSlug);
}
