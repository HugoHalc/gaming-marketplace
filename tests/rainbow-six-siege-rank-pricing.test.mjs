import assert from "node:assert/strict";
import test from "node:test";
import {
  BOOSTING_MARKET_DISPLAY_DISCOUNT_BPS,
  BOOSTINGPEDIA_REFERENCE_SHARE_BPS,
  calculateDiscountedReferenceBaseCents,
  calculateRainbowSixSiegeRankPricing,
  R6_RANK_BENCHMARK_CENTS,
  R6_RANK_RULE_SET_VERSION,
  STREAMING_FIXED_CENTS,
} from "../src/features/pricing/server/rainbow-six-siege-rank-pricing.ts";
import {
  findRainbowSixSiegeServiceFoundation,
  isRainbowSixSiegeServiceActive,
} from "../src/features/catalog/data/rainbow-six-siege-foundation.ts";
import {
  estimateRainbowSixSiegeStartingTime,
  R6_STARTING_TIME_DISCLAIMER,
  R6_STARTING_TIME_RANGES,
} from "../src/features/configurator/data/rainbow-six-siege-starting-time.ts";

function selection(overrides = {}) {
  return {
    currentRank: "copper-v",
    desiredRank: "copper-iv",
    platform: "pc",
    gameMode: "solo",
    rpGain: "21-plus",
    server: "north-america",
    playOffline: false,
    specificOperators: false,
    streaming: false,
    expressDelivery: false,
    highKillCount: false,
    oneTrickPony: false,
    rankInsurance: false,
    vipPriority: false,
    insaneClipDrop: false,
    eliteBoosterTier: false,
    ...overrides,
  };
}

test("frozen benchmark table keeps the approved endpoints", () => {
  assert.equal(R6_RANK_BENCHMARK_CENTS["copper-v"], 0);
  assert.equal(R6_RANK_BENCHMARK_CENTS["champion-i"], 135920);
  assert.equal(Object.keys(R6_RANK_BENCHMARK_CENTS).length, 40);
});

test("Copper V to Copper IV uses two-stage discounted reference pricing and is below minimum", () => {
  const reference = calculateDiscountedReferenceBaseCents(469);
  const result = calculateRainbowSixSiegeRankPricing(selection());
  assert.equal(reference.normalBenchmarkCents, 469);
  assert.equal(reference.discountedReferenceCents, 235);
  assert.equal(reference.boostingPediaBaseCents, 165);
  assert.equal(result.metadata.basePriceCents, 165);
  assert.equal(result.metadata.finalTotalCents, 165);
  assert.equal(500 - result.metadata.finalTotalCents, 335);
});

test("Copper V to Bronze V base is $8.21", () => {
  const reference = calculateDiscountedReferenceBaseCents(2345);
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v" }));
  assert.equal(reference.discountedReferenceCents, 1173);
  assert.equal(reference.boostingPediaBaseCents, 821);
  assert.equal(result.metadata.basePriceCents, 821);
  assert.equal(result.metadata.finalTotalCents, 821);
});

test("Copper V to Diamond V uses a 6% progressive discount", () => {
  const reference = calculateDiscountedReferenceBaseCents(32621);
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "diamond-v" }));
  assert.equal(reference.discountedReferenceCents, 16311);
  assert.equal(reference.boostingPediaBaseCents, 11418);
  assert.equal(result.metadata.basePriceCents, 11418);
  assert.equal(result.metadata.discountBps, 600);
  assert.equal(result.metadata.finalTotalCents, 10733);
});

test("Copper V to Champion I keeps the 12% progressive discount", () => {
  const reference = calculateDiscountedReferenceBaseCents(135920);
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "champion-i" }));
  assert.equal(reference.discountedReferenceCents, 67960);
  assert.equal(reference.boostingPediaBaseCents, 47572);
  assert.equal(result.metadata.basePriceCents, 47572);
  assert.equal(result.metadata.discountBps, 1200);
  assert.equal(result.metadata.finalTotalCents, 41863);
});

test("reference pricing constants are the approved integer basis points", () => {
  assert.equal(BOOSTING_MARKET_DISPLAY_DISCOUNT_BPS, 5000);
  assert.equal(BOOSTINGPEDIA_REFERENCE_SHARE_BPS, 7000);
  assert.equal(R6_RANK_RULE_SET_VERSION, "rainbow-six-siege-rank-v2");
});

test("PlayStation applies exactly +20%", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", platform: "playstation" }));
  assert.equal(result.metadata.totalModifierBps, 2000);
});

test("Xbox applies exactly +20%", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", platform: "xbox" }));
  assert.equal(result.metadata.totalModifierBps, 2000);
});

test("Oceania applies exactly +10%", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", server: "oceania" }));
  assert.equal(result.metadata.totalModifierBps, 1000);
});

test("Copper V to Bronze V with PlayStation and Oceania is $10.67", () => {
  const result = calculateRainbowSixSiegeRankPricing(
    selection({ desiredRank: "bronze-v", platform: "playstation", server: "oceania" }),
  );
  assert.equal(result.metadata.basePriceCents, 821);
  assert.equal(result.metadata.totalModifierBps, 3000);
  assert.equal(result.metadata.percentageAdjustedCents, 1067);
  assert.equal(result.metadata.finalTotalCents, 1067);
});

test("11–20 RP applies exactly +36%", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", rpGain: "11-20" }));
  assert.equal(result.metadata.totalModifierBps, 3600);
});

test("1–10 RP applies exactly +50%", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", rpGain: "1-10" }));
  assert.equal(result.metadata.totalModifierBps, 5000);
});

test("Duo applies exactly +57%", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", gameMode: "duo" }));
  assert.equal(result.metadata.totalModifierBps, 5700);
});

test("Streaming adds exactly $10.00 as a fixed charge", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", streaming: true }));
  assert.equal(STREAMING_FIXED_CENTS, 1000);
  assert.equal(result.metadata.fixedChargesCents, 1000);
});

test("percentage modifiers are additive rather than compounded", () => {
  const result = calculateRainbowSixSiegeRankPricing(
    selection({
      desiredRank: "bronze-v",
      platform: "xbox",
      gameMode: "duo",
      rpGain: "11-20",
      server: "oceania",
      expressDelivery: true,
    }),
  );
  assert.equal(result.metadata.totalModifierBps, 14300);
  assert.equal(result.metadata.percentageAdjustedCents, 1995);
});

test("progressive discount still uses subtotal after percentage and fixed charges", () => {
  const result = calculateRainbowSixSiegeRankPricing(
    selection({ desiredRank: "gold-v", platform: "xbox", streaming: true }),
  );
  assert.equal(result.metadata.preDiscountSubtotalCents, 4342);
  assert.equal(result.metadata.discountBps, 0);
  assert.equal(result.metadata.discountCents, 0);
  assert.equal(result.metadata.finalTotalCents, 4342);
});

test("PlayStation plus Oceania plus Streaming is $20.67", () => {
  const result = calculateRainbowSixSiegeRankPricing(
    selection({
      desiredRank: "bronze-v",
      platform: "playstation",
      server: "oceania",
      streaming: true,
    }),
  );
  assert.equal(result.metadata.basePriceCents, 821);
  assert.equal(result.metadata.percentageAdjustedCents, 1067);
  assert.equal(result.metadata.fixedChargesCents, 1000);
  assert.equal(result.metadata.preDiscountSubtotalCents, 2067);
  assert.equal(result.metadata.finalTotalCents, 2067);
});

test("desired rank equal to current rank is rejected", () => {
  assert.throws(
    () => calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "copper-v" })),
    /Desired rank must be above current rank/,
  );
});

test("desired rank below current rank is rejected", () => {
  assert.throws(
    () => calculateRainbowSixSiegeRankPricing(selection({ currentRank: "bronze-v", desiredRank: "copper-i" })),
    /Desired rank must be above current rank/,
  );
});

test("unknown rank is rejected", () => {
  assert.throws(
    () => calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "legend-i" })),
    /valid Rainbow Six Siege ranks/,
  );
});

test("unknown platform is rejected", () => {
  assert.throws(() => calculateRainbowSixSiegeRankPricing(selection({ platform: "switch" })), /valid platform/);
});

test("unknown server is rejected", () => {
  assert.throws(() => calculateRainbowSixSiegeRankPricing(selection({ server: "moon" })), /valid server/);
});

test("unknown RP gain is rejected", () => {
  assert.throws(() => calculateRainbowSixSiegeRankPricing(selection({ rpGain: "99" })), /valid RP gain/);
});

test("unknown mode is rejected", () => {
  assert.throws(() => calculateRainbowSixSiegeRankPricing(selection({ gameMode: "squad" })), /valid game mode/);
});

test("unknown selection keys and client price tampering are rejected", () => {
  assert.throws(
    () => calculateRainbowSixSiegeRankPricing(selection({ total: 1 })),
    /Invalid Rainbow Six Siege Rank Boost selection/,
  );
});

test("all customization values must be booleans", () => {
  assert.throws(
    () => calculateRainbowSixSiegeRankPricing(selection({ rankInsurance: "true" })),
    /Invalid value for rankInsurance/,
  );
});

test("Rank Boost, Competitive Wins and Placements Boost are active Siege services", () => {
  assert.equal(isRainbowSixSiegeServiceActive("rank-boost"), true);
  assert.equal(isRainbowSixSiegeServiceActive("competitive-wins"), true);
  assert.equal(isRainbowSixSiegeServiceActive("placements-boost"), true);
  assert.equal(isRainbowSixSiegeServiceActive("unrated-matches"), false);
});

test("legacy provisional service slugs are rejected", () => {
  assert.equal(findRainbowSixSiegeServiceFoundation("ranked-wins"), undefined);
  assert.equal(findRainbowSixSiegeServiceFoundation("placement-matches"), undefined);
  assert.equal(findRainbowSixSiegeServiceFoundation("competitive-rewards"), undefined);
});

import { existsSync, readFileSync } from "node:fs";


const pricingSource = readFileSync(
  new URL("../src/features/pricing/server/rainbow-six-siege-rank-pricing.ts", import.meta.url),
  "utf8",
);
const configuratorSource = readFileSync(
  new URL("../src/features/configurator/components/rainbow-six-siege-rank-configurator.tsx", import.meta.url),
  "utf8",
);
const quoteRouteSource = readFileSync(
  new URL("../src/app/api/rainbow-six-siege/rank-boost-quote/route.ts", import.meta.url),
  "utf8",
);
const orderRouteSource = readFileSync(
  new URL("../src/app/api/rainbow-six-siege/rank-boost-order/route.ts", import.meta.url),
  "utf8",
);
const servicePageSource = readFileSync(
  new URL("../src/app/games/rainbow-six-siege/[service]/page.tsx", import.meta.url),
  "utf8",
);

test("quote route recalculates through the centralized server pricing module", () => {
  assert.match(quoteRouteSource, /calculateRainbowSixSiegeRankPricing\(selection\)/);
  assert.match(quoteRouteSource, /key !== "selection"/);
});

test("order route recalculates pricing and enforces the global minimum before creation", () => {
  const pricingIndex = orderRouteSource.indexOf("calculateRainbowSixSiegeRankPricing(selection)");
  const minimumIndex = orderRouteSource.indexOf("meetsMinimumOrderTotal(result.quote.total)");
  const createIndex = orderRouteSource.indexOf("createServerValidatedOrder");
  assert.ok(pricingIndex >= 0);
  assert.ok(minimumIndex > pricingIndex);
  assert.ok(createIndex >= 0);
  assert.match(orderRouteSource, /key !== "selection"/);
});

test("Unrated Matches does not have quote or order endpoints", () => {
  for (const slug of ["unrated-matches"]) {
    assert.equal(
      existsSync(new URL(`../src/app/api/rainbow-six-siege/${slug}-quote`, import.meta.url)),
      false,
    );
    assert.equal(
      existsSync(new URL(`../src/app/api/rainbow-six-siege/${slug}-order`, import.meta.url)),
      false,
    );
  }
});

test("service route rejects inactive and unknown Siege services", () => {
  assert.match(servicePageSource, /service\.status !== "active"/);
  assert.match(servicePageSource, /service\.slug === "rank-boost"/);
  assert.match(servicePageSource, /service\.slug === "competitive-wins"/);
  assert.match(servicePageSource, /RainbowSixSiegePlacementsConfigurator/);
  assert.match(servicePageSource, /notFound\(\)/);
});

test("order route never accepts a client quote or final total", () => {
  assert.doesNotMatch(orderRouteSource, /body\.quote/);
  assert.doesNotMatch(orderRouteSource, /body\.total/);
  assert.match(orderRouteSource, /quote: result\.quote/);
});


test("pricing uses mandatory two-stage rounding and not a direct 35 percent multiplier", () => {
  assert.match(pricingSource, /normalBenchmarkCents \* BOOSTING_MARKET_DISPLAY_DISCOUNT_BPS/);
  assert.match(pricingSource, /discountedReferenceCents \* BOOSTINGPEDIA_REFERENCE_SHARE_BPS/);
  assert.doesNotMatch(pricingSource, /0\.35|\*\s*35\s*[,/)]|3500/);
});

test("quote and order creation both use the centralized v2 pricing result", () => {
  assert.match(quoteRouteSource, /calculateRainbowSixSiegeRankPricing\(selection\)/);
  assert.match(orderRouteSource, /calculateRainbowSixSiegeRankPricing\(selection\)/);
  assert.match(pricingSource, /rainbow-six-siege-rank-v2/);
});

test("Verify your order renders the server quote total", () => {
  assert.match(configuratorSource, /Verify your order/);
  assert.match(configuratorSource, /formatUsd\(quote\.total\)/);
});

test("below-minimum checkout remains guarded by the existing global minimum helper", () => {
  assert.match(configuratorSource, /!meetsMinimumOrderTotal\(currentQuote\.total\)/);
  assert.match(configuratorSource, /disabled=\{!canCheckout \|\| isCreatingOrder\}/);
});


test("default Siege configuration estimates 1–3 hours", () => {
  const result = estimateRainbowSixSiegeStartingTime(
    selection({ desiredRank: "bronze-v" }),
  );
  assert.equal(result.category, "standard");
  assert.equal(result.range, "1–3 hours");
});

test("Express Delivery reduces standard to priority", () => {
  const result = estimateRainbowSixSiegeStartingTime(
    selection({ desiredRank: "bronze-v", expressDelivery: true }),
  );
  assert.equal(result.category, "priority");
  assert.equal(result.range, "30–90 minutes");
});

test("desired Platinum estimates 3–6 hours", () => {
  assert.equal(
    estimateRainbowSixSiegeStartingTime(selection({ desiredRank: "platinum-v" })).range,
    "3–6 hours",
  );
});

test("desired Diamond estimates 3–6 hours", () => {
  assert.equal(
    estimateRainbowSixSiegeStartingTime(selection({ desiredRank: "diamond-v" })).range,
    "3–6 hours",
  );
});

test("desired Champion estimates 6–12 hours", () => {
  assert.equal(
    estimateRainbowSixSiegeStartingTime(selection({ desiredRank: "champion-v" })).range,
    "6–12 hours",
  );
});

test("Champion plus Duo plus 1–10 RP caps at 12–24 hours", () => {
  const result = estimateRainbowSixSiegeStartingTime(
    selection({ desiredRank: "champion-v", gameMode: "duo", rpGain: "1-10" }),
  );
  assert.equal(result.complexityScore, 6);
  assert.equal(result.range, "12–24 hours");
});

test("PlayStation plus Oceania estimates 3–6 hours", () => {
  assert.equal(
    estimateRainbowSixSiegeStartingTime(
      selection({ desiredRank: "bronze-v", platform: "playstation", server: "oceania" }),
    ).range,
    "3–6 hours",
  );
});

test("Streaming plus High Kill Count plus Elite Booster Tier estimates 6–12 hours", () => {
  assert.equal(
    estimateRainbowSixSiegeStartingTime(
      selection({
        desiredRank: "bronze-v",
        streaming: true,
        highKillCount: true,
        eliteBoosterTier: true,
      }),
    ).range,
    "6–12 hours",
  );
});

test("starting-time estimate caps at 12–24 hours above five complexity points", () => {
  const result = estimateRainbowSixSiegeStartingTime(
    selection({
      desiredRank: "champion-i",
      platform: "playstation",
      gameMode: "duo",
      rpGain: "1-10",
      server: "oceania",
      streaming: true,
      highKillCount: true,
      oneTrickPony: true,
      eliteBoosterTier: true,
    }),
  );
  assert.ok(result.complexityScore > 5);
  assert.equal(result.category, "limited");
  assert.equal(result.range, R6_STARTING_TIME_RANGES.limited);
});

test("Express Delivery reduces limited to specialist", () => {
  const result = estimateRainbowSixSiegeStartingTime(
    selection({
      desiredRank: "champion-v",
      gameMode: "duo",
      rpGain: "1-10",
      expressDelivery: true,
    }),
  );
  assert.equal(result.complexityScore, 6);
  assert.equal(result.category, "specialist");
  assert.equal(result.range, "6–12 hours");
});

test("rank distance alone does not change starting-time category", () => {
  const shortDistance = estimateRainbowSixSiegeStartingTime(
    selection({ currentRank: "gold-iv", desiredRank: "gold-i" }),
  );
  const longDistance = estimateRainbowSixSiegeStartingTime(
    selection({ currentRank: "copper-v", desiredRank: "gold-i" }),
  );
  assert.equal(shortDistance.complexityScore, 0);
  assert.equal(longDistance.complexityScore, 0);
  assert.equal(shortDistance.range, longDistance.range);
});

test("unknown normalized starting-time values are rejected", () => {
  assert.throws(
    () => estimateRainbowSixSiegeStartingTime(selection({ platform: "switch" })),
    /valid platform/,
  );
  assert.throws(
    () => estimateRainbowSixSiegeStartingTime(selection({ desiredRank: "legend-i" })),
    /valid Rainbow Six Siege rank progression/,
  );
});

test("starting-time disclaimer uses the approved public copy", () => {
  assert.equal(
    R6_STARTING_TIME_DISCLAIMER,
    "Estimate based on your configuration and current booster availability. Actual start time may vary.",
  );
});

const rootLayoutSource = readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);
const siegeOverviewSource = readFileSync(
  new URL("../src/app/games/rainbow-six-siege/page.tsx", import.meta.url),
  "utf8",
);

test("Rank Boost metadata relies on the root title template exactly once", () => {
  assert.match(rootLayoutSource, /template: `%s \| \$\{siteConfig\.name\}`/);
  assert.match(servicePageSource, /title: `Rainbow Six Siege \$\{service\.name\}`/);
  assert.doesNotMatch(servicePageSource, /Rainbow Six Siege Rank Boost \| BoostingPedia/);
});

test("Siege overview keeps its absolute title and customer-facing copy", () => {
  assert.match(
    siegeOverviewSource,
    /absolute: "Rainbow Six Siege Boosting Services \| BoostingPedia"/,
  );
  for (const copy of [
    "Choose the Siege service that matches your goal. Configure Rank Boost, Competitive Wins or Placements Boost now. Unrated Matches is coming soon.",
    "Built for competitive progression",
    "A clearer way to configure your Siege service.",
    "Review your goal, customize the service, and see your updated price before continuing to checkout.",
    "Ranked progression",
    "Focused service options",
    "Transparent configuration",
  ]) {
    assert.ok(siegeOverviewSource.includes(copy), copy);
  }
  for (const internalCopy of [
    "implemented",
    "rollout",
    "server-authoritative",
    "pricing and configurators",
    "future service rules",
    "rules remain isolated",
  ]) {
    assert.equal(siegeOverviewSource.toLowerCase().includes(internalCopy), false, internalCopy);
  }
});

test("all Rainbow Six Siege modifiers remain priceable and reversible after discounted-reference pricing", () => {
  const base = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v" }));
  assert.equal(base.metadata.finalTotalCents, 821);

  const cases = [
    ["Xbox", { platform: "xbox" }, 985, "Xbox (+20%)"],
    ["PlayStation", { platform: "playstation" }, 985, "PlayStation (+20%)"],
    ["Duo", { gameMode: "duo" }, 1289, "Duo (+57%)"],
    ["11–20 RP", { rpGain: "11-20" }, 1117, "11–20 RP (+36%)"],
    ["1–10 RP", { rpGain: "1-10" }, 1232, "1–10 RP (+50%)"],
    ["Oceania", { server: "oceania" }, 903, "Oceania (+10%)"],
    ["Streaming", { streaming: true }, 1821, "Streaming (+$10.00)"],
    ["Express Delivery", { expressDelivery: true }, 985, "Express Delivery (+20%)"],
    ["High Kill Count", { highKillCount: true }, 1149, "High Kill Count (+40%)"],
    ["One Trick Pony", { oneTrickPony: true }, 1067, "One Trick Pony (+30%)"],
    ["Rank Insurance", { rankInsurance: true }, 1232, "Rank Insurance (+50%)"],
    ["VIP Priority", { vipPriority: true }, 1232, "VIP Priority (+50%)"],
    ["Insane Clip Drop", { insaneClipDrop: true }, 944, "Insane Clip Drop (+15%)"],
    ["Elite Booster Tier", { eliteBoosterTier: true }, 1232, "Elite Booster Tier (+50%)"],
  ];

  for (const [label, override, expectedCents, breakdownLabel] of cases) {
    const modified = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", ...override }));
    assert.equal(modified.metadata.finalTotalCents, expectedCents, label);
    assert.ok(modified.quote.breakdown.some((item) => item.label === breakdownLabel), label);
    const restored = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v" }));
    assert.equal(restored.metadata.finalTotalCents, 821, `${label} removal`);
  }
});

test("Rainbow Six Siege verified modifier sequence remains stable", () => {
  assert.equal(calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v" })).metadata.finalTotalCents, 821);
  assert.equal(calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", expressDelivery: true })).metadata.finalTotalCents, 985);
  assert.equal(calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", expressDelivery: true, streaming: true })).metadata.finalTotalCents, 1985);
  assert.equal(calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", expressDelivery: true, streaming: true, highKillCount: true })).metadata.finalTotalCents, 2314);
  assert.equal(calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", expressDelivery: true, streaming: true, highKillCount: true, oneTrickPony: true })).metadata.finalTotalCents, 2560);
});

test("Rainbow Six Siege free options do not change the price", () => {
  const base = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v" }));
  const free = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v", playOffline: true, specificOperators: true }));
  assert.equal(free.metadata.finalTotalCents, base.metadata.finalTotalCents);
  assert.ok(free.quote.breakdown.some((item) => item.label === "Play Offline" && item.amount === 0));
  assert.ok(free.quote.breakdown.some((item) => item.label === "Specific Operators" && item.amount === 0));
});
