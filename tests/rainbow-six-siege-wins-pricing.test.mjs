import test from "node:test";
import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const original = Module._extensions[".ts"];
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename,"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename);
const { calculateRainbowSixSiegeWinsPricing: price } = require("../src/features/pricing/server/rainbow-six-siege-wins-pricing.ts");
const { progressiveDiscountBps } = require("../src/features/pricing/server/rainbow-six-siege-rank-pricing.ts");
if (original) Module._extensions[".ts"] = original;
else delete Module._extensions[".ts"];
function selection(override={}) {return {currentRank:"copper-v",wins:1,platform:"pc",gameMode:"solo",server:"europe",playOffline:false,specificOperators:false,streaming:false,expressDelivery:false,highKillCount:false,oneTrickPony:false,vipPriority:false,insaneClipDrop:false,eliteBoosterTier:false,...override};}
function cents(s) {return price(selection(s)).metadata.finalTotalCents;}
test("frozen references and $5 minimum guard",()=>{
  const copper=price(selection());assert.equal(copper.metadata.discountedReferenceCents,106);assert.equal(copper.metadata.basePriceCents,74);assert.equal(copper.metadata.finalTotalCents,74);
  assert.equal(price(selection({currentRank:"copper-v",wins:4})).metadata.discountedReferenceCents,425);
  const gold=price(selection({currentRank:"gold-v",wins:5}));assert.equal(gold.metadata.discountedReferenceCents,1370);assert.equal(gold.metadata.basePriceCents,959);assert.equal(gold.metadata.finalTotalCents,959);
  assert.equal(price(selection({currentRank:"gold-v"})).metadata.basePriceCents,192);
});
test("modifiers are additive, service-specific, and free options do not alter price",()=>{
  const base={currentRank:"gold-v",wins:5};
  assert.equal(cents(base),959);assert.equal(cents({...base,platform:"xbox"}),1151);assert.equal(cents({...base,platform:"playstation"}),1151);
  assert.equal(cents({...base,gameMode:"duo"}),1726);assert.equal(cents({...base,server:"oceania"}),1055);
  assert.equal(cents({...base,streaming:true}),1959);
  assert.equal(cents({...base,platform:"xbox",gameMode:"duo",server:"oceania"}),2014);
  assert.equal(cents({...base,playOffline:true,specificOperators:true}),959);
});
test("frozen rank anomalies and high ranks remain available",()=>{
  assert.ok(cents({currentRank:"diamond-iv",wins:1})<cents({currentRank:"diamond-v",wins:1}));
  assert.equal(price(selection({currentRank:"champion-i",wins:5})).metadata.normalBenchmarkCents,8446);
});
test("invalid and unknown selections are rejected",()=>{
  for(const wins of [0,-1,1.5,6,"2",null]) assert.throws(()=>price(selection({wins})));
  for(const override of [{currentRank:"legend-v"},{platform:"mobile"},{gameMode:"boost"},{server:"mars"},{rankInsurance:true},{streaming:"yes"}]) assert.throws(()=>price(selection(override)));
});

test("progressive thresholds use the pre-discount subtotal once",()=>{
  for (const [subtotal,expected] of [[4999,0],[5000,300],[9999,300],[10000,600],[14999,600],[15000,900],[19999,900],[20000,1200]]) assert.equal(progressiveDiscountBps(subtotal),expected);
  const result=price(selection({currentRank:"champion-i",wins:5,gameMode:"duo",platform:"xbox",server:"oceania",streaming:true,highKillCount:true,vipPriority:true}));
  assert.equal(result.metadata.discountBps,progressiveDiscountBps(result.metadata.preDiscountSubtotalCents));
  assert.equal(result.metadata.finalTotalCents,result.metadata.preDiscountSubtotalCents-result.metadata.discountCents);
});
test("checkout wiring keeps a stale quote ineligible and order recalculation server side",()=>{
  const client=readFileSync(path.join(root,"src/features/configurator/components/rainbow-six-siege-wins-configurator.tsx"),"utf8");
  const order=readFileSync(path.join(root,"src/app/api/rainbow-six-siege/competitive-wins-order/route.ts"),"utf8");
  assert.match(client,/quoteIsCurrent &&/);assert.match(client,/const currentQuote = quoteIsCurrent \? quote : null/);
  assert.match(client,/controller.abort\(\)/);assert.match(client,/disabled=\{!canCheckout \|\| isCreatingOrder\}/);
  assert.match(order,/calculateRainbowSixSiegeWinsPricing\(selection\)/);
  assert.match(order,/meetsMinimumOrderTotal\(result.quote.total\)/);
});
