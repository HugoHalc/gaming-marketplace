import test from "node:test";
import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const original = Module._extensions[".ts"];
Module._extensions[".ts"] = (module, filename) => module._compile(
  ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  filename,
);
const {
  calculateRainbowSixSiegePlacementsPricing: calculate,
  R6_PLACEMENTS_REFERENCE_CENTS: reference,
  R6_PLACEMENTS_RULE_SET_VERSION: version,
} = require("../src/features/pricing/server/rainbow-six-siege-placements-pricing.ts");
const {
  progressiveDiscountBps, roundHalfUp,
} = require("../src/features/pricing/server/rainbow-six-siege-rank-pricing.ts");
const { meetsMinimumOrderTotal } = require("../src/features/orders/minimum-order.ts");
if (original) Module._extensions[".ts"] = original;
else delete Module._extensions[".ts"];

const defaults = {
  previousSeasonRank: "copper", games: 1, platform: "pc", gameMode: "solo",
  server: "north-america", playOffline: false, specificOperators: false,
  streaming: false, expressDelivery: false, highKillCount: false,
};
function price(overrides = {}) { return calculate({ ...defaults, ...overrides }); }
function cents(overrides = {}) { return price(overrides).metadata.finalTotalCents; }
function source(path) { return readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"); }

test("frozen permanent-discount benchmark covers all eight ranks and five game counts", () => {
  assert.equal(version, "rainbow-six-siege-placements-v1");
  assert.deepEqual(reference, {
    copper: [113, 225, 338, 450, 563],
    bronze: [113, 225, 338, 450, 563],
    silver: [113, 225, 338, 450, 563],
    gold: [150, 300, 450, 600, 750],
    platinum: [188, 375, 563, 750, 938],
    emerald: [338, 675, 1013, 1350, 1688],
    diamond: [450, 900, 1350, 1800, 2250],
    champion: [750, 1500, 2250, 3000, 3750],
  });
  assert.equal(price({ previousSeasonRank: "copper", games: 5 }).metadata.referenceCents, 563);
});

test("70% reference share, half-up cents, real totals and minimum eligibility", () => {
  for (const [rank, games, benchmark, expected, eligible] of [
    ["copper", 1, 113, 79, false],
    ["copper", 5, 563, 394, false],
    ["gold", 5, 750, 525, true],
    ["platinum", 3, 563, 394, false],
    ["emerald", 2, 675, 473, false],
    ["emerald", 3, 1013, 709, true],
    ["diamond", 5, 2250, 1575, true],
    ["champion", 5, 3750, 2625, true],
  ]) {
    const result = price({ previousSeasonRank: rank, games });
    assert.equal(result.metadata.referenceCents, benchmark);
    assert.equal(result.metadata.basePriceCents, roundHalfUp(benchmark * 7000, 10000));
    assert.equal(result.metadata.finalTotalCents, expected);
    assert.equal(result.quote.total, expected / 100);
    assert.equal(result.metadata.checkoutEligible, eligible);
    assert.equal(meetsMinimumOrderTotal(result.quote.total), eligible);
  }
});

test("platform, mode, region and paid extras use additive modifiers", () => {
  const gold = { previousSeasonRank: "gold", games: 5 };
  assert.equal(cents({ ...gold, platform: "xbox" }), 630);
  assert.equal(cents({ ...gold, platform: "playstation" }), 630);
  assert.equal(cents({ ...gold, gameMode: "duo" }), 945);
  assert.equal(cents({ ...gold, server: "oceania" }), 578);
  assert.equal(cents({ ...gold, streaming: true }), 578);
  assert.equal(cents({ ...gold, expressDelivery: true }), 630);
  assert.equal(cents({ ...gold, highKillCount: true }), 735);
  const extras = price({ ...gold, streaming: true, expressDelivery: true, highKillCount: true });
  assert.equal(extras.metadata.totalModifierBps, 7000);
  assert.equal(extras.metadata.finalTotalCents, 893);
  const together = price({ ...gold, platform: "xbox", gameMode: "duo", server: "oceania", streaming: true });
  assert.equal(together.metadata.totalModifierBps, 12000);
  assert.equal(together.metadata.finalTotalCents, 1155);
  assert.equal(cents({ ...gold, playOffline: true, specificOperators: true }), 525);
  assert.deepEqual(price({ ...gold, playOffline: true, specificOperators: true }).metadata.selectedCustomizationLabels, ["Play Offline", "Specific Operators"]);
});

test("modifiers can make a below-minimum order eligible without raising its displayed price", () => {
  const low = price({ previousSeasonRank: "emerald", games: 2 });
  const raised = price({ previousSeasonRank: "emerald", games: 2, streaming: true });
  assert.equal(low.quote.total, 4.73);
  assert.equal(low.metadata.checkoutEligible, false);
  assert.equal(raised.quote.total, 5.20);
  assert.equal(raised.metadata.checkoutEligible, true);
});

test("global progressive boundaries, one discount and line totals remain exact", () => {
  for (const [subtotal, bps] of [[4999, 0], [5000, 300], [9999, 300], [10000, 600], [14999, 600], [15000, 900], [19999, 900], [20000, 1200]]) {
    assert.equal(progressiveDiscountBps(subtotal), bps);
  }
  const result = price({ previousSeasonRank: "champion", games: 5, gameMode: "duo", platform: "xbox", streaming: true, highKillCount: true });
  const { metadata, quote } = result;
  assert.equal(metadata.totalModifierBps, 15000);
  assert.equal(metadata.preDiscountSubtotalCents, 6563);
  assert.equal(metadata.discountBps, 300);
  assert.equal(metadata.discountCents, 197);
  assert.equal(metadata.finalTotalCents, 6366);
  assert.equal(Math.round(quote.breakdown.reduce((sum, item) => sum + item.amount, 0) * 100), metadata.finalTotalCents);
  assert.equal(quote.ruleSetVersion, version);
});

test("invalid and incomplete selections cannot produce a quote", () => {
  for (const value of [0, -1, 1.5, 6, "2", null, undefined]) {
    assert.throws(() => price({ games: value }));
  }
  for (const bad of [
    { previousSeasonRank: "gold-v" }, { platform: "mobile" }, { gameMode: "pilot" },
    { server: "mars" }, { streaming: "true" }, { expressDelivery: 1 },
    { oneTrickPony: true }, { highKillCount: undefined }, { previousSeasonRank: undefined },
  ]) assert.throws(() => price(bad));
  assert.throws(() => calculate({ previousSeasonRank: "gold", games: 5 }));
  assert.throws(() => calculate(null));
});

test("quote, order, client and catalog preserve authoritative checkout rules", () => {
  const quote = source("app/api/rainbow-six-siege/placements-boost-quote/route.ts");
  const order = source("app/api/rainbow-six-siege/placements-boost-order/route.ts");
  const client = source("features/configurator/components/rainbow-six-siege-placements-configurator.tsx");
  const catalog = source("features/catalog/data/rainbow-six-siege-foundation.ts");
  assert.match(quote, /calculateRainbowSixSiegePlacementsPricing\(selection\)/);
  assert.match(order, /calculateRainbowSixSiegePlacementsPricing\(selection\)/);
  assert.match(order, /meetsMinimumOrderTotal\(result\.quote\.total\)/);
  assert.match(order, /quote: result\.quote/);
  assert.match(order, /pricingVersion: result\.metadata\.pricingVersion/);
  assert.match(order, /previousSeasonRankLabel: result\.metadata\.previousSeasonRankLabel/);
  assert.doesNotMatch(order, /body\.quote|body\.total/);
  assert.match(client, /const currentQuote = quoteIsCurrent \? quote : null/);
  assert.match(client, /!isLoading && !quoteError && quoteIsCurrent/);
  assert.match(client, /controller\.abort\(\)/);
  assert.match(client, /disabled=\{!canCheckout \|\| isCreatingOrder\}/);
  assert.match(client, /<MinimumOrderNotice/);
  assert.match(catalog, /slug: "unrated-matches"[\s\S]*?status: "active"/);
});
