import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = process.env.SEO_TEST_BASE_URL;
const expectedOrigin = (process.env.SEO_EXPECTED_ORIGIN ?? "https://boostingpedia.com").replace(/\/+$/, "");
const expectIndexing = process.env.SEO_EXPECT_INDEXING === "true";
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadCatalog() {
  const filename = path.join(root, "src/features/catalog/data/public-seo-catalog.ts");
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports }, { filename });
  return loadedModule.exports;
}

function metaContent(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return html.match(pattern)?.[1];
}

function canonicalHref(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
}

test("all 43 rendered public routes expose complete canonical and social metadata", {
  skip: !baseUrl && "Set SEO_TEST_BASE_URL to a running production build.",
}, async () => {
  const { publicSeoPaths } = loadCatalog();
  assert.equal(publicSeoPaths.length, 43);

  for (const pathname of publicSeoPaths) {
    const response = await fetch(new URL(pathname, baseUrl));
    assert.equal(response.status, 200, `${pathname} did not render`);
    const html = await response.text();
    const expectedCanonical = pathname === "/" ? expectedOrigin : `${expectedOrigin}${pathname}`;
    const canonical = canonicalHref(html);
    const ogUrl = metaContent(html, "property", "og:url");
    const ogImage = metaContent(html, "property", "og:image");
    const twitterImage = metaContent(html, "name", "twitter:image");

    assert.equal(canonical, expectedCanonical, `${pathname}: canonical`);
    assert.ok(metaContent(html, "property", "og:title"), `${pathname}: og:title`);
    assert.ok(metaContent(html, "property", "og:description"), `${pathname}: og:description`);
    assert.equal(ogUrl, canonical, `${pathname}: og:url`);
    assert.ok(ogImage, `${pathname}: og:image`);
    assert.equal(metaContent(html, "name", "twitter:card"), "summary_large_image", `${pathname}: twitter:card`);
    assert.ok(metaContent(html, "name", "twitter:title"), `${pathname}: twitter:title`);
    assert.ok(metaContent(html, "name", "twitter:description"), `${pathname}: twitter:description`);
    assert.ok(twitterImage, `${pathname}: twitter:image`);
    assert.doesNotMatch(html.match(/<title>(.*?)<\/title>/is)?.[1] ?? "", /BoostingPedia\s*\|\s*BoostingPedia/i);

    for (const imageUrl of [ogImage, twitterImage]) {
      const parsed = new URL(imageUrl);
      assert.equal(parsed.origin, expectedOrigin, `${pathname}: social image origin`);
      assert.ok(
        existsSync(path.join(root, "public", parsed.pathname.replace(/^\//, ""))),
        `${pathname}: missing local social image ${parsed.pathname}`,
      );
    }

    assert.match(
      html,
      expectIndexing
        ? /<meta name="robots" content="index, follow"/i
        : /<meta name="robots" content="noindex, nofollow"/i,
      `${pathname}: robots`,
    );
    assert.match(
      html,
      expectIndexing
        ? /<meta name="googlebot" content="index, follow"/i
        : /<meta name="googlebot" content="noindex, nofollow"/i,
      `${pathname}: googlebot`,
    );

    if (pathname === "/") {
      const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gis)]
        .map((match) => JSON.parse(match[1].replaceAll("&quot;", '"')));
      assert.equal(schemas.filter((schema) => schema["@type"] === "Organization").length, 1);
      assert.equal(schemas.filter((schema) => schema["@type"] === "WebSite").length, 1);
    }
  }
});
