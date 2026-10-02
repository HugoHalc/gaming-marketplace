import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(import.meta.dirname, "..");
const contexts = new Map();
const cache = new Map();
let active = null;
let refreshes = 0;
let clientDate = true;
let pathname = "/dashboard/orders";
let mode = "booster";
const router = { refresh() { refreshes++; } };
const hooks = {
  ...React,
  useState(initial) {
    const context = active, index = context.stateIndex++;
    if (!(index in context.states)) context.states[index] = typeof initial === "function" ? initial() : initial;
    return [context.states[index], (next) => { context.states[index] = typeof next === "function" ? next(context.states[index]) : next; }];
  },
  useRef(initial) {
    const context = active, index = context.refIndex++;
    return context.refs[index] ??= { current: initial };
  },
  useEffect(fn, deps) {
    const context = active, index = context.effectIndex++;
    const old = context.effects[index];
    if (!old || deps.some((dep, i) => dep !== old.deps[i])) context.effects[index] = { fn, deps, cleanup: old?.cleanup, pending: true };
  },
  useSyncExternalStore: (_subscribe, snapshot, serverSnapshot) => clientDate ? snapshot() : serverSnapshot(),
  useMemo: (fn) => fn(), useCallback: (fn) => fn,
  useTransition: () => [false, (fn) => fn()],
};
function invoke(fn, props) {
  const key = `${fn.name}:${props.orderId ?? props.order?.id ?? ""}`;
  const context = contexts.get(key) ?? { states: [], refs: [], effects: [] };
  contexts.set(key, context);
  context.stateIndex = 0; context.refIndex = 0; context.effectIndex = 0;
  const previous = active; active = context;
  try { return fn(props); } finally { active = previous; }
}
function load(file) {
  const filename = [file, `${file}.ts`, `${file}.tsx`].find(existsSync);
  assert.ok(filename, file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = { exports: {} }; cache.set(filename, mod);
  const localRequire = (name) => {
    if (name === "react") return hooks;
    if (name === "next/navigation") return { useRouter: () => router, usePathname: () => pathname, useSearchParams: () => new URLSearchParams(mode ? `mode=${mode}` : "") };
    if (name === "next/image") return { __esModule: true, default: ({ src, alt, width, height, className }) => React.createElement("img", { src, alt, width, height, className }) };
    if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
    if (name.startsWith("@/")) return load(path.join(root, "src", name.slice(2)));
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), name));
    return require(name);
  };
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal(compiled.diagnostics.length, 0, filename);
  vm.runInThisContext(`(function(require,module,exports){${compiled.outputText}\n})`, { filename })(localRequire, mod, mod.exports);
  return mod.exports;
}
function expand(node) {
  if (node == null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(expand);
  if (typeof node.type === "function") return expand(invoke(node.type, node.props));
  if (node.type?.$$typeof === Symbol.for("react.memo")) return expand(invoke(node.type.type, node.props));
  return { ...node, props: { ...node.props, children: expand(node.props?.children) } };
}
function nodes(node, result = []) {
  if (!node || typeof node !== "object") return result;
  if (Array.isArray(node)) { node.forEach((child) => nodes(child, result)); return result; }
  result.push(node); nodes(node.props?.children, result); return result;
}
const textOf = (node) => typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(textOf).join("") : node?.props ? textOf(node.props.children) : "";
const render = (Component, props) => expand(React.createElement(Component, props));
const button = (tree, label) => nodes(tree).find((node) => node.type === "button" && (textOf(node) === label || node.props["aria-label"] === label));
function keyedTree(node, key = "root") {
  if (node == null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map((child, index) => keyedTree(child, String(index)));
  return React.createElement(node.type, { ...node.props, key: node.key ?? key }, keyedTree(node.props.children));
}
const html = (tree) => renderToStaticMarkup(keyedTree(tree));
function reset() { contexts.clear(); refreshes = 0; }
async function effects() {
  for (const context of contexts.values()) for (const effect of context.effects) if (effect?.pending) {
    effect.cleanup?.(); effect.pending = false; effect.cleanup = effect.fn();
  }
  await Promise.resolve();
}
function cleanup() { for (const context of contexts.values()) for (const effect of context.effects) effect?.cleanup?.(); }
const model = load(path.join(root, "src/features/booster/presentation/order-board"));
const alerts = load(path.join(root, "src/features/booster/presentation/order-alerts"));
const Hub = load(path.join(root, "src/components/dashboard/booster-orders-hub")).BoosterOrdersHub;
const Claim = load(path.join(root, "src/components/booster/claim-order-button")).ClaimOrderButton;
const Card = load(path.join(root, "src/components/booster/booster-order-card"));
const now = Date.parse("2026-10-02T06:00:00Z");
function entry(id = "one", overrides = {}) {
  return { payout: 12.34, assignedAt: null, order: { id, orderNumber: `BP-${id}`, status: "paid", paymentStatus: "paid", createdAt: "2026-10-02T05:00:00Z", total: 99.99, customerNote: "SECRET NOTE", items: [{ gameName: "Rocket League", serviceName: "Rank Boost", configuration: { platform: "pc", region: "Europe", currentRank: "gold-1", targetRank: "platinum-1", email: "private@example.com", password: "PRIVATE PASSWORD", username: "PRIVATE USER", evidence: "private.png", expressDelivery: true, streaming: true, playOffline: true, rankInsurance: true } }], ...overrides } };
}
const order = (id = "one", bucket = "available") => ({ ...model.projectBoardOrders([entry(id)], "available")[0], bucket });
const hubProps = (orders, overrides = {}) => ({ orders, viewerId: "booster-one", generatedAt: now, ...overrides });

class Audio {
  static instances = [];
  constructor() { Audio.instances.push(this); this.state = "suspended"; this.currentTime = 1; this.oscillators = []; this.closed = false; this.destination = {}; }
  async resume() { this.state = "running"; }
  async close() { this.closed = true; }
  createOscillator() { const oscillator = { frequency: {}, connect() {}, start() {}, stop() {}, disconnect() {} }; this.oscillators.push(oscillator); return oscillator; }
  createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
}
async function browser(fn) {
  const originals = { window: globalThis.window, document: globalThis.document, localStorage: globalThis.localStorage };
  const stored = new Map(), listeners = new Map(), intervals = new Map(), timers = new Map();
  let timerId = 0;
  const document = { visibilityState: "visible", addEventListener(name, fn) { listeners.set(name, fn); }, removeEventListener(name) { listeners.delete(name); }, getElementById: () => ({ focus() {} }) };
  const window = { AudioContext: Audio, addEventListener(name, fn) { listeners.set(name, fn); }, removeEventListener(name) { listeners.delete(name); }, setInterval(fn, ms) { intervals.set(++timerId, { fn, ms }); return timerId; }, clearInterval(id) { intervals.delete(id); }, setTimeout(fn, ms) { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout(id) { timers.delete(id); }, requestAnimationFrame(fn) { timers.set(++timerId, { fn, ms: 0 }); return timerId; } };
  Object.assign(globalThis, { window, document, localStorage: { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) } });
  Audio.instances = []; reset();
  try { await fn({ stored, document, listeners, intervals, timers }); } finally { cleanup(); Object.assign(globalThis, originals); }
}

test("projection exposes real payout and approved public configuration only", () => {
  const projected = model.projectBoardOrders([entry()], "available");
  assert.equal(projected[0].payout, 12.34);
  assert.doesNotMatch(JSON.stringify(projected), /99\.99|SECRET|PRIVATE|private@|private\.png|email|password|username|evidence|customerNote|priceBreakdown/);
  assert.equal(projected[0].configuration.currentRank, "gold-1");
  assert.equal(model.boardGames.length, 7);
  for (const game of model.boardGames) assert.ok(existsSync(path.join(root, "public", model.gameLogos[game.slug])));
  assert.deepEqual(model.projectBoardOrders([entry("unpaid", { paymentStatus: "unpaid" }), entry("cancelled", { status: "cancelled" }), { ...entry("bad"), payout: NaN }, entry("unknown", { items: [{ gameName: "Unapproved Game", configuration: {} }] })], "available"), []);
});

test("combined game/status filters, newest sorting and public search", () => {
  const a = order(), b = { ...order("two"), gameSlug: "valorant", gameName: "Valorant", createdAt: "2026-10-02T05:30:00Z" }, c = order("three", "active");
  assert.deepEqual(model.filterBoardOrders([a, b, c], "available", "all", "").map((row) => row.id), ["two", "one"]);
  assert.deepEqual(model.filterBoardOrders([a, b, c], "active", "rocket-league", "Europe").map((row) => row.id), ["three"]);
  for (const query of ["BP-one", "Rocket League", "Rank Boost", "pc", "Europe"]) assert.equal(model.filterBoardOrders([a], "available", "all", query).length, 1);
  assert.equal(model.filterBoardOrders([a], "available", "all", "PRIVATE PASSWORD").length, 0);
});

test("initial snapshot, refresh, seen IDs and status changes never repeat alerts", () => {
  const tracker = new alerts.OrderAlertTracker();
  assert.deepEqual(tracker.observe([order(), order("two", "active"), order("three", "completed")]), []);
  assert.deepEqual(tracker.observe([order(), order("two"), order("three")]), []);
  assert.deepEqual(tracker.observe([order("new"), order("new")]).map((row) => row.id), ["new"]);
  assert.deepEqual(tracker.observe([order("new")]), []);
  const reload = new alerts.OrderAlertTracker(); reload.merge(alerts.readSeenIds(JSON.stringify({ version: 1, ids: tracker.ids() })));
  assert.deepEqual(reload.observe([order("new")]), []);
  assert.deepEqual(reload.observe([order("one")]), []);
  assert.deepEqual(alerts.readSeenIds("invalid"), []);
  assert.deepEqual(alerts.readSeenIds('{"version":2,"ids":["one"]}'), []);
});

test("unavailable/assigned duplicate and ineligible projection do not alert", () => {
  const tracker = new alerts.OrderAlertTracker(); tracker.observe([]);
  assert.deepEqual(tracker.observe([order("claimed"), order("claimed", "active")]), []);
  assert.deepEqual(tracker.observe(model.projectBoardOrders([entry("unpaid", { paymentStatus: "unpaid" })], "available")), []);
});

test("chime is short, user unlocked, non-overlapping and cleaned up", async () => {
  const audio = new Audio(), sound = alerts.createOrderChime(audio);
  assert.equal(sound.play(), false); assert.equal(audio.oscillators.length, 0);
  await sound.unlock(); assert.equal(sound.play(), true); assert.equal(audio.oscillators.length, 2);
  assert.equal(sound.play(), false); assert.equal(audio.oscillators.length, 2);
  audio.currentTime += 1; assert.equal(sound.play(), true);
  await sound.close(); assert.equal(audio.closed, true);
});

test("board initial load is silent; new eligible order sounds once after Enable", async () => browser(async ({ stored }) => {
  let tree = render(Hub, hubProps([order()])); await effects();
  assert.equal(Audio.instances.length, 0); assert.doesNotMatch(html(tree), /New order available/);
  button(tree, "Enable order sounds").props.onClick();
  tree = render(Hub, hubProps([order()]));
  await button(tree, "On").props.onClick();
  tree = render(Hub, hubProps([order()])); await effects();
  assert.ok(button(tree, "Order sounds on"));
  const rows = [order("fresh"), order()]; render(Hub, hubProps(rows)); await effects();
  tree = render(Hub, hubProps(rows)); assert.match(html(tree), /New order available/);
  assert.equal(Audio.instances[0].oscillators.length, 2);
  render(Hub, hubProps([...rows])); await effects(); assert.equal(Audio.instances[0].oscillators.length, 2);
  assert.match(stored.get("boostingpedia:order-board:sounds:v1:booster-one"), /"enabled":true/);
  assert.match(html(tree), /aria-live="polite"/);
}));

test("mute still shows new order toast without sound; saved preference respects autoplay", async () => browser(async ({ stored }) => {
  stored.set("boostingpedia:order-board:sounds:v1:booster-one", '{"version":1,"enabled":true}');
  let tree = render(Hub, hubProps([])); await effects(); tree = render(Hub, hubProps([]));
  assert.equal(Audio.instances.length, 0); assert.doesNotMatch(html(tree), /Activate for this browser session/);
  button(tree, "Enable order sounds").props.onClick(); tree = render(Hub, hubProps([]));
  await button(tree, "On").props.onClick(); tree = render(Hub, hubProps([]));
  button(tree, "Off").props.onClick();
  const rows = [order("muted")]; render(Hub, hubProps(rows)); await effects(); tree = render(Hub, hubProps(rows));
  assert.match(html(tree), /New order available/); assert.equal(Audio.instances[0].oscillators.length, 0);
  assert.match(stored.get("boostingpedia:order-board:sounds:v1:booster-one"), /"enabled":false/);
}));

test("polling skips hidden/pending/claiming states and cleans up listeners", async () => browser(async ({ document, intervals, listeners }) => {
  assert.equal(alerts.canRefreshBoard(true, true, false), false);
  assert.equal(alerts.canRefreshBoard(true, false, true), false);
  let tree = render(Hub, hubProps([order()])); await effects();
  assert.equal(intervals.size, 1); assert.equal([...intervals.values()][0].ms, 15000);
  document.visibilityState = "hidden"; [...intervals.values()][0].fn(); assert.equal(refreshes, 0);
  document.visibilityState = "visible"; listeners.get("visibilitychange")(); assert.equal(refreshes, 1);
  const context = contexts.get("BoosterOrdersHub:"); context.states[6] = 1;
  tree = render(Hub, hubProps([order()])); await effects();
  [...intervals.values()][0].fn(); assert.equal(refreshes, 1); assert.equal(button(tree, "Refresh orders").props.disabled, true);
  cleanup(); assert.equal(intervals.size, 0); assert.equal(listeners.size, 0);
}));

async function acceptWith(response, expected, double = false) {
  reset(); const previous = globalThis.fetch, calls = [], confirmed = [], conflicts = [], pending = [];
  let finish; globalThis.fetch = (...args) => { calls.push(args); return new Promise((resolve) => { finish = resolve; }); };
  const props = { orderId: "one", onClaimed: (...args) => confirmed.push(args), onConflict: (id) => conflicts.push(id), onPending: (value) => pending.push(value) };
  try {
    let tree = render(Claim, props), form = nodes(tree).find((node) => node.type === "form");
    const promise = form.props.onSubmit({ preventDefault() {} });
    if (double) await form.props.onSubmit({ preventDefault() {} });
    assert.deepEqual(confirmed, []); assert.equal(calls.length, 1);
    tree = render(Claim, props); assert.equal(button(tree, "Accepting…").props.disabled, true);
    finish({ ok: response.ok, status: response.status, json: async () => response.body }); await promise;
    tree = render(Claim, props); assert.deepEqual(pending, [true, false]);
    assert.deepEqual(confirmed, expected.confirmed ?? []); assert.deepEqual(conflicts, expected.conflicts ?? []);
    if (expected.error) { assert.match(html(tree), expected.error); assert.match(html(tree), /role="alert"/); }
    assert.equal(calls[0][0], "/api/booster/orders/one/claim");
    assert.equal(calls[0][1].headers.Accept, "application/json");
  } finally { globalThis.fetch = previous; }
}

test("acceptance waits for authenticated server confirmation and blocks double submit", async () => {
  await acceptWith({ ok: true, status: 200, body: { orderId: "one", payout: 12.34 } }, { confirmed: [["one", 12.34]] }, true);
});
test("concurrent claim conflict is explicit and removes only unavailable order", async () => {
  await acceptWith({ ok: false, status: 409, body: { error: "Order is not available for claiming" } }, { conflicts: ["one"], error: /not available/ });
});
test("session failures and malformed confirmation never assign optimistically", async () => {
  await acceptWith({ ok: false, status: 409, body: { error: "NEXT_REDIRECT" } }, { error: /sign in again/ });
  await acceptWith({ ok: true, status: 200, body: { orderId: "one", payout: -1 } }, { error: /Unable to confirm/ });
});
test("confirmed claim survives stale refresh and server completion wins", () => {
  const assigned = { ...order("one", "active"), payout: 9.87 };
  assert.equal(model.mergeConfirmedClaims([order()], [assigned])[0].bucket, "active");
  assert.equal(model.mergeConfirmedClaims([order()], [assigned])[0].payout, 9.87);
  assert.equal(model.mergeConfirmedClaims([order("one", "completed")], [assigned])[0].bucket, "completed");
});

test("cards share responsive structure, canonical flat ranks, real payout and workspace links", () => {
  reset(); const data = { order: order(), now, isNew: false, onSeen() {}, onClaimed() {}, onConflict() {}, onPending() {} };
  const markup = html(render(Card.BoosterOrderCardView, data));
  assert.match(markup, /\$12\.34/); assert.doesNotMatch(markup, /99\.99|PRIVATE|private@|shadow-|drop-shadow|glow/);
  assert.match(markup, /ranks\/rocket-league\//); assert.match(markup, /Current Rank/); assert.match(markup, /Desired Rank/);
  assert.match(markup, /more extras/); assert.match(markup, /min-h-11/); assert.match(markup, /overflow-wrap:anywhere/);
  for (const bucket of ["active", "completed"]) {
    const tree = render(Card.BoosterOrderCardView, { ...data, order: order("one", bucket) });
    const link = nodes(tree).find((node) => node.type === "a");
    assert.equal(link.props.href, "/booster/orders/one"); assert.equal(textOf(link), bucket === "active" ? "Open Workspace" : "View Order");
  }
  assert.equal(Card.elapsedOrderTime("2026-10-02T05:00:00Z", now), "1h ago");
  assert.equal(Card.elapsedOrderTime("bad", now), null);
  reset(); const grid = html(render(Hub, hubProps([order()])));
  assert.match(grid, /grid-cols-1 md:grid-cols-2 min-\[1440px\]:grid-cols-3/); assert.match(grid, /min-\[1600px\]:hidden/);
  reset(); const list = html(render(Hub, hubProps([order()], { initialLayout: "list" })));
  assert.doesNotMatch(list, /min-\[1440px\]:grid-cols-3/);
  assert.equal((grid.match(/data-order-board-card=/g) ?? []).length, (list.match(/data-order-board-card=/g) ?? []).length);
});

test("default Available and specific empty states preserve accessible controls", () => {
  for (const [bucket, label] of [["available", "No available orders"], ["active", "No in-progress orders"], ["completed", "No completed orders"]]) {
    reset(); const markup = html(render(Hub, hubProps([], { initialBucket: bucket })));
    assert.match(markup, new RegExp(label)); assert.match(markup, /aria-pressed="true"/); assert.match(markup, /Search orders/);
  }
  reset(); assert.match(html(render(Hub, hubProps([], { initialSearch: "no result" }))), /No search results/);
  reset(); const tree = render(Hub, hubProps([order()]));
  assert.equal(button(tree, "Available 1").props["aria-pressed"], true);
  assert.equal(button(tree, "Grid view").props["aria-pressed"], true);
});

test("existing active-profile eligibility and admin atomic operations remain authoritative", () => {
  const auth = readFileSync(path.join(root, "src/features/auth/server/auth.ts"), "utf8");
  assert.match(auth, /async function requireBooster/); assert.match(auth, /\.eq\("is_active", true\)/);
  const claims = readFileSync(path.join(root, "src/features/booster/server/booster-orders.ts"), "utf8");
  assert.match(claims, /await requireBooster\(\)/); assert.match(claims, /claim_order_for_booster/);
  const sql = readFileSync(path.join(root, "supabase/migrations/phase_16g_order_lifecycle_delivery_confirmation.sql"), "utf8");
  assert.match(sql, /for update/i); assert.match(sql, /on conflict/i); assert.match(sql, /is_active/i);
  const operations = readFileSync(path.join(root, "src/features/orders/server/order-operations-repository.ts"), "utf8");
  assert.match(operations, /admin/);
});


test("service-specific hero, mastery, previous rank and modifiers are preserved without changing snapshots", () => {
  for (const [gameName, configuration, expected] of [
    ["Dota 2", { heroName: "Anti-Mage", currentLevel: 1, desiredLevel: 5, privacyMode: true, dotaPlusConfirmed: true }, /Anti Mage/],
    ["League of Legends", { masteryMode: "points", masteryPoints: 10000, masteryCurrentLevel: 1, masteryTargetLevel: 3 }, /10000/],
    ["Rainbow Six Siege", { previousSeasonRank: "copper", games: 5, specificOperators: true }, /Previous Rank/],
  ]) {
    const raw = entry("service", { items: [{ gameName, serviceName: "Existing Service", configuration }] });
    const before = JSON.stringify(raw), projected = model.projectBoardOrders([raw], "available")[0];
    reset(); const markup = html(render(Card.BoosterOrderCardView, { order: projected, now, isNew: false, onSeen() {}, onClaimed() {}, onConflict() {}, onPending() {} }));
    assert.match(markup, expected); assert.equal(JSON.stringify(raw), before);
    if (configuration.privacyMode) assert.match(markup, /Privacy Mode/);
    if (configuration.specificOperators) assert.match(markup, /Specific Operators/);
  }
});

test("active booster and admin profiles keep board access; missing session/profile remains denied", async () => {
  const file = path.join(root, "src/features/auth/server/auth.ts");
  const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const scenario of [{ role: "booster", active: true, session: true }, { role: "admin", active: true, session: true }, { role: "customer", active: false, session: true }, { role: "booster", active: true, session: false }]) {
    const client = { auth: { getClaims: async () => ({ data: { claims: scenario.session ? { sub: "viewer" } : null }, error: null }) }, from(table) { const query = { select() { return query; }, eq() { return query; }, async maybeSingle() { return { data: table === "profiles" ? { role: scenario.role } : scenario.active ? { user_id: "viewer", is_active: true, payout_rate_bps: 2500 } : null, error: null }; } }; return query; } };
    const mod = { exports: {} };
    const mockedRequire = (name) => name === "next/navigation" ? { redirect(url) { throw new Error(`Redirect:${url}`); } } : name.endsWith("/env") ? { hasPublicSupabaseEnv: () => true } : { createAuthServerClient: async () => client };
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(mockedRequire, mod, mod.exports);
    if (scenario.active && scenario.session) {
      const result = await mod.exports.requireBooster(); assert.equal(result.profile.role, scenario.role); assert.equal(result.boosterProfile.payoutRateBps, 2500);
    } else await assert.rejects(mod.exports.requireBooster(), /Redirect:/);
  }
});


test("claim conflict stays visible after removal and successful claim moves to In Progress", async () => {
  const previous = globalThis.fetch;
  try {
    reset(); globalThis.fetch = async () => ({ ok: false, status: 409, json: async () => ({ error: "This order is no longer available." }) });
    let tree = render(Hub, hubProps([order()]));
    await nodes(tree).find((node) => node.type === "form").props.onSubmit({ preventDefault() {} });
    tree = render(Hub, hubProps([order()]));
    assert.match(html(tree), /role="alert"/); assert.match(html(tree), /no longer available/);
    assert.equal(nodes(tree).filter((node) => node.type === "article").length, 0);
    reset(); globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ orderId: "one", payout: 9.87 }) });
    tree = render(Hub, hubProps([order()]));
    await nodes(tree).find((node) => node.type === "form").props.onSubmit({ preventDefault() {} });
    tree = render(Hub, hubProps([order()])); assert.ok(button(tree, "In Progress 1")); assert.ok(button(tree, "Available 0"));
    button(tree, "In Progress 1").props.onClick(); tree = render(Hub, hubProps([order()]));
    assert.match(html(tree), /Open Workspace/); assert.match(html(tree), /\$9\.87/);
  } finally { globalThis.fetch = previous; }
});

test("short IDs reuse compact public numbers and expand colliding suffixes consistently", () => {
  const rows = [{ ...order("uuid-one"), orderNumber: "VB-25EE2C00D2" }, { ...order("uuid-two"), orderNumber: "VB-ABCD2C00D2" }, { ...order("uuid-three"), orderNumber: "#12345" }];
  const labels = model.shortBoardOrderIds(rows);
  assert.equal(new Set(labels.values()).size, rows.length);
  assert.equal(labels.get("uuid-three"), "#12345");
  assert.ok(labels.get("uuid-one").length > 7);
  assert.deepEqual([...model.shortBoardOrderIds([...rows].reverse())].sort(), [...labels].sort());
  const single = model.shortBoardOrderIds([rows[0]]); assert.equal(single.get("uuid-one"), "#2C00D2");
  reset(); const markup = html(render(Card.BoosterOrderCardView, { order: rows[0], shortId: single.get(rows[0].id), now, isNew: false, onSeen() {}, onClaimed() {}, onConflict() {}, onPending() {} }));
  assert.match(markup, /#2C00D2/); assert.match(markup, /title="VB-25EE2C00D2 · uuid-one"/); assert.match(markup, /aria-label="Order VB-25EE2C00D2"/);
});

test("toolbar has compact icon controls and no permanent polling or sound setup copy", () => {
  reset(); const tree = render(Hub, hubProps([order()])), markup = html(tree);
  assert.match(markup, /data-order-board-toolbar/); assert.match(markup, /xl:flex-nowrap/);
  assert.doesNotMatch(markup, /Auto-refresh|15 seconds|preference is saved|Test sound/);
  assert.ok(button(tree, "Refresh orders")); assert.ok(button(tree, "Grid view")); assert.ok(button(tree, "List view"));
  assert.ok(button(tree, "Enable order sounds"));
  assert.match(markup, /placeholder="Search orders"/); assert.match(markup, /sr-only/);
  const link = nodes(tree).find((node) => node.type === "a" && textOf(node) === "Switch to Customer Orders");
  assert.equal(link.props.href, "/dashboard/orders?mode=customer");
});

test("sound popover preserves Test/On/Off and Escape returns focus without autoplay", async () => browser(async ({ listeners }) => {
  let tree = render(Hub, hubProps([])); await effects();
  assert.equal(Audio.instances.length, 0);
  button(tree, "Enable order sounds").props.onClick(); tree = render(Hub, hubProps([])); await effects();
  assert.equal(button(tree, "Enable order sounds").props["aria-expanded"], true);
  await button(tree, "Test sound").props.onClick(); tree = render(Hub, hubProps([]));
  assert.equal(Audio.instances[0].oscillators.length, 2); assert.equal(button(tree, "On").props["aria-pressed"], false);
  await button(tree, "On").props.onClick(); tree = render(Hub, hubProps([])); assert.ok(button(tree, "Order sounds on"));
  button(tree, "Off").props.onClick(); tree = render(Hub, hubProps([])); assert.ok(button(tree, "Order sounds muted"));
  let focused = 0; button(tree, "Order sounds muted").props.ref.current = { focus() { focused++; } };
  listeners.get("keydown")({ key: "Escape" }); tree = render(Hub, hubProps([]));
  assert.equal(focused, 1); assert.equal(button(tree, "Order sounds muted").props["aria-expanded"], false);
  assert.doesNotMatch(html(tree), /Test sound/);
}));

test("dates hydrate consistently and then use browser timezone without a hardcoded timezone", () => {
  const DateView = load(path.join(root, "src/components/booster/order-local-date")).OrderLocalDate;
  const timestamp = "2026-10-02T03:21:00Z";
  clientDate = false; reset(); assert.equal(textOf(render(DateView, { timestamp })), "2026-10-02");
  const previous = process.env.TZ;
  try {
    clientDate = true; process.env.TZ = "America/Mexico_City";
    const local = textOf(render(DateView, { timestamp }));
    assert.equal(local, new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp)));
    assert.doesNotMatch(local, /UTC/);
    process.env.TZ = "Asia/Tokyo"; assert.notEqual(textOf(render(DateView, { timestamp })), local);
    assert.equal(render(DateView, { timestamp: "invalid" }), null);
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; clientDate = true; }
});

test("shell labels match booster/customer view while menus and permissions remain available", () => {
  const Shell = load(path.join(root, "src/components/dashboard/dashboard-shell")).DashboardShell;
  const props = { children: "BOARD", displayName: "Tester", email: "test@example.invalid", avatarUrl: null, initials: "T", unreadNotifications: 0, canAccessBooster: true, canAccessAdmin: true, defaultBoosterContext: false };
  for (const scenario of [{ mode: "booster", defaultRole: false, active: true, booster: true }, { mode: "", defaultRole: true, active: true, booster: true }, { mode: "customer", defaultRole: true, active: true, booster: false }, { mode: "booster", defaultRole: false, active: false, booster: false }]) {
    reset(); pathname = "/dashboard/orders"; mode = scenario.mode;
    const tree = render(Shell, { ...props, canAccessBooster: scenario.active, defaultBoosterContext: scenario.defaultRole });
    const header = nodes(tree).find((node) => node.type === "header");
    assert.equal(textOf(header).includes("Booster Account"), scenario.booster);
    assert.equal(textOf(header).includes("Customer Account"), !scenario.booster);
    const links = nodes(tree).filter((node) => node.type === "a");
    assert.ok(links.some((node) => node.props.href === "/admin"));
    assert.equal(links.some((node) => node.props.href === "/booster"), scenario.active);
  }
  reset(); pathname = "/dashboard/settings"; mode = "booster";
  assert.match(textOf(render(Shell, props)), /Customer Account/);
  pathname = "/dashboard/orders"; mode = "booster";
});

test("explicit customer switch selects customer render without widening booster or admin access", async () => {
  const filename = path.join(root, "src/app/dashboard/orders/page.tsx");
  const source = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  for (const scenario of [{ role: "booster", active: true, mode: "customer", board: false }, { role: "booster", active: true, mode: "", board: true }, { role: "admin", active: true, mode: "booster", board: true }, { role: "admin", active: false, mode: "booster", board: false }, { role: "customer", active: false, mode: "booster", board: false }]) {
    let boardCalls = 0, customerCalls = 0;
    const Board = () => null, Customer = () => null;
    const mod = { exports: {} }, query = { select() { return query; }, eq() { return query; }, async maybeSingle() { return { data: scenario.active ? { user_id: "viewer" } : null }; } };
    const mockedRequire = (name) => {
      if (name === "react/jsx-runtime") return require(name);
      if (name === "next/link") return { default: () => null };
      if (name.endsWith("auth/server/auth")) return { requireUser: async () => ({ id: "viewer", profile: { role: scenario.role } }) };
      if (name.endsWith("order-repository")) return { listCurrentUserOrders: async () => { customerCalls++; return []; } };
      if (name.endsWith("supabase/server")) return { createSecretServerClient: () => ({ from: () => query }) };
      if (name.endsWith("server/order-board")) return { getBoosterOrderBoard: async () => { boardCalls++; return { viewerId: "viewer", orders: [], generatedAt: now }; } };
      if (name.endsWith("/booster-orders-hub")) return { BoosterOrdersHub: Board };
      if (name.endsWith("/dashboard-orders-hub")) return { DashboardOrdersHub: Customer };
      throw new Error(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename })(mockedRequire, mod, mod.exports);
    await mod.exports.default({ searchParams: Promise.resolve({ mode: scenario.mode }) });
    assert.equal(boardCalls, Number(scenario.board)); assert.equal(customerCalls, Number(!scenario.board));
  }
});
