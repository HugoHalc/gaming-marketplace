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
  "/games/league-of-legends/arena-boost",
  "/games/league-of-legends/clash-boost",
  "/games/league-of-legends/mastery-boost",
  "/games/league-of-legends/placement-matches",
  "/games/league-of-legends/rank-boost",
  "/games/league-of-legends/unrated-matches",
  "/games/league-of-legends/wins",
  "/games/valorant/placement-matches",
  "/games/valorant/rank-boost",
  "/games/valorant/wins",
  "/games/marvel-rivals/hero-boost",
  "/games/marvel-rivals/placement-matches",
  "/games/marvel-rivals/rank-boost",
  "/games/marvel-rivals/unrated-games",
  "/games/marvel-rivals/wins",
];

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

test("Phase 2A defines unique, complete customer content for exactly 15 scoped services", () => {
  assert.equal(serviceSeoContent.length, 15);
  assert.deepEqual([...serviceSeoContent.map(entryPath)].sort(), [...scopedPaths].sort());
  assert.equal(new Set(serviceSeoContent.map(entryPath)).size, 15);

  for (const entry of serviceSeoContent) {
    const words = renderedWords(entry);
    assert.ok(words >= 250 && words <= 400, `${entryPath(entry)} has ${words} rendered words`);
    assert.equal(entry.steps.length, 3, `${entryPath(entry)} must have three steps`);
    assert.ok(entry.faqs.length >= 3 && entry.faqs.length <= 4, `${entryPath(entry)} FAQ count`);
    assert.equal(entry.links.length, 3, `${entryPath(entry)} related-link count`);
    assert.ok(entry.links.some((link) => link.href === `/games/${entry.gameSlug}`), `${entryPath(entry)} overview link`);
    assert.ok(entry.links.filter((link) => link.href.startsWith(`/games/${entry.gameSlug}/`)).length >= 2, `${entryPath(entry)} sibling links`);
    for (const link of entry.links) assert.ok(publicSeoPaths.includes(link.href), `${entryPath(entry)} links to missing ${link.href}`);
  }
});

test("FAQ questions do not repeat within a game", () => {
  for (const gameSlug of ["league-of-legends", "valorant", "marvel-rivals"]) {
    const questions = serviceSeoContent
      .filter((entry) => entry.gameSlug === gameSlug)
      .flatMap((entry) => entry.faqs.map((faq) => faq.question.toLowerCase()));
    assert.equal(new Set(questions).size, questions.length, `${gameSlug} contains a repeated FAQ question`);
  }
});

test("customer copy avoids placeholders, prohibited claims and developer-facing language", () => {
  const copy = JSON.stringify(serviceSeoContent);
  assert.doesNotMatch(copy, /\b(?:TODO|TBD|lorem ipsum)\b/i);
  assert.doesNotMatch(copy, /100% safe|zero ban risk|instant delivery|guaranteed no ban|best in the world|cheapest|starting from/i);
  assert.doesNotMatch(copy, /repository|rollout phase|database schema|supabase|developer terminology|API\b/i);
  assert.doesNotMatch(copy, /competitor|boostingmarket/i);
});

test("shared presentation is semantic, server-rendered and wired only into scoped route families", () => {
  const component = readFileSync(path.join(root, "src/features/catalog/components/service-seo-content.tsx"), "utf8");
  const sharedPage = readFileSync(path.join(root, "src/app/games/[game]/[service]/page.tsx"), "utf8");
  const marvelPage = readFileSync(path.join(root, "src/app/games/marvel-rivals/[service]/page.tsx"), "utf8");

  assert.doesNotMatch(component, /^\s*["']use client["']/m);
  assert.match(component, /<section/);
  assert.match(component, /<h2/);
  assert.match(component, /<h3/);
  assert.match(component, /<ol/);
  assert.match(component, /<details/);
  assert.match(component, /<summary/);
  assert.match(component, /<nav/);
  assert.doesNotMatch(component, /FAQPage|application\/ld\+json/);
  assert.match(sharedPage, /getServiceSeoContent\(game\.slug, service\.slug\)/);
  assert.match(marvelPage, /getServiceSeoContent\("marvel-rivals", service\.slug\)/);
  assert.ok(sharedPage.indexOf("<ServiceSeoContent content={seoContent}") > sharedPage.indexOf("<ServiceConfigurator"));
  assert.ok(marvelPage.indexOf("<ServiceSeoContent content={seoContent}") > marvelPage.indexOf("<MarvelRivalsRankConfigurator"));
});

