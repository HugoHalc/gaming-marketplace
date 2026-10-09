import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypescript(relativePath, { env = {}, mocks = {} } = {}) {
  const filename = path.join(root, relativePath);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, {
    module: loadedModule,
    exports: loadedModule.exports,
    process: { env },
    URL,
    require(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      return require(specifier);
    },
  }, { filename });
  return loadedModule.exports;
}

test("official origin is central and indexing requires the official Vercel production environment", () => {
  const production = loadTypescript("src/config/site.ts", {
    env: {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://boostingpedia.com/",
      NEXT_PUBLIC_ALLOW_INDEXING: "true",
    },
  }).siteConfig;
  const preview = loadTypescript("src/config/site.ts", {
    env: {
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SITE_URL: "https://boostingpedia.com",
      NEXT_PUBLIC_ALLOW_INDEXING: "true",
    },
  }).siteConfig;
  const misconfiguredProduction = loadTypescript("src/config/site.ts", {
    env: {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://gaming-marketplace-gold.vercel.app",
      NEXT_PUBLIC_ALLOW_INDEXING: "true",
    },
  }).siteConfig;
  const disabledProduction = loadTypescript("src/config/site.ts", {
    env: {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://boostingpedia.com",
      NEXT_PUBLIC_ALLOW_INDEXING: "false",
    },
  }).siteConfig;

  assert.equal(production.url, "https://boostingpedia.com");
  assert.equal(production.allowIndexing, true);
  assert.equal(preview.allowIndexing, false);
  assert.equal(misconfiguredProduction.url, "https://boostingpedia.com");
  assert.equal(misconfiguredProduction.allowIndexing, true);
  assert.equal(disabledProduction.allowIndexing, false);
});

test("robots allows public production crawling while blocking all private route families", () => {
  const robots = loadTypescript("src/app/robots.ts", {
    mocks: {
      "@/config/site": {
        siteConfig: { url: "https://boostingpedia.com", allowIndexing: true },
      },
    },
  }).default();

  assert.equal(robots.host, "https://boostingpedia.com");
  assert.equal(robots.sitemap, "https://boostingpedia.com/sitemap.xml");
  assert.equal(robots.rules.allow, "/");
  for (const path of [
    "/api/", "/auth/", "/admin/", "/dashboard/", "/booster/",
    "/checkout/", "/account/", "/orders/", "/login", "/register",
    "/forgot-password", "/update-password", "/become-a-booster",
  ]) assert.ok(robots.rules.disallow.includes(path), path);

  const previewRobots = loadTypescript("src/app/robots.ts", {
    mocks: {
      "@/config/site": {
        siteConfig: { url: "https://boostingpedia.com", allowIndexing: false },
      },
    },
  }).default();
  assert.equal(previewRobots.rules.disallow, "/");
});

test("legacy host redirect is exact, permanent and cannot match Vercel previews", async () => {
  const redirects = await loadTypescript("next.config.ts").default.redirects();
  const redirect = redirects[0];
  assert.equal(redirect.source, "/:path*");
  assert.equal(redirect.destination, "https://boostingpedia.com/:path*");
  assert.equal(redirect.permanent, true);
  assert.deepEqual(JSON.parse(JSON.stringify(redirect.has)), [
    { type: "host", value: "gaming-marketplace-gold.vercel.app" },
  ]);
  assert.notEqual(redirect.has[0].value, "*.vercel.app");
});

test("active configuration contains no provisional origin outside the intentional redirect", () => {
  for (const file of ["src/config/site.ts", ".env.example", "src/app/robots.ts", "src/app/sitemap.ts", "src/lib/seo.ts"]) {
    assert.doesNotMatch(readFileSync(path.join(root, file), "utf8"), /gaming-marketplace-gold\.vercel\.app/, file);
  }
});
