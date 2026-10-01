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
let currentPath = "/";
const mocks = {
  "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
  "next/navigation": { usePathname: () => currentPath, useRouter: () => ({ push() {}, replace() {} }), notFound: () => { throw new Error("Not found"); } },
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
  const transpiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal(transpiled.diagnostics.length, 0, `Syntax errors: ${filename}`);
  const code = transpiled.outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const fromSrc = (file) => load(path.join(root, "src", file));
const catalog = fromSrc("features/catalog/data/catalog-repository.ts");
const supportedGames = ["rocket-league", "league-of-legends", "valorant", "marvel-rivals", "overwatch-2", "dota-2", "rainbow-six-siege"];
async function inventory() {
  const games = (await catalog.listCatalogGames()).filter((game) => supportedGames.includes(game.slug) && !["marvel-rivals", "dota-2", "rainbow-six-siege"].includes(game.slug));
  for (const [slug, file, key] of [["marvel-rivals", "marvel-rivals-foundation", "marvelRivalsServices"], ["dota-2", "dota-2-foundation", "dota2ServiceFoundations"], ["rainbow-six-siege", "rainbow-six-siege-foundation", "rainbowSixSiegeServiceFoundations"]]) {
    games.push({ slug, services: fromSrc(`features/catalog/data/${file}.ts`)[key] });
  }
  return games;
}

for (const gameSlug of supportedGames) {
  test(`${gameSlug}: every approved service renders the shared shell and exact navigation`, async () => {
    const games = await inventory();
    const game = games.find((item) => item.slug === gameSlug);
    assert.equal(game.services.length, { "rocket-league": 5, "league-of-legends": 7, valorant: 3, "marvel-rivals": 5, "overwatch-2": 5, "dota-2": 4, "rainbow-six-siege": 4 }[gameSlug]);
    const dedicated = ["dota-2", "rainbow-six-siege", "marvel-rivals", "overwatch-2"].includes(gameSlug);
    const page = fromSrc(dedicated ? `app/games/${gameSlug}/[service]/page.tsx` : "app/games/[game]/[service]/page.tsx");
    if (gameSlug === "overwatch-2") assert.deepEqual(page.generateStaticParams().map((item) => item.service), game.services.map((item) => item.slug));
    for (const service of game.services) {
      currentPath = `/games/${gameSlug}/${service.slug}`;
      const element = await page.default({ params: Promise.resolve({ game: gameSlug, service: service.slug }) });
      const html = renderToStaticMarkup(element);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, service.slug);
      const breadcrumbs = html.match(/<nav aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
      assert.ok(breadcrumbs, service.slug);
      for (const href of ["/", "/games", `/games/${gameSlug}`]) assert.ok(breadcrumbs.includes(`href="${href}"`));
      assert.match(breadcrumbs, /aria-current="page"/);
      assert.match(html, /text-\[1\.75rem\]/);
      assert.match(html, /xl:grid-cols-\[13\.5rem_minmax\(0,1fr\)\]/);
      assert.match(html, /xl:grid-cols-\[minmax\(0,1fr\)_23rem\]/);
      assert.match(html, /Order Summary/);
      assert.match(html, /Checkout/);
      const navs = [...html.matchAll(/<nav aria-label="[^"]* services"[^>]*>([\s\S]*?)<\/nav>/g)];
      assert.equal(navs.length, 2, service.slug);
      for (const nav of navs) {
        const links = [...nav[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
        assert.deepEqual(links.map((link) => link[1].match(/href="([^"]+)"/)[1]), [...game.services.map((item) => `/games/${gameSlug}/${item.slug}`), `/games/${gameSlug}`]);
        const active = links.filter((link) => link[1].includes('aria-current="page"'));
        assert.equal(active.length, 1);
        assert.ok(active[0][1].includes(`href="/games/${gameSlug}/${service.slug}"`));
        for (const link of links) assert.match(link[1], /focus-visible:ring/);
      }
      assert.doesNotMatch(html, /battlefield|Configure your full order without leaving this panel/);
      if (["league-of-legends", "marvel-rivals"].includes(gameSlug)) assert.doesNotMatch(html, /game-heroes/);
    }
  });
}

test("shared mobile navigation uses full service names and contained scrolling with 44px targets", () => {
  const { GameServiceNavigation } = fromSrc("features/configurator/components/game-service-navigation.tsx");
  const html = renderToStaticMarkup(React.createElement(GameServiceNavigation, { gameName: "Example", gameSlug: "example", activeSlug: "long", items: [{ slug: "long", label: "Long complete service name", mobileLabel: "Short" }], accentTextClass: "text-red-200", accentBorderClass: "border-red-300" }));
  assert.match(html, /overflow-x-auto/);
  assert.match(html, /h-11/);
  assert.equal((html.match(/Long complete service name/g) ?? []).length, 2);
  assert.doesNotMatch(html, />Short</);
  assert.doesNotMatch(html, /truncate/);
});
