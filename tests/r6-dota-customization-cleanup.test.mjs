import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const removed = ["oneTrickPony", "vipPriority", "eliteBoosterTier", "insaneClipDrop", "eliteBoostTier"];
const removedLabels = /One Trick Pony|VIP Priority|Elite Boost(?:er)? Tier|Insane Clip Drop/;
const savedOrders = [];
const mocks = {
  "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
  "next/navigation": { useRouter: () => ({ push() {}, replace() {} }) },
  "@/features/auth/server/auth": { getCurrentIdentity: async () => ({ id: "test-user" }) },
  "@/lib/supabase/env": { hasSecretSupabaseEnv: () => true },
  "@/features/orders/server/order-repository": {
    createServerValidatedOrder: async (input) => {
      savedOrders.push(input);
      return { id: "test-order", total: input.quote.total };
    },
  },
};
// Load real repository modules without starting Next or connecting to a database.
const cache = new Map();
function load(file) {
  const filename = [file, `${file}.ts`, `${file}.tsx`].find(existsSync);
  assert.ok(filename, `Missing module: ${file}`);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const localRequire = (name) => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith("@/")) return load(path.join(root, "src", name.slice(2)));
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), name));
    return require(name);
  };
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const src = (file) => readFileSync(path.join(root, "src", file), "utf8");
const r6Extras = { playOffline: false, specificOperators: false, streaming: false, expressDelivery: false, highKillCount: false };
const r6Common = { platform: "pc", gameMode: "solo", server: "europe", ...r6Extras };
const dotaExtras = { privacyMode: false, expressDelivery: false, streaming: false };
const dotaCommon = { server: "europe-west", behaviorScore: "8000-12000", boostMethod: "solo", preference: "none", roles: "", heroName: "", soloQueueOnly: false, ...dotaExtras };
const cases = [
  { game: "rainbow-six-siege", api: "rank-boost", component: "rank", calc: "rank", fn: "calculateRainbowSixSiegeRankPricing", selection: { ...r6Common, currentRank: "copper-v", desiredRank: "bronze-v", rpGain: "21-plus", rankInsurance: false } },
  { game: "rainbow-six-siege", api: "competitive-wins", component: "wins", calc: "wins", fn: "calculateRainbowSixSiegeWinsPricing", selection: { ...r6Common, currentRank: "gold-v", wins: 5 } },
  { game: "rainbow-six-siege", api: "placements-boost", component: "placements", calc: "placements", fn: "calculateRainbowSixSiegePlacementsPricing", selection: { ...r6Common, previousSeasonRank: "gold", games: 5 } },
  { game: "rainbow-six-siege", api: "unrated-matches", component: "unrated", calc: "unrated", fn: "calculateRainbowSixSiegeUnratedPricing", selection: { ...r6Common, games: 4 } },
  { game: "dota-2", api: "mmr", component: "mmr", calc: "mmr", fn: "calculateDota2MmrPricing", selection: { ...dotaCommon, currentMmr: 1000, targetMmr: 2000 } },
  { game: "dota-2", api: "net-wins", component: "net-wins", calc: "net-wins", fn: "calculateDota2NetWinsPricing", selection: { ...dotaCommon, currentMmr: 1000, netWins: 5 } },
  { game: "dota-2", api: "calibration", component: "calibration", calc: "calibration", fn: "calculateDota2CalibrationPricing", selection: { ...dotaCommon, previousRank: "legend", previousDivision: "III", rankConfidence: 30, matches: 5 } },
  { game: "dota-2", api: "hero-level", component: "hero-level", calc: "hero-level", fn: "calculateDota2HeroLevelPricing", selection: { ...dotaExtras, heroName: "Axe", currentLevel: 1, desiredLevel: 5, dotaPlusConfirmed: true, server: "europe-west", behaviorScore: "8000-12000" } },
];
const post = (handler, selection) => handler(new Request("http://localhost/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selection }) }));
for (const item of cases) {
  test(`${item.game} ${item.api}: removed keys cannot price, quote or persist; retained extras permit checkout`, async () => {
    const calculate = load(path.join(root, `src/features/pricing/server/${item.game}-${item.calc}-pricing`))[item.fn];
    const prefix = item.game === "dota-2" ? `dota-2/${item.api}` : `rainbow-six-siege/${item.api}`;
    const quoteRoute = load(path.join(root, `src/app/api/${prefix}-quote/route`)).POST;
    const orderRoute = load(path.join(root, `src/app/api/${prefix}-order/route`)).POST;
    const base = calculate(item.selection);
    const retained = { ...item.selection, expressDelivery: true, streaming: true };
    const result = calculate(retained);
    assert.ok(result.quote.total > base.quote.total);
    const response = await post(quoteRoute, retained);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).quote.total, result.quote.total);
    savedOrders.length = 0;
    assert.equal((await post(orderRoute, retained)).status, 201);
    assert.equal(savedOrders.length, 1);
    assert.equal(savedOrders[0].quote.total, result.quote.total);
    for (const key of removed) for (const value of [true, false, "true", 1]) {
      const manipulated = { ...retained, [key]: value };
      assert.throws(() => calculate(manipulated), /Invalid .* selection/);
      assert.equal((await post(quoteRoute, manipulated)).status, 400);
      savedOrders.length = 0;
      assert.equal((await post(orderRoute, manipulated)).status, 400);
      assert.equal(savedOrders.length, 0);
    }
    assert.doesNotMatch(JSON.stringify(result), removedLabels);
  });
}

test("every R6S and Dota 2 client/data file excludes the removed options", () => {
  for (const folder of ["features/configurator/components", "features/configurator/data", "features/pricing/server", "features/catalog/data"]) {
    for (const name of readdirSync(path.join(root, "src", folder))) {
      if (!/^(rainbow-six-siege|dota-2)/.test(name)) continue;
      const content = src(`${folder}/${name}`);
      assert.doesNotMatch(content, removedLabels, name);
      for (const key of removed) assert.equal(content.includes(key), false, `${name}: ${key}`);
    }
  }
});

test("all four R6S rendered platform groups use canonical decorative masks with unchanged values", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { rainbowSixSiegePlatformOptions } = load(path.join(root, "src/features/configurator/data/rainbow-six-siege-rank-options"));
  assert.deepEqual(rainbowSixSiegePlatformOptions.map((p) => p.value), ["pc", "xbox", "playstation"]);
  for (const item of cases.filter((c) => c.game === "rainbow-six-siege")) {
    const exports = load(path.join(root, `src/features/configurator/components/rainbow-six-siege-${item.component}-configurator`));
    const Component = Object.values(exports).find((v) => typeof v === "function");
    const html = renderToStaticMarkup(React.createElement(Component));
    const platform = html.match(/<div role="radiogroup" aria-label="Platform"[\s\S]*?<\/section>/)?.[0];
    assert.ok(platform, item.api);
    for (const icon of ["windows", "xbox", "playstation"]) assert.ok(platform.includes(`/platform-icons/${icon}.png`), icon);
    assert.equal((platform.match(/role="radio"/g) ?? []).length, 3);
    assert.equal((platform.match(/aria-hidden="true" class="block size-4/g) ?? []).length, 3);
    assert.doesNotMatch(html, removedLabels);
  }
});


test("R6S platform pricing remains service-specific and unchanged", () => {
  const expected = [[821, 985, 985], [959, 1151, 1151], [525, 630, 630], [503, 503, 503]];
  for (const [index, item] of cases.filter((c) => c.game === "rainbow-six-siege").entries()) {
    const calculate = load(path.join(root, `src/features/pricing/server/rainbow-six-siege-${item.calc}-pricing`))[item.fn];
    for (const [p, platform] of ["pc", "xbox", "playstation"].entries()) {
      assert.equal(calculate({ ...item.selection, platform }).metadata.finalTotalCents, expected[index][p]);
    }
  }
});
