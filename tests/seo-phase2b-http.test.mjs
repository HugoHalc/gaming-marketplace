import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.SEO_TEST_BASE_URL;
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

function headingLevels(html) {
  return [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
}

test("all 13 Phase 2B routes render semantic content and resolvable internal links", {
  skip: !baseUrl && "Set SEO_TEST_BASE_URL to a running production build.",
}, async () => {
  const discoveredLinks = new Set();

  for (const pathname of scopedPaths) {
    const response = await fetch(new URL(pathname, baseUrl));
    assert.equal(response.status, 200, `${pathname} did not render`);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${pathname} must contain exactly one H1`);
    assert.match(html, new RegExp(`data-service-seo-content=["']${pathname.slice(7)}["']`), `${pathname} content marker`);
    assert.equal((html.match(/<details\b/gi) ?? []).length, 3, `${pathname} FAQ count`);
    assert.equal((html.match(/<summary\b/gi) ?? []).length, 3, `${pathname} FAQ summary count`);

    const levels = headingLevels(html);
    assert.equal(levels[0], 1, `${pathname} heading order must start at H1`);
    for (let index = 1; index < levels.length; index += 1) {
      assert.ok(levels[index] <= levels[index - 1] + 1, `${pathname} skips from H${levels[index - 1]} to H${levels[index]}`);
    }

    for (const match of html.matchAll(/<a[^>]+href=["'](\/games\/[^"'#?]+)["']/gi)) discoveredLinks.add(match[1]);
  }

  for (const href of discoveredLinks) {
    const response = await fetch(new URL(href, baseUrl));
    assert.equal(response.status, 200, `internal link ${href} did not resolve`);
  }
});
