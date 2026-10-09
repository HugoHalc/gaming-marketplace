import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = process.env.SEO_TEST_BASE_URL;
const expectIndexing = process.env.SEO_EXPECT_INDEXING === "true";
const require = createRequire(import.meta.url);
const ts = require("typescript");

function publicPaths() {
  const filename = path.join(root, "src/features/catalog/data/public-seo-catalog.ts");
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports }, { filename });
  return loadedModule.exports.publicSeoPaths;
}

test("official-domain metadata, robots and sitemap match the selected environment", {
  skip: !baseUrl && "Set SEO_TEST_BASE_URL to a running production build.",
}, async () => {
  const paths = publicPaths();
  assert.equal(paths.length, 43);
  for (const pathname of paths) {
    const response = await fetch(new URL(pathname, baseUrl));
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.doesNotMatch(html, /gaming-marketplace-gold\.vercel\.app/i, pathname);
    assert.match(html, /<link rel="canonical" href="https:\/\/boostingpedia\.com(?:\/[^"?]*)?"/i, `${pathname}: canonical`);
    assert.match(html, expectIndexing
      ? /<meta name="robots" content="index, follow"/i
      : /<meta name="robots" content="noindex, nofollow"/i,
    `${pathname}: robots`);
    assert.match(html, expectIndexing
      ? /<meta name="googlebot" content="index, follow"/i
      : /<meta name="googlebot" content="noindex, nofollow"/i,
    `${pathname}: googlebot`);
  }

  const robots = await (await fetch(new URL("/robots.txt", baseUrl))).text();
  assert.match(robots, /Host: https:\/\/boostingpedia\.com/i);
  assert.match(robots, /Sitemap: https:\/\/boostingpedia\.com\/sitemap\.xml/i);
  if (expectIndexing) {
    assert.match(robots, /Allow: \//i);
    for (const path of ["/api/", "/auth/", "/admin/", "/dashboard/", "/booster/"]) {
      assert.ok(robots.includes(`Disallow: ${path}`), path);
    }
  } else {
    assert.match(robots, /Disallow: \/(?:\r?\n|$)/i);
  }

  const sitemap = await (await fetch(new URL("/sitemap.xml", baseUrl))).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 43);
  assert.equal(new Set(urls).size, 43);
  assert.ok(urls.every((url) => url.startsWith("https://boostingpedia.com")));
  assert.doesNotMatch(sitemap, /dashboard|admin|auth|checkout|\/api\/|orders|gaming-marketplace-gold/i);
});
