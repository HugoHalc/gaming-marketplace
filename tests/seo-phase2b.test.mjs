import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypescript(relativePath) {
  const filename = path.join(root, relativePath);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports }, { filename });
  return loadedModule.exports;
}

const { serviceSeoContent } = loadTypescript("src/features/catalog/data/service-seo-content.ts");
const { publicSeoPaths } = loadTypescript("src/features/catalog/data/public-seo-catalog.ts");
const scopedPaths = [
  "/games/overwatch-2/competitive-drives",
  "/games/overwatch-2/placement-matches",
  "/games/overwatch-2/rank-boost",
  "/games/overwatch-2/unrated-matches",
  "/games/overwatch-2/wins",
  "/games/dota-2/calibration-matches",
  "/games/dota-2/hero-level-boost",
  "/games/dota-2/mmr-boost",
  "/games/dota-2/net-wins",
  "/games/rainbow-six-siege/competitive-wins",
  "/games/rainbow-six-siege/placements-boost",
  "/games/rainbow-six-siege/rank-boost",
  "/games/rainbow-six-siege/unrated-matches",
];
const scopedGames = ["overwatch-2", "dota-2", "rainbow-six-siege"];
const scopedContent = serviceSeoContent.filter((entry) => scopedGames.includes(entry.gameSlug));

function entryPath(entry) {
  return `/games/${entry.gameSlug}/${entry.serviceSlug}`;
}

function renderedWords(entry) {
  return [
    entry.eyebrow,
    entry.title,
    ...entry.introduction,
    entry.configuration,
    ...entry.steps.flatMap((step) => [step.title, step.text]),
    "Frequently asked questions",
    ...entry.faqs.flatMap((faq) => [faq.question, faq.answer]),
    "Explore related services",
    ...entry.links.map((link) => link.label),
  ].join(" ").trim().split(/\s+/).length;
}

test("Phase 2B defines unique, complete customer content for exactly 13 scoped services", () => {
  assert.equal(scopedContent.length, 13);
  assert.deepEqual([...scopedContent.map(entryPath)].sort(), [...scopedPaths].sort());
  assert.equal(new Set(scopedContent.map(entryPath)).size, 13);

  for (const entry of scopedContent) {
    const words = renderedWords(entry);
    assert.ok(words >= 250 && words <= 400, `${entryPath(entry)} has ${words} rendered words`);
    assert.equal(entry.steps.length, 3, `${entryPath(entry)} must have three steps`);
    assert.ok(entry.faqs.length >= 3 && entry.faqs.length <= 4, `${entryPath(entry)} FAQ count`);
    assert.equal(entry.links.length, 3, `${entryPath(entry)} related-link count`);
    assert.ok(entry.links.some((link) => link.href === `/games/${entry.gameSlug}`), `${entryPath(entry)} overview link`);
    assert.equal(entry.links.filter((link) => link.href.startsWith(`/games/${entry.gameSlug}/`)).length, 2, `${entryPath(entry)} sibling links`);
    for (const link of entry.links) assert.ok(publicSeoPaths.includes(link.href), `${entryPath(entry)} links to missing ${link.href}`);
  }
});

test("Phase 2B FAQ questions are unique within each game", () => {
  for (const gameSlug of scopedGames) {
    const questions = scopedContent
      .filter((entry) => entry.gameSlug === gameSlug)
      .flatMap((entry) => entry.faqs.map((faq) => faq.question.toLowerCase()));
    assert.equal(new Set(questions).size, questions.length, `${gameSlug} contains a repeated FAQ question`);
  }
});

test("Phase 2B copy avoids placeholders, prohibited claims and developer-facing language", () => {
  const copy = JSON.stringify(scopedContent);
  assert.doesNotMatch(copy, /\b(?:TODO|TBD|lorem ipsum)\b/i);
  assert.doesNotMatch(copy, /100% safe|zero ban risk|instant delivery|guaranteed no ban|best in the world|cheapest|starting from/i);
  assert.doesNotMatch(copy, /repository|rollout phase|database schema|supabase|developer terminology|API\b/i);
  assert.doesNotMatch(copy, /competitor|boostingmarket/i);
});

test("shared presentation remains semantic, server-rendered and is wired into all Phase 2B route families", () => {
  const component = readFileSync(path.join(root, "src/features/catalog/components/service-seo-content.tsx"), "utf8");
  const pages = [
    "src/app/games/overwatch-2/[service]/page.tsx",
    "src/app/games/dota-2/[service]/page.tsx",
    "src/app/games/rainbow-six-siege/[service]/page.tsx",
  ].map((filename) => readFileSync(path.join(root, filename), "utf8"));

  assert.doesNotMatch(component, /^\s*["']use client["']/m);
  assert.match(component, /<section/);
  assert.match(component, /<h2/);
  assert.match(component, /<h3/);
  assert.match(component, /<ol/);
  assert.match(component, /<details/);
  assert.match(component, /<summary/);
  assert.match(component, /<nav/);
  assert.doesNotMatch(component, /FAQPage|application\/ld\+json/);
  for (const page of pages) {
    assert.match(page, /getServiceSeoContent\(/);
    assert.ok(page.indexOf("<ServiceSeoContent content={seoContent}") > page.indexOf("Configurator"));
  }
});

test("Rainbow Six Siege starting-time estimator remains wired in every scoped configurator", () => {
  for (const name of ["rank", "wins", "placements", "unrated"]) {
    const source = readFileSync(path.join(root, `src/features/configurator/components/rainbow-six-siege-${name}-configurator.tsx`), "utf8");
    assert.match(source, /(?:estimateRainbowSixSiegeStartingTime|R6_STARTING_TIME_RANGES)/);
    assert.match(source, /R6_STARTING_TIME_DISCLAIMER/);
    assert.match(source, /ServiceOrderGuidance/);
  }
});
