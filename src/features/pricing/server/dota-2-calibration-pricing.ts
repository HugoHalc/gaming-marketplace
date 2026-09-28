import type { ConfiguratorSelection, QuoteBreakdownItem, QuotePreview } from "@/features/configurator/types/configurator";
import { dota2BehaviorScoreOptions, dota2BoostMethodOptions, dota2ExtraOptions, dota2PreferenceOptions, dota2ServerOptions, type Dota2BehaviorScore, type Dota2BoostMethod, type Dota2Preference, type Dota2Server } from "@/features/configurator/data/dota-2-mmr-options";
import { DOTA2_CALIBRATION_MATCHES_MAX, DOTA2_CALIBRATION_MATCHES_MIN, DOTA2_RANK_CONFIDENCE_MAX, DOTA2_RANK_CONFIDENCE_MIN, dota2CalibrationDivisionOptions, dota2CalibrationRankOptions, type Dota2CalibrationCustomQuoteState, type Dota2CalibrationDivision, type Dota2CalibrationQuoteMetadata, type Dota2CalibrationRank } from "@/features/configurator/data/dota-2-calibration-options";
import { validateDota2PreferenceDetails, type Dota2PreferenceValidationMode } from "./dota-2-preference-validation";
const VERSION = "dota-2-calibration-v1";
const ALLOWED_SELECTION_KEYS = new Set(["previousRank", "previousDivision", "rankConfidence", "matches", "server", "behaviorScore", "boostMethod", "preference", "roles", "heroName", "privacyMode", "soloQueueOnly", "expressDelivery", "streaming"]);
function dollars(c: number) { return c / 100; }
function parseInteger(s: ConfiguratorSelection, k: string, min: number, max: number) { const v = s[k]; if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v) || v < min || v > max)
    throw new Error(`Invalid value for ${k}.`); return v; }
function parseString(s: ConfiguratorSelection, k: string) { const v = s[k]; if (typeof v !== "string")
    throw new Error(`Invalid value for ${k}.`); return v; }
function parseRequiredString(s: ConfiguratorSelection, k: string) { const v = parseString(s, k); if (!v.trim())
    throw new Error(`Invalid value for ${k}.`); return v; }
function parseBoolean(s: ConfiguratorSelection, k: string) { const v = s[k]; if (typeof v !== "boolean")
    throw new Error(`Invalid value for ${k}.`); return v; }
function optionValue<T extends {
    value: string;
}>(o: readonly T[], v: string, m: string): T { const x = o.find(i => i.value === v); if (!x)
    throw new Error(m); return x; }
function validateSelectionKeys(s: ConfiguratorSelection) { for (const k of Object.keys(s))
    if (!ALLOWED_SELECTION_KEYS.has(k))
        throw new Error("Invalid Dota 2 Calibration Matches selection."); }
function modifierLine(label: string, baseCents: number, percent: number) { return { label: `${label} (+${percent}%)`, cents: Math.round((baseCents * percent) / 100) }; }
export type Dota2CalibrationPricingResult = {
    kind: "quote";
    quote: QuotePreview;
    metadata: Dota2CalibrationQuoteMetadata;
} | {
    kind: "custom";
    customQuote: Dota2CalibrationCustomQuoteState;
};
export function calculateDota2CalibrationPricing(selection: ConfiguratorSelection, validationMode: Dota2PreferenceValidationMode = "order"): Dota2CalibrationPricingResult {
    validateSelectionKeys(selection);
    const previousRank = parseRequiredString(selection, "previousRank") as Dota2CalibrationRank;
    const rankOption = optionValue(dota2CalibrationRankOptions, previousRank, "Select a valid previous rank.");
    const previousDivisionRaw = parseString(selection, "previousDivision");
    let previousDivision: Dota2CalibrationDivision | null = null;
    if (previousRank === "immortal") {
        if (previousDivisionRaw !== "")
            throw new Error("Previous Division does not apply to Immortal.");
    }
    else {
        if (!dota2CalibrationDivisionOptions.some(d => d === previousDivisionRaw))
            throw new Error("Select a valid previous division.");
        previousDivision = previousDivisionRaw as Dota2CalibrationDivision;
    }
    parseInteger(selection, "rankConfidence", DOTA2_RANK_CONFIDENCE_MIN, DOTA2_RANK_CONFIDENCE_MAX);
    const matches = parseInteger(selection, "matches", DOTA2_CALIBRATION_MATCHES_MIN, DOTA2_CALIBRATION_MATCHES_MAX);
    const server = parseRequiredString(selection, "server") as Dota2Server;
    optionValue(dota2ServerOptions, server, "Select a valid server.");
    const behaviorScore = parseRequiredString(selection, "behaviorScore") as Dota2BehaviorScore;
    const behaviorOption = optionValue(dota2BehaviorScoreOptions, behaviorScore, "Select a valid Behavior Score range.");
    const boostMethod = parseRequiredString(selection, "boostMethod") as Dota2BoostMethod;
    const boostMethodOption = optionValue(dota2BoostMethodOptions, boostMethod, "Select a valid boost method.");
    const preference = parseRequiredString(selection, "preference") as Dota2Preference;
    const preferenceOption = optionValue(dota2PreferenceOptions, preference, "Select a valid preference.");
    validateDota2PreferenceDetails(selection, preference, validationMode);
    const privacyMode = parseBoolean(selection, "privacyMode"), soloQueueOnly = parseBoolean(selection, "soloQueueOnly"), expressDelivery = parseBoolean(selection, "expressDelivery"), streaming = parseBoolean(selection, "streaming");
    if (boostMethod === "duo" && (soloQueueOnly || streaming))
        throw new Error("Solo Queue Only and Streaming are available with Solo only.");
    const metadata: Dota2CalibrationQuoteMetadata = { previousRank: rankOption.label, previousDivision, rateCentsPerMatch: rankOption.rateCentsPerMatch };
    if (previousRank === "immortal")
        return { kind: "custom", customQuote: { ...metadata, reason: "immortal", message: "Custom quote required", supportingCopy: "Contact Support so we can confirm availability and pricing for Immortal calibration matches." } };
    if (behaviorOption.customQuote)
        return { kind: "custom", customQuote: { ...metadata, reason: "behavior-score", message: "Custom quote required", supportingCopy: "Contact Support so we can confirm availability and pricing for this Behavior Score range." } };
    const baseCents = rankOption.rateCentsPerMatch * matches;
    const breakdown: QuoteBreakdownItem[] = [{ label: `${matches} Calibration Match${matches === 1 ? "" : "es"} × $${(rankOption.rateCentsPerMatch / 100).toFixed(2)}`, amount: dollars(baseCents) }];
    const percentageLines: Array<{
        label: string;
        cents: number;
    }> = [];
    if (boostMethodOption.modifierPercent > 0)
        percentageLines.push(modifierLine(boostMethod === "duo" ? "Play With Booster" : boostMethodOption.label, baseCents, boostMethodOption.modifierPercent));
    if (behaviorOption.modifierPercent > 0)
        percentageLines.push(modifierLine("Behavior Score", baseCents, behaviorOption.modifierPercent));
    if (preferenceOption.modifierPercent > 0)
        percentageLines.push(modifierLine(preferenceOption.label, baseCents, preferenceOption.modifierPercent));
    if (soloQueueOnly)
        percentageLines.push(modifierLine(dota2ExtraOptions.soloQueueOnly.label, baseCents, dota2ExtraOptions.soloQueueOnly.modifierPercent));
    if (expressDelivery)
        percentageLines.push(modifierLine(dota2ExtraOptions.expressDelivery.label, baseCents, dota2ExtraOptions.expressDelivery.modifierPercent));
    const totalPercent = boostMethodOption.modifierPercent + behaviorOption.modifierPercent + preferenceOption.modifierPercent + (soloQueueOnly ? dota2ExtraOptions.soloQueueOnly.modifierPercent : 0) + (expressDelivery ? dota2ExtraOptions.expressDelivery.modifierPercent : 0);
    const combinedModifierCents = Math.round((baseCents * totalPercent) / 100), roundedLineTotal = percentageLines.reduce((s, l) => s + l.cents, 0);
    if (percentageLines.length > 0 && roundedLineTotal !== combinedModifierCents) {
        const i = percentageLines.length - 1;
        percentageLines[i] = { ...percentageLines[i], cents: percentageLines[i].cents + (combinedModifierCents - roundedLineTotal) };
    }
    breakdown.push(...percentageLines.map(l => ({ label: l.label, amount: dollars(l.cents) })));
    if (privacyMode)
        breakdown.push({ label: "Privacy Mode", amount: 0 });
    const streamingCents = streaming ? dota2ExtraOptions.streaming.fixedCents : 0;
    if (streaming)
        breakdown.push({ label: "Streaming", amount: dollars(streamingCents) });
    const totalCents = baseCents + combinedModifierCents + streamingCents, total = dollars(totalCents);
    return { kind: "quote", metadata, quote: { currency: "USD", subtotal: total, discount: 0, total, ruleSetVersion: VERSION, breakdown } };
}

