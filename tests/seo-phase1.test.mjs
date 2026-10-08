import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypescript(relativePath, mocks = {}) {
  const filename = path.join(root, relativePath);
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, {
    module: loadedModule,
    exports: loadedModule.exports,
    require(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      return require(specifier);
    },
    Response,
    URL,
  }, { filename });
  return loadedModule.exports;
}

const catalog = loadTypescript("src/features/catalog/data/public-seo-catalog.ts");

test("SEO inventory contains exactly 43 unique approved public URLs and 33 services", () => {
  assert.equal(catalog.publicSeoGames.length, 7);
  assert.equal(catalog.publicServicePaths.length, 33);
  assert.equal(catalog.publicSeoPaths.length, 43);
  assert.equal(new Set(catalog.publicSeoPaths).size, 43);
  assert.equal(catalog.publicSeoGames.find((game) => game.slug === "valorant").services.length, 3);
  for (const servicePath of catalog.publicServicePaths) {
    assert.ok(catalog.publicSeoPaths.includes(servicePath), `${servicePath} missing from sitemap inventory`);
  }
  const joined = catalog.publicSeoPaths.join("\n");
  assert.doesNotMatch(joined, /battlefield|rematch|arc-raiders/i);
});

test("central SEO metadata creates absolute canonical and complete social metadata", () => {
  const siteConfig = {
    name: "BoostingPedia",
    url: "https://boostingpedia.com",
    allowIndexing: false,
  };
  const seo = loadTypescript("src/lib/seo.ts", { "@/config/site": { siteConfig } });
  const metadata = seo.createPublicMetadata({
    title: "Games",
    description: "Games description",
    path: "/games?ignored=true",
    image: "/brand/boostingpedia-home-hero.webp",
  });

  assert.equal(metadata.alternates.canonical, "https://boostingpedia.com/games");
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.siteName, "BoostingPedia");
  assert.equal(metadata.openGraph.type, "website");
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.match(metadata.openGraph.images[0].url, /^https:\/\/boostingpedia\.com\//);
  assert.deepEqual(JSON.parse(JSON.stringify(metadata.robots)), { index: false, follow: false });
  assert.doesNotMatch(metadata.title.absolute, /BoostingPedia\s*\|\s*BoostingPedia/);
});

test("indexing switch only changes approved-page metadata while root and private layouts stay noindex", () => {
  const indexedSeo = loadTypescript("src/lib/seo.ts", {
    "@/config/site": {
      siteConfig: { name: "BoostingPedia", url: "https://boostingpedia.com", allowIndexing: true },
    },
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(indexedSeo.createPublicMetadata({ title: "Games", description: "x", path: "/games" }).robots)),
    { index: true, follow: true },
  );
  assert.match(readFileSync(path.join(root, "src/app/layout.tsx"), "utf8"), /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  for (const file of [
    "src/app/admin/layout.tsx",
    "src/app/dashboard/layout.tsx",
    "src/app/booster/layout.tsx",
    "src/app/auth/layout.tsx",
    "src/app/login/page.tsx",
    "src/app/register/page.tsx",
    "src/app/forgot-password/page.tsx",
    "src/app/update-password/page.tsx",
  ]) {
    const source = readFileSync(path.join(root, file), "utf8");
    assert.match(source, /index:\s*false/);
    assert.match(source, /follow:\s*false/);
  }
});

test("breadcrumb helper emits parseable JSON-LD with consecutive positions and absolute URLs", () => {
  const seo = loadTypescript("src/lib/seo.ts", {
    "@/config/site": {
      siteConfig: { name: "BoostingPedia", url: "https://boostingpedia.com", allowIndexing: false },
    },
  });
  const schema = seo.serviceBreadcrumbs("Dota 2", "dota-2", "MMR Boost", "mmr-boost");
  const parsed = JSON.parse(seo.serializeJsonLd(schema));
  assert.equal(parsed["@type"], "BreadcrumbList");
  assert.deepEqual(parsed.itemListElement.map((item) => item.position), [1, 2, 3, 4]);
  assert.ok(parsed.itemListElement.every((item) => item.item.startsWith("https://boostingpedia.com")));
  assert.equal(parsed.itemListElement.at(-1).item, "https://boostingpedia.com/games/dota-2/mmr-boost");
});

test("all public page implementations use centralized metadata and game/service pages render breadcrumbs", () => {
  const publicPages = [
    "src/app/page.tsx",
    "src/app/games/page.tsx",
    "src/app/games/[game]/page.tsx",
    "src/app/games/[game]/[service]/page.tsx",
    "src/app/games/league-of-legends/page.tsx",
    "src/app/games/marvel-rivals/page.tsx",
    "src/app/games/marvel-rivals/[service]/page.tsx",
    "src/app/games/overwatch-2/page.tsx",
    "src/app/games/overwatch-2/[service]/page.tsx",
    "src/app/games/dota-2/page.tsx",
    "src/app/games/dota-2/[service]/page.tsx",
    "src/app/games/rainbow-six-siege/page.tsx",
    "src/app/games/rainbow-six-siege/[service]/page.tsx",
    "src/app/contact/page.tsx",
  ];
  for (const file of publicPages) {
    assert.match(readFileSync(path.join(root, file), "utf8"), /createPublicMetadata/);
  }
  for (const file of publicPages.filter((file) => file.includes("/games/") && !file.endsWith("games/page.tsx"))) {
    assert.match(readFileSync(path.join(root, file), "utf8"), /StructuredData/);
  }
});

test("legacy redirects are permanent and map directly to exact live destinations", async () => {
  const config = loadTypescript("next.config.ts").default;
  const redirects = await config.redirects();
  assert.deepEqual(
    JSON.parse(JSON.stringify(redirects.map(({ source, destination, permanent }) => ({ source, destination, permanent })))),
    [
      { source: "/rocket-league", destination: "/games/rocket-league", permanent: true },
      { source: "/rocket-league/rocket-league", destination: "/games/rocket-league/rank-boost", permanent: true },
      { source: "/rocket-league/placements", destination: "/games/rocket-league/placements-boost", permanent: true },
      { source: "/rocket-league/rewards", destination: "/games/rocket-league/rewards-boost", permanent: true },
      { source: "/rocket-league/tournaments", destination: "/games/rocket-league/tournament-boost", permanent: true },
    ],
  );
});

test("retired routes return real 410 responses and unrelated paths continue to the app", async () => {
  class MockNextResponse extends Response {}
  const proxyModule = loadTypescript("src/proxy.ts", {
    "next/server": { NextResponse: MockNextResponse },
    "@/lib/supabase/proxy": { updateSession: async () => new Response("next", { status: 200 }) },
  });
  assert.equal(proxyModule.retiredPaths.size, 19);
  const gone = await proxyModule.proxy({ nextUrl: { pathname: "/arc-raiders" } });
  assert.equal(gone.status, 410);
  assert.equal(gone.headers.get("x-robots-tag"), "noindex, nofollow");
  const random = await proxyModule.proxy({ nextUrl: { pathname: "/random-missing-route" } });
  assert.equal(random.status, 200);
});

test("sitemap, robots and favicon use the centralized origin and official asset", () => {
  const sitemapSource = readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
  const robotsSource = readFileSync(path.join(root, "src/app/robots.ts"), "utf8");
  const nextConfigSource = readFileSync(path.join(root, "next.config.ts"), "utf8");
  assert.match(sitemapSource, /publicSeoPaths/);
  assert.match(sitemapSource, /absoluteUrl/);
  assert.match(robotsSource, /siteConfig\.allowIndexing/);
  assert.match(robotsSource, /\/api\//);
  assert.match(robotsSource, /\/auth\//);
  assert.match(robotsSource, /\/admin\//);
  assert.match(robotsSource, /\/dashboard\//);
  assert.match(robotsSource, /\/booster\//);
  assert.match(nextConfigSource, /source:\s*"\/favicon\.ico"/);
  assert.match(nextConfigSource, /destination:\s*"\/brand\/boostingpedia-mark\.png"/);
  assert.ok(existsSync(path.join(root, "public/brand/boostingpedia-mark.png")));
});
