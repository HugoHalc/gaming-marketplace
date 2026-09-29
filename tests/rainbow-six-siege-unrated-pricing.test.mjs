import test from 'node:test';
import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const original = Module._extensions['.ts'];
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { calculateRainbowSixSiegeUnratedPricing: calculate, R6_UNRATED_REFERENCE_CENTS: reference, R6_UNRATED_RULE_SET_VERSION: version } = require('../src/features/pricing/server/rainbow-six-siege-unrated-pricing.ts');
const { progressiveDiscountBps, roundHalfUp } = require('../src/features/pricing/server/rainbow-six-siege-rank-pricing.ts');
const { meetsMinimumOrderTotal } = require('../src/features/orders/minimum-order.ts');
if (original) Module._extensions['.ts'] = original;
else delete Module._extensions['.ts'];
const defaults = { games: 1, platform: 'pc', gameMode: 'solo', server: 'north-america', playOffline: false, specificOperators: false, streaming: false, expressDelivery: false, highKillCount: false, oneTrickPony: false, vipPriority: false, insaneClipDrop: false, eliteBoosterTier: false };
const price = (changes={}) => calculate({ ...defaults, ...changes });
const cents = (changes={}) => price(changes).metadata.finalTotalCents;
const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');

test('frozen reference and all ten base prices use round-half-up cents', () => {
  assert.equal(version, 'rainbow-six-siege-unrated-v1');
  assert.deepEqual(reference, [179,359,538,718,897,1076,1256,1435,1615,1794]);
  for (const [index, expected] of [125,251,377,503,628,753,879,1005,1131,1256].entries()) {
    const {quote,metadata} = price({games:index+1});
    assert.equal(metadata.referenceCents, reference[index]);
    assert.equal(metadata.basePriceCents, roundHalfUp(reference[index]*7000,10000));
    assert.equal(metadata.basePriceCents, expected);
    assert.equal(metadata.finalTotalCents, expected);
    assert.equal(quote.total, expected/100);
    assert.equal(metadata.checkoutEligible, expected>=500);
  }
});

test('malformed quantities, incomplete selections and unknown keys are rejected', () => {
  for (const games of [0,-1,1.5,11,'2',null,NaN,Infinity]) assert.throws(()=>price({games}));
  for (const key of Object.keys(defaults)) {
    const incomplete={...defaults}; delete incomplete[key];
    assert.throws(()=>calculate(incomplete), key);
  }
  assert.throws(()=>price({currentRank:'copper'}));
  assert.throws(()=>price({expressDelivery:'true'}));
});

test('platform and all regions are operational selectors with zero price effect', () => {
  for (const platform of ['pc','xbox','playstation']) for (const server of ['europe','north-america','latin-america','asia','oceania','brazil','middle-east']) {
    const result=price({games:4,platform,server});
    assert.equal(result.metadata.finalTotalCents,503);
    assert.ok(result.metadata.platformLabel);
    assert.ok(result.metadata.serverLabel);
  }
  assert.throws(()=>price({platform:'switch'}));
  assert.throws(()=>price({server:'invalid'}));
});

test('service-specific Duo and all optional percentages are additive; fixed Streaming is applied once', () => {
  assert.equal(cents({games:4,gameMode:'duo'}),905);
  for (const [key,bps] of [['expressDelivery',2000],['highKillCount',4000],['oneTrickPony',3000],['vipPriority',5000],['insaneClipDrop',1500],['eliteBoosterTier',5000]]) {
    assert.equal(price({games:4,[key]:true}).metadata.totalModifierBps,bps);
  }
  assert.equal(cents({games:4,playOffline:true,specificOperators:true}),503);
  assert.equal(price({games:1,streaming:true}).metadata.preDiscountSubtotalCents,1125);
  assert.equal(cents({games:1,streaming:true}),1125);
  const both=price({games:10,gameMode:'duo',expressDelivery:true,highKillCount:true,streaming:true});
  assert.equal(both.metadata.totalModifierBps,14000);
  assert.equal(both.metadata.percentageAdjustedCents,3014);
  assert.equal(both.metadata.preDiscountSubtotalCents,4014);
  assert.equal(both.metadata.finalTotalCents,4014);
  assert.equal(Math.round(both.quote.breakdown.reduce((sum,item)=>sum+item.amount,0)*100),4014);
  assert.equal(price({games:1,playOffline:true,streaming:true}).metadata.selectedCustomizationLabels.join(','),'Play Offline,Streaming');
});

test('progressive boundaries and the $5 guard stay separate from the real price', () => {
  for(const [subtotal,bps] of [[4999,0],[5000,300],[9999,300],[10000,600],[14999,600],[15000,900],[19999,900],[20000,1200]]) assert.equal(progressiveDiscountBps(subtotal),bps);
  for(const [amount,eligible] of [[4.99,false],[5,true],[5.01,true]]) assert.equal(meetsMinimumOrderTotal(amount),eligible);
  for(const [games,expected,eligible] of [[1,1.25,false],[2,2.51,false],[3,3.77,false],[4,5.03,true]]) {
    const result=price({games}); assert.equal(result.quote.total,expected); assert.equal(result.metadata.checkoutEligible,eligible);
  }
  assert.equal(price({streaming:true}).metadata.checkoutEligible,true);
  const high=price({games:10,gameMode:'duo',eliteBoosterTier:true,vipPriority:true});
  assert.equal(high.metadata.preDiscountSubtotalCents,3517);
  assert.equal(high.metadata.discountBps,0);
  const discounted=price({games:10,gameMode:'duo',streaming:true,expressDelivery:true,highKillCount:true,oneTrickPony:true,vipPriority:true,insaneClipDrop:true,eliteBoosterTier:true});
  assert.equal(discounted.metadata.totalModifierBps,28500);
  assert.equal(discounted.metadata.preDiscountSubtotalCents,5836);
  assert.equal(discounted.metadata.discountBps,300);
  assert.equal(discounted.metadata.discountCents,175);
  assert.equal(discounted.metadata.finalTotalCents,5661);
  assert.equal(Math.round(discounted.quote.breakdown.reduce((sum,item)=>sum+item.amount,0)*100),5661);
});

test('client quote lifecycle, order recalculation, immutable snapshot and route wiring', () => {
  const ui=source('features/configurator/components/rainbow-six-siege-unrated-configurator.tsx');
  const order=source('app/api/rainbow-six-siege/unrated-matches-order/route.ts');
  const quote=source('app/api/rainbow-six-siege/unrated-matches-quote/route.ts');
  const page=source('app/games/rainbow-six-siege/[service]/page.tsx');
  const catalog=source('features/catalog/data/rainbow-six-siege-foundation.ts');
  assert.match(ui,/const quote = quoteState\?\.quote \?\? null/);
  assert.match(ui,/quoteState\?\.key === requestKey/);
  assert.match(ui,/controller\.abort\(\)/);
  assert.match(ui,/!isLoading && !quoteError && quoteIsCurrent/);
  assert.match(ui,/if \(!canCheckout \|\| isCreatingOrder\) return/);
  assert.match(ui,/grid-cols-2 gap-2 sm:grid-cols-5/);
  assert.match(order,/calculateRainbowSixSiegeUnratedPricing\(selection\)/);
  assert.match(order,/meetsMinimumOrderTotal\(result.quote.total\)/);
  for (const key of ['referenceCents','basePriceCents','fixedChargesCents','finalTotalCents','pricingVersion','checkoutEligible','platformLabel','serverLabel','modeLabel']) assert.match(order,new RegExp(`${key}: result.metadata.${key}`));
  assert.match(order,/percentageModifiers: JSON.stringify\(result.metadata.percentageModifiers\)/);
  assert.match(quote,/calculateRainbowSixSiegeUnratedPricing\(selection\)/);
  assert.match(page,/RainbowSixSiegeUnratedConfigurator/);
  assert.match(catalog,/slug: "unrated-matches"[\s\S]*?status: "active"/);
});
