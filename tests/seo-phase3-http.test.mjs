import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = process.env.SEO_TEST_BASE_URL;
const expectedOrigin = (process.env.SEO_EXPECTED_ORIGIN ?? "https://boostingpedia.com").replace(/\/+$/, "");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadCatalog() {
  const filename = path.join(root, "src/features/catalog/data/public-seo-catalog.ts");
  const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports }, { filename });
  return loadedModule.exports;
}

function schemasFromHtml(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gis)].map((match) => JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&")));
}

function metaDescription(html) {
  return html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.replaceAll("&quot;", '"').replaceAll("&amp;", "&");
}

test("all 43 public routes render truthful linked structured data", { skip: !baseUrl && "Set SEO_TEST_BASE_URL to a running production build." }, async () => {
  const { publicSeoGames, publicSeoPaths } = loadCatalog();
  assert.equal(publicSeoPaths.length, 43);
  for (const pathname of publicSeoPaths) {
    const response = await fetch(new URL(pathname, baseUrl));
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    const entities = schemasFromHtml(html).flatMap((schema) => schema["@graph"] ?? [schema]);
    const ids = entities.map((entity) => entity["@id"]).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, `${pathname}: duplicate @id`);
    assert.doesNotMatch(JSON.stringify(entities), /"@type":"(?:Offer|Product|AggregateRating|Review)"|"price"|"priceCurrency"/i, pathname);
    if (pathname === "/") {
      assert.equal(entities.filter((entity) => entity["@type"] === "Organization").length, 1);
      assert.equal(entities.filter((entity) => entity["@type"] === "WebSite").length, 1);
      continue;
    }
    assert.equal(entities.filter((entity) => entity["@type"] === "BreadcrumbList").length, 1, `${pathname}: breadcrumb`);
    if (pathname === "/contact") assert.equal(entities.filter((entity) => entity["@type"] === "ContactPage").length, 1);
    else if (pathname === "/games" || publicSeoGames.some((game) => pathname === `/games/${game.slug}`)) {
      assert.equal(entities.filter((entity) => entity["@type"] === "CollectionPage").length, 1);
      const list = entities.find((entity) => entity["@type"] === "ItemList");
      const expectedCount = pathname === "/games" ? 7 : publicSeoGames.find((game) => pathname === `/games/${game.slug}`).services.length;
      assert.equal(list.numberOfItems, expectedCount);
    } else {
      assert.equal(entities.filter((entity) => entity["@type"] === "WebPage").length, 1);
      const service = entities.find((entity) => entity["@type"] === "Service");
      assert.equal(service.description, metaDescription(html));
      assert.equal(service.url, `${expectedOrigin}${pathname}`);
    }
  }
});
