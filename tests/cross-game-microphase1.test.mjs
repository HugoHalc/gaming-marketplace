import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const savedOrders = [];
const mocks = {
  "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
  "next/navigation": { useRouter: () => ({ push() {}, replace() {} }), notFound: () => { throw new Error("Not found"); } },
  "next/font/google": { Geist: () => ({ variable: "geist" }), Geist_Mono: () => ({ variable: "mono" }), Rajdhani: () => ({ variable: "rajdhani" }) },
  "@/components/marketing/site-header": { SiteHeader: () => null },
  "@/components/marketing/site-footer": { SiteFooter: () => null },
  "@/components/support/support-chat-widget": { SupportChatWidget: () => null },
  "@/lib/supabase/server": { createPublicServerClient: () => null },
  "@/features/auth/server/auth": { getCurrentIdentity: async () => ({ id: "test-user" }) },
  "@/lib/supabase/env": { hasSecretSupabaseEnv: () => true, hasPublicSupabaseEnv: () => false },
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
    if (name.endsWith(".css")) return {};
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

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { resolveTitle } = require("next/dist/lib/metadata/resolvers/resolve-title");
const fromSrc = (file) => load(path.join(root, "src", file));
const post = (handler, selection) => handler(new Request("http://localhost/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selection }) }));
const common = { platform: "pc", gameMode: "solo", server: "europe", playOffline: false, specificOperators: false, streaming: false, expressDelivery: false, highKillCount: false };

test("all five Dota titles resolve through the actual Next title resolver with one brand", async () => {
  const template = fromSrc("app/layout.tsx").metadata.title.template;
  const overview = fromSrc("app/games/dota-2/page.tsx").metadata;
  const services = fromSrc("app/games/dota-2/[service]/page.tsx");
  const records = [{ metadata: overview, title: "Dota 2 Boosting Services | BoostingPedia" }];
  for (const [slug, title] of [
    ["mmr-boost", "Dota 2 MMR Boost"], ["net-wins", "Dota 2 Net Wins"],
    ["calibration-matches", "Dota 2 Calibration Matches"], ["hero-level-boost", "Dota Plus Hero Level"],
  ]) records.push({ metadata: await services.generateMetadata({ params: Promise.resolve({ service: slug }) }), title: `${title} | BoostingPedia` });
  for (const record of records) {
    const resolved = resolveTitle(record.metadata.title, template).absolute;
    const html = renderToStaticMarkup(React.createElement("title", null, resolved));
    assert.equal(resolved, record.title);
    assert.equal((html.match(/BoostingPedia/g) ?? []).length, 1);
  }
});

test("all seven overview routes retain approved service links and authentic previews", async () => {
  const { publicGameNavigation } = fromSrc("features/catalog/data/launch-games");
  assert.equal(publicGameNavigation.length, 7);
  assert.ok(publicGameNavigation.every((g) => !/battlefield/.test(g.slug)));
  const catalogs = fromSrc("features/catalog/data/catalog-repository");
  for (const [slug, count] of [["rocket-league",5],["valorant",3],["overwatch-2",5],["marvel-rivals",5]]) {
    const catalog = await catalogs.findCatalogGameBySlug(slug);
    assert.equal(catalog.services.length, count, slug);
  }
  for (const game of publicGameNavigation) {
    const dedicated = path.join(root, `src/app/games/${game.slug}/page.tsx`);
    const page = load(existsSync(dedicated) ? dedicated : path.join(root, "src/app/games/[game]/page.tsx"));
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ game: game.slug }) }));
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].filter((m) => m[1].startsWith(`/games/${game.slug}/`));
    assert.ok(links.length >= 3, game.slug);
    for (const link of links) {
      assert.match(link[0], /focus-visible:ring/);
      assert.match(link[0], /min-h-\[22rem\]/);
      assert.match(link[0], /md:w-auto/);
    }
    if (["dota-2","rainbow-six-siege"].includes(game.slug)) {
      assert.equal(links.length,4);
      assert.match(html,/xl:grid-cols-3/);
      assert.match(html,/h-\[5\.15rem\]/);
      assert.match(html,/ranks(?:%2F|\/)(?:dota-2|rainbow-six-siege)/);
      assert.doesNotMatch(html,/min-h-\[21rem\]/);
    }
    if (game.slug === "overwatch-2") assert.doesNotMatch(html,/implemented|server-side|Server-validated|Existing order flow|visual system/);
  }
});

for (const [api, selection, fixed, bps] of [
  ["placements-boost", { ...common, previousSeasonRank: "gold", games:5, platform:"xbox", streaming:true, expressDelivery:true },1000,4000],
  ["unrated-matches", { ...common, games:4, platform:"playstation", streaming:true, expressDelivery:true },1000,4000],
]) test(`${api}: combined corrections flow through quote and validated order snapshot`, async () => {
  const quoteRoute = fromSrc(`app/api/rainbow-six-siege/${api}-quote/route.ts`).POST;
  const orderRoute = fromSrc(`app/api/rainbow-six-siege/${api}-order/route.ts`).POST;
  const response = await post(quoteRoute,selection);
  assert.equal(response.status,200);
  const quoted = await response.json();
  assert.equal(quoted.metadata.fixedChargesCents,fixed);
  assert.equal(quoted.metadata.totalModifierBps,bps);
  assert.ok(quoted.quote.total >= 5);
  assert.equal(quoted.metadata.checkoutEligible,true);
  assert.equal(Math.round(quoted.quote.breakdown.reduce((sum,line)=>sum+line.amount,0)*100),quoted.metadata.finalTotalCents);
  savedOrders.length=0;
  assert.equal((await post(orderRoute,selection)).status,201);
  assert.equal(savedOrders.length,1);
  assert.equal(savedOrders[0].quote.total,quoted.quote.total);
  assert.equal(savedOrders[0].selection.fixedChargesCents,1000);
  assert.equal(savedOrders[0].selection.finalTotalCents,quoted.metadata.finalTotalCents);
  assert.equal(savedOrders[0].selection.platform,selection.platform);
});
