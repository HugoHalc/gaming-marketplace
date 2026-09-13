import {
  marvelRivalsDivisionOptions,
  marvelRivalsHeroes,
  marvelRivalsRanks,
  type MarvelRivalsServiceSlug,
} from "@/features/catalog/data/marvel-rivals-foundation";
import {
  calculateMarvelCompetitiveWinsPrice,
  calculateMarvelHeroProficiencyPrice,
  calculateMarvelPlacementsPrice,
  calculateMarvelRankBoostPrice,
  calculateMarvelUnratedPrice,
  MARVEL_RIVALS_DUO_PERCENT,
  MARVEL_RIVALS_EXPRESS_DELIVERY_PERCENT,
  MARVEL_RIVALS_SPECIFIC_HEROES_PERCENT,
  MARVEL_RIVALS_STRATEGIST_PERCENT,
  MARVEL_RIVALS_STREAMING_FIXED_USD,
  roundMarvelUsd,
  type MarvelRivalsBoostMethod,
  type MarvelRivalsDivision,
  type MarvelRivalsPriceQuote,
  type MarvelRivalsPricingExtras,
  type MarvelRivalsRankKey,
  type MarvelRivalsRole,
} from "@/features/configurator/data/marvel-rivals-pricing";
import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "marvel-rivals-v1.0";
const FINAL_SERVICES = new Set<MarvelRivalsServiceSlug>([
  "rank-boost",
  "placement-matches",
  "wins",
  "hero-boost",
  "unrated-games",
]);
const RANKS = new Set<string>(marvelRivalsRanks.map((rank) => rank.key));
const DIVISIONS = new Set<string>(marvelRivalsDivisionOptions);
const HEROES = new Set<string>(marvelRivalsHeroes);
const REGIONS = new Set([
  "north-america",
  "europe",
  "middle-east",
  "south-america",
  "asia-pacific",
]);
const PLATFORMS = new Set(["pc", "xbox", "playstation"]);
const ROLES = new Set<MarvelRivalsRole>(["duelist", "vanguard", "strategist", "any"]);
const BOOST_METHODS = new Set<MarvelRivalsBoostMethod>(["solo", "duo"]);

const RANK_STATES = marvelRivalsRanks.flatMap((rank) =>
  rank.hasDivisions
    ? marvelRivalsDivisionOptions.map((division) => `${rank.key}-${division}`)
    : [rank.key],
);

function asString(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "string" || !value) throw new Error(`Invalid value for ${key}.`);
  return value;
}

function asInteger(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isInteger(number)) throw new Error(`Invalid value for ${key}.`);
  return number;
}

function asBoolean(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "boolean") throw new Error(`Invalid value for ${key}.`);
  return value;
}

function validateRank(value: string, key: string): MarvelRivalsRankKey {
  if (!RANKS.has(value)) throw new Error(`Invalid value for ${key}.`);
  return value as MarvelRivalsRankKey;
}

function optionalDivision(
  selection: ConfiguratorSelection,
  key: string,
  rank: MarvelRivalsRankKey,
): MarvelRivalsDivision | null {
  if (rank === "eternity") {
    if (selection[key] !== undefined && selection[key] !== "") {
      throw new Error(`${key} does not apply to Eternity.`);
    }
    return null;
  }

  const value = asString(selection, key);
  if (!DIVISIONS.has(value)) throw new Error(`Invalid value for ${key}.`);
  return value as MarvelRivalsDivision;
}

function rankStateIndex(rank: MarvelRivalsRankKey, division: MarvelRivalsDivision | null) {
  return RANK_STATES.indexOf(rank === "eternity" ? rank : `${rank}-${division}`);
}

function validateCommon(selection: ConfiguratorSelection) {
  const region = asString(selection, "region");
  const platform = asString(selection, "platform");
  const boostMethod = asString(selection, "boostMethod") as MarvelRivalsBoostMethod;
  if (!REGIONS.has(region)) throw new Error("Select a valid region.");
  if (!PLATFORMS.has(platform)) throw new Error("Select a valid platform.");
  if (!BOOST_METHODS.has(boostMethod)) throw new Error("Select a valid boost method.");

  const playOffline = asBoolean(selection, "playOffline");
  const streaming = asBoolean(selection, "streaming");
  const expressDelivery = asBoolean(selection, "expressDelivery");
  if (boostMethod === "duo" && playOffline) {
    throw new Error("Play Offline is available with Solo only.");
  }

  return { boostMethod, playOffline, streaming, expressDelivery };
}

function validateRole(selection: ConfiguratorSelection) {
  const role = asString(selection, "role") as MarvelRivalsRole;
  if (!ROLES.has(role)) throw new Error("Select a valid role.");
  return role;
}

function validateSpecificHeroes(selection: ConfiguratorSelection) {
  return asBoolean(selection, "specificHeroes");
}

function buildExtras(input: {
  playOffline: boolean;
  specificHeroes?: boolean;
  streaming: boolean;
  expressDelivery: boolean;
}): MarvelRivalsPricingExtras {
  return {
    playOffline: input.playOffline,
    specificHeroes: input.specificHeroes,
    streaming: input.streaming,
    expressDelivery: input.expressDelivery,
  };
}

function modifierBreakdown(input: {
  quote: MarvelRivalsPriceQuote;
  baseLabel: string;
  boostMethod: MarvelRivalsBoostMethod;
  role?: MarvelRivalsRole;
  extras: MarvelRivalsPricingExtras;
  specificHeroesPaid: boolean;
}) {
  const items: QuoteBreakdownItem[] = [];
  const base = roundMarvelUsd(input.quote.boostingPediaBase);
  items.push({ label: input.baseLabel, amount: base });

  if (input.boostMethod === "duo") {
    items.push({
      label: `Duo (+${MARVEL_RIVALS_DUO_PERCENT}%)`,
      amount: roundMarvelUsd(input.quote.boostingPediaBase * (MARVEL_RIVALS_DUO_PERCENT / 100)),
    });
  }
  if (input.role === "strategist") {
    items.push({
      label: `Strategist (+${MARVEL_RIVALS_STRATEGIST_PERCENT}%)`,
      amount: roundMarvelUsd(
        input.quote.boostingPediaBase * (MARVEL_RIVALS_STRATEGIST_PERCENT / 100),
      ),
    });
  }
  if (input.extras.specificHeroes) {
    items.push({
      label: input.specificHeroesPaid
        ? `Specific Heroes (+${MARVEL_RIVALS_SPECIFIC_HEROES_PERCENT}%)`
        : "Specific Heroes",
      amount: input.specificHeroesPaid
        ? roundMarvelUsd(
            input.quote.boostingPediaBase * (MARVEL_RIVALS_SPECIFIC_HEROES_PERCENT / 100),
          )
        : 0,
    });
  }
  if (input.extras.expressDelivery) {
    items.push({
      label: `Express Delivery (+${MARVEL_RIVALS_EXPRESS_DELIVERY_PERCENT}%)`,
      amount: roundMarvelUsd(
        input.quote.boostingPediaBase * (MARVEL_RIVALS_EXPRESS_DELIVERY_PERCENT / 100),
      ),
    });
  }
  if (input.extras.streaming) {
    items.push({ label: "Streaming", amount: MARVEL_RIVALS_STREAMING_FIXED_USD });
  }
  if (input.extras.playOffline) {
    items.push({ label: "Play Offline", amount: 0 });
  }

  const difference = roundMarvelUsd(
    input.quote.total - items.reduce((sum, item) => sum + item.amount, 0),
  );
  if (difference !== 0) items[0] = { ...items[0], amount: roundMarvelUsd(items[0].amount + difference) };
  return items;
}

function toQuotePreview(
  quote: MarvelRivalsPriceQuote,
  breakdown: QuoteBreakdownItem[],
): QuotePreview {
  return {
    currency: "USD",
    subtotal: quote.total,
    discount: 0,
    total: quote.total,
    breakdown,
    ruleSetVersion: VERSION,
  };
}

function calculateRank(selection: ConfiguratorSelection) {
  const common = validateCommon(selection);
  const role = validateRole(selection);
  const specificHeroes = validateSpecificHeroes(selection);
  const currentRank = validateRank(asString(selection, "currentRank"), "currentRank");
  const currentDivision = optionalDivision(selection, "currentDivision", currentRank);
  const targetRank = validateRank(asString(selection, "targetRank"), "targetRank");
  const targetDivision = optionalDivision(selection, "targetDivision", targetRank);

  if (rankStateIndex(targetRank, targetDivision) <= rankStateIndex(currentRank, currentDivision)) {
    throw new Error("Target rank must be above current rank.");
  }

  const extras = buildExtras({ ...common, specificHeroes });
  const quote = calculateMarvelRankBoostPrice({
    currentRank,
    currentDivision,
    targetRank,
    targetDivision,
    boostMethod: common.boostMethod,
    role,
    extras,
  });
  return toQuotePreview(
    quote,
    modifierBreakdown({
      quote,
      baseLabel: "Rank progression",
      boostMethod: common.boostMethod,
      role,
      extras,
      specificHeroesPaid: true,
    }),
  );
}

function calculatePlacements(selection: ConfiguratorSelection) {
  const common = validateCommon(selection);
  const role = validateRole(selection);
  const specificHeroes = validateSpecificHeroes(selection);
  const previousRankValue = asString(selection, "previousRank");
  if (previousRankValue !== "unranked" && !RANKS.has(previousRankValue)) {
    throw new Error("Select a valid previous rank.");
  }
  const previousRank = previousRankValue as MarvelRivalsRankKey | "unranked";
  if (previousRank === "unranked" || previousRank === "eternity") {
    if (selection.previousDivision !== undefined && selection.previousDivision !== "") {
      throw new Error("previousDivision does not apply to this rank.");
    }
  } else {
    const division = asString(selection, "previousDivision");
    if (!DIVISIONS.has(division)) throw new Error("Select a valid previous division.");
  }
  const matches = asInteger(selection, "matches");
  if (matches < 1 || matches > 10) throw new Error("Placement matches must be between 1 and 10.");

  const extras = buildExtras({ ...common, specificHeroes });
  const quote = calculateMarvelPlacementsPrice({
    previousRank,
    matches,
    boostMethod: common.boostMethod,
    role,
    extras,
  });
  return toQuotePreview(
    quote,
    modifierBreakdown({
      quote,
      baseLabel: `${matches} placement match${matches === 1 ? "" : "es"}`,
      boostMethod: common.boostMethod,
      role,
      extras,
      specificHeroesPaid: false,
    }),
  );
}

function calculateWins(selection: ConfiguratorSelection) {
  const common = validateCommon(selection);
  const role = validateRole(selection);
  const specificHeroes = validateSpecificHeroes(selection);
  const currentRank = validateRank(asString(selection, "currentRank"), "currentRank");
  const currentDivision = optionalDivision(selection, "currentDivision", currentRank);
  const wins = asInteger(selection, "wins");
  if (wins < 1 || wins > 5) throw new Error("Competitive wins must be between 1 and 5.");

  let eternityPoints = 30;
  if (currentRank === "eternity") {
    eternityPoints = asInteger(selection, "eternityPoints");
    if (eternityPoints < 30 || eternityPoints > 1000) {
      throw new Error("Eternity points must be between 30 and 1000.");
    }
  } else if (selection.eternityPoints !== undefined) {
    throw new Error("Eternity points apply to Eternity only.");
  }

  const extras = buildExtras({ ...common, specificHeroes });
  const quote = calculateMarvelCompetitiveWinsPrice({
    currentRank,
    currentDivision,
    eternityPoints,
    wins,
    boostMethod: common.boostMethod,
    role,
    extras,
  });
  return toQuotePreview(
    quote,
    modifierBreakdown({
      quote,
      baseLabel: `${wins} competitive win${wins === 1 ? "" : "s"}`,
      boostMethod: common.boostMethod,
      role,
      extras,
      specificHeroesPaid: true,
    }),
  );
}

function calculateHero(selection: ConfiguratorSelection) {
  const common = validateCommon(selection);
  const hero = asString(selection, "hero");
  if (!HEROES.has(hero)) throw new Error("Select a valid hero.");
  const currentProficiency = asInteger(selection, "currentProficiency");
  const targetProficiency = asInteger(selection, "targetProficiency");
  if (currentProficiency < 1 || currentProficiency > 69) {
    throw new Error("Current proficiency must be between 1 and 69.");
  }
  if (targetProficiency < 2 || targetProficiency > 70) {
    throw new Error("Target proficiency must be between 2 and 70.");
  }
  if (targetProficiency <= currentProficiency) {
    throw new Error("Target proficiency must be above current proficiency.");
  }

  const extras = buildExtras(common);
  const quote = calculateMarvelHeroProficiencyPrice({
    currentProficiency,
    targetProficiency,
    boostMethod: common.boostMethod,
    extras,
  });
  return toQuotePreview(
    quote,
    modifierBreakdown({
      quote,
      baseLabel: "Hero proficiency progression",
      boostMethod: common.boostMethod,
      extras,
      specificHeroesPaid: false,
    }),
  );
}

function calculateUnrated(selection: ConfiguratorSelection) {
  const common = validateCommon(selection);
  const specificHeroes = validateSpecificHeroes(selection);
  const games = asInteger(selection, "games");
  if (games < 1 || games > 10) throw new Error("Unrated games must be between 1 and 10.");

  const extras = buildExtras({ ...common, specificHeroes });
  const quote = calculateMarvelUnratedPrice({ games, boostMethod: common.boostMethod, extras });
  return toQuotePreview(
    quote,
    modifierBreakdown({
      quote,
      baseLabel: `${games} unrated game${games === 1 ? "" : "s"}`,
      boostMethod: common.boostMethod,
      extras,
      specificHeroesPaid: false,
    }),
  );
}

export function isMarvelRivalsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "marvel-rivals" && FINAL_SERVICES.has(input.serviceSlug as MarvelRivalsServiceSlug);
}

export function calculateMarvelRivalsQuote(
  serviceSlug: string,
  selection: ConfiguratorSelection,
): QuotePreview {
  if (serviceSlug === "rank-boost") return calculateRank(selection);
  if (serviceSlug === "placement-matches") return calculatePlacements(selection);
  if (serviceSlug === "wins") return calculateWins(selection);
  if (serviceSlug === "hero-boost") return calculateHero(selection);
  if (serviceSlug === "unrated-games") return calculateUnrated(selection);
  throw new Error("Unsupported Marvel Rivals service.");
}
