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
  boostingMarketRawBase: number;
  boostingPediaBase: number;
  percentageModifiers: number;
  fixedFees: number;
  total: number;
};

const BOOSTINGPEDIA_BASE_FACTOR = 0.7;
const DUO_PERCENT = 75;
const STRATEGIST_PERCENT = 15;
const EXPRESS_DELIVERY_PERCENT = 20;
const SPECIFIC_HEROES_PERCENT = 10;
const STREAMING_FIXED_USD = 10;

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

// Raw BoostingMarket transition prices captured from the public Marvel Rivals configurator.
// BoostingPedia applies its 70% base factor after summing the required transitions.
const RANK_TRANSITION_RAW_USD = [
  3.15,
  3.15,
  3.15,
  3.89,
  3.89,
  3.89,
  4.99,
  4.99,
  4.99,
  5.16,
  5.16,
  12.43,
  10.88,
  10.88,
  33.92,
  25.49,
  24.04,
  50,
  55,
  65,
  100.14,
] as const;

const PLACEMENT_RAW_PRICE_PER_MATCH: Record<string, number> = {
  unranked: 4.8,
  bronze: 2.4,
  silver: 3,
  gold: 3.6,
  platinum: 4.8,
  diamond: 6,
  grandmaster: 7.2,
  celestial: 8.4,
  eternity: 9.6,
};

const COMPETITIVE_WIN_RAW_PRICE: Record<string, number> = {
  "bronze-III": 3.3516,
  "bronze-II": 3.3516,
  "bronze-I": 3.3516,
  "silver-III": 3.3516,
  "silver-II": 3.3516,
  "silver-I": 3.3516,
  "gold-III": 6.1236,
  "gold-II": 6.1236,
  "gold-I": 6.1236,
  "platinum-III": 7.9716,
  "platinum-II": 6.643,
  "platinum-I": 6.643,
  "diamond-III": 10.143,
  "diamond-II": 10.143,
  "diamond-I": 10.143,
  "grandmaster-III": 12.943,
  "grandmaster-II": 13.643,
  "grandmaster-I": 13.643,
  "celestial-III": 17.143,
  "celestial-II": 20.643,
  "celestial-I": 27.643,
};

const ETERNITY_WIN_RAW_PRICE_BY_MAX_POINTS = [
  [100, 66.493],
  [200, 90.993],
  [300, 171.493],
  [400, 171.493],
  [500, 104.993],
  [600, 171.493],
  [700, 171.493],
  [800, 171.493],
  [900, 171.493],
  [1000, 171.493],
] as const;

const HERO_PROFICIENCY_RAW_PRICE_BY_SOURCE_LEVEL = [
  [1, 7.014],
  [10, 8.4],
  [20, 12.6],
  [40, 21],
  [50, 13.125],
  [60, 21],
] as const;

const UNRATED_RAW_PRICE_PER_GAME = 5.988;

function roundUsd(value: number) {
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
  const boostingPediaBase = rawBase * BOOSTINGPEDIA_BASE_FACTOR;
  let percentageModifiers = 0;

  if (boostMethod === "duo") percentageModifiers += DUO_PERCENT;
  if (role === "strategist") percentageModifiers += STRATEGIST_PERCENT;
  if (extras.expressDelivery) percentageModifiers += EXPRESS_DELIVERY_PERCENT;
  if (extras.specificHeroes && (service === "rank" || service === "wins")) {
    percentageModifiers += SPECIFIC_HEROES_PERCENT;
  }

  const fixedFees = extras.streaming ? STREAMING_FIXED_USD : 0;
  const total = boostingPediaBase * (1 + percentageModifiers / 100) + fixedFees;

  return {
    boostingMarketRawBase: rawBase,
    boostingPediaBase,
    percentageModifiers,
    fixedFees,
    total: roundUsd(total),
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
  return `$${roundUsd(value).toFixed(2)}`;
}
