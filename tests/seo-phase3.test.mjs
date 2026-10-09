import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadSeo() {
  const filename = path.join(root, "src/lib/seo.ts");
  const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports, require(specifier) {
    if (specifier === "@/config/site") return { siteConfig: { name: "BoostingPedia", url: "https://boostingpedia.com", allowIndexing: false } };
    return require(specifier);
  }, URL }, { filename });
  return loadedModule.exports;
}

const seo = loadSeo();

test("Phase 3 central builders emit linked stable graphs without commerce claims", () => {
  const service = seo.createServicePageJsonLd({ gameName: "Dota 2", gameSlug: "dota-2", serviceName: "MMR Boost", serviceSlug: "mmr-boost", description: "Configure your current MMR and target MMR." });
  assert.deepEqual(Array.from(service["@graph"], (entity) => entity["@type"]), ["BreadcrumbList", "WebPage", "Service"]);
  assert.equal(new Set(service["@graph"].map((entity) => entity["@id"])).size, 3);
  assert.equal(service["@graph"][1].mainEntity["@id"], service["@graph"][2]["@id"]);
  assert.doesNotMatch(JSON.stringify(service), /Offer|Product|AggregateRating|Review|price/i);
});

test("directory and overview ItemLists preserve supplied order and absolute URLs", () => {
  const graph = seo.createGameOverviewJsonLd({ gameName: "Rocket League", gameSlug: "rocket-league", title: "Rocket League Boosting Services | BoostingPedia", description: "Services.", services: [{ name: "Rank Boost", path: "/games/rocket-league/rank-boost" }, { name: "Competitive Wins", path: "/games/rocket-league/wins" }] });
  const list = graph["@graph"].find((entity) => entity["@type"] === "ItemList");
  assert.equal(list.numberOfItems, 2);
  assert.deepEqual(Array.from(list.itemListElement, (item) => item.position), [1, 2]);
  assert.ok(list.itemListElement.every((item) => item.url.startsWith("https://boostingpedia.com/")));
});

test("homepage and all route families use shared server-rendered structured data", () => {
  const files = ["src/app/page.tsx", "src/app/games/page.tsx", "src/app/games/[game]/page.tsx", "src/app/games/[game]/[service]/page.tsx", "src/app/games/league-of-legends/page.tsx", "src/app/games/marvel-rivals/page.tsx", "src/app/games/marvel-rivals/[service]/page.tsx", "src/app/games/overwatch-2/page.tsx", "src/app/games/overwatch-2/[service]/page.tsx", "src/app/games/dota-2/page.tsx", "src/app/games/dota-2/[service]/page.tsx", "src/app/games/rainbow-six-siege/page.tsx", "src/app/games/rainbow-six-siege/[service]/page.tsx", "src/app/contact/page.tsx"];
  for (const file of files) {
    const source = readFileSync(path.join(root, file), "utf8");
    assert.match(source, /<StructuredData\b/, file);
    assert.doesNotMatch(source, /^\s*["']use client["']/m, file);
  }
  const homepage = readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  assert.equal((homepage.match(/createOrganizationJsonLd\(\)/g) ?? []).length, 1);
  assert.equal((homepage.match(/createWebsiteJsonLd\(\)/g) ?? []).length, 1);
});

test("JSON-LD serialization remains safe for script embedding", () => {
  assert.equal(seo.serializeJsonLd({ value: "</script>" }), '{"value":"\\u003c/script>"}');
});
