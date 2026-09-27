import type { ConfiguratorSelection, QuoteBreakdownItem, QuotePreview } from "@/features/configurator/types/configurator";
import {
  DOTA2_CURRENT_MMR_MAX,
  DOTA2_CURRENT_MMR_MIN,
  DOTA2_MAX_ROLE_PREFERENCES,
  DOTA2_IMMORTAL_MMR,
  DOTA2_TARGET_MMR_MAX,
  DOTA2_TARGET_MMR_MIN,
  dota2BehaviorScoreOptions,
  dota2MmrRankBands,
  getDota2MmrBracketName,
  dota2BoostMethodOptions,
  dota2ExtraOptions,
  dota2PreferenceOptions,
  dota2RoleOptions,
  dota2ServerOptions,
  type Dota2BehaviorScore,
  type Dota2BoostMethod,
  type Dota2MmrCustomQuoteState,
  type Dota2MmrQuoteMetadata,
  type Dota2Preference,
  type Dota2Role,
  type Dota2Server,
} from "@/features/configurator/data/dota-2-mmr-options";

const VERSION = "dota-2-mmr-v1";
const rateCentsPer100ByBracket = {
  Herald: 320,
  Guardian: 320,
  Crusader: 340,
  Archon: 410,
  Legend: 500,
  Ancient: 675,
  Divine: 900,
} as const;

const pricingBrackets = dota2MmrRankBands.map((band) => ({
  ...band,
  rateCentsPer100: rateCentsPer100ByBracket[band.name],
}));

const ALLOWED_SELECTION_KEYS = new Set([
  "currentMmr",
  "targetMmr",
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

function parseInteger(selection: ConfiguratorSelection, key: string, min: number, max: number) {
  const value = selection[key];
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`Invalid value for ${key}.`);
  }
  if (value < min || value > max) throw new Error(`Invalid value for ${key}.`);
  return value;
}

function parseString(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`Invalid value for ${key}.`);
  return value;
}

function parseBoolean(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "boolean") throw new Error(`Invalid value for ${key}.`);
  return value;
}

function optionValue<T extends { value: string }>(options: readonly T[], value: string, message: string): T {
  const option = options.find((item) => item.value === value);
  if (!option) throw new Error(message);
  return option;
}

function calculateSegmentedBase(currentMmr: number, targetMmr: number) {
  const segments = pricingBrackets.flatMap((bracket) => {
    const start = Math.max(currentMmr, bracket.start);
    const end = Math.min(targetMmr, bracket.end);
    if (end <= start) return [];
    const mmr = end - start;
    return [{ ...bracket, mmr, exactCentHundredths: mmr * bracket.rateCentsPer100 }];
  });

  const exactTotalCentHundredths = segments.reduce((sum, segment) => sum + segment.exactCentHundredths, 0);
  const baseCents = Math.round(exactTotalCentHundredths / 100);
  const rounded = segments.map((segment) => ({ ...segment, cents: Math.round(segment.exactCentHundredths / 100) }));
  const roundedTotal = rounded.reduce((sum, segment) => sum + segment.cents, 0);
  if (rounded.length > 0 && roundedTotal !== baseCents) {
    rounded[rounded.length - 1] = {
      ...rounded[rounded.length - 1],
      cents: rounded[rounded.length - 1].cents + (baseCents - roundedTotal),
    };
  }
  return { baseCents, segments: rounded };
}

function validateSelectionKeys(selection: ConfiguratorSelection) {
  for (const key of Object.keys(selection)) {
    if (!ALLOWED_SELECTION_KEYS.has(key)) throw new Error("Invalid Dota 2 MMR Boost selection.");
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
  const value = selection.heroName;
  if (typeof value !== "string") throw new Error("Invalid hero preference.");
  if (preference === "hero") {
    if (!value.trim()) throw new Error("Enter a hero name.");
  } else if (value.trim()) {
    throw new Error("Hero preference applies only to Specific Hero.");
  }
  return value;
}

function modifierLine(label: string, baseCents: number, percent: number) {
  return {
    label: `${label} (+${percent}%)`,
    cents: Math.round((baseCents * percent) / 100),
  };
}

export type Dota2MmrPricingResult =
  | { kind: "quote"; quote: QuotePreview; metadata: Dota2MmrQuoteMetadata }
  | { kind: "custom"; customQuote: Dota2MmrCustomQuoteState };

export function calculateDota2MmrPricing(selection: ConfiguratorSelection): Dota2MmrPricingResult {
  validateSelectionKeys(selection);

  const currentMmr = parseInteger(selection, "currentMmr", DOTA2_CURRENT_MMR_MIN, DOTA2_CURRENT_MMR_MAX);
  const targetMmr = parseInteger(selection, "targetMmr", DOTA2_TARGET_MMR_MIN, DOTA2_TARGET_MMR_MAX);
  if (targetMmr <= currentMmr) throw new Error("Desired MMR must be above Current MMR.");

  const server = parseString(selection, "server") as Dota2Server;
  optionValue(dota2ServerOptions, server, "Select a valid server.");

  const behaviorScore = parseString(selection, "behaviorScore") as Dota2BehaviorScore;
  const behaviorOption = optionValue(dota2BehaviorScoreOptions, behaviorScore, "Select a valid Behavior Score range.");

  const boostMethod = parseString(selection, "boostMethod") as Dota2BoostMethod;
  const boostMethodOption = optionValue(dota2BoostMethodOptions, boostMethod, "Select a valid boost method.");

  const preference = parseString(selection, "preference") as Dota2Preference;
  const preferenceOption = optionValue(dota2PreferenceOptions, preference, "Select a valid preference.");
  parseRoles(selection, preference);
  validateHero(selection, preference);

  const privacyMode = parseBoolean(selection, "privacyMode");
  const soloQueueOnly = parseBoolean(selection, "soloQueueOnly");
  const expressDelivery = parseBoolean(selection, "expressDelivery");
  const streaming = parseBoolean(selection, "streaming");

  if (boostMethod === "duo" && (soloQueueOnly || streaming)) {
    throw new Error("Solo Queue Only and Streaming are available with Solo only.");
  }

  const metadata: Dota2MmrQuoteMetadata = {
    currentBracket: getDota2MmrBracketName(currentMmr) ?? "Herald",
    targetBracket: getDota2MmrBracketName(targetMmr) ?? "Herald",
  };

  if (currentMmr >= DOTA2_IMMORTAL_MMR || targetMmr >= DOTA2_IMMORTAL_MMR) {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "immortal",
        message: "Immortal orders require a custom quote.",
        supportingCopy: "Contact Support so we can confirm availability and pricing for your MMR range.",
      },
    };
  }

  if (behaviorOption.customQuote) {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "behavior-score",
        message: "This Behavior Score range requires a custom quote.",
        supportingCopy: "Contact Support so we can confirm availability and pricing for your order.",
      },
    };
  }

  const { baseCents } = calculateSegmentedBase(currentMmr, targetMmr);
  const breakdown: QuoteBreakdownItem[] = [
    { label: "Base MMR price · segmented", amount: dollars(baseCents) },
  ];

  const percentageLines: Array<{ label: string; cents: number }> = [];
  if (boostMethodOption.modifierPercent > 0) {
    percentageLines.push(modifierLine(boostMethodOption.label, baseCents, boostMethodOption.modifierPercent));
  }
  if (behaviorOption.modifierPercent > 0) {
    percentageLines.push(modifierLine("Behavior Score", baseCents, behaviorOption.modifierPercent));
  }
  if (preferenceOption.modifierPercent > 0) {
    percentageLines.push(modifierLine(preferenceOption.label, baseCents, preferenceOption.modifierPercent));
  }
  if (soloQueueOnly) {
    percentageLines.push(modifierLine(dota2ExtraOptions.soloQueueOnly.label, baseCents, dota2ExtraOptions.soloQueueOnly.modifierPercent));
  }
  if (expressDelivery) {
    percentageLines.push(modifierLine(dota2ExtraOptions.expressDelivery.label, baseCents, dota2ExtraOptions.expressDelivery.modifierPercent));
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
      cents: percentageLines[percentageLines.length - 1].cents + (combinedModifierCents - roundedLineTotal),
    };
  }
  breakdown.push(...percentageLines.map((line) => ({ label: line.label, amount: dollars(line.cents) })));

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
