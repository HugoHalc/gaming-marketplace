import type { QuotePreview } from "../types/configurator";
import type {
  Dota2BehaviorScore,
  Dota2BoostMethod,
  Dota2Preference,
  Dota2Role,
  Dota2Server,
} from "./dota-2-mmr-options";

export const DOTA2_CALIBRATION_SERVICE_SLUG = "calibration-matches" as const;
export const DOTA2_RANK_CONFIDENCE_MIN = 0;
export const DOTA2_RANK_CONFIDENCE_MAX = 100;
export const DOTA2_CALIBRATION_MATCHES_MIN = 1;
export const DOTA2_CALIBRATION_MATCHES_MAX = 30;

export const dota2CalibrationRankOptions = [
  { value: "herald", label: "Herald", rateCentsPerMatch: 150 },
  { value: "guardian", label: "Guardian", rateCentsPerMatch: 150 },
  { value: "crusader", label: "Crusader", rateCentsPerMatch: 160 },
  { value: "archon", label: "Archon", rateCentsPerMatch: 170 },
  { value: "legend", label: "Legend", rateCentsPerMatch: 180 },
  { value: "ancient", label: "Ancient", rateCentsPerMatch: 200 },
  { value: "divine", label: "Divine", rateCentsPerMatch: 225 },
  { value: "immortal", label: "Immortal", rateCentsPerMatch: 0 },
] as const;

export const dota2CalibrationDivisionOptions = ["I", "II", "III", "IV", "V"] as const;

export type Dota2CalibrationRank = (typeof dota2CalibrationRankOptions)[number]["value"];
export type Dota2CalibrationDivision = (typeof dota2CalibrationDivisionOptions)[number];

export type Dota2CalibrationQuoteMetadata = {
  previousRank: string;
  previousDivision: Dota2CalibrationDivision | null;
  rateCentsPerMatch: number;
};

export type Dota2CalibrationCustomQuoteState = Dota2CalibrationQuoteMetadata & {
  reason: "immortal" | "behavior-score";
  message: string;
  supportingCopy: string;
};

export type Dota2CalibrationQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: Dota2CalibrationQuoteMetadata;
  customQuote?: Dota2CalibrationCustomQuoteState;
  error?: string;
};

export type Dota2CalibrationValidatedSelection = {
  previousRank: Dota2CalibrationRank;
  previousDivision: Dota2CalibrationDivision | "";
  rankConfidence: number;
  matches: number;
  server: Dota2Server;
  behaviorScore: Dota2BehaviorScore;
  boostMethod: Dota2BoostMethod;
  preference: Dota2Preference;
  roles: Dota2Role[];
  heroName: string;
  privacyMode: boolean;
  soloQueueOnly: boolean;
  expressDelivery: boolean;
  streaming: boolean;
};
