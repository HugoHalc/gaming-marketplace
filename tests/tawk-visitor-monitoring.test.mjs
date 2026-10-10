import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypescript(relativePath, mocks = {}, globals = {}) {
  const filename = path.join(root, relativePath);
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, {
    module: loadedModule,
    exports: loadedModule.exports,
    require(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      return require(specifier);
    },
    Date,
    ...globals,
  }, { filename });
  return loadedModule.exports;
}

const catalog = loadTypescript("src/features/catalog/data/public-seo-catalog.ts");
const monitoring = loadTypescript("src/lib/tawk-monitoring.ts", {
  "@/features/catalog/data/public-seo-catalog": catalog,
});

test("Tawk uses the exact 41-route storefront allowlist and defaults to denied", () => {
  const expected = [
    "/",
    ...catalog.publicSeoGames.map((game) => `/games/${game.slug}`),
    ...catalog.publicServicePaths,
  ];

  assert.equal(monitoring.tawkMonitoringPaths.length, 41);
  assert.equal(new Set(monitoring.tawkMonitoringPaths).size, 41);
  assert.deepEqual(
    JSON.parse(JSON.stringify(monitoring.tawkMonitoringPaths)),
    expected,
  );

  for (const pathname of expected) {
    assert.equal(monitoring.isTawkMonitoringPath(pathname), true, pathname);
    assert.equal(
      monitoring.isTawkMonitoringPath(pathname === "/" ? pathname : `${pathname}/`),
      true,
      `${pathname}/`,
    );
  }

  for (const pathname of [
    "/games",
    "/contact",
    "/login",
    "/register",
    "/auth/callback",
    "/forgot-password",
    "/update-password",
    "/checkout",
    "/dashboard",
    "/dashboard/orders/example",
    "/admin",
    "/booster",
    "/boosters",
    "/orders/example",
    "/api/checkout",
    "/cookies",
    "/privacy",
    "/terms",
    "/refunds",
    "/become-a-booster",
    "/games/rocket-league/not-a-service",
    "/unknown",
  ]) {
    assert.equal(monitoring.isTawkMonitoringPath(pathname), false, pathname);
  }
});

function monitoringHarness(initialPathname = "/") {
  let pathname = initialPathname;
  let search = "";
  let nextTimer = 1;
  const timers = new Map();
  const nodes = new Map();
  const calls = [];

  const document = {
    head: {
      appendChild(node) {
        nodes.set(node.id, node);
      },
    },
    createElement() {
      const listeners = new Map();
      return {
        id: "",
        async: false,
        src: "",
        charset: "",
        crossOrigin: "",
        addEventListener(type, callback) {
          listeners.set(type, callback);
        },
        dispatch(type) {
          listeners.get(type)?.();
        },
        remove() {
          nodes.delete(this.id);
        },
      };
    },
    getElementById(id) {
      return nodes.get(id) ?? null;
    },
  };

  const window = {
    setTimeout(callback) {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };

  const component = loadTypescript(
    "src/components/monitoring/tawk-visitor-monitoring.tsx",
    {
      "next/navigation": {
        usePathname: () => pathname,
        useSearchParams: () => new URLSearchParams(search),
      },
      react: { useEffect: (effect) => effect() },
      "@/lib/tawk-monitoring": {
        isTawkMonitoringPath: monitoring.isTawkMonitoringPath,
      },
    },
    { document, window, URLSearchParams },
  );

  return {
    calls,
    component,
    document,
    nodes,
    runTimers() {
      for (const [id, callback] of [...timers]) {
        timers.delete(id);
        callback();
      }
    },
    setPathname(value) {
      pathname = value;
    },
    setSearch(value) {
      search = value;
    },
    window,
  };
}

function installReadyApi(harness) {
  Object.assign(harness.window.Tawk_API, {
    hideWidget: () => harness.calls.push("hide"),
    shutdown: () => harness.calls.push("shutdown"),
    start: () => harness.calls.push("start"),
  });
}

test("Tawk starts hidden, restarts public page monitoring and shuts down on excluded routes", () => {
  const harness = monitoringHarness();
  harness.component.TawkVisitorMonitoring();

  const script = harness.document.getElementById("boostingpedia-tawk-monitoring");
  assert.ok(script);
  assert.equal(script.async, true);
  assert.equal(
    script.src,
    "https://embed.tawk.to/6855d398fcaa46190d472212/1iu7k5335",
  );
  assert.equal(harness.window.Tawk_API.autoStart, false);

  installReadyApi(harness);
  harness.window.Tawk_API.onBeforeLoad();
  harness.window.Tawk_API.onLoad();
  harness.runTimers();
  assert.equal(harness.calls.at(-1), "hide");
  assert.equal(harness.calls.filter((call) => call === "start").length, 1);

  harness.setPathname("/games/rocket-league");
  harness.component.TawkVisitorMonitoring();
  harness.runTimers();
  assert.equal(harness.calls.filter((call) => call === "start").length, 2);
  assert.ok(harness.calls.filter((call) => call === "shutdown").length >= 2);
  assert.equal(harness.nodes.size, 1);

  harness.setPathname("/checkout");
  harness.component.TawkVisitorMonitoring();
  assert.equal(harness.calls.at(-1), "shutdown");

  harness.setPathname("/games/dota-2/mmr-boost");
  harness.component.TawkVisitorMonitoring();
  harness.runTimers();
  assert.equal(harness.calls.filter((call) => call === "start").length, 3);
  assert.equal(harness.nodes.size, 1);
});

test("a late Tawk callback cannot start after rapid navigation to a private route", () => {
  const harness = monitoringHarness("/games/valorant/rank-boost");
  harness.component.TawkVisitorMonitoring();
  const lateOnLoad = harness.window.Tawk_API.onLoad;

  harness.setPathname("/login");
  harness.component.TawkVisitorMonitoring();
  assert.equal(harness.nodes.size, 0);

  installReadyApi(harness);
  lateOnLoad();
  harness.runTimers();
  assert.equal(harness.calls.includes("start"), false);
  assert.equal(harness.calls.at(-1), "shutdown");
});

test("query-bearing URLs are not exposed to Tawk and script failure is harmless", () => {
  const queryHarness = monitoringHarness("/games/rocket-league/rank-boost");
  queryHarness.setSearch("token=private-value");
  queryHarness.component.TawkVisitorMonitoring();
  assert.equal(queryHarness.nodes.size, 0);

  const blockedHarness = monitoringHarness("/games/overwatch-2");
  blockedHarness.component.TawkVisitorMonitoring();
  const script = blockedHarness.document.getElementById("boostingpedia-tawk-monitoring");
  assert.ok(script);
  assert.doesNotThrow(() => script.dispatch("error"));
  assert.equal(blockedHarness.nodes.size, 0);
});

test("the integration never sets Tawk identity, attributes, events or chat content", () => {
  const source = readFileSync(
    path.join(root, "src/components/monitoring/tawk-visitor-monitoring.tsx"),
    "utf8",
  );
  assert.doesNotMatch(source, /Tawk_API\.(?:visitor|login|setAttributes|addEvent|addTags)/);
  assert.doesNotMatch(source, /(?:name|email|userId|orderId)\s*:/);
  assert.match(source, /autoStart\s*=\s*false/);
  assert.match(source, /hideWidget/);
  assert.match(source, /shutdown/);
  assert.match(source, /startMonitoring/);

  const rootLayout = readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
  assert.match(rootLayout, /referrer:\s*"origin"/);
});
