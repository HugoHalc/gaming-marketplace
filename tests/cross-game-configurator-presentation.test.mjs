import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { useState: realState, useRef: realRef, useId: realId, useMemo: realMemo, useCallback: realCallback, useEffect: realEffect } = React;
const { renderToStaticMarkup } = require("react-dom/server");
require("next/image");
require("next/link");
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
let currentPath = "/";
let active = null;
const timers = new Map();
let timerId = 0;
const fakeWindow = {
  location: { href: "http://localhost/" },
  setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
  clearTimeout(id) { timers.delete(id); },
  addEventListener() {}, removeEventListener() {},
};
function slot(initial) {
  const state = active;
  const index = state.index++;
  if (!(index in state.values)) state.values[index] = typeof initial === "function" ? initial() : initial;
  return [state.values[index], (next) => {
    state.values[index] = typeof next === "function" ? next(state.values[index]) : next;
  }];
}
const mocks = {
  "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
  "next/navigation": { usePathname: () => currentPath, useRouter: () => ({ push() {}, replace() {}, refresh() {} }), notFound: () => { throw new Error("Not found"); } },
  "next/font/google": { Geist: () => ({ variable: "geist" }), Geist_Mono: () => ({ variable: "mono" }), Rajdhani: () => ({ variable: "rajdhani" }) },
  "@/components/marketing/site-header": { SiteHeader: () => null },
  "@/components/marketing/site-footer": { SiteFooter: () => null },
  "@/components/support/support-chat-widget": { SupportChatWidget: () => null },
  "@/lib/supabase/server": { createPublicServerClient: () => null },
  "@/features/auth/server/auth": { getCurrentIdentity: async () => ({ id: "test-user" }) },
  "@/lib/supabase/env": { hasSecretSupabaseEnv: () => true, hasPublicSupabaseEnv: () => false },
  react: {
    ...React,
    useState: (initial) => active ? slot(initial) : realState(initial),
    useRef: (initial) => active ? slot(() => ({ current: initial }))[0] : realRef(initial),
    useId: () => active ? `test-${active.index++}` : realId(),
    useMemo: (fn, deps) => active ? fn() : realMemo(fn, deps),
    useCallback: (fn, deps) => active ? fn : realCallback(fn, deps),
    useEffect(fn, deps) {
      if (!active) return realEffect(fn, deps);
      const index = active.index++;
      const previous = active.dependencies[index];
      if (!previous || !deps || deps.some((value, i) => value !== previous[i])) {
        active.dependencies[index] = deps;
        active.effects.push(fn);
      }
    },
  },
};
function load(file) {
  const filename = [file, `${file}.ts`, `${file}.tsx`].find(existsSync);
  assert.ok(filename, file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loadedModule = { exports: {} }; cache.set(filename, loadedModule);
  const localRequire = (name) => {
    if (name.endsWith(".css")) return {};
    if (name.endsWith("checkout-intent")) return { useCheckoutIntentContinuity: () => ({ saveForAuthentication() {}, clearAfterOrder() {} }) };
    if (name === "server-only") return {};
    if (mocks[name]) return mocks[name];
    if (name.startsWith("@/")) return load(path.join(root, "src", name.slice(2)));
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), name));
    return require(name);
  };
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal(output.diagnostics.length, 0, filename);
  vm.runInThisContext(`(function(require,module,exports){${output.outputText}\n})`, { filename })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const src = (file) => load(path.join(root, "src", file));
const supported = ["rocket-league", "league-of-legends", "valorant", "marvel-rivals", "overwatch-2", "dota-2", "rainbow-six-siege"];
const counts = [5, 7, 3, 5, 5, 4, 4];
async function inventory() {
  const catalog = src("features/catalog/data/catalog-repository");
  const games = [];
  for (const slug of supported) {
    if (["marvel-rivals", "dota-2", "rainbow-six-siege"].includes(slug)) {
      const [file, key] = { "marvel-rivals": ["marvel-rivals-foundation", "marvelRivalsServices"], "dota-2": ["dota-2-foundation", "dota2ServiceFoundations"], "rainbow-six-siege": ["rainbow-six-siege-foundation", "rainbowSixSiegeServiceFoundations"] }[slug];
      games.push({ slug, services: src(`features/catalog/data/${file}`)[key] });
    } else games.push(await catalog.findCatalogGameBySlug(slug));
  }
  return games;
}
function elements(node, result = []) {
  if (!node || typeof node !== "object") return result;
  if (Array.isArray(node)) { node.forEach((child) => elements(child, result)); return result; }
  if (node.props) { result.push(node); elements(node.props.children, result); }
  return result;
}
async function renderConfigured(component, props, state) {
  let tree;
  for (let round = 0; round < 5; round++) {
    state.index = 0; state.effects = []; active = state;
    try { tree = component(props); } finally { active = null; }
    for (const effect of state.effects) effect();
    const pending = [...timers.values()]; timers.clear();
    for (const timer of pending) await timer();
  }
  return { tree, html: renderToStaticMarkup(tree) };
}
function summaryAside(html) {
  return [...html.matchAll(/<aside\b[^>]*>([\s\S]*?)<\/aside>/g)].find((m) => m[1].includes("Order Summary"))?.[1] ?? "";
}
function rowGroups(html) {
  return [...html.matchAll(/data-service-price-breakdown="[^"]*"[^>]*>([\s\S]*?)<\/div><\/div>/g)].map((m) => [...m[1].matchAll(/data-price-cents="(\d+)"/g)].map((x) => Number(x[1])));
}
for (const slug of supported) test(`${slug}: all services retain live quotes, extras, summary anatomy and navigation`, async () => {
  const games = await inventory(); const game = games.find((g) => g.slug === slug);
  assert.equal(game.services.length, counts[supported.indexOf(slug)]);
  const originalWindow = globalThis.window, originalFetch = globalThis.fetch;
  globalThis.window = fakeWindow;
  const observed = [];
  let suspendResponse = false;
  const releases = [];
  globalThis.fetch = async (url, options) => {
    if (suspendResponse) await new Promise((resolve) => releases.push(resolve));
    const handler = src(`app${url}/route`).POST;
    const response = await handler(new Request(`http://localhost${url}`, { ...options, headers: { "Content-Type": "application/json" } }));
    const payload = await response.clone().json();
    observed.push({ url, selection: JSON.parse(options.body).selection, payload });
    return response;
  };
  try {
    const page = src(["dota-2", "rainbow-six-siege", "marvel-rivals", "overwatch-2"].includes(slug) ? `app/games/${slug}/[service]/page` : "app/games/[game]/[service]/page");
    for (const service of game.services) {
      currentPath = `/games/${slug}/${service.slug}`;
      const pageTree = await page.default({ params: Promise.resolve({ game: slug, service: service.slug }) });
      let configurator = elements(pageTree).find((node) => typeof node.type === "function" && /Configurator$/.test(node.type.name));
      assert.ok(configurator, currentPath);
      if (configurator.type.name === "ServiceConfigurator") configurator = configurator.type(configurator.props);
      const state = { index: 0, values: [], dependencies: [], effects: [] };
      observed.length = 0;
      let initial = await renderConfigured(configurator.type, configurator.props, state);
      // Required choices remain required: select an existing option through its real handler.
      const controls = elements(initial.tree);
      for (const control of controls) {
        if (control.type === "select" && control.props.value === "") {
          const option = elements(control.props.children).find((n) => n.type === "option" && n.props.value && !n.props.disabled);
          if (option) control.props.onChange({ target: { value: option.props.value } });
        }
        if (typeof control.type === "function" && control.type.name === "HeroSelector" && control.props.value === "") {
          const hero = src("features/catalog/data/marvel-rivals-foundation").marvelRivalsHeroes[0];
          control.props.onChange(hero);
        }
      }
      initial = await renderConfigured(configurator.type, configurator.props, state);
      assert.match(initial.html, /data-service-experience/);
      assert.match(initial.html, /Order Summary/);
      assert.match(initial.html, /Before checkout/);
      assert.match(initial.html, /Estimated timing/);
      assert.equal((initial.html.match(/>\s*Verify before you order\s*</g) ?? []).length, 1, currentPath);
      assert.doesNotMatch(initial.html, /Automatic price adjustment|Starting from|NaN|Battlefield/i);
      // Trigger the actual Express Delivery handler, including cards represented as components.
      const candidates = elements(initial.tree);
      const extra = candidates.find((n) => /Express Delivery/i.test(n.props.title ?? n.props.label ?? n.props["aria-label"] ?? "") && (typeof n.props.onChange === "function" || typeof n.props.onClick === "function"))
        ?? candidates.find((n) => n.type === "button" && n.props["aria-pressed"] !== undefined && /Express/i.test(JSON.stringify(n.props.children)));
      assert.ok(extra, `Missing approved customization control: ${currentPath}`);
      if (extra) {
        if (extra.props.onChange) extra.props.onChange(true); else extra.props.onClick();
        // Run the real pending effects without resolving their HTTP timers yet.
        state.index = 0; state.effects = []; active = state;
        try { configurator.type(configurator.props); } finally { active = null; }
        for (const effect of state.effects) effect();
        suspendResponse = true;
        const waitingTimers = [...timers.values()]; timers.clear();
        const pendingRequests = waitingTimers.map((timer) => timer());
        state.index = 0; state.effects = []; active = state;
        let pendingTree;
        try { pendingTree = configurator.type(configurator.props); } finally { active = null; }
        const pendingHtml = renderToStaticMarkup(pendingTree);
        assert.match(pendingHtml, /data-service-price-breakdown/, `Price disappeared while updating: ${currentPath}`);
        const pendingAside = summaryAside(pendingHtml);
        const pendingCheckout = [...pendingAside.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find((m) => /Checkout|Preparing checkout/.test(m[2]));
        assert.ok(pendingCheckout, currentPath);
        assert.match(pendingCheckout[1], /\sdisabled(?:=|\s|$)/, `Stale quote permitted checkout: ${currentPath}`);
        suspendResponse = false;
        releases.splice(0).forEach((resolve) => resolve());
        await Promise.all(pendingRequests);
        const selected = await renderConfigured(configurator.type, configurator.props, state);
        assert.match(selected.html, /Express/i);
        assert.doesNotMatch(selected.html, /Automatic price adjustment|Starting from|NaN/i);
      }
      const success = observed.filter((o) => o.payload.quote);
      assert.ok(success.length, `No successful quote: ${currentPath}: ${JSON.stringify(observed)}; ${configurator.type.name}; ${JSON.stringify(state.values)}`);
      for (const response of success) {
        const rows = src("features/configurator/presentation/service-price-breakdown").presentServicePriceBreakdown(response.payload.quote);
        assert.equal(rows.reduce((sum, row) => sum + Math.round(row.amount * 100), 0), Math.round(response.payload.quote.total * 100));
        assert.ok(rows.every((row) => Number.isFinite(row.amount) && row.amount >= 0));
      }
      const final = await renderConfigured(configurator.type, configurator.props, state);
      const priceGroups = rowGroups(final.html);
      assert.ok(priceGroups.length, `No visible price: ${currentPath}`);
      console.log(`${currentPath}: ${success.length} server quotes; extra interaction: ${Boolean(extra)}`);
      if (success.length && priceGroups.length) assert.equal(priceGroups[0].reduce((sum, value) => sum + value, 0), Math.round(success.at(-1).payload.quote.total * 100), currentPath);
      const latestQuote = success.at(-1).payload.quote;
      const aside = summaryAside(final.html);
      const checkout = [...aside.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find((m) => /Checkout|Preparing checkout/.test(m[2]));
      assert.ok(checkout, currentPath);
      if (latestQuote.total < 5) {
        assert.match(checkout[1], /\sdisabled(?:=|\s|$)/);
        assert.match(aside, /\$5\.00/);
      } else if (service.slug !== "hero-level-boost") assert.doesNotMatch(checkout[1], /\sdisabled(?:=|\s|$)/);
      const renderedPage = renderToStaticMarkup(pageTree);
      assert.match(renderedPage, /aria-label="Breadcrumb"/);
      assert.ok(renderedPage.includes(`href="/games/${slug}"`));
    }
  } finally { active = null; timers.clear(); globalThis.window = originalWindow; globalThis.fetch = originalFetch; }
});

test("shared rows preserve extras and snapshots and show real totals below the global minimum", () => {
  const helper = src("features/configurator/presentation/service-price-breakdown").presentServicePriceBreakdown;
  const Rows = src("features/configurator/components/service-price-breakdown").ServicePriceBreakdown;
  const Notice = src("features/configurator/components/minimum-order-notice").MinimumOrderNotice;
  for (const total of [0.62, 3.92, 5, 11.1, 33.91]) {
    const quote = Object.freeze({ total, subtotal: 33.64, discount: 33.64 - total, currency: "USD", ruleSetVersion: "test", breakdown: Object.freeze([{ label: "Service", amount: 23.64 }, { label: "Live Stream", amount: 10 }, { label: "Appear Offline", amount: 0 }, { label: "Automatic price adjustment", amount: total - 33.64 }].map(Object.freeze)) });
    const rows = helper(quote); const html = renderToStaticMarkup(React.createElement(Rows, { quote }));
    assert.equal(rows.reduce((sum, row) => sum + Math.round(row.amount * 100), 0), Math.round(total * 100));
    assert.deepEqual(rows.map((row) => row.label), ["Service", "Live Stream", "Appear Offline"]);
    assert.doesNotMatch(html, /Automatic price adjustment|−|NaN/);
    assert.equal(quote.breakdown[0].amount, 23.64);
    const minimum = src("features/orders/minimum-order");
    assert.equal(minimum.meetsMinimumOrderTotal(total), total >= 5);
    const notice = renderToStaticMarkup(React.createElement(Notice, { id: "minimum", shortfallCents: minimum.minimumOrderShortfallCents(total) }));
    if (total < 5) assert.match(notice, /\$5\.00/); else assert.equal(notice, "");
  }
});

test("mobile tokens cover narrow widths without changing the 2A shell or rank assets", () => {
  const css = readFileSync(path.join(root, "src/features/configurator/components/service-configurator-presentation.css"), "utf8");
  assert.match(css, /min-height: 2\.75rem/);
  assert.match(css, /white-space: normal/);
  assert.match(css, /font-size: 0\.75rem/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /:has\(input:focus, select:focus\)/);
  for (const width of [320, 375, 390, 430]) {
    assert.ok(width <= 639);
    assert.match(css, /@media \(max-width: 639px\)/);
    assert.match(css, /grid-template-columns: minmax\(0, 1fr\) auto/);
  }
});


test("shared radio keys select enabled options, preserve existing handlers and ignore native controls", () => {
  const handler = src("features/configurator/components/service-configurator-presentation").handleServiceRadioKeyDown;
  const called = [];
  const group = { querySelectorAll: () => radios };
  const radios = [0, 1, 2].map((index) => ({ disabled: index === 1, getAttribute: () => null, closest: () => group, focus: () => called.push(`focus-${index}`), click: () => called.push(`click-${index}`) }));
  const event = (key, prevented = false) => ({ key, defaultPrevented: prevented, target: { closest: () => radios[0] }, preventDefault() { this.defaultPrevented = true; } });
  handler(event("ArrowRight")); assert.deepEqual(called, ["focus-2", "click-2"]);
  called.length = 0; handler(event("End")); assert.deepEqual(called, ["focus-2", "click-2"]);
  called.length = 0; handler(event("Home")); assert.deepEqual(called, ["focus-0", "click-0"]);
  called.length = 0; handler(event("ArrowRight", true)); assert.deepEqual(called, []);
  handler({ ...event("ArrowRight"), target: { closest: () => null } }); assert.deepEqual(called, []);
});
