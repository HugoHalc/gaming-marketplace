import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const originalResolveFilename = Module._resolveFilename;
const originalLoad = Module._load;
const originalTsLoader = Module._extensions[".ts"];

const mmrRankBands = [
  { name: "Herald", start: 0, end: 770 },
  { name: "Guardian", start: 770, end: 1540 },
  { name: "Crusader", start: 1540, end: 2310 },
  { name: "Archon", start: 2310, end: 3080 },
  { name: "Legend", start: 3080, end: 3850 },
  { name: "Ancient", start: 3850, end: 4620 },
  { name: "Divine", start: 4620, end: 5620 },
];
const mmrOptionsFixture = {
  DOTA2_CURRENT_MMR_MIN: 0, DOTA2_CURRENT_MMR_MAX: 11999,
  DOTA2_TARGET_MMR_MIN: 1, DOTA2_TARGET_MMR_MAX: 12000,
  DOTA2_MAX_ROLE_PREFERENCES: 2, DOTA2_IMMORTAL_MMR: 5620,
  dota2MmrRankBands: mmrRankBands,
  getDota2MmrBracketName(mmr) {
    if (!Number.isInteger(mmr) || mmr < 0 || mmr > 12000) return null;
    if (mmr >= 5620) return "Immortal";
    return mmrRankBands.find((band) => mmr >= band.start && mmr < band.end)?.name ?? null;
  },
  dota2ServerOptions: ["us-east", "us-west", "south-america", "europe-west", "europe-east", "russia", "southeast-asia", "australia"].map((value) => ({ value, label: value })),
  dota2BehaviorScoreOptions: [
    { value: "8000-12000", label: "8,000–12,000", modifierPercent: 0, customQuote: false },
    { value: "6000-7999", label: "6,000–7,999", modifierPercent: 15, customQuote: false },
    { value: "4000-5999", label: "4,000–5,999", modifierPercent: 25, customQuote: false },
    { value: "below-4000", label: "Below 4,000", modifierPercent: 0, customQuote: true },
  ],
  dota2BoostMethodOptions: [
    { value: "solo", label: "Solo", modifierPercent: 0 },
    { value: "duo", label: "Duo", modifierPercent: 75 },
  ],
  dota2PreferenceOptions: [
    { value: "none", label: "No Preference", modifierPercent: 0 },
    { value: "roles", label: "Specific Roles", modifierPercent: 10 },
    { value: "hero", label: "Specific Hero", modifierPercent: 20 },
  ],
  dota2RoleOptions: ["carry", "mid", "offlane", "soft-support", "hard-support"].map((value) => ({ value, label: value })),
  dota2ExtraOptions: {
    privacyMode: { label: "Privacy Mode", modifierPercent: 0, fixedCents: 0 },
    soloQueueOnly: { label: "Solo Queue Only", modifierPercent: 20, fixedCents: 0 },
    expressDelivery: { label: "Express Delivery", modifierPercent: 20, fixedCents: 0 },
    streaming: { label: "Streaming", modifierPercent: 0, fixedCents: 1000 },
  },
};
const netWinsOptionsFixture = {
  DOTA2_NET_WINS_MIN: 1, DOTA2_NET_WINS_MAX: 20,
};
const calibrationOptionsFixture = {
  DOTA2_RANK_CONFIDENCE_MIN: 0, DOTA2_RANK_CONFIDENCE_MAX: 100,
  DOTA2_CALIBRATION_MATCHES_MIN: 1, DOTA2_CALIBRATION_MATCHES_MAX: 30,
  dota2CalibrationRankOptions: [
    { value: "herald", label: "Herald", rateCentsPerMatch: 150 },
    { value: "guardian", label: "Guardian", rateCentsPerMatch: 150 },
    { value: "crusader", label: "Crusader", rateCentsPerMatch: 160 },
    { value: "archon", label: "Archon", rateCentsPerMatch: 170 },
    { value: "legend", label: "Legend", rateCentsPerMatch: 180 },
    { value: "ancient", label: "Ancient", rateCentsPerMatch: 200 },
    { value: "divine", label: "Divine", rateCentsPerMatch: 225 },
    { value: "immortal", label: "Immortal", rateCentsPerMatch: 0 },
  ],
  dota2CalibrationDivisionOptions: ["I", "II", "III", "IV", "V"],
};
const heroLevelOptionsFixture = {
  DOTA2_HERO_NAME_MAX_LENGTH: 64,
  DOTA2_CURRENT_HERO_LEVEL_MIN: 1, DOTA2_CURRENT_HERO_LEVEL_MAX: 39,
  DOTA2_TARGET_HERO_LEVEL_MIN: 2, DOTA2_TARGET_HERO_LEVEL_MAX: 40,
  dota2HeroLevelRateBands: [
    { start: 2, end: 5, rateCentsPerLevel: 300 },
    { start: 6, end: 10, rateCentsPerLevel: 350 },
    { start: 11, end: 20, rateCentsPerLevel: 400 },
    { start: 21, end: 30, rateCentsPerLevel: 500 },
    { start: 31, end: 40, rateCentsPerLevel: 600 },
  ],
};
const runtimeFixtures = new Map([
  ["@/features/configurator/data/dota-2-mmr-options", mmrOptionsFixture],
  ["@/features/configurator/data/dota-2-net-wins-options", netWinsOptionsFixture],
  ["@/features/configurator/data/dota-2-calibration-options", calibrationOptionsFixture],
  ["@/features/configurator/data/dota-2-hero-level-options", heroLevelOptionsFixture],
]);
Module._load = function loadRepositoryModule(request, parent, isMain) {
  if (runtimeFixtures.has(request)) return runtimeFixtures.get(request);
  return originalLoad.call(this, request, parent, isMain);
};

Module._resolveFilename = function resolveRepositoryAlias(request, parent, isMain, options) {
  const resolvedRequest = request.startsWith("@/")
    ? path.join(repoRoot, "src", request.slice(2))
    : request;
  return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
};

Module._extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
  });
  module._compile(output.outputText, filename);
};

const { calculateDota2MmrPricing } = require(
  "../src/features/pricing/server/dota-2-mmr-pricing.ts",
);
const { calculateDota2NetWinsPricing } = require(
  "../src/features/pricing/server/dota-2-net-wins-pricing.ts",
);
const { calculateDota2CalibrationPricing } = require(
  "../src/features/pricing/server/dota-2-calibration-pricing.ts",
);
process.on("exit", () => {
  Module._resolveFilename = originalResolveFilename;
  Module._load = originalLoad;
  if (originalTsLoader) Module._extensions[".ts"] = originalTsLoader;
  else delete Module._extensions[".ts"];
});

function mmrSelection(overrides = {}) {
  return {
    currentMmr: 1000,
    targetMmr: 2000,
    server: "europe-west",
    behaviorScore: "8000-12000",
    boostMethod: "solo",
    preference: "none",
    roles: "",
    heroName: "",
    privacyMode: false,
    soloQueueOnly: false,
    expressDelivery: false,
    streaming: false,
    ...overrides,
  };
}

function netWinsSelection(overrides = {}) {
  return {
    currentMmr: 1000,
    netWins: 5,
    server: "europe-west",
    behaviorScore: "8000-12000",
    boostMethod: "solo",
    preference: "none",
    roles: "",
    heroName: "",
    privacyMode: false,
    soloQueueOnly: false,
    expressDelivery: false,
    streaming: false,
    ...overrides,
  };
}

function calibrationSelection(overrides = {}) {
  return {
    previousRank: "legend",
    previousDivision: "III",
    rankConfidence: 30,
    matches: 5,
    server: "europe-west",
    behaviorScore: "8000-12000",
    boostMethod: "solo",
    preference: "none",
    roles: "",
    heroName: "",
    privacyMode: false,
    soloQueueOnly: false,
    expressDelivery: false,
    streaming: false,
    ...overrides,
  };
}


function quoteTotal(result) {
  assert.equal(result.kind, "quote");
  return result.quote.total;
}

function breakdownLabel(result, pattern) {
  assert.equal(result.kind, "quote");
  assert.ok(result.quote.breakdown.some((item) => pattern.test(item.label)), pattern.toString());
}

test("MMR verified modifier totals remain unchanged", () => {
  assert.equal(quoteTotal(calculateDota2MmrPricing(mmrSelection())), 32.92);
  assert.equal(
    quoteTotal(calculateDota2MmrPricing(mmrSelection({ behaviorScore: "6000-7999" }))),
    37.86,
  );
  assert.equal(
    quoteTotal(
      calculateDota2MmrPricing(
        mmrSelection({ behaviorScore: "6000-7999", soloQueueOnly: true }),
      ),
    ),
    44.44,
  );
  assert.equal(
    quoteTotal(calculateDota2MmrPricing(mmrSelection({ boostMethod: "duo" }))),
    57.61,
  );
  assert.equal(
    quoteTotal(
      calculateDota2MmrPricing(
        mmrSelection({
          boostMethod: "duo",
          preference: "roles",
          roles: "carry",
          expressDelivery: true,
        }),
      ),
    ),
    67.49,
  );
});

test("MMR Specific Roles is priceable before a role is selected but not orderable", () => {
  const incomplete = mmrSelection({ preference: "roles", roles: "" });
  const quoteResult = calculateDota2MmrPricing(incomplete, "quote");
  assert.equal(quoteTotal(quoteResult), 36.21);
  breakdownLabel(quoteResult, /Specific Roles \(\+10%\)/);
  assert.throws(
    () => calculateDota2MmrPricing(incomplete),
    /Select at least one role to continue/,
  );
  assert.equal(
    quoteTotal(calculateDota2MmrPricing({ ...incomplete, roles: "carry" })),
    36.21,
  );
});

test("MMR Specific Hero is priceable before a hero is entered but not orderable", () => {
  const incomplete = mmrSelection({ preference: "hero", heroName: "" });
  const quoteResult = calculateDota2MmrPricing(incomplete, "quote");
  assert.equal(quoteTotal(quoteResult), 39.5);
  breakdownLabel(quoteResult, /Specific Hero \(\+20%\)/);
  assert.throws(() => calculateDota2MmrPricing(incomplete), /Select a hero to continue/);
  assert.equal(
    quoteTotal(calculateDota2MmrPricing({ ...incomplete, heroName: "Puck" })),
    39.5,
  );
});

test("Net Wins fixed-dollar, free, percentage, and removal behavior remain correct", () => {
  assert.equal(quoteTotal(calculateDota2NetWinsPricing(netWinsSelection())), 7.5);
  const streaming = calculateDota2NetWinsPricing(netWinsSelection({ streaming: true }));
  assert.equal(quoteTotal(streaming), 17.5);
  breakdownLabel(streaming, /Streaming/);
  assert.equal(
    quoteTotal(calculateDota2NetWinsPricing(netWinsSelection({ privacyMode: true }))),
    7.5,
  );
  const incomplete = netWinsSelection({ preference: "roles" });
  const quoteResult = calculateDota2NetWinsPricing(incomplete, "quote");
  assert.equal(quoteTotal(quoteResult), 8.25);
  breakdownLabel(quoteResult, /Specific Roles \(\+10%\)/);
  assert.throws(
    () => calculateDota2NetWinsPricing(incomplete),
    /Select at least one role to continue/,
  );
  assert.equal(quoteTotal(calculateDota2NetWinsPricing(netWinsSelection())), 7.5);
});

test("Calibration Express, incomplete preference quote, and removal behavior remain correct", () => {
  assert.equal(quoteTotal(calculateDota2CalibrationPricing(calibrationSelection())), 9);
  const express = calculateDota2CalibrationPricing(
    calibrationSelection({ expressDelivery: true }),
  );
  assert.equal(quoteTotal(express), 10.8);
  breakdownLabel(express, /Express Delivery \(\+20%\)/);
  const incomplete = calibrationSelection({ preference: "hero" });
  const quoteResult = calculateDota2CalibrationPricing(incomplete, "quote");
  assert.equal(quoteTotal(quoteResult), 10.8);
  breakdownLabel(quoteResult, /Specific Hero \(\+20%\)/);
  assert.throws(
    () => calculateDota2CalibrationPricing(incomplete),
    /Select a hero to continue/,
  );
  assert.equal(quoteTotal(calculateDota2CalibrationPricing(calibrationSelection())), 9);
});

test("strict pricing mode preserves order-time preference validation", () => {
  assert.throws(
    () => calculateDota2MmrPricing(mmrSelection({ preference: "roles" })),
    /Select at least one role to continue/,
  );
  assert.throws(
    () => calculateDota2NetWinsPricing(netWinsSelection({ preference: "hero" })),
    /Select a hero to continue/,
  );
  assert.throws(
    () => calculateDota2CalibrationPricing(calibrationSelection({ preference: "roles" })),
    /Select at least one role to continue/,
  );
});

test("custom quote states remain intentionally non-purchasable", () => {
  assert.equal(
    calculateDota2MmrPricing(mmrSelection({ behaviorScore: "below-4000" })).kind,
    "custom",
  );
  assert.equal(
    calculateDota2NetWinsPricing(netWinsSelection({ behaviorScore: "below-4000" })).kind,
    "custom",
  );
  assert.equal(
    calculateDota2CalibrationPricing(
      calibrationSelection({ behaviorScore: "below-4000" }),
    ).kind,
    "custom",
  );
});



const source = (relativePath) => readFileSync(path.join(repoRoot, relativePath), "utf8");
const mmrQuoteRoute = source("src/app/api/dota-2/mmr-quote/route.ts");
const netWinsQuoteRoute = source("src/app/api/dota-2/net-wins-quote/route.ts");
const calibrationQuoteRoute = source("src/app/api/dota-2/calibration-quote/route.ts");

for (const [label, routeSource] of [
  ["MMR", mmrQuoteRoute],
  ["Net Wins", netWinsQuoteRoute],
  ["Calibration", calibrationQuoteRoute],
]) {
  test(`${label} quote route explicitly uses quote validation and returns blockers`, () => {
    assert.match(routeSource, /calculateDota2\w+Pricing\(body\.selection, "quote"\)/);
    assert.match(routeSource, /blockingIssues/);
    assert.match(routeSource, /checkoutEligible/);
  });
}

for (const file of [
  "src/features/configurator/components/dota-2-mmr-configurator.tsx",
  "src/features/configurator/components/dota-2-net-wins-configurator.tsx",
  "src/features/configurator/components/dota-2-calibration-configurator.tsx",
]) {
  test(`${path.basename(file)} separates priceability from checkout completeness`, () => {
    const text = source(file);
    assert.match(text, /quoteSelectionIsValid/);
    assert.match(text, /configurationIsComplete/);
    assert.match(text, /quoteIsCurrent/);
    assert.match(text, /currentQuote/);
    assert.match(text, /AbortController/);
    assert.match(text, /aria-busy=/);
    assert.match(text, /Updating price…/);
    assert.match(text, /Previous price/);
    assert.doesNotMatch(text, /setQuoteState\(null\)/);
    assert.match(text, /configurationIsComplete &&\s*currentQuote/);
  });
}

test("Hero Level keeps quote visible while Dota Plus controls only checkout eligibility", () => {
  const text = source("src/features/configurator/components/dota-2-hero-level-configurator.tsx");
  assert.match(text, /const requirementConfirmed = selection\.dotaPlusConfirmed === true/);
  assert.match(text, /requirementConfirmed && currentQuote/);
  assert.match(text, /Confirm your active Dota Plus subscription before Checkout/);
  assert.match(text, /quote \? formatUsd\(quote\.total\) : "—"/);
  assert.match(text, /Updating price…/);
  assert.match(text, /Previous price/);
  assert.doesNotMatch(text, /setQuoteState\(null\)/);
});

test("Dota quote clients preserve stale amount but cannot check it out", () => {
  for (const file of [
    "src/features/configurator/components/dota-2-mmr-configurator.tsx",
    "src/features/configurator/components/dota-2-net-wins-configurator.tsx",
    "src/features/configurator/components/dota-2-calibration-configurator.tsx",
    "src/features/configurator/components/dota-2-hero-level-configurator.tsx",
  ]) {
    const text = source(file);
    assert.match(text, /quoteState\?\.quote/);
    assert.match(text, /const currentQuote = quoteIsCurrent \? quote : null/);
    assert.match(text, /disabled=\{!canCheckout \|\| isCreatingOrder\}/);
  }
});

test("rapid-response protection keeps only the latest request eligible to update state", () => {
  for (const file of [
    "src/features/configurator/components/dota-2-mmr-configurator.tsx",
    "src/features/configurator/components/dota-2-net-wins-configurator.tsx",
    "src/features/configurator/components/dota-2-calibration-configurator.tsx",
    "src/features/configurator/components/dota-2-hero-level-configurator.tsx",
  ]) {
    const text = source(file);
    assert.match(text, /const controller = new AbortController\(\)/);
    assert.match(text, /let active = true/);
    assert.match(text, /if \(!active\) return/);
    assert.match(text, /active = false/);
    assert.match(text, /controller\.abort\(\)/);
  }
});

test("Rainbow Six Siege stale quote hardening preserves MICROPHASE 2.2 pricing consumers", () => {
  const text = source(
    "src/features/configurator/components/rainbow-six-siege-rank-configurator.tsx",
  );
  assert.match(text, /quoteIsCurrent/);
  assert.match(text, /currentQuote/);
  assert.match(text, /AbortController/);
  assert.match(text, /aria-busy=/);
  assert.doesNotMatch(text, /setQuoteState\(null\)/);
  assert.match(text, /quoteIsCurrent && currentQuote \? `Quote updated to/);
});
