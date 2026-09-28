import type { ConfiguratorSelection } from "../types/configurator";

export const R6_STARTING_TIME_RANGES = {
  priority: "30–90 minutes",
  standard: "1–3 hours",
  extended: "3–6 hours",
  specialist: "6–12 hours",
  limited: "12–24 hours",
} as const;

export const R6_STARTING_TIME_DISCLAIMER =
  "Estimate based on your configuration and current booster availability. Actual start time may vary.";

export type RainbowSixSiegeStartingTimeCategory = keyof typeof R6_STARTING_TIME_RANGES;

export type RainbowSixSiegeStartingTimeEstimate = {
  category: RainbowSixSiegeStartingTimeCategory;
  range: (typeof R6_STARTING_TIME_RANGES)[RainbowSixSiegeStartingTimeCategory];
  complexityScore: number;
};

const RANK_TIERS = [
  "copper",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "emerald",
  "diamond",
  "champion",
] as const;

const RANK_DIVISIONS = ["v", "iv", "iii", "ii", "i"] as const;

type RankTier = (typeof RANK_TIERS)[number];
type Platform = "pc" | "xbox" | "playstation";
type GameMode = "solo" | "duo";
type RpGain = "21-plus" | "11-20" | "1-10";
type Server =
  | "europe"
  | "north-america"
  | "latin-america"
  | "asia"
  | "oceania"
  | "brazil"
  | "middle-east";

const DESIRED_TIER_SCORE: Record<RankTier, number> = {
  copper: 0,
  bronze: 0,
  silver: 0,
  gold: 0,
  platinum: 1,
  emerald: 1,
  diamond: 2,
  champion: 3,
};

const PLATFORM_SCORE: Record<Platform, number> = {
  pc: 0,
  xbox: 1,
  playstation: 1,
};

const MODE_SCORE: Record<GameMode, number> = {
  solo: 0,
  duo: 1,
};

const RP_GAIN_SCORE: Record<RpGain, number> = {
  "21-plus": 0,
  "11-20": 1,
  "1-10": 2,
};

const SERVER_SCORE: Record<Server, number> = {
  europe: 0,
  "north-america": 0,
  "latin-america": 0,
  asia: 1,
  oceania: 1,
  brazil: 0,
  "middle-east": 1,
};

const CUSTOMIZATION_KEYS = [
  "playOffline",
  "specificOperators",
  "streaming",
  "expressDelivery",
  "highKillCount",
  "oneTrickPony",
  "rankInsurance",
  "vipPriority",
  "insaneClipDrop",
  "eliteBoosterTier",
] as const;

const FULFILLMENT_SENSITIVE_CUSTOMIZATIONS = [
  "streaming",
  "highKillCount",
  "oneTrickPony",
  "eliteBoosterTier",
] as const;

const EXPECTED_SELECTION_KEYS = new Set([
  "currentRank",
  "desiredRank",
  "platform",
  "gameMode",
  "rpGain",
  "server",
  ...CUSTOMIZATION_KEYS,
]);

const EXPRESS_REDUCTION: Record<
  RainbowSixSiegeStartingTimeCategory,
  RainbowSixSiegeStartingTimeCategory
> = {
  priority: "priority",
  standard: "priority",
  extended: "standard",
  specialist: "extended",
  limited: "specialist",
};

function parseString(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid value for ${key}.`);
  }
  return value;
}

function parseBoolean(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "boolean") {
    throw new Error(`Invalid value for ${key}.`);
  }
  return value;
}

function assertSelectionKeys(selection: ConfiguratorSelection) {
  for (const key of Object.keys(selection)) {
    if (!EXPECTED_SELECTION_KEYS.has(key)) {
      throw new Error("Invalid Rainbow Six Siege starting-time selection.");
    }
  }
}

function parseRank(rank: string) {
  const separator = rank.lastIndexOf("-");
  if (separator <= 0 || separator === rank.length - 1) {
    throw new Error("Select a valid Rainbow Six Siege rank progression.");
  }

  const tier = rank.slice(0, separator);
  const division = rank.slice(separator + 1);
  const tierIndex = RANK_TIERS.indexOf(tier as RankTier);
  const divisionIndex = RANK_DIVISIONS.indexOf(
    division as (typeof RANK_DIVISIONS)[number],
  );

  if (tierIndex < 0 || divisionIndex < 0) {
    throw new Error("Select a valid Rainbow Six Siege rank progression.");
  }

  return {
    tier: tier as RankTier,
    index: tierIndex * RANK_DIVISIONS.length + divisionIndex,
  };
}

function assertRecordValue<T extends string>(
  record: Record<T, number>,
  value: string,
  message: string,
): T {
  if (!Object.prototype.hasOwnProperty.call(record, value)) throw new Error(message);
  return value as T;
}

function scoreCategory(score: number): RainbowSixSiegeStartingTimeCategory {
  if (score === 0) return "standard";
  if (score <= 2) return "extended";
  if (score <= 4) return "specialist";
  return "limited";
}

export function estimateRainbowSixSiegeStartingTime(
  selection: ConfiguratorSelection,
): RainbowSixSiegeStartingTimeEstimate {
  assertSelectionKeys(selection);

  const currentRank = parseRank(parseString(selection, "currentRank"));
  const desiredRank = parseRank(parseString(selection, "desiredRank"));
  if (desiredRank.index <= currentRank.index) {
    throw new Error("Select a valid Rainbow Six Siege rank progression.");
  }

  const platform = assertRecordValue(
    PLATFORM_SCORE,
    parseString(selection, "platform"),
    "Select a valid platform.",
  );
  const mode = assertRecordValue(
    MODE_SCORE,
    parseString(selection, "gameMode"),
    "Select a valid game mode.",
  );
  const rpGain = assertRecordValue(
    RP_GAIN_SCORE,
    parseString(selection, "rpGain"),
    "Select a valid RP gain range.",
  );
  const server = assertRecordValue(
    SERVER_SCORE,
    parseString(selection, "server"),
    "Select a valid server.",
  );

  for (const key of CUSTOMIZATION_KEYS) parseBoolean(selection, key);

  let complexityScore = DESIRED_TIER_SCORE[desiredRank.tier];
  complexityScore += PLATFORM_SCORE[platform];
  complexityScore += MODE_SCORE[mode];
  complexityScore += RP_GAIN_SCORE[rpGain];
  complexityScore += SERVER_SCORE[server];

  for (const key of FULFILLMENT_SENSITIVE_CUSTOMIZATIONS) {
    if (selection[key] === true) complexityScore += 1;
  }

  let category = scoreCategory(complexityScore);
  if (selection.expressDelivery === true) category = EXPRESS_REDUCTION[category];

  return {
    category,
    range: R6_STARTING_TIME_RANGES[category],
    complexityScore,
  };
}
