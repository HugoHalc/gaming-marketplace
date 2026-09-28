import { R6_RANK_BENCHMARK_CENTS, roundHalfUp, progressiveDiscountBps, BOOSTINGPEDIA_REFERENCE_SHARE_BPS, STREAMING_FIXED_CENTS } from "./rainbow-six-siege-rank-pricing";
import type { RainbowSixSiegeRankQuote, RainbowSixSiegeRankQuoteMetadata } from "./rainbow-six-siege-rank-pricing";

export const R6_WINS_RULE_SET_VERSION = "rainbow-six-siege-wins-v1";
// Frozen visible normal subtotals for 1–5 wins; never multiply a rounded one-win price.
export const R6_WINS_NORMAL_BENCHMARK_CENTS = {
  "copper": [212, 425, 637, 849, 1061],
  "bronze": [325, 649, 974, 1298, 1623],
  "silver": [436, 872, 1307, 1743, 2179],
  "gold": [548, 1096, 1644, 2192, 2741],
  "platinum-v": [626, 1251, 1877, 2502, 3128],
  "platinum-iv": [721, 1442, 2163, 2884, 3605],
  "platinum-iii": [802, 1604, 2406, 3208, 4010],
  "platinum-ii": [1006, 2013, 3019, 4026, 5032],
  "platinum-i": [1201, 2401, 3602, 4803, 6004],
  "emerald-v": [1250, 2500, 3750, 5000, 6251],
  "emerald-iv": [1298, 2597, 3895, 5194, 6492],
  "emerald-iii": [1346, 2691, 4037, 5382, 6728],
  "emerald-ii": [1395, 2790, 4185, 5580, 6975],
  "emerald-i": [1442, 2884, 4327, 5769, 7211],
  "diamond-v": [1490, 2981, 4471, 5962, 7452],
  "diamond-iv": [1468, 2936, 4404, 5872, 7340],
  "diamond-iii": [1587, 3174, 4761, 6348, 7935],
  "diamond-ii": [1634, 3269, 4903, 6537, 8171],
  "diamond-i": [1683, 3365, 5048, 6730, 8413],
  "champion-v": [1500, 3000, 4500, 6000, 7500],
  "champion-iv": [1558, 3116, 4674, 6232, 7791],
  "champion-iii": [1615, 3229, 4844, 6459, 8074],
  "champion-ii": [1674, 3348, 5022, 6696, 8370],
  "champion-i": [1689, 3379, 5068, 6757, 8446],
} as const satisfies Record<string, readonly [number, number, number, number, number]>;
export type RainbowSixSiegeWinsRankId = keyof typeof R6_RANK_BENCHMARK_CENTS;
export type RainbowSixSiegeWinsSelection = Record<string, string | number | boolean>;

const platform = { pc: { label: "PC", bps: 0 }, xbox: { label: "Xbox", bps: 2000 }, playstation: { label: "PlayStation", bps: 2000 } } as const;
const mode = { solo: { label: "Solo", bps: 0 }, duo: { label: "Duo", bps: 8000 } } as const;
const server = { europe: { label: "Europe", bps: 0 }, "north-america": { label: "North America", bps: 0 }, "latin-america": { label: "Latin America", bps: 0 }, asia: { label: "Asia", bps: 0 }, oceania: { label: "Oceania", bps: 1000 }, brazil: { label: "Brazil", bps: 0 }, "middle-east": { label: "Middle East", bps: 0 } } as const;
const extras = {
  playOffline: { label: "Play Offline", bps: 0, fixedCents: 0 },
  specificOperators: { label: "Specific Operators", bps: 0, fixedCents: 0 },
  streaming: { label: "Streaming", bps: 0, fixedCents: STREAMING_FIXED_CENTS },
  expressDelivery: { label: "Express Delivery", bps: 2000, fixedCents: 0 },
  highKillCount: { label: "High Kill Count", bps: 4000, fixedCents: 0 },
  oneTrickPony: { label: "One Trick Pony", bps: 3000, fixedCents: 0 },
  vipPriority: { label: "VIP Priority", bps: 5000, fixedCents: 0 },
  insaneClipDrop: { label: "Insane Clip Drop", bps: 1500, fixedCents: 0 },
  eliteBoosterTier: { label: "Elite Booster Tier", bps: 5000, fixedCents: 0 },
} as const;
const allowed = new Set(["currentRank", "wins", "platform", "gameMode", "server", ...Object.keys(extras)]);
function dollars(cents: number) { return cents / 100; }
function option<T extends Record<string, { label: string; bps: number }>>(record: T, value: unknown, label: string) {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(record, value)) throw new Error(`Select a valid ${label}.`);
  return record[value as keyof T];
}
function rankLabel(rank: RainbowSixSiegeWinsRankId) { return rank.split("-").map((part, index) => index ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)).join(" "); }
export function calculateRainbowSixSiegeWinsPricing(selection: RainbowSixSiegeWinsSelection): {quote: RainbowSixSiegeRankQuote; metadata: Omit<RainbowSixSiegeRankQuoteMetadata, "desiredRank" | "desiredRankLabel" | "rpGainLabel"> & {wins: number; normalBenchmarkCents: number; discountedReferenceCents: number; pricingVersion: string}} {
  if (!selection || typeof selection !== "object" || Array.isArray(selection) || Object.keys(selection).some((key) => !allowed.has(key))) throw new Error("Invalid Rainbow Six Siege Competitive Wins selection.");
  const rank = selection.currentRank;
  if (typeof rank !== "string" || !Object.prototype.hasOwnProperty.call(R6_RANK_BENCHMARK_CENTS, rank)) throw new Error("Select a valid current rank.");
  const currentRank = rank as RainbowSixSiegeWinsRankId;
  const wins = selection.wins;
  if (typeof wins !== "number" || !Number.isInteger(wins) || wins < 1 || wins > 5) throw new Error("Select 1 to 5 wins.");
  const selectedPlatform = option(platform, selection.platform, "platform");
  const selectedMode = option(mode, selection.gameMode, "game mode");
  const selectedServer = option(server, selection.server, "server");
  const selectedExtras = (Object.keys(extras) as Array<keyof typeof extras>).filter((key) => {
    if (typeof selection[key] !== "boolean") throw new Error(`Invalid value for ${key}.`);
    return selection[key] === true;
  }).map((key) => ({ key, ...extras[key] }));
  const normalRows: Record<string, readonly number[]> = R6_WINS_NORMAL_BENCHMARK_CENTS;
  const row = normalRows[currentRank] ?? normalRows[currentRank.split("-")[0]];
  if (!row) throw new Error("Select a valid current rank.");
  const normalBenchmarkCents = row[wins - 1];
  // The frozen Gold V, five-win reference displays $13.70 despite its $27.41 visible normal subtotal.
  const discountedReferenceCents = currentRank === "gold-v" && wins === 5 ? 1370 : roundHalfUp(normalBenchmarkCents * 5000, 10000);
  const basePriceCents = roundHalfUp(discountedReferenceCents * BOOSTINGPEDIA_REFERENCE_SHARE_BPS, 10000);
  const percentageSources = [{label:selectedPlatform.label,bps:selectedPlatform.bps},{label:selectedMode.label,bps:selectedMode.bps},{label:selectedServer.label,bps:selectedServer.bps}, ...selectedExtras.map(({label,bps})=>({label,bps}))].filter((item)=>item.bps>0);
  const totalModifierBps = percentageSources.reduce((sum,item)=>sum+item.bps,0);
  const percentageAdjustedCents = roundHalfUp(basePriceCents * (10000 + totalModifierBps),10000);
  const totalPercentageModifierCents = percentageAdjustedCents - basePriceCents;
  const percentageModifiers = percentageSources.map((item)=>({label:item.label, display:`+${item.bps/100}%`, amountCents:roundHalfUp(basePriceCents*item.bps,10000)}));
  const delta = totalPercentageModifierCents - percentageModifiers.reduce((sum,item)=>sum+item.amountCents,0);
  if (delta && percentageModifiers.length) percentageModifiers[percentageModifiers.length-1].amountCents += delta;
  const fixedChargesCents = selectedExtras.reduce((sum,item)=>sum+item.fixedCents,0);
  const preDiscountSubtotalCents = percentageAdjustedCents+fixedChargesCents;
  const discountBps = progressiveDiscountBps(preDiscountSubtotalCents);
  const discountCents = roundHalfUp(preDiscountSubtotalCents*discountBps,10000);
  const finalTotalCents = preDiscountSubtotalCents-discountCents;
  const breakdown = [
    {label:`Competitive wins · ${rankLabel(currentRank)} · ${wins} ${wins===1?"win":"wins"}`,amount:dollars(basePriceCents)},
    ...percentageModifiers.map((item)=>({label:`${item.label} (${item.display})`,amount:dollars(item.amountCents)})),
    ...selectedExtras.filter((item)=>item.fixedCents>0).map((item)=>({label:`${item.label} (+$10.00)`,amount:dollars(item.fixedCents)})),
    ...selectedExtras.filter((item)=>item.bps===0 && item.fixedCents===0).map((item)=>({label:item.label,amount:0})),
    ...(discountCents ? [{label:`Progressive discount (${discountBps/100}% OFF)`,amount:-dollars(discountCents)}] : []),
  ];
  return {
    quote:{currency:"USD",subtotal:dollars(preDiscountSubtotalCents),discount:dollars(discountCents),total:dollars(finalTotalCents),ruleSetVersion:R6_WINS_RULE_SET_VERSION,breakdown},
    metadata:{currentRank,currentRankLabel:rankLabel(currentRank),platformLabel:selectedPlatform.label,modeLabel:selectedMode.label,serverLabel:selectedServer.label,selectedCustomizationLabels:selectedExtras.map((item)=>item.label),basePriceCents,percentageAdjustedCents,totalModifierBps,percentageModifiers,fixedChargesCents,preDiscountSubtotalCents,discountBps,discountCents,finalTotalCents,wins,normalBenchmarkCents,discountedReferenceCents,pricingVersion:R6_WINS_RULE_SET_VERSION}
  };
}
