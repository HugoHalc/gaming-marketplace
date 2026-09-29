import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { rainbowSixSiegeRankOptions } from "../src/features/configurator/data/rainbow-six-siege-rank-options.ts";
import {
  availableSiegeRankOptions,
  rankTier,
  resolveSiegeRankTierSelection,
  siegeRankTierOptions,
} from "../src/features/configurator/data/rainbow-six-siege-rank-selection.ts";

test("eight badge tiers reuse the canonical 40 rank and division identifiers", () => {
  const tiers = siegeRankTierOptions(rainbowSixSiegeRankOptions);
  assert.equal(tiers.length, 8);
  assert.equal(rainbowSixSiegeRankOptions.length, 40);
  for (const tier of tiers) {
    const divisions = rainbowSixSiegeRankOptions
      .filter((option) => rankTier(option) === rankTier(tier))
      .map((option) => option.division);
    assert.deepEqual(divisions, ["V", "IV", "III", "II", "I"]);
  }
});

test("desired tiers choose the first strictly higher canonical rank", () => {
  const options = rainbowSixSiegeRankOptions;
  const current = options.findIndex((option) => option.value === "gold-iii");
  const available = availableSiegeRankOptions(options, current);
  assert.equal(available[0].value, "gold-ii");
  assert.equal(available.some((option) => option.value === "gold-iii"), false);
  assert.equal(resolveSiegeRankTierSelection(options, "gold-iii", "Gold", current), "gold-ii");
  assert.equal(resolveSiegeRankTierSelection(options, "gold-iii", "Silver", current), null);
  assert.equal(resolveSiegeRankTierSelection(options, "gold-iii", "Diamond", current), "diamond-v");
});

test("current rank excludes Champion I and desired rank can reach it", () => {
  const options = rainbowSixSiegeRankOptions;
  const current = availableSiegeRankOptions(options, -1, true);
  assert.equal(current.at(-1).value, "champion-ii");
  assert.equal(resolveSiegeRankTierSelection(options, "champion-ii", "Champion", options.length - 2), "champion-i");
  assert.equal(availableSiegeRankOptions(options, options.length - 1).length, 0);
});

test("Placements keeps its eight tier-only values and no division", () => {
  const source = readFileSync(new URL("../src/features/configurator/data/rainbow-six-siege-placements-options.ts", import.meta.url), "utf8");
  const array = source.split("export const rainbowSixSiegePlacementsRankOptions = [")[1].split("] as const;")[0];
  const options = [...array.matchAll(/\{ value: "([^"]+)", label: "([^"]+)" \}/g)]
    .map((match) => ({ value: match[1], label: match[2] }));
  assert.equal(siegeRankTierOptions(options).length, 8);
  assert.ok(options.every((option) => !("division" in option)));
  for (const option of options) {
    assert.equal(resolveSiegeRankTierSelection(options, "copper", option.value), option.value);
  }
});
