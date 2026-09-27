import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";
import {
  dota2BehaviorScoreOptions,
  dota2ExtraOptions,
  dota2ServerOptions,
  type Dota2BehaviorScore,
  type Dota2Server,
} from "@/features/configurator/data/dota-2-mmr-options";
import {
  DOTA2_CURRENT_HERO_LEVEL_MAX,
  DOTA2_CURRENT_HERO_LEVEL_MIN,
  DOTA2_HERO_NAME_MAX_LENGTH,
  DOTA2_TARGET_HERO_LEVEL_MAX,
  DOTA2_TARGET_HERO_LEVEL_MIN,
  dota2HeroLevelRateBands,
  type Dota2HeroLevelCustomQuoteState,
  type Dota2HeroLevelQuoteMetadata,
} from "@/features/configurator/data/dota-2-hero-level-options";

const VERSION = "dota-2-hero-level-v1";

const ALLOWED_SELECTION_KEYS = new Set([
  "heroName",
  "currentLevel",
  "desiredLevel",
  "dotaPlusConfirmed",
  "server",
  "behaviorScore",
  "privacyMode",
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

function parseBoolean(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "boolean") throw new Error(`Invalid value for ${key}.`);
  return value;
}

function parseHeroName(selection: ConfiguratorSelection) {
  const value = selection.heroName;
  if (typeof value !== "string") throw new Error("Enter the hero you want to level.");
  const heroName = value.trim();
  if (!heroName || heroName.length > DOTA2_HERO_NAME_MAX_LENGTH || heroName.includes(",")) {
    throw new Error("Enter the hero you want to level.");
  }
  return heroName;
}

function optionValue<T extends { value: string }>(options: readonly T[], value: unknown, message: string): T {
  if (typeof value !== "string") throw new Error(message);
  const option = options.find((item) => item.value === value);
  if (!option) throw new Error(message);
  return option;
}

function validateSelectionKeys(selection: ConfiguratorSelection) {
  for (const key of Object.keys(selection)) {
    if (!ALLOWED_SELECTION_KEYS.has(key)) {
      throw new Error("Invalid Dota 2 Hero Level selection.");
    }
  }
}

function calculateSegmentedBase(currentLevel: number, desiredLevel: number) {
  const segments = dota2HeroLevelRateBands.flatMap((band) => {
    const start = Math.max(currentLevel + 1, band.start);
    const end = Math.min(desiredLevel, band.end);
    if (end < start) return [];
    const levels = end - start + 1;
    return [{ start, end, levels, rateCentsPerLevel: band.rateCentsPerLevel, cents: levels * band.rateCentsPerLevel }];
  });
  const baseCents = segments.reduce((sum, segment) => sum + segment.cents, 0);
  return { baseCents, segments };
}

function modifierLine(label: string, baseCents: number, percent: number) {
  return { label: `${label} (+${percent}%)`, cents: Math.round((baseCents * percent) / 100) };
}

export type Dota2HeroLevelPricingResult =
  | { kind: "quote"; quote: QuotePreview; metadata: Dota2HeroLevelQuoteMetadata }
  | { kind: "custom"; customQuote: Dota2HeroLevelCustomQuoteState };

export function calculateDota2HeroLevelPricing(selection: ConfiguratorSelection): Dota2HeroLevelPricingResult {
  validateSelectionKeys(selection);

  const heroName = parseHeroName(selection);
  const currentLevel = parseInteger(
    selection,
    "currentLevel",
    DOTA2_CURRENT_HERO_LEVEL_MIN,
    DOTA2_CURRENT_HERO_LEVEL_MAX,
  );
  const desiredLevel = parseInteger(
    selection,
    "desiredLevel",
    DOTA2_TARGET_HERO_LEVEL_MIN,
    DOTA2_TARGET_HERO_LEVEL_MAX,
  );
  if (desiredLevel <= currentLevel) {
    throw new Error("Desired Hero Level must be above Current Hero Level.");
  }

  // The quote may be previewed before confirmation, but the value must remain a boolean.
  parseBoolean(selection, "dotaPlusConfirmed");

  const server = optionValue(dota2ServerOptions, selection.server, "Select a valid server.") as (typeof dota2ServerOptions)[number] & { value: Dota2Server };
  const behaviorOption = optionValue(
    dota2BehaviorScoreOptions,
    selection.behaviorScore,
    "Select a valid Behavior Score range.",
  ) as (typeof dota2BehaviorScoreOptions)[number] & { value: Dota2BehaviorScore };

  const privacyMode = parseBoolean(selection, "privacyMode");
  const expressDelivery = parseBoolean(selection, "expressDelivery");
  const streaming = parseBoolean(selection, "streaming");
  void server;

  const metadata: Dota2HeroLevelQuoteMetadata = {
    heroName,
    currentLevel,
    desiredLevel,
    progressionLevels: desiredLevel - currentLevel,
  };

  if (behaviorOption.customQuote) {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "behavior-score",
        message: "Custom quote required",
        supportingCopy: "Contact Support so we can confirm availability and pricing for this Behavior Score range.",
      },
    };
  }

  const { baseCents, segments } = calculateSegmentedBase(currentLevel, desiredLevel);
  const breakdown: QuoteBreakdownItem[] = segments.map((segment) => ({
    label: `Levels ${segment.start}${segment.end === segment.start ? "" : `–${segment.end}`} · ${segment.levels} level${segment.levels === 1 ? "" : "s"} × $${(segment.rateCentsPerLevel / 100).toFixed(2)}`,
    amount: dollars(segment.cents),
  }));

  const totalPercent =
    behaviorOption.modifierPercent +
    (expressDelivery ? dota2ExtraOptions.expressDelivery.modifierPercent : 0);
  const percentageLines: Array<{ label: string; cents: number }> = [];
  if (behaviorOption.modifierPercent > 0) {
    percentageLines.push(modifierLine("Behavior Score", baseCents, behaviorOption.modifierPercent));
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

  const combinedModifierCents = Math.round((baseCents * totalPercent) / 100);
  const roundedLineTotal = percentageLines.reduce((sum, line) => sum + line.cents, 0);
  if (percentageLines.length > 0 && roundedLineTotal !== combinedModifierCents) {
    const last = percentageLines.length - 1;
    percentageLines[last] = {
      ...percentageLines[last],
      cents: percentageLines[last].cents + (combinedModifierCents - roundedLineTotal),
    };
  }
  breakdown.push(...percentageLines.map((line) => ({ label: line.label, amount: dollars(line.cents) })));

  if (privacyMode) breakdown.push({ label: dota2ExtraOptions.privacyMode.label, amount: 0 });
  const streamingCents = streaming ? dota2ExtraOptions.streaming.fixedCents : 0;
  if (streaming) breakdown.push({ label: dota2ExtraOptions.streaming.label, amount: dollars(streamingCents) });

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
