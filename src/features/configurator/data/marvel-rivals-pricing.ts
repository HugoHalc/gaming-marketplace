import "server-only";

export type MarvelRivalsRankKey =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "grandmaster"
  | "celestial"
  | "eternity";

export type MarvelRivalsDivision = "III" | "II" | "I";
export type MarvelRivalsBoostMethod = "solo" | "duo";
export type MarvelRivalsRole = "duelist" | "vanguard" | "strategist" | "any";

export type MarvelRivalsPricingExtras = {
  playOffline?: boolean;
  specificHeroes?: boolean;
  streaming?: boolean;
  expressDelivery?: boolean;
};

export type MarvelRivalsPriceQuote = {
  rawBase: number;
  baseBeforeModifiers: number;
  percentageModifiers: number;
  fixedFees: number;
  total: number;
};

export const MARVEL_RIVALS_BASE_FACTOR = 0.7;
export const MARVEL_RIVALS_DUO_PERCENT = 75;
export const MARVEL_RIVALS_STRATEGIST_PERCENT = 15;
export const MARVEL_RIVALS_EXPRESS_DELIVERY_PERCENT = 20;
export const MARVEL_RIVALS_SPECIFIC_HEROES_PERCENT = 10;
export const MARVEL_RIVALS_STREAMING_FIXED_USD = 10;

const RANK_STATES = [
  ["bronze", "III"],
  ["bronze", "II"],
  ["bronze", "I"],
  ["silver", "III"],
  ["silver", "II"],
  ["silver", "I"],
  ["gold", "III"],
  ["gold", "II"],
  ["gold", "I"],
  ["platinum", "III"],
  ["platinum", "II"],
  ["platinum", "I"],
  ["diamond", "III"],
  ["diamond", "II"],
  ["diamond", "I"],
  ["grandmaster", "III"],
  ["grandmaster", "II"],
  ["grandmaster", "I"],
  ["celestial", "III"],
  ["celestial", "II"],
  ["celestial", "I"],
  ["eternity", null],
] as const satisfies ReadonlyArray<readonly [MarvelRivalsRankKey, MarvelRivalsDivision | null]>;

const RANK_TRANSITION_RAW_USD = [
  3.15,
  3.15,
  3.15,
  3.4384,
  3.4384,
  3.4384,
  5.7114,
  5.7114,
  5.7114,
  8.6828,
  8.6828,
  8.6828,
  11.6116,
  11.6116,
  11.6116,
  21.6174,
  21.6174,
  21.6174,
  42.7196,
  42.7196,
  42.7196,
] as const;

const PLACEMENT_RAW_PRICE_PER_MATCH: Record<string, number> = {
  unranked: 4.8,
  bronze: 2.4,
  silver: 2.4,
  gold: 2.4,
  platinum: 2.7576,
  diamond: 4.572,
  grandmaster: 6.588,
  celestial: 8.28,
  eternity: 8.28,
};

const COMPETITIVE_WIN_RAW_PRICE: Record<string, number> = {
  "bronze-III": 3.3516,
  "bronze-II": 3.3516,
  "bronze-I": 3.3516,
  "silver-III": 3.5196,
  "silver-II": 3.5196,
  "silver-I": 3.5196,
  "gold-III": 3.5196,
  "gold-II": 3.5196,
  "gold-I": 3.5196,
  "platinum-III": 4.2252,
  "platinum-II": 4.2252,
  "platinum-I": 4.2252,
  "diamond-III": 5.208,
  "diamond-II": 5.208,
  "diamond-I": 5.208,
  "grandmaster-III": 9.072,
  "grandmaster-II": 9.072,
  "grandmaster-I": 9.072,
  "celestial-III": 17.136,
  "celestial-II": 17.136,
  "celestial-I": 17.136,
};

const ETERNITY_WIN_RAW_PRICE_BY_MAX_POINTS = [
  [99, 17.136],
  [199, 22.68],
  [299, 28.224],
  [399, 33.768],
  [499, 39.312],
  [599, 44.856],
  [699, 50.4],
  [799, 55.944],
  [899, 61.488],
  [1000, 67.032],
] as const;

const HERO_PROFICIENCY_RAW_PRICE_BY_SOURCE_LEVEL = [
  [1, 7.014],
  [5, 9.114],
  [10, 11.214],
  [20, 13.314],
  [30, 15.414],
  [40, 17.514],
  [50, 19.614],
  [60, 21.714],
] as const;

const UNRATED_RAW_PRICE_PER_GAME = 5.988;

export function roundMarvelUsd(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function rankStateIndex(rank: MarvelRivalsRankKey, division: MarvelRivalsDivision | null) {
  return RANK_STATES.findIndex(([stateRank, stateDivision]) => {
    if (stateRank !== rank) return false;
    if (rank === "eternity") return true;
    return stateDivision === division;
  });
}

function quoteFromRawBase({
  rawBase,
  service,
  boostMethod,
  role,
  extras,
}: {
  rawBase: number;
  service: "rank" | "placements" | "wins" | "hero" | "unrated";
  boostMethod: MarvelRivalsBoostMethod;
  role?: MarvelRivalsRole;
  extras: MarvelRivalsPricingExtras;
}): MarvelRivalsPriceQuote {
  const baseBeforeModifiers = rawBase * MARVEL_RIVALS_BASE_FACTOR;
  let percentageModifiers = 0;

  if (boostMethod === "duo") percentageModifiers += MARVEL_RIVALS_DUO_PERCENT;
  if (role === "strategist") percentageModifiers += MARVEL_RIVALS_STRATEGIST_PERCENT;
  if (extras.expressDelivery) percentageModifiers += MARVEL_RIVALS_EXPRESS_DELIVERY_PERCENT;
  if (extras.specificHeroes && (service === "rank" || service === "wins")) {
    percentageModifiers += MARVEL_RIVALS_SPECIFIC_HEROES_PERCENT;
  }

  const fixedFees = extras.streaming ? MARVEL_RIVALS_STREAMING_FIXED_USD : 0;
  const total = baseBeforeModifiers * (1 + percentageModifiers / 100) + fixedFees;

  return {
    rawBase,
    baseBeforeModifiers,
    percentageModifiers,
    fixedFees,
    total: roundMarvelUsd(total),
  };
}

export function calculateMarvelRankBoostPrice({
  currentRank,
  currentDivision,
  targetRank,
  targetDivision,
  boostMethod,
  role,
  extras,
}: {
  currentRank: MarvelRivalsRankKey;
  currentDivision: MarvelRivalsDivision | null;
  targetRank: MarvelRivalsRankKey;
  targetDivision: MarvelRivalsDivision | null;
  boostMethod: MarvelRivalsBoostMethod;
  role: MarvelRivalsRole;
  extras: MarvelRivalsPricingExtras;
}) {
  const currentIndex = rankStateIndex(currentRank, currentDivision);
  const targetIndex = rankStateIndex(targetRank, targetDivision);

  if (currentIndex < 0 || targetIndex <= currentIndex) {
    return quoteFromRawBase({ rawBase: 0, service: "rank", boostMethod, role, extras });
  }

  let rawBase = 0;
  for (let index = currentIndex; index < targetIndex; index += 1) {
    rawBase += RANK_TRANSITION_RAW_USD[index] ?? 0;
  }

  return quoteFromRawBase({ rawBase, service: "rank", boostMethod, role, extras });
}

export function calculateMarvelPlacementsPrice({
  previousRank,
  matches,
  boostMethod,
  role,
  extras,
}: {
  previousRank: MarvelRivalsRankKey | "unranked";
  matches: number;
  boostMethod: MarvelRivalsBoostMethod;
  role: MarvelRivalsRole;
  extras: MarvelRivalsPricingExtras;
}) {
  const unitPrice = PLACEMENT_RAW_PRICE_PER_MATCH[previousRank] ?? 0;
  const rawBase = unitPrice * Math.min(10, Math.max(1, matches));
  return quoteFromRawBase({ rawBase, service: "placements", boostMethod, role, extras });
}

export function calculateMarvelCompetitiveWinsPrice({
  currentRank,
  currentDivision,
  eternityPoints,
  wins,
  boostMethod,
  role,
  extras,
}: {
  currentRank: MarvelRivalsRankKey;
  currentDivision: MarvelRivalsDivision | null;
  eternityPoints: number;
  wins: number;
  boostMethod: MarvelRivalsBoostMethod;
  role: MarvelRivalsRole;
  extras: MarvelRivalsPricingExtras;
}) {
  let unitPrice = 0;

  if (currentRank === "eternity") {
    const safePoints = Math.min(1000, Math.max(30, eternityPoints));
    unitPrice =
      ETERNITY_WIN_RAW_PRICE_BY_MAX_POINTS.find(([maxPoints]) => safePoints <= maxPoints)?.[1] ??
      ETERNITY_WIN_RAW_PRICE_BY_MAX_POINTS.at(-1)?.[1] ??
      0;
  } else {
    unitPrice = COMPETITIVE_WIN_RAW_PRICE[`${currentRank}-${currentDivision ?? "III"}`] ?? 0;
  }

  const rawBase = unitPrice * Math.min(5, Math.max(1, wins));
  return quoteFromRawBase({ rawBase, service: "wins", boostMethod, role, extras });
}

export function calculateMarvelHeroProficiencyPrice({
  currentProficiency,
  targetProficiency,
  boostMethod,
  extras,
}: {
  currentProficiency: number;
  targetProficiency: number;
  boostMethod: MarvelRivalsBoostMethod;
  extras: MarvelRivalsPricingExtras;
}) {
  const current = Math.min(69, Math.max(1, currentProficiency));
  const target = Math.min(70, Math.max(current + 1, targetProficiency));
  let rawBase = 0;

  for (let sourceLevel = current; sourceLevel < target; sourceLevel += 1) {
    let unitPrice: number = HERO_PROFICIENCY_RAW_PRICE_BY_SOURCE_LEVEL[0][1];
    for (const [startLevel, price] of HERO_PROFICIENCY_RAW_PRICE_BY_SOURCE_LEVEL) {
      if (startLevel > sourceLevel) break;
      unitPrice = price;
    }
    rawBase += unitPrice;
  }

  return quoteFromRawBase({ rawBase, service: "hero", boostMethod, extras });
}

export function calculateMarvelUnratedPrice({
  games,
  boostMethod,
  extras,
}: {
  games: number;
  boostMethod: MarvelRivalsBoostMethod;
  extras: MarvelRivalsPricingExtras;
}) {
  const rawBase = UNRATED_RAW_PRICE_PER_GAME * Math.min(10, Math.max(1, games));
  return quoteFromRawBase({ rawBase, service: "unrated", boostMethod, extras });
}

export function formatMarvelUsd(value: number) {
  return `$${roundMarvelUsd(value).toFixed(2)}`;
}
