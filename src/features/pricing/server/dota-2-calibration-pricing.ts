import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";
import {
  DOTA2_MAX_ROLE_PREFERENCES,
  dota2BehaviorScoreOptions,
  dota2BoostMethodOptions,
  dota2ExtraOptions,
  dota2PreferenceOptions,
  dota2RoleOptions,
  dota2ServerOptions,
  type Dota2BehaviorScore,
  type Dota2BoostMethod,
  type Dota2Preference,
  type Dota2Role,
  type Dota2Server,
} from "@/features/configurator/data/dota-2-mmr-options";
import {
  DOTA2_CALIBRATION_MATCHES_MAX,
  DOTA2_CALIBRATION_MATCHES_MIN,
  DOTA2_RANK_CONFIDENCE_MAX,
  DOTA2_RANK_CONFIDENCE_MIN,
  dota2CalibrationDivisionOptions,
  dota2CalibrationRankOptions,
  type Dota2CalibrationCustomQuoteState,
  type Dota2CalibrationDivision,
  type Dota2CalibrationQuoteMetadata,
  type Dota2CalibrationRank,
} from "@/features/configurator/data/dota-2-calibration-options";

const VERSION = "dota-2-calibration-v1";

const ALLOWED_SELECTION_KEYS = new Set([
  "previousRank",
  "previousDivision",
  "rankConfidence",
  "matches",
  "server",
  "behaviorScore",
  "boostMethod",
  "preference",
  "roles",
  "heroName",
  "privacyMode",
  "soloQueueOnly",
  "expressDelivery",
  "streaming",
]);

function dollars(cents: number) {
  return cents / 100;
}

function parseInteger(
  selection: ConfiguratorSelection,
  key: string,
  min: number,
  max: number,
) {
  const value = selection[key];
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value)
  ) {
    throw new Error(`Invalid value for ${key}.`);
  }
  if (value < min || value > max) throw new Error(`Invalid value for ${key}.`);
  return value;
}

function parseString(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "string") throw new Error(`Invalid value for ${key}.`);
  return value;
}

function parseRequiredString(selection: ConfiguratorSelection, key: string) {
  const value = parseString(selection, key);
  if (!value.trim()) throw new Error(`Invalid value for ${key}.`);
  return value;
}

function parseBoolean(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "boolean") throw new Error(`Invalid value for ${key}.`);
  return value;
}

function optionValue<T extends { value: string }>(
  options: readonly T[],
  value: string,
  message: string,
): T {
  const option = options.find((item) => item.value === value);
  if (!option) throw new Error(message);
  return option;
}

function validateSelectionKeys(selection: ConfiguratorSelection) {
  for (const key of Object.keys(selection)) {
    if (!ALLOWED_SELECTION_KEYS.has(key)) {
      throw new Error("Invalid Dota 2 Calibration Matches selection.");
    }
  }
}

function parseRoles(selection: ConfiguratorSelection, preference: Dota2Preference) {
  const raw = selection.roles;
  if (typeof raw !== "string") throw new Error("Invalid role preference.");
  const roles = raw.length ? raw.split(",") : [];
  const unique = new Set(roles);
  if (unique.size !== roles.length) throw new Error("Duplicate role preference.");
  if (roles.some((role) => !dota2RoleOptions.some((option) => option.value === role))) {
    throw new Error("Select valid roles.");
  }
  if (preference === "roles") {
    if (roles.length < 1 || roles.length > DOTA2_MAX_ROLE_PREFERENCES) {
      throw new Error(`Select between 1 and ${DOTA2_MAX_ROLE_PREFERENCES} roles.`);
    }
  } else if (roles.length > 0) {
    throw new Error("Role preferences apply only to Specific Roles.");
  }
  return roles as Dota2Role[];
}

function validateHero(selection: ConfiguratorSelection, preference: Dota2Preference) {
  const raw = selection.heroName;
  if (typeof raw !== "string") throw new Error("Invalid hero preference.");
  const heroName = raw.trim();
  if (preference === "hero") {
    if (!heroName) throw new Error("Enter a hero name.");
  } else if (heroName) {
    throw new Error("Hero preference applies only to Specific Hero.");
  }
  return heroName;
}

function modifierLine(label: string, baseCents: number, percent: number) {
  return {
    label: `${label} (+${percent}%)`,
    cents: Math.round((baseCents * percent) / 100),
  };
}

export type Dota2CalibrationPricingResult =
  | { kind: "quote"; quote: QuotePreview; metadata: Dota2CalibrationQuoteMetadata }
  | { kind: "custom"; customQuote: Dota2CalibrationCustomQuoteState };

export function calculateDota2CalibrationPricing(
  selection: ConfiguratorSelection,
): Dota2CalibrationPricingResult {
  validateSelectionKeys(selection);

  const previousRank = parseRequiredString(selection, "previousRank") as Dota2CalibrationRank;
  const rankOption = optionValue(
    dota2CalibrationRankOptions,
    previousRank,
    "Select a valid previous rank.",
  );

  const previousDivisionRaw = parseString(selection, "previousDivision");
  let previousDivision: Dota2CalibrationDivision | null = null;
  if (previousRank === "immortal") {
    if (previousDivisionRaw !== "") {
      throw new Error("Previous Division does not apply to Immortal.");
    }
  } else {
    if (!dota2CalibrationDivisionOptions.some((division) => division === previousDivisionRaw)) {
      throw new Error("Select a valid previous division.");
    }
    previousDivision = previousDivisionRaw as Dota2CalibrationDivision;
  }

  parseInteger(
    selection,
    "rankConfidence",
    DOTA2_RANK_CONFIDENCE_MIN,
    DOTA2_RANK_CONFIDENCE_MAX,
  );
  const matches = parseInteger(
    selection,
    "matches",
    DOTA2_CALIBRATION_MATCHES_MIN,
    DOTA2_CALIBRATION_MATCHES_MAX,
  );

  const server = parseRequiredString(selection, "server") as Dota2Server;
  optionValue(dota2ServerOptions, server, "Select a valid server.");

  const behaviorScore = parseRequiredString(
    selection,
    "behaviorScore",
  ) as Dota2BehaviorScore;
  const behaviorOption = optionValue(
    dota2BehaviorScoreOptions,
    behaviorScore,
    "Select a valid Behavior Score range.",
  );

  const boostMethod = parseRequiredString(selection, "boostMethod") as Dota2BoostMethod;
  const boostMethodOption = optionValue(
    dota2BoostMethodOptions,
    boostMethod,
    "Select a valid boost method.",
  );

  const preference = parseRequiredString(selection, "preference") as Dota2Preference;
  const preferenceOption = optionValue(
    dota2PreferenceOptions,
    preference,
    "Select a valid preference.",
  );
  parseRoles(selection, preference);
  validateHero(selection, preference);

  const privacyMode = parseBoolean(selection, "privacyMode");
  const soloQueueOnly = parseBoolean(selection, "soloQueueOnly");
  const expressDelivery = parseBoolean(selection, "expressDelivery");
  const streaming = parseBoolean(selection, "streaming");

  if (boostMethod === "duo" && (soloQueueOnly || streaming)) {
    throw new Error("Solo Queue Only and Streaming are available with Solo only.");
  }

  const metadata: Dota2CalibrationQuoteMetadata = {
    previousRank: rankOption.label,
    previousDivision,
    rateCentsPerMatch: rankOption.rateCentsPerMatch,
  };

  if (previousRank === "immortal") {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "immortal",
        message: "Custom quote required",
        supportingCopy:
          "Contact Support so we can confirm availability and pricing for Immortal calibration matches.",
      },
    };
  }

  if (behaviorOption.customQuote) {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "behavior-score",
        message: "Custom quote required",
        supportingCopy:
          "Contact Support so we can confirm availability and pricing for this Behavior Score range.",
      },
    };
  }

  const baseCents = rankOption.rateCentsPerMatch * matches;
  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${matches} Calibration Match${matches === 1 ? "" : "es"} × $${(
        rankOption.rateCentsPerMatch / 100
      ).toFixed(2)}`,
      amount: dollars(baseCents),
    },
  ];

  const percentageLines: Array<{ label: string; cents: number }> = [];
  if (boostMethodOption.modifierPercent > 0) {
    percentageLines.push(
      modifierLine(
        boostMethod === "duo" ? "Play With Booster" : boostMethodOption.label,
        baseCents,
        boostMethodOption.modifierPercent,
      ),
    );
  }
  if (behaviorOption.modifierPercent > 0) {
    percentageLines.push(
      modifierLine("Behavior Score", baseCents, behaviorOption.modifierPercent),
    );
  }
  if (preferenceOption.modifierPercent > 0) {
    percentageLines.push(
      modifierLine(preferenceOption.label, baseCents, preferenceOption.modifierPercent),
    );
  }
  if (soloQueueOnly) {
    percentageLines.push(
      modifierLine(
        dota2ExtraOptions.soloQueueOnly.label,
        baseCents,
        dota2ExtraOptions.soloQueueOnly.modifierPercent,
      ),
    );
  }
  if (expressDelivery) {
    percentageLines.push(
      modifierLine(
        dota2ExtraOptions.expressDelivery.label,
        baseCents,
        dota2ExtraOptions.expressDelivery.modifierPercent,
      ),
    );
  }

  const totalPercent =
    boostMethodOption.modifierPercent +
    behaviorOption.modifierPercent +
    preferenceOption.modifierPercent +
    (soloQueueOnly ? dota2ExtraOptions.soloQueueOnly.modifierPercent : 0) +
    (expressDelivery ? dota2ExtraOptions.expressDelivery.modifierPercent : 0);
  const combinedModifierCents = Math.round((baseCents * totalPercent) / 100);
  const roundedLineTotal = percentageLines.reduce((sum, line) => sum + line.cents, 0);
  if (percentageLines.length > 0 && roundedLineTotal !== combinedModifierCents) {
    percentageLines[percentageLines.length - 1] = {
      ...percentageLines[percentageLines.length - 1],
      cents:
        percentageLines[percentageLines.length - 1].cents +
        (combinedModifierCents - roundedLineTotal),
    };
  }
  breakdown.push(
    ...percentageLines.map((line) => ({ label: line.label, amount: dollars(line.cents) })),
  );

  if (privacyMode) breakdown.push({ label: "Privacy Mode", amount: 0 });
  const streamingCents = streaming ? dota2ExtraOptions.streaming.fixedCents : 0;
  if (streaming) breakdown.push({ label: "Streaming", amount: dollars(streamingCents) });

  const totalCents = baseCents + combinedModifierCents + streamingCents;
  const total = dollars(totalCents);

  return {
    kind: "quote",
    metadata,
    quote: {
      currency: "USD",
      subtotal: total,
      discount: 0,
      total,
      ruleSetVersion: VERSION,
      breakdown,
    },
  };
}
