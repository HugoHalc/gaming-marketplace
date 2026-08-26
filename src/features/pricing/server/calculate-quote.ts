import { findCatalogGameBySlug } from "@/features/catalog/data/catalog-repository";
import { getServiceConfiguratorSchema } from "@/features/configurator/data/configurator-repository";
import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";
import { getActivePricingRuleSet, type PricingRule } from "./pricing-repository";
import {
  calculateRocketLeagueRankQuote,
  isRocketLeagueRankQuote,
} from "./rocket-league-rank-pricing";

const MOCK_RULE_SET_VERSION = "mock-v1.0";

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function validateSelection(
  selection: ConfiguratorSelection,
  schema: Awaited<ReturnType<typeof getServiceConfiguratorSchema>>,
) {
  for (const field of schema.fields) {
    const value = selection[field.key];
    if (field.required && (value === undefined || value === null || value === "")) {
      throw new Error(`${field.label} is required.`);
    }

    if (field.type === "select") {
      const allowed = field.options?.some((option) => option.value === String(value));
      if (!allowed) throw new Error(`Invalid value for ${field.label}.`);
    }

    if (field.type === "number") {
      const number = asNumber(value, Number.NaN);
      if (!Number.isFinite(number)) throw new Error(`Invalid value for ${field.label}.`);
      if (field.min !== undefined && number < field.min) throw new Error(`${field.label} is below the minimum.`);
      if (field.max !== undefined && number > field.max) throw new Error(`${field.label} is above the maximum.`);
    }

    if (field.type === "toggle" && typeof value !== "boolean") {
      throw new Error(`Invalid value for ${field.label}.`);
    }
  }
}

function mockModifierMultiplier(selection: ConfiguratorSelection, category: string) {
  let multiplier = 1;
  if (selection.queue === "duo") multiplier *= category === "rank" ? 1.22 : 1.18;
  if (selection.focus === "live") multiplier *= 1.12;
  if (selection.priority === true) multiplier *= 1.15;
  return multiplier;
}

function calculateWithMockRules(input: {
  startingPrice: number;
  category: string;
  selection: ConfiguratorSelection;
}): Omit<QuotePreview, "ruleSetVersion"> {
  let base = input.startingPrice;
  const breakdown: QuoteBreakdownItem[] = [{ label: "Base service", amount: base }];

  if (input.category === "rank") {
    const current = asNumber(input.selection.currentRank);
    const target = asNumber(input.selection.targetRank);
    if (target <= current) throw new Error("Target rank must be above current rank.");
    const distance = target - current;
    const progression = distance * Math.max(4.25, input.startingPrice * 0.42);
    base += progression;
    breakdown.push({ label: `${distance} rank steps`, amount: roundMoney(progression) });
  }

  if (input.category === "wins") {
    const quantity = asNumber(input.selection.wins, 1);
    base = input.startingPrice * quantity;
    breakdown[0] = { label: `${quantity} competitive wins`, amount: roundMoney(base) };
  }

  if (input.category === "placements") {
    const quantity = asNumber(input.selection.matches, 1);
    base = input.startingPrice * quantity;
    breakdown[0] = { label: `${quantity} placement matches`, amount: roundMoney(base) };
  }

  if (input.category === "coaching") {
    const quantity = asNumber(input.selection.hours, 1);
    base = input.startingPrice * quantity;
    breakdown[0] = { label: `${quantity} coaching hour${quantity === 1 ? "" : "s"}`, amount: roundMoney(base) };
  }

  const subtotal = roundMoney(base * mockModifierMultiplier(input.selection, input.category));
  const modifierAmount = roundMoney(subtotal - base);
  if (modifierAmount > 0) breakdown.push({ label: "Selected modifiers", amount: modifierAmount });

  const discount = subtotal >= 100 ? roundMoney(subtotal * 0.05) : 0;
  if (discount > 0) breakdown.push({ label: "Package discount", amount: -discount });

  return { currency: "USD", subtotal, discount, total: roundMoney(subtotal - discount), breakdown };
}

function matchesCondition(rule: PricingRule, selection: ConfiguratorSelection) {
  const field = typeof rule.condition.field === "string" ? rule.condition.field : null;
  if (!field) return true;
  return selection[field] === rule.condition.value;
}

function calculateWithDatabaseRules(input: {
  startingPrice: number;
  selection: ConfiguratorSelection;
  rules: PricingRule[];
}): Omit<QuotePreview, "ruleSetVersion"> {
  let base = input.startingPrice;
  let multiplier = 1;
  let discountPercentage = 0;
  let discountThreshold = Number.POSITIVE_INFINITY;
  const breakdown: QuoteBreakdownItem[] = [{ label: "Base service", amount: base }];

  for (const rule of input.rules) {
    if (rule.ruleType === "progression") {
      const currentField = String(rule.effect.currentField ?? "currentRank");
      const targetField = String(rule.effect.targetField ?? "targetRank");
      const current = asNumber(input.selection[currentField]);
      const target = asNumber(input.selection[targetField]);
      if (target <= current) throw new Error("Target rank must be above current rank.");
      const steps = target - current;
      const minimum = asNumber(rule.effect.minimumPerStepCents) / 100;
      const percentage = asNumber(rule.effect.basePercentage);
      const perStep = Math.max(minimum, input.startingPrice * percentage);
      const amount = roundMoney(steps * perStep);
      base += amount;
      breakdown.push({ label: `${steps} rank steps`, amount });
    }

    if (rule.ruleType === "quantity") {
      const field = String(rule.effect.field ?? "");
      const quantity = asNumber(input.selection[field], 1);
      base = input.startingPrice * quantity;
      breakdown[0] = { label: `${quantity} × base service`, amount: roundMoney(base) };
    }

    if ((rule.ruleType === "option_multiplier" || rule.ruleType === "boolean_multiplier") && matchesCondition(rule, input.selection)) {
      const value = asNumber(rule.effect.multiplier, 1);
      multiplier *= value;
    }

    if (rule.ruleType === "threshold_discount") {
      discountThreshold = asNumber(rule.condition.minimumSubtotalCents, Number.POSITIVE_INFINITY) / 100;
      discountPercentage = asNumber(rule.effect.percentage);
    }
  }

  const subtotal = roundMoney(base * multiplier);
  const modifierAmount = roundMoney(subtotal - base);
  if (modifierAmount > 0) breakdown.push({ label: "Selected modifiers", amount: modifierAmount });

  const discount = subtotal >= discountThreshold ? roundMoney(subtotal * discountPercentage) : 0;
  if (discount > 0) breakdown.push({ label: "Package discount", amount: -discount });

  return { currency: "USD", subtotal, discount, total: roundMoney(subtotal - discount), breakdown };
}

export async function calculateQuotePreview(input: {
  gameSlug: string;
  serviceSlug: string;
  selection: ConfiguratorSelection;
}): Promise<QuotePreview> {
  const game = await findCatalogGameBySlug(input.gameSlug);
  if (!game) throw new Error("Game not found.");

  const service = game.services.find((item) => item.slug === input.serviceSlug);
  if (!service) throw new Error("Service not found.");

  if (isRocketLeagueRankQuote(input)) {
    return calculateRocketLeagueRankQuote(input.selection);
  }

  const schema = await getServiceConfiguratorSchema({ serviceId: service.id, category: service.category });
  validateSelection(input.selection, schema);

  const ruleSet = await getActivePricingRuleSet(service.id);
  const calculated = ruleSet
    ? calculateWithDatabaseRules({ startingPrice: service.startingPrice, selection: input.selection, rules: ruleSet.rules })
    : calculateWithMockRules({ startingPrice: service.startingPrice, category: service.category, selection: input.selection });

  return { ...calculated, ruleSetVersion: ruleSet?.version ?? MOCK_RULE_SET_VERSION };
}
