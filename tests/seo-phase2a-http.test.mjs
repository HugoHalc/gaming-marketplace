import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.SEO_TEST_BASE_URL;
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

function headingLevels(html) {
  return [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
}

test("all 15 Phase 2A routes render semantic content and resolvable internal links", {
  skip: !baseUrl && "Set SEO_TEST_BASE_URL to a running production build.",
}, async () => {
  const discoveredLinks = new Set();

  for (const pathname of scopedPaths) {
    const response = await fetch(new URL(pathname, baseUrl));
    assert.equal(response.status, 200, `${pathname} did not render`);
    const html = await response.text();
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    assert.equal(h1Count, 1, `${pathname} must contain exactly one H1`);
    assert.match(html, new RegExp(`data-service-seo-content=["']${pathname.slice(7)}["']`), `${pathname} content marker`);
    assert.equal((html.match(/<details\b/gi) ?? []).length, 3, `${pathname} FAQ count`);
    assert.equal((html.match(/<summary\b/gi) ?? []).length, 3, `${pathname} FAQ summary count`);

    const levels = headingLevels(html);
    assert.equal(levels[0], 1, `${pathname} heading order must start at H1`);
    for (let index = 1; index < levels.length; index += 1) {
      assert.ok(levels[index] <= levels[index - 1] + 1, `${pathname} skips from H${levels[index - 1]} to H${levels[index]}`);
    }

    for (const match of html.matchAll(/<a[^>]+href=["'](\/games\/[^"'#?]+)["']/gi)) {
      discoveredLinks.add(match[1]);
    }
  }

  for (const href of discoveredLinks) {
    const response = await fetch(new URL(href, baseUrl));
    assert.equal(response.status, 200, `internal link ${href} did not resolve`);
  }
});
