import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const snapshot = JSON.parse(readFileSync(path.join(root, "docs/rocket-league-reference-2026-10-01.json"), "utf8"));
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const realUseState = React.useState;
const realUseEffect = React.useEffect;
const realUseMemo = React.useMemo;
const inserts = [];
const paths = [];
let identity = { id: "customer" };
let available = true;
let harness = null;
const database = {
  from(table) {
    return {
      insert(row) {
        inserts.push({ table, row: structuredClone(row) });
        return table === "orders" ? { select: () => ({ single: async () => ({ data: { id: "order-1", order_number: "BP-1" }, error: null }) }) }
          : Promise.resolve({ error: null });
      },
      select: () => ({ order: async () => ({ data: [], error: null }) }),
    };
  },
};
const mocks = {
  "server-only": {},
  "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
  "next/navigation": { usePathname: () => "/games/rocket-league/wins", useRouter: () => ({ push: (p) => paths.push(p), refresh() {} }) },
  "@/features/auth/server/auth": { getCurrentIdentity: async () => identity },
  "@/lib/supabase/env": { hasSecretSupabaseEnv: () => available, hasPublicSupabaseEnv: () => false },
  "@/lib/supabase/server": { createSecretServerClient: () => database, createPublicServerClient: () => null },
  "@/lib/supabase/auth": { createAuthServerClient: async () => database },
  "react": {
    ...React,
    useState(initial) {
      if (!harness) return realUseState(initial);
      const index = harness.index++;
      let value = initial;
      if (initial && typeof initial === "object") value = harness.selection;
      if (initial === null && !harness.quoteUsed) { value = harness.quote; harness.quoteUsed = true; }
      if (initial === true) value = false;
      return [value, (next) => { harness.updates.push({ index, next }); }];
    },
    useEffect: (...args) => { if (!harness) return realUseEffect(...args); },
    useMemo: (fn, deps) => harness ? fn() : realUseMemo(fn, deps),
  },
};
const cache = new Map();
function load(file) {
  const filename = [file, `${file}.ts`, `${file}.tsx`].find(existsSync);
  assert.ok(filename, file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const localRequire = (name) => {
    if (name.endsWith(".css")) return {};
    if (name === "../client/checkout-intent" && harness) return { useCheckoutIntentContinuity: () => ({ saveForAuthentication() {}, clearAfterOrder() {} }) };
    if (mocks[name]) return mocks[name];
    if (name.startsWith("@/")) return load(path.join(root, "src", name.slice(2)));
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), name));
    return require(name);
  };
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal(output.diagnostics.length, 0, filename);
  vm.runInThisContext(`(function(require,module,exports){${output.outputText}\n})`, { filename })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const src = (file) => load(path.join(root, "src", file));
const shared = src("features/pricing/server/rocket-league-reference-pricing.ts");
const reference = src("features/pricing/server/rocket-league-reference.ts");
const presentation = src("features/configurator/presentation/rocket-league-price-breakdown.ts").presentRocketLeaguePriceBreakdown;
const minimum = src("features/orders/minimum-order.ts");
const catalog = src("features/catalog/data/catalog-repository.ts");
const quoteRoute = src("app/api/quotes/preview/route.ts");
const orderRoute = src("app/api/orders/route.ts");
const calculators = Object.fromEntries(["rank", "wins", "tournament", "rewards", "placements"].map((family) => [family,
  src(`features/pricing/server/rocket-league-${family}-pricing.ts`)[`calculateRocketLeague${family[0].toUpperCase() + family.slice(1)}Quote`],
]));
const slug = { rank: "rank-boost", wins: "wins", tournament: "tournament-boost", rewards: "rewards-boost", placements: "placements-boost" };
const base = { boostMethod: "account", playlist: "1v1", platform: "pc", appearOffline: false, liveStream: false, expressDelivery: false, rankInsurance: false };
const cents = (dollars) => Math.round(dollars * 100);
const half = (n, d) => Number((n + d / 2n) / d);
// Independent BigInt oracle starts with the captured decimal strings, never the production tables.
function rawUnits(family, selection) {
  const prices = snapshot.services[family].prices;
  const units = (price) => BigInt(price.rawDollars.replace(".", "").padEnd(price.rawDollars.split(".")[0].length + 4, "0"));
  if (family === "rank") {
    const ranks = reference.rocketLeagueRankOrder;
    return prices.slice(ranks.indexOf(selection.currentRank), ranks.indexOf(selection.targetRank)).reduce((n, p) => n + units(p), 0n);
  }
  const key = family === "placements" ? selection.previousRank : selection.currentRank;
  const rate = units(prices.find((p) => p.rankId === key));
  return rate * BigInt(family === "tournament" ? 1 : family === "placements" ? selection.matches : selection.wins);
}
function oracle(family, selection) {
  const units = rawUnits(family, selection);
  const pack = snapshot.services[family];
  const queue = { "1v1": "1v1", "2v2": "2v2", "3v3": "3v3", "4v4": "4v4", rumble: "Rumble", hoops: "Hoops", dropshot: "Dropshot", "snow-day": "Snowday", heatseeker: "Heatseeker" };
  let percent = pack.queues.find((q) => q.title === queue[selection.playlist]).price;
  for (const [key, title] of [["expressDelivery", "Express Delivery"], ["rankInsurance", "Rank Insurance"]]) {
    if (selection[key] && (key !== "rankInsurance" || family === "rank")) percent += pack.approvedOptions.find((o) => o.title === title).price;
  }
  if (selection.boostMethod === "play-with-booster") percent += pack.approvedOptions.find((o) => o.title === "Play with Booster").price;
  const fixed = selection.liveStream ? BigInt(pack.approvedOptions.find((o) => o.title === "Streaming").price * 10000) : 0n;
  const raw = half(units * BigInt(100 + percent) + fixed * 100n, 10000n);
  const progressive = [...pack.progressDiscount].reverse().find((p) => raw >= p.slab * 100)?.discount ?? 0;
  const combined = pack.globalDiscount.discount + progressive;
  const discounted = half(BigInt(raw) * BigInt(100 - combined), 100n);
  return { raw, progressive, discounted, total: half(BigInt(discounted) * 60n, 100n) };
}
function* selections(family) {
  const ranks = reference.rocketLeagueRankOrder;
  if (family === "rank") {
    for (let i = 0; i < ranks.length; i++) for (let j = i + 1; j < ranks.length; j++) yield { currentRank: ranks[i], targetRank: ranks[j] };
  } else for (const price of snapshot.services[family].prices) {
    const maximum = family === "tournament" ? 1 : family === "wins" ? 12 : 10;
    for (let n = 1; n <= maximum; n++) yield family === "placements" ? { previousRank: price.rankId, matches: n }
      : family === "tournament" ? { currentRank: price.rankId } : { currentRank: price.rankId, wins: n };
  }
}
const anchors = [
  ["rank", { currentRank: "grand-champion-1", targetRank: "grand-champion-3" }, 11535, 5652, 3391],
  ["rank", { currentRank: "grand-champion-1", targetRank: "supersonic-legend" }, 23724, 10201, 6121],
  ["wins", { currentRank: "bronze-3", wins: 1 }, 188, 103, 62],
  ["wins", { currentRank: "bronze-3", wins: 12 }, 2257, 1241, 745],
  ["tournament", { currentRank: "gold" }, 3201, 1761, 1057],
  ["rewards", { currentRank: "silver-3", wins: 1 }, 212, 117, 70],
  ["placements", { previousRank: "bronze-3", matches: 1 }, 199, 109, 65],
];
for (const [family, selection, raw, discounted, total] of anchors) test(`verified ${family} anchor ${JSON.stringify(selection)}`, () => {
  const expected = oracle(family, { ...base, ...selection });
  assert.deepEqual([expected.raw, expected.discounted, expected.total], [raw, discounted, total]);
  assert.equal(cents(calculators[family]({ ...base, ...selection }).total), total);
});

for (const family of Object.keys(calculators)) test(`${family}: every base configuration, queue, platform, method and approved extra combination`, () => {
  let count = 0;
  for (const selection of selections(family)) for (const playlist of ["1v1", "2v2", "3v3", "4v4", "rumble", "hoops", "dropshot", "snow-day", "heatseeker"])
    for (const platform of ["pc", "playstation", "xbox", "switch"]) for (const boostMethod of ["account", "play-with-booster"])
      for (let mask = 0; mask < (family === "rank" ? 16 : 8); mask++) {
        const input = { ...base, ...selection, playlist, platform, boostMethod, appearOffline: Boolean(mask & 1), liveStream: Boolean(mask & 2), expressDelivery: Boolean(mask & 4), rankInsurance: family === "rank" && Boolean(mask & 8) };
        if (boostMethod === "play-with-booster" && input.appearOffline) continue;
        const expected = oracle(family, input);
        const quote = calculators[family](input);
        assert.equal(cents(quote.subtotal), expected.raw);
        assert.equal(cents(quote.total), expected.total);
        assert.equal(cents(quote.discount), expected.raw - expected.total);
        assert.deepEqual(quote, calculators[family](input));
        assert.equal(quote.breakdown.reduce((sum, item) => sum + cents(item.amount), 0), expected.total);
        const visible = presentation(quote.breakdown, quote.total, "rocket-league");
        assert.equal(visible.reduce((sum, line) => sum + cents(line.amount), 0), expected.total);
        assert.ok(visible.every((line) => Number.isFinite(line.amount) && line.amount >= 0 && !/automatic price adjustment/i.test(line.label)));
        assert.deepEqual(visible.map((line) => line.label), quote.breakdown.filter((line) => line.amount >= 0).map((line) => line.label));
        assert.ok(Number.isSafeInteger(cents(quote.total)) && quote.total >= 0);
        assert.equal(minimum.meetsMinimumOrderTotal(quote.total), expected.total >= 500);
        const stages = shared.rocketLeaguePriceFromReferenceSubtotal(expected.raw);
        assert.equal(stages.discountedReferenceCents, expected.discounted);
        assert.equal(stages.progressiveDiscountBps, expected.progressive * 100);
        count++;
      }
  console.log(`${family}: ${count} complete quote configurations verified`);
});

test("progressive boundaries, fixed extras crossing boundaries, and two-stage half-up", () => {
  for (const [n, rate] of [[4999, 0], [5000, 300], [9999, 300], [10000, 600], [14999, 600], [15000, 900], [19999, 900], [20000, 1200]]) {
    const q = shared.rocketLeaguePriceFromReferenceSubtotal(n);
    assert.equal(q.progressiveDiscountBps, rate);
    assert.equal(q.totalCents, half(BigInt(half(BigInt(n) * BigInt(5500 - rate), 10000n)) * 6000n, 10000n));
  }
  assert.equal(shared.roundHalfUp(5, 2), 3);
  for (const raw of [-1, NaN, Infinity, 1.5]) assert.throws(() => shared.rocketLeaguePriceFromReferenceSubtotal(raw));
  const input = { ...base, currentRank: "champion", liveStream: true };
  const expected = oracle("tournament", input);
  assert.equal(cents(calculators.tournament(input).total), expected.total);
  assert.notEqual(cents(calculators.tournament(input).total), cents(calculators.tournament({ ...input, liveStream: false }).total) + 600);
});

test("invalid states, no invented ranks, and wins quantity 0/13/20 rejection", () => {
  for (const wins of [0, 13, 20, -1, 1.5, "", " ", NaN, Infinity, true, null]) assert.throws(() => calculators.wins({ ...base, currentRank: "bronze-3", wins }));
  for (const family of ["rewards", "placements"]) for (const quantity of [0, 11, 1.5]) {
    const selection = family === "placements" ? { previousRank: "unrated", matches: quantity } : { currentRank: "silver-3", wins: quantity };
    assert.throws(() => calculators[family]({ ...base, ...selection }));
  }
  for (const targetRank of ["bronze-1", "no-rank"]) assert.throws(() => calculators.rank({ ...base, currentRank: "bronze-1", targetRank }));
  assert.throws(() => calculators.rank({ ...base, currentRank: "gold-1", targetRank: "silver-3" }));
  assert.throws(() => calculators.tournament({ ...base, currentRank: "none" }));
  assert.throws(() => calculators.wins({ ...base, currentRank: "bronze-3", wins: 1, playlist: "invalid" }));
  assert.throws(() => calculators.wins({ ...base, currentRank: "bronze-3", wins: 1, liveStream: "true" }));
  assert.throws(() => calculators.wins({ ...base, currentRank: "bronze-3", wins: 1, boostMethod: "play-with-booster", appearOffline: true }));
  assert.equal(cents(calculators.wins({ ...base, currentRank: "bronze-3", wins: 1, clientPrice: 1, vipPriority: true }).total), 62);
});

const request = (body) => new Request("https://boostingpedia.test/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
function orderBody(family, selection, quote) {
  return { gameSlug: "rocket-league", serviceSlug: slug[family], selection, expectedTotalCents: cents(quote.total), expectedRuleSetVersion: quote.ruleSetVersion };
}
test("all 953 base configurations: real quote API, order gate, and immutable database snapshots agree", async () => {
  let count = 0;
  for (const family of Object.keys(calculators)) for (const selection of selections(family)) {
    const input = { ...base, ...selection };
    const response = await quoteRoute.POST(request({ gameSlug: "rocket-league", serviceSlug: slug[family], selection: input, total: 1 }));
    assert.equal(response.status, 200);
    const { quote } = await response.json();
    const expected = oracle(family, input);
    assert.equal(cents(quote.total), expected.total);
    inserts.length = 0;
    const order = await orderRoute.POST(request(orderBody(family, input, quote)));
    assert.equal(order.status, expected.total >= 500 ? 201 : 400);
    if (expected.total < 500) { assert.equal((await order.json()).code, "minimum_order_total"); assert.equal(inserts.length, 0); }
    else {
      assert.equal(inserts.length, 2);
      for (const { row } of inserts) assert.deepEqual([row.subtotal_cents, row.discount_cents, row.total_cents], [expected.raw, expected.raw - expected.total, expected.total]);
      assert.equal(inserts[1].row.rule_set_version, quote.ruleSetVersion);
      assert.deepEqual(inserts[1].row.price_breakdown, quote.breakdown);
      input.liveStream = true;
      assert.equal(inserts[1].row.configuration.liveStream, false);
    }
    count++;
  }
  assert.equal(count, 953);
});

test("stale/tampered quotes, order quantity bounds, authentication and other games remain guarded", async () => {
  const selection = { ...base, currentRank: "bronze-3", wins: 12 };
  const quote = calculators.wins(selection);
  for (const patch of [{ expectedTotalCents: 1 }, { expectedRuleSetVersion: "rocket-league-wins-v1.1" }, { expectedTotalCents: undefined }, { selection: { ...selection, liveStream: true } }]) {
    inserts.length = 0;
    const response = await orderRoute.POST(request({ ...orderBody("wins", selection, quote), ...patch }));
    assert.equal(response.status, 400);
    assert.equal(inserts.length, 0);
  }
  for (const wins of [0, 13, 20]) {
    const body = orderBody("wins", { ...selection, wins }, quote);
    assert.equal((await quoteRoute.POST(request(body))).status, 400);
    assert.equal((await orderRoute.POST(request(body))).status, 400);
  }
  identity = null;
  assert.equal((await orderRoute.POST(request(orderBody("wins", selection, quote)))).status, 401);
  identity = { id: "customer" }; available = false;
  assert.equal((await orderRoute.POST(request(orderBody("wins", selection, quote)))).status, 503);
  available = true;
});

function findCheckout(node) {
  if (!node || typeof node !== "object") return null;
  if (node.props?.onClick?.name === "createOrder") return node;
  for (const child of React.Children.toArray(node.props?.children)) { const found = findCheckout(child); if (found) return found; }
  return null;
}
test("all five real configurators show server quotes, minimum gate, and submit versioned cents", async () => {
  const game = await catalog.findCatalogGameBySlug("rocket-league");
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => orderRoute.POST(request(JSON.parse(options.body)));
    for (const family of Object.keys(calculators)) for (const lowPrice of [false, true]) {
      const selection = family === "rank" ? { ...base, currentRank: lowPrice ? "bronze-1" : "grand-champion-1", targetRank: lowPrice ? "bronze-2" : "grand-champion-3" }
        : family === "tournament" ? { ...base, currentRank: lowPrice ? "bronze" : "gold" }
          : family === "placements" ? { ...base, previousRank: "bronze-3", matches: lowPrice ? 1 : 10 }
            : { ...base, currentRank: "bronze-3", wins: lowPrice ? 1 : 10 };
      for (const liveStream of [false, true]) {
        selection.liveStream = liveStream;
        const quote = calculators[family](selection);
        harness = { index: 0, quoteUsed: false, quote, selection, updates: [] };
        const component = src(`features/configurator/components/rocket-league-${family}-configurator.tsx`)[`RocketLeague${family[0].toUpperCase() + family.slice(1)}Configurator`];
        const tree = component({ gameSlug: "rocket-league", service: game.services.find((s) => s.slug === slug[family]) });
        const html = renderToStaticMarkup(tree);
        assert.ok(html.includes(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(quote.total)));
        assert.doesNotMatch(html, /Automatic price adjustment|% OFF|Unlocked/);
        const displayed = presentation(quote.breakdown, quote.total, "rocket-league");
        for (const line of displayed) {
          assert.ok(html.includes(line.label), `${family}: ${line.label}`);
          assert.ok(html.includes(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(line.amount)));
        }
        const checkout = findCheckout(tree);
        assert.ok(checkout, family);
        assert.equal(checkout.props.disabled, quote.total < 5);
        if (quote.total < 5) assert.match(html, /Minimum order total: \$5\.00/);
        inserts.length = 0;
        await checkout.props.onClick();
        assert.equal(inserts.length, quote.total < 5 ? 0 : 2);
        if (inserts.length) assert.equal(inserts[0].row.total_cents, cents(quote.total));
        if (family === "wins") assert.match(html, /max="12"/);
      }
    }
  } finally { harness = null; globalThis.fetch = originalFetch; }
});

test("wins schema and historical checkout-intent restoration reject 13–20 without clamping", async () => {
  const repository = src("features/configurator/data/configurator-repository.ts");
  const schema = await repository.getServiceConfiguratorSchema({ serviceId: "service_rl_wins", category: "wins" });
  assert.equal(schema.fields.find((f) => f.key === "wins").max, 12);
  const raw = readFileSync(path.join(root, "src/features/configurator/client/checkout-intent.ts"), "utf8") + "\nexport { readMatchingCheckoutIntent };";
  const output = ts.transpileModule(raw, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: (key) => memory.delete(key) };
  vm.runInNewContext(`(function(require,module,exports){${output}\n})`, { window: { sessionStorage: storage, localStorage: storage }, Date })(
    (name) => name === "../data/rocket-league-limits" ? src("features/configurator/data/rocket-league-limits.ts") : require(name), loadedModule, loadedModule.exports,
  );
  for (const gameSlug of ["rocket-league", "valorant"]) for (const wins of [1, 12, 13, 20]) {
    const key = "boostingpedia.checkout-intent.v1";
    const selection = { ...base, currentRank: "bronze-3", wins };
    memory.set(key, JSON.stringify({ version: 1, id: "valid-intent-id", gameSlug, serviceSlug: "wins", selection, createdAt: Date.now(), resumeRequested: true }));
    const restored = loadedModule.exports.readMatchingCheckoutIntent(gameSlug, "wins", selection);
    assert.equal(Boolean(restored), gameSlug !== "rocket-league" || wins <= 12);
    if (restored) assert.equal(restored.intent.selection.wins, wins);
  }
});

test("shared order endpoint preserves non-RL quotes and does not require RL acknowledgement fields", async () => {
  const selection = { currentRank: "iron-1", wins: 5, queue: "solo", rrGain: "20", server: "europe", platform: "pc", playOffline: false, agentPreferences: false, liveStream: false, expressDelivery: false, extraWin: false, rankInsurance: false };
  const body = { gameSlug: "valorant", serviceSlug: "wins", selection };
  const response = await quoteRoute.POST(request(body));
  assert.equal(response.status, 200);
  const { quote } = await response.json();
  assert.equal(quote.total, 8.5);
  inserts.length = 0;
  assert.equal((await orderRoute.POST(request(body))).status, 201);
  assert.equal(inserts[0].row.total_cents, 850);
});

test("omitted optional extras retain non-rank compatibility", () => {
  assert.equal(cents(calculators.wins({ currentRank: "bronze-3", wins: 1, boostMethod: "account", playlist: "1v1", platform: "pc" }).total), 62);
});

test("all base configurations with compatible percentage and fixed extras retain API/order parity", async () => {
  for (const family of Object.keys(calculators)) for (const selection of selections(family)) {
    const input = { ...base, ...selection, playlist: "4v4", platform: "switch", appearOffline: true, liveStream: true, expressDelivery: true, rankInsurance: family === "rank" };
    const response = await quoteRoute.POST(request({ gameSlug: "rocket-league", serviceSlug: slug[family], selection: input }));
    assert.equal(response.status, 200);
    const { quote } = await response.json();
    const expected = oracle(family, input);
    assert.equal(cents(quote.total), expected.total);
    inserts.length = 0;
    const order = await orderRoute.POST(request(orderBody(family, input, quote)));
    assert.equal(order.status, expected.total >= 500 ? 201 : 400);
    if (expected.total >= 500) assert.deepEqual(inserts.map(({ row }) => row.total_cents), [expected.total, expected.total]);
    else assert.equal(inserts.length, 0);
  }
  const from = oracle("tournament", { ...base, currentRank: "platinum" });
  const to = oracle("tournament", { ...base, currentRank: "platinum", liveStream: true });
  assert.equal(from.progressive, 0);
  assert.equal(to.progressive, 3);
});


test("presentation incorporates adjustments without mutating historical snapshots or other games", () => {
  const frozen = Object.freeze([
    Object.freeze({ label: "Rank Boost", amount: 33.64 }),
    Object.freeze({ label: "Automatic price adjustment", amount: -22.54 }),
  ]);
  assert.deepEqual(presentation(frozen, 11.1, "Rocket League"), [{ label: "Rank Boost", amount: 11.1 }]);
  assert.deepEqual(presentation(frozen, undefined, "Rocket League"), [{ label: "Rank Boost", amount: 11.1 }]);
  assert.equal(presentation(frozen, 11.1, "Valorant"), frozen);
  assert.equal(frozen[0].amount, 33.64);
  assert.equal(frozen[1].amount, -22.54);
  const noAdjustment = [{ label: "Rank Boost", amount: 12 }];
  assert.equal(presentation(noAdjustment, 12, "rocket-league"), noAdjustment);
});

test("paid extras receive final cents without negative service prices or missing free extras", () => {
  const lines = [
    { label: "Competitive Wins", amount: 1.88 },
    { label: "Live Stream", amount: 10 },
    { label: "Appear Offline", amount: 0 },
    { label: "Automatic price adjustment", amount: -7.96 },
  ];
  const expected = [{ label: "Competitive Wins", amount: 0.62 }, { label: "Live Stream", amount: 3.3 }, { label: "Appear Offline", amount: 0 }];
  assert.deepEqual(presentation(lines, 3.92, "rocket-league"), expected);
  assert.deepEqual(presentation(lines, undefined, "Rocket League"), expected);
  assert.equal(lines[1].amount, 10);
  assert.equal(minimum.meetsMinimumOrderTotal(3.92), false);
  const summary = src("components/orders/order-configuration-summary.tsx").OrderConfigurationSummary;
  const html = renderToStaticMarkup(React.createElement(summary, {
    gameName: "Rocket League", configuration: { currentRank: "bronze-3" }, priceBreakdown: lines,
  }));
  assert.doesNotMatch(html, /Automatic price adjustment|\$10\.00/);
  assert.match(html, /Live Stream/);
});

test("home games heading contains only customer title and retains responsive card layout", () => {
  const source = readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  const section = source.split('<section id="games"')[1].split('</section>')[0];
  assert.match(section, /Select your game/);
  assert.doesNotMatch(section, /Select your game:/);
  assert.doesNotMatch(section, /Choose your game|Jump straight into a game storefront/);
  assert.doesNotMatch(section.split('<h2')[0], /<p/);
  assert.match(section, /text-3xl.*sm:text-4xl.*lg:text-5xl/);
  assert.match(section, /mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 xl:grid-cols-3/);
  assert.match(section, /publicGameNavigation\.map/);
  assert.match(section, /href="\/games"/);
});
