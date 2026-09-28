import type { ConfiguratorSelection, QuoteBreakdownItem, QuotePreview } from "@/features/configurator/types/configurator";
import { DOTA2_CURRENT_MMR_MAX, DOTA2_CURRENT_MMR_MIN, DOTA2_IMMORTAL_MMR, dota2BehaviorScoreOptions, dota2MmrRankBands, getDota2MmrBracketName, dota2BoostMethodOptions, dota2ExtraOptions, dota2PreferenceOptions, dota2ServerOptions, type Dota2BehaviorScore, type Dota2BoostMethod, type Dota2Preference, type Dota2Server } from "@/features/configurator/data/dota-2-mmr-options";
import { DOTA2_NET_WINS_MAX, DOTA2_NET_WINS_MIN, type Dota2NetWinsCustomQuoteState, type Dota2NetWinsQuoteMetadata } from "@/features/configurator/data/dota-2-net-wins-options";
import { validateDota2PreferenceDetails, type Dota2PreferenceValidationMode } from "./dota-2-preference-validation";
const VERSION = "dota-2-net-wins-v2";
const rateCentsPerWinByBracket = { Herald: 150, Guardian: 150, Crusader: 160, Archon: 175, Legend: 190, Ancient: 210, Divine: 240 } as const;
const pricingBrackets = dota2MmrRankBands.map((band) => ({ ...band, rateCentsPerWin: rateCentsPerWinByBracket[band.name] }));
const ALLOWED_SELECTION_KEYS = new Set(["currentMmr", "netWins", "server", "behaviorScore", "boostMethod", "preference", "roles", "heroName", "privacyMode", "soloQueueOnly", "expressDelivery", "streaming"]);
function dollars(cents: number) { return cents / 100; }
function parseInteger(s: ConfiguratorSelection, k: string, min: number, max: number) { const v = s[k]; if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v) || v < min || v > max)
    throw new Error(`Invalid value for ${k}.`); return v; }
function parseString(s: ConfiguratorSelection, k: string) { const v = s[k]; if (typeof v !== "string" || !v.trim())
    throw new Error(`Invalid value for ${k}.`); return v; }
function parseBoolean(s: ConfiguratorSelection, k: string) { const v = s[k]; if (typeof v !== "boolean")
    throw new Error(`Invalid value for ${k}.`); return v; }
function optionValue<T extends {
    value: string;
}>(o: readonly T[], v: string, m: string): T { const x = o.find(i => i.value === v); if (!x)
    throw new Error(m); return x; }
function validateSelectionKeys(s: ConfiguratorSelection) { for (const k of Object.keys(s))
    if (!ALLOWED_SELECTION_KEYS.has(k))
        throw new Error("Invalid Dota 2 Net Wins selection."); }
function bracketForMmr(mmr: number) { const name = getDota2MmrBracketName(mmr); if (!name)
    throw new Error("Unable to determine Current MMR bracket."); if (mmr >= DOTA2_IMMORTAL_MMR || name === "Immortal")
    return { name: "Immortal", rateCentsPerWin: 0, customQuote: true } as const; const bracket = pricingBrackets.find(i => i.name === name); if (!bracket)
    throw new Error("Unable to determine Current MMR bracket."); return { ...bracket, customQuote: false } as const; }
function modifierLine(label: string, baseCents: number, percent: number) { return { label: `${label} (+${percent}%)`, cents: Math.round((baseCents * percent) / 100) }; }
export type Dota2NetWinsPricingResult = {
    kind: "quote";
    quote: QuotePreview;
    metadata: Dota2NetWinsQuoteMetadata;
} | {
    kind: "custom";
    customQuote: Dota2NetWinsCustomQuoteState;
};
export function calculateDota2NetWinsPricing(selection: ConfiguratorSelection, validationMode: Dota2PreferenceValidationMode = "order"): Dota2NetWinsPricingResult {
    validateSelectionKeys(selection);
    const currentMmr = parseInteger(selection, "currentMmr", DOTA2_CURRENT_MMR_MIN, DOTA2_CURRENT_MMR_MAX);
    const netWins = parseInteger(selection, "netWins", DOTA2_NET_WINS_MIN, DOTA2_NET_WINS_MAX);
    const server = parseString(selection, "server") as Dota2Server;
    optionValue(dota2ServerOptions, server, "Select a valid server.");
    const behaviorScore = parseString(selection, "behaviorScore") as Dota2BehaviorScore;
    const behaviorOption = optionValue(dota2BehaviorScoreOptions, behaviorScore, "Select a valid Behavior Score range.");
    const boostMethod = parseString(selection, "boostMethod") as Dota2BoostMethod;
    const boostMethodOption = optionValue(dota2BoostMethodOptions, boostMethod, "Select a valid boost method.");
    const preference = parseString(selection, "preference") as Dota2Preference;
    const preferenceOption = optionValue(dota2PreferenceOptions, preference, "Select a valid preference.");
    validateDota2PreferenceDetails(selection, preference, validationMode);
    const privacyMode = parseBoolean(selection, "privacyMode");
    const soloQueueOnly = parseBoolean(selection, "soloQueueOnly");
    const expressDelivery = parseBoolean(selection, "expressDelivery");
    const streaming = parseBoolean(selection, "streaming");
    if (boostMethod === "duo" && (soloQueueOnly || streaming))
        throw new Error("Solo Queue Only and Streaming are available with Solo only.");
    const bracket = bracketForMmr(currentMmr);
    const metadata: Dota2NetWinsQuoteMetadata = { currentBracket: bracket.name, rateCentsPerWin: bracket.rateCentsPerWin };
    if (bracket.customQuote)
        return { kind: "custom", customQuote: { ...metadata, reason: "immortal", message: "Immortal orders require a custom quote.", supportingCopy: "Contact Support so we can confirm availability and pricing for your Current MMR." } };
    if (behaviorOption.customQuote)
        return { kind: "custom", customQuote: { ...metadata, reason: "behavior-score", message: "This Behavior Score range requires a custom quote.", supportingCopy: "Contact Support so we can confirm availability and pricing for your order." } };
    const baseCents = bracket.rateCentsPerWin * netWins;
    const breakdown: QuoteBreakdownItem[] = [{ label: `${netWins} Net Win${netWins === 1 ? "" : "s"} × $${(bracket.rateCentsPerWin / 100).toFixed(2)}`, amount: dollars(baseCents) }];
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
    const combinedModifierCents = Math.round((baseCents * totalPercent) / 100);
    const roundedLineTotal = percentageLines.reduce((sum, line) => sum + line.cents, 0);
    if (percentageLines.length > 0 && roundedLineTotal !== combinedModifierCents) {
        const last = percentageLines.length - 1;
        percentageLines[last] = { ...percentageLines[last], cents: percentageLines[last].cents + (combinedModifierCents - roundedLineTotal) };
    }
    breakdown.push(...percentageLines.map(line => ({ label: line.label, amount: dollars(line.cents) })));
    if (privacyMode)
        breakdown.push({ label: dota2ExtraOptions.privacyMode.label, amount: 0 });
    const streamingCents = streaming ? dota2ExtraOptions.streaming.fixedCents : 0;
    if (streaming)
        breakdown.push({ label: dota2ExtraOptions.streaming.label, amount: dollars(streamingCents) });
    const totalCents = baseCents + combinedModifierCents + streamingCents, total = dollars(totalCents);
    return { kind: "quote", metadata, quote: { currency: "USD", subtotal: total, discount: 0, total, ruleSetVersion: VERSION, breakdown } };
}

