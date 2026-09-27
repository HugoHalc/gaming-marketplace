import type { QuotePreview } from "../types/configurator";
import type { Dota2BehaviorScore, Dota2Server } from "./dota-2-mmr-options";

export const DOTA2_HERO_LEVEL_SERVICE_SLUG = "hero-level-boost" as const;
export const DOTA2_HERO_NAME_MAX_LENGTH = 64;
export const DOTA2_CURRENT_HERO_LEVEL_MIN = 1;
export const DOTA2_CURRENT_HERO_LEVEL_MAX = 39;
export const DOTA2_TARGET_HERO_LEVEL_MIN = 2;
export const DOTA2_TARGET_HERO_LEVEL_MAX = 40;

export const dota2HeroLevelRateBands = [
  { start: 2, end: 5, rateCentsPerLevel: 300 },
  { start: 6, end: 10, rateCentsPerLevel: 350 },
  { start: 11, end: 20, rateCentsPerLevel: 400 },
  { start: 21, end: 30, rateCentsPerLevel: 500 },
  { start: 31, end: 40, rateCentsPerLevel: 600 },
] as const;

export type Dota2HeroLevelQuoteMetadata = {
  heroName: string;
  currentLevel: number;
  desiredLevel: number;
  progressionLevels: number;
};

export type Dota2HeroLevelCustomQuoteState = Dota2HeroLevelQuoteMetadata & {
  reason: "behavior-score";
  message: string;
  supportingCopy: string;
};

export type Dota2HeroLevelQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: Dota2HeroLevelQuoteMetadata;
  customQuote?: Dota2HeroLevelCustomQuoteState;
  error?: string;
};

export type Dota2HeroLevelValidatedSelection = {
  heroName: string;
  currentLevel: number;
  desiredLevel: number;
  dotaPlusConfirmed: boolean;
  server: Dota2Server;
  behaviorScore: Dota2BehaviorScore;
  privacyMode: boolean;
  expressDelivery: boolean;
  streaming: boolean;
};
