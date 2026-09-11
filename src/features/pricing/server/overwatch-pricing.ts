import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "overwatch-v1.0";
const BOOSTINGPEDIA_FACTOR = 0.7;

const RANK_FAMILIES = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "emerald",
  "diamond",
  "master",
  "grandmaster",
  "champion",
] as const;

const DIVISIONS = ["5", "4", "3", "2", "1"] as const;

const RANK_ORDER = RANK_FAMILIES.flatMap((family) =>
  DIVISIONS.map((division) => `${family}-${division}`),
);

const DIVISION_LABEL: Record<string, string> = {
  "5": "V",
  "4": "IV",
  "3": "III",
  "2": "II",
  "1": "I",
};

const RANK_TRANSITION_BM_NORMAL: Record<string, number> = {
  "bronze-5>bronze-4": 5.17,
  "bronze-4>bronze-3": 5.17,
  "bronze-3>bronze-2": 5.17,
  "bronze-2>bronze-1": 5.17,
  "bronze-1>silver-5": 5.17,
  "silver-5>silver-4": 6.35,
  "silver-4>silver-3": 6.35,
  "silver-3>silver-2": 6.35,
  "silver-2>silver-1": 6.35,
  "silver-1>gold-5": 4.33,
  "gold-5>gold-4": 4.33,
  "gold-4>gold-3": 4.33,
  "gold-3>gold-2": 4.33,
  "gold-2>gold-1": 4.33,
  "gold-1>platinum-5": 9.32,
  "platinum-5>platinum-4": 5.32,
  "platinum-4>platinum-3": 5.32,
  "platinum-3>platinum-2": 5.92,
  "platinum-2>platinum-1": 5.92,
  "platinum-1>emerald-5": 7.51,
  "emerald-5>emerald-4": 6.89,
  "emerald-4>emerald-3": 7.6,
  "emerald-3>emerald-2": 8.32,
  "emerald-2>emerald-1": 9.27,
  "emerald-1>diamond-5": 7.51,
  "diamond-5>diamond-4": 9.15,
  "diamond-4>diamond-3": 10.38,
  "diamond-3>diamond-2": 11.98,
  "diamond-2>diamond-1": 13.98,
  "diamond-1>master-5": 14.01,
  "master-5>master-4": 26.19,
  "master-4>master-3": 27.38,
  "master-3>master-2": 30.35,
  "master-2>master-1": 30.35,
  "master-1>grandmaster-5": 43.31,
  "grandmaster-5>grandmaster-4": 86.29,
  "grandmaster-4>grandmaster-3": 110.1,
  "grandmaster-3>grandmaster-2": 121.67,
  "grandmaster-2>grandmaster-1": 142.84,
  "grandmaster-1>champion-5": 166.63,
  "champion-5>champion-4": 249.96,
  "champion-4>champion-3": 446.34,
  "champion-3>champion-2": 952.21,
  "champion-2>champion-1": 1487.81,
};

const WIN_BM_NORMAL_PER_WIN: Record<string, number> = {
  "bronze-5": 2.3,
  "bronze-4": 2.3,
  "bronze-3": 2.3,
  "bronze-2": 2.3,
  "bronze-1": 2.3,
  "silver-5": 2.3,
  "silver-4": 2.3,
  "silver-3": 2.3,
  "silver-2": 2.3,
  "silver-1": 2.3,
  "gold-5": 2.65,
  "gold-4": 2.85,
  "gold-3": 3.0,
  "gold-2": 3.2,
  "gold-1": 3.45,
  "platinum-5": 3.8,
  "platinum-4": 4.0,
  "platinum-3": 4.2,
  "platinum-2": 4.4,
  "platinum-1": 4.6,
  "emerald-5": 4.14,
  "emerald-4": 4.24,
  "emerald-3": 4.54,
  "emerald-2": 4.84,
  "emerald-1": 4.99,
  "diamond-5": 4.9,
  "diamond-4": 5.0,
  "diamond-3": 5.34,
  "diamond-2": 5.54,
  "diamond-1": 5.99,
  "master-5": 6.5,
  "master-4": 8.5,
  "master-3": 9.99,
  "master-2": 11.99,
  "master-1": 12.99,
  "grandmaster-5": 23.92,
  "grandmaster-4": 26.68,
  "grandmaster-3": 27.28,
  "grandmaster-2": 38.04,
  "grandmaster-1": 45.8,
  "champion-5": 38.88,
  "champion-4": 43.24,
  "champion-3": 46.92,
  "champion-2": 49.68,
  "champion-1": 72.44,
};

const PLACEMENT_BM_NORMAL_PER_MATCH: Record<string, number> = {
  unranked: 3.59,
  "bronze-5": 1.39,
  "bronze-4": 1.48,
  "bronze-3": 1.57,
  "bronze-2": 1.7,
  "bronze-1": 1.79,
  "silver-5": 1.89,
  "silver-4": 1.98,
  "silver-3": 2.07,
  "silver-2": 2.25,
  "silver-1": 2.34,
  "gold-5": 2.51,
  "gold-4": 2.6,
  "gold-3": 2.7,
  "gold-2": 2.79,
  "gold-1": 2.9,
  "platinum-5": 2.97,
  "platinum-4": 3.06,
  "platinum-3": 3.15,
  "platinum-2": 3.33,
  "platinum-1": 3.59,
  "emerald-5": 3.24,
  "emerald-4": 3.24,
  "emerald-3": 3.24,
  "emerald-2": 3.24,
  "emerald-1": 3.24,
  "diamond-5": 3.62,
  "diamond-4": 3.83,
  "diamond-3": 4.04,
  "diamond-2": 4.22,
  "diamond-1": 4.49,
  "master-5": 4.86,
  "master-4": 5.31,
  "master-3": 5.58,
  "master-2": 5.94,
  "master-1": 6.48,
  "grandmaster-5": 7.73,
  "grandmaster-4": 8.63,
  "grandmaster-3": 9.44,
  "grandmaster-2": 9.96,
  "grandmaster-1": 11.24,
  "champion-5": 13.04,
  "champion-4": 13.94,
  "champion-3": 14.84,
  "champion-2": 15.74,
  "champion-1": 16.64,
};

const DRIVE_BM_NORMAL: Record<string, { starting: number; step: number }> = {
  bronze: { starting: 0, step: 0.3622058824 },
  silver: { starting: 0, step: 0.4427941176 },
  gold: { starting: 0, step: 0.6036764706 },
  platinum: { starting: 0, step: 0.805 },
  emerald: { starting: 0.9882352941, step: 1.5 },
  diamond: { starting: 0, step: 1.0464705882 },
  master: { starting: 0, step: 2.3183823529 },
  grandmaster: { starting: 0, step: 8.05 },
  champion: { starting: 0, step: 8.3375 },
};

const UNRATED_BM_NORMAL_PER_MATCH = 3.44;

const ROLE_MODIFIER: Record<string, number> = {
  tank: 0,
  damage: 0,
  support: 0.15,
  "open-queue": 0.3,
};

const ROLE_LABEL: Record<string, string> = {
  tank: "Tank",
  damage: "Damage",
  support: "Support",
  "open-queue": "Open Queue",
};

const SERVERS = new Set(["north-america", "europe", "asia", "middle-east"]);
const PLATFORMS = new Set(["pc", "xbox", "playstation", "nintendo-switch"]);

function roundMoney(value: number) {
  return Math.round((value + 1e-9) * 100) / 100;
}

function asInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

function familyLabel(family: string) {
  return family === "grandmaster"
    ? "Grandmaster"
    : family.charAt(0).toUpperCase() + family.slice(1);
}

function rankLabel(rank: string) {
  if (rank === "unranked") return "Unranked";
  const [family, division] = rank.split("-");
  return `${familyLabel(family)} ${DIVISION_LABEL[division] ?? division}`;
}

function assertBoolean(selection: ConfiguratorSelection, key: string) {
  if (typeof selection[key] !== "boolean") {
    throw new Error(`Invalid value for ${key}.`);
  }
}

function validateCommon(selection: ConfiguratorSelection) {
  const boostMethod = String(selection.boostMethod ?? "");
  const boosters = asInteger(selection.boosters);
  const role = String(selection.role ?? "");
  const server = String(selection.server ?? "");
  const platform = String(selection.platform ?? "");

  if (!["account", "duo"].includes(boostMethod)) {
    throw new Error("Select Account Boost or Play With Booster.");
  }
  if (!Number.isFinite(boosters) || boosters < 1 || boosters > 5) {
    throw new Error("Boosters must be between 1 and 5.");
  }
  if (!(role in ROLE_MODIFIER)) throw new Error("Select a valid role or queue.");
  if (!SERVERS.has(server)) throw new Error("Select a valid server.");
  if (!PLATFORMS.has(platform)) throw new Error("Select a valid platform.");

  assertBoolean(selection, "playOffline");
  assertBoolean(selection, "specificHeroes");
  assertBoolean(selection, "streaming");
  assertBoolean(selection, "expressDelivery");
  assertBoolean(selection, "extraWin");
  assertBoolean(selection, "rankInsurance");

  return { boostMethod, boosters, role };
}

function calculateCommonQuote(input: {
  baseBmNormal: number;
  baseLabel: string;
  serviceSlug: string;
  selection: ConfiguratorSelection;
}) {
  const { boostMethod, boosters, role } = validateCommon(input.selection);
  const allowBonusWin = input.serviceSlug !== "wins";
  const allowRankInsurance = input.serviceSlug !== "wins";

  if (!allowBonusWin && input.selection.extraWin === true) {
    throw new Error("+1 Bonus Win is not available for Competitive Wins.");
  }
  if (!allowRankInsurance && input.selection.rankInsurance === true) {
    throw new Error("Rank Insurance is not available for Competitive Wins.");
  }

  let percentageModifier = 0;
  let fixedBmNormal = 0;
  const breakdown: QuoteBreakdownItem[] = [
    {
      label: input.baseLabel,
      amount: roundMoney(input.baseBmNormal * BOOSTINGPEDIA_FACTOR),
    },
  ];

  const roleModifier = ROLE_MODIFIER[role];
  if (roleModifier > 0) {
    percentageModifier += roleModifier;
    breakdown.push({
      label: `${ROLE_LABEL[role]} (+${Math.round(roleModifier * 100)}%)`,
      amount: roundMoney(input.baseBmNormal * roleModifier * BOOSTINGPEDIA_FACTOR),
    });
  }

  if (boostMethod === "duo") {
    const duoModifier = 0.8 + Math.max(0, boosters - 1) * 0.75;
    percentageModifier += duoModifier;
    breakdown.push({
      label: `Play With Booster · ${boosters} booster${boosters === 1 ? "" : "s"}`,
      amount: roundMoney(input.baseBmNormal * duoModifier * BOOSTINGPEDIA_FACTOR),
    });
  }

  if (input.selection.expressDelivery === true) {
    percentageModifier += 0.2;
    breakdown.push({
      label: "Express Delivery (+20%)",
      amount: roundMoney(input.baseBmNormal * 0.2 * BOOSTINGPEDIA_FACTOR),
    });
  }

  if (allowRankInsurance && input.selection.rankInsurance === true) {
    percentageModifier += 0.6;
    breakdown.push({
      label: "Rank Insurance (+60%)",
      amount: roundMoney(input.baseBmNormal * 0.6 * BOOSTINGPEDIA_FACTOR),
    });
  }

  if (input.selection.streaming === true) {
    fixedBmNormal += 10;
    breakdown.push({ label: "Streaming", amount: 7 });
  }

  if (allowBonusWin && input.selection.extraWin === true) {
    fixedBmNormal += 3;
    breakdown.push({ label: "+1 Bonus Win", amount: 2.1 });
  }

  if (input.selection.playOffline === true) {
    breakdown.push({ label: "Play Offline", amount: 0 });
  }
  if (input.selection.specificHeroes === true) {
    breakdown.push({ label: "Specific Heroes", amount: 0 });
  }

  const bmNormalTotal =
    input.baseBmNormal + input.baseBmNormal * percentageModifier + fixedBmNormal;
  const total = roundMoney(bmNormalTotal * BOOSTINGPEDIA_FACTOR);

  return {
    currency: "USD" as const,
    subtotal: total,
    discount: 0,
    total,
    breakdown,
    ruleSetVersion: VERSION,
  };
}

function calculateRankBase(selection: ConfiguratorSelection) {
  const currentRank = String(selection.currentRank ?? "");
  const targetRank = String(selection.targetRank ?? "");
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  const targetIndex = RANK_ORDER.indexOf(targetRank);

  if (currentIndex < 0 || targetIndex < 0) throw new Error("Select valid Overwatch ranks.");
  if (targetIndex <= currentIndex) throw new Error("Target rank must be above current rank.");

  let base = 0;
  for (let index = currentIndex; index < targetIndex; index += 1) {
    const from = RANK_ORDER[index];
    const to = RANK_ORDER[index + 1];
    const price = RANK_TRANSITION_BM_NORMAL[`${from}>${to}`];
    if (price === undefined) throw new Error("Overwatch rank pricing is incomplete for this path.");
    base += price;
  }

  return {
    baseBmNormal: base,
    label: `${rankLabel(currentRank)} → ${rankLabel(targetRank)}`,
  };
}

function calculateWinsBase(selection: ConfiguratorSelection) {
  const currentRank = String(selection.currentRank ?? "");
  const wins = asInteger(selection.wins);
  const perWin = WIN_BM_NORMAL_PER_WIN[currentRank];

  if (perWin === undefined) throw new Error("Select a valid Overwatch rank.");
  if (!Number.isFinite(wins) || wins < 1 || wins > 5) {
    throw new Error("Competitive Wins must be between 1 and 5.");
  }

  return {
    baseBmNormal: perWin * wins,
    label: `${wins} competitive win${wins === 1 ? "" : "s"} · ${rankLabel(currentRank)}`,
  };
}

function calculatePlacementsBase(selection: ConfiguratorSelection) {
  const currentRank = String(selection.currentRank ?? "");
  const matches = asInteger(selection.matches);
  const perMatch = PLACEMENT_BM_NORMAL_PER_MATCH[currentRank];

  if (perMatch === undefined) throw new Error("Select a valid previous rank.");
  if (!Number.isFinite(matches) || matches < 1 || matches > 10) {
    throw new Error("Placement Matches must be between 1 and 10.");
  }

  return {
    baseBmNormal: perMatch * matches,
    label: `${matches} placement match${matches === 1 ? "" : "es"} · ${rankLabel(currentRank)}`,
  };
}

function calculateDrivesBase(selection: ConfiguratorSelection) {
  const rank = String(selection.driveRank ?? "");
  const currentDrive = asInteger(selection.currentDrive);
  const desiredDrive = asInteger(selection.desiredDrive);
  const pricing = DRIVE_BM_NORMAL[rank];

  if (!pricing) throw new Error("Select a valid Competitive Drive rank.");
  if (
    !Number.isFinite(currentDrive) ||
    currentDrive < 0 ||
    currentDrive > 3950 ||
    currentDrive % 50 !== 0
  ) {
    throw new Error("Current Drive must be between 0 and 3950 in 50-point steps.");
  }
  if (
    !Number.isFinite(desiredDrive) ||
    desiredDrive < 50 ||
    desiredDrive > 4000 ||
    desiredDrive % 50 !== 0
  ) {
    throw new Error("Desired Drive must be between 50 and 4000 in 50-point steps.");
  }
  if (desiredDrive <= currentDrive) {
    throw new Error("Desired Drive must be above Current Drive.");
  }

  const steps = (desiredDrive - currentDrive) / 50;
  return {
    baseBmNormal: pricing.starting + pricing.step * steps,
    label: `${familyLabel(rank)} Drive · ${currentDrive} → ${desiredDrive}`,
  };
}

function calculateUnratedBase(selection: ConfiguratorSelection) {
  const matches = asInteger(selection.matches);
  if (!Number.isFinite(matches) || matches < 1 || matches > 10) {
    throw new Error("Unrated Matches must be between 1 and 10.");
  }

  return {
    baseBmNormal: UNRATED_BM_NORMAL_PER_MATCH * matches,
    label: `${matches} unrated match${matches === 1 ? "" : "es"}`,
  };
}

export function isOverwatchQuote(input: { gameSlug: string; serviceSlug: string }) {
  return (
    input.gameSlug === "overwatch-2" &&
    ["rank-boost", "wins", "competitive-drives", "placement-matches", "unrated-matches"].includes(
      input.serviceSlug,
    )
  );
}

export function calculateOverwatchQuote(
  serviceSlug: string,
  selection: ConfiguratorSelection,
): QuotePreview {
  if (serviceSlug === "rank-boost") {
    const base = calculateRankBase(selection);
    return calculateCommonQuote({ ...base, baseLabel: base.label, serviceSlug, selection });
  }

  if (serviceSlug === "wins") {
    const base = calculateWinsBase(selection);
    return calculateCommonQuote({ ...base, baseLabel: base.label, serviceSlug, selection });
  }

  if (serviceSlug === "competitive-drives") {
    const base = calculateDrivesBase(selection);
    return calculateCommonQuote({ ...base, baseLabel: base.label, serviceSlug, selection });
  }

  if (serviceSlug === "placement-matches") {
    const base = calculatePlacementsBase(selection);
    return calculateCommonQuote({ ...base, baseLabel: base.label, serviceSlug, selection });
  }

  if (serviceSlug === "unrated-matches") {
    const base = calculateUnratedBase(selection);
    return calculateCommonQuote({ ...base, baseLabel: base.label, serviceSlug, selection });
  }

  throw new Error("Unsupported Overwatch service.");
}
