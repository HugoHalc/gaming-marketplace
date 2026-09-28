import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateRainbowSixSiegeRankPricing,
  R6_RANK_BENCHMARK_CENTS,
  STREAMING_FIXED_CENTS,
} from "../src/features/pricing/server/rainbow-six-siege-rank-pricing.ts";
import {
  findRainbowSixSiegeServiceFoundation,
  isRainbowSixSiegeServiceActive,
} from "../src/features/catalog/data/rainbow-six-siege-foundation.ts";

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

test("Copper V to Copper IV is $3.28 and below the $5 minimum", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection());
  assert.equal(result.metadata.basePriceCents, 328);
  assert.equal(result.metadata.finalTotalCents, 328);
  assert.equal(500 - result.metadata.finalTotalCents, 172);
});

test("Copper V to Bronze V base is $16.42", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "bronze-v" }));
  assert.equal(result.metadata.basePriceCents, 1642);
  assert.equal(result.metadata.finalTotalCents, 1642);
});

test("Copper V to Diamond V receives the 12% progressive discount", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "diamond-v" }));
  assert.equal(result.metadata.basePriceCents, 22835);
  assert.equal(result.metadata.discountBps, 1200);
  assert.equal(result.metadata.finalTotalCents, 20095);
});

test("Copper V to Champion I receives the 12% progressive discount", () => {
  const result = calculateRainbowSixSiegeRankPricing(selection({ desiredRank: "champion-i" }));
  assert.equal(result.metadata.basePriceCents, 95144);
  assert.equal(result.metadata.discountBps, 1200);
  assert.equal(result.metadata.finalTotalCents, 83727);
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
  assert.equal(result.metadata.percentageAdjustedCents, 3990);
});

test("progressive discount uses subtotal after percentage and fixed charges", () => {
  const result = calculateRainbowSixSiegeRankPricing(
    selection({ desiredRank: "gold-v", platform: "xbox", streaming: true }),
  );
  assert.equal(result.metadata.preDiscountSubtotalCents, 7683);
  assert.equal(result.metadata.discountBps, 300);
  assert.equal(result.metadata.discountCents, 230);
  assert.equal(result.metadata.finalTotalCents, 7453);
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

test("Rank Boost is the only active Siege service", () => {
  assert.equal(isRainbowSixSiegeServiceActive("rank-boost"), true);
  assert.equal(isRainbowSixSiegeServiceActive("competitive-wins"), false);
  assert.equal(isRainbowSixSiegeServiceActive("placements-boost"), false);
  assert.equal(isRainbowSixSiegeServiceActive("unrated-matches"), false);
});

test("legacy provisional service slugs are rejected", () => {
  assert.equal(findRainbowSixSiegeServiceFoundation("ranked-wins"), undefined);
  assert.equal(findRainbowSixSiegeServiceFoundation("placement-matches"), undefined);
  assert.equal(findRainbowSixSiegeServiceFoundation("competitive-rewards"), undefined);
});

import { existsSync, readFileSync } from "node:fs";

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

test("unfinished Siege services do not have quote or order endpoints", () => {
  for (const slug of ["competitive-wins", "placements-boost", "unrated-matches"]) {
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
  assert.match(servicePageSource, /service\.slug !== "rank-boost"/);
  assert.match(servicePageSource, /notFound\(\)/);
});

test("order route never accepts a client quote or final total", () => {
  assert.doesNotMatch(orderRouteSource, /body\.quote/);
  assert.doesNotMatch(orderRouteSource, /body\.total/);
  assert.match(orderRouteSource, /quote: result\.quote/);
});
