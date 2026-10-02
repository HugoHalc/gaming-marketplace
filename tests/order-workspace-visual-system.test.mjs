import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const realState = React.useState;
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
const fixtures = new Map();
let active = null;
// Deterministic component renders: effects do not contact any external service.
const hookReact = {
  ...React,
  useState(initial) {
    if (!active) return realState(initial);
    const context = active;
    const index = context.index++;
    if (!(index in context.values)) context.values[index] = typeof initial === "function" ? initial() : initial;
    return [context.values[index], (next) => {
      context.values[index] = typeof next === "function" ? next(context.values[index]) : next;
    }];
  },
  useRef: (initial) => ({ current: initial }),
  useEffect() {},
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
};
function invoke(fn, props, name = fn.name) {
  const previous = active;
  const values = fixtures.get(name) ?? [];
  if (!fixtures.has(name)) fixtures.set(name, values);
  active = { values, index: 0 };
  try { return fn(props); } finally { active = previous; }
}
function load(file) {
  const filename = [file, `${file}.ts`, `${file}.tsx`].find(existsSync);
  assert.ok(filename, file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = { exports: {} };
  cache.set(filename, mod);
  const localRequire = (name) => {
    if (name === "react") return hookReact;
    if (name === "next/navigation") return { useRouter: () => ({ refresh() {} }) };
    if (name === "next/image") return { __esModule: true, default: ({ src, alt, width, height, className, style }) => React.createElement("img", { src, alt, width, height, className, style }) };
    if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
    if (name === "@/lib/supabase/browser") return { createAuthBrowserClient: () => { throw new Error("No external client in render tests"); } };
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
  for (const [name, fn] of Object.entries(mod.exports)) {
    if (typeof fn === "function" && /^[A-Z]/.test(name)) mod.exports[name] = (props) => invoke(fn, props, name);
  }
  return mod.exports;
}
const component = (file, name) => load(path.join(root, "src/components", file))[name];
const Customer = component("dashboard/customer-order-workspace", "CustomerOrderWorkspace");
const Booster = component("booster/booster-order-workspace", "BoosterOrderWorkspace");
const Operations = component("dashboard/order-operations-panel", "OrderOperationsPanel");
const Chat = component("dashboard/order-live-chat", "OrderLiveChat");
const Account = component("dashboard/order-account-details", "OrderAccountDetails");
const now = "2026-10-01T20:00:00Z";
const integrity = { platform: "Steam", playerId: "player-123", internalNote: null, recordedAt: now, updatedAt: now, orderId: "order-1" };
const evidence = (type) => ({ type, url: `https://example.com/${type}.png`, submittedAt: now, updatedAt: now });
function operationsState(overrides = {}) {
  return { canManage: false, canAdminister: false, isCustomer: true, currentIntegrity: null, knownIdentities: [], startEvidence: null, deliveryEvidence: null, operationalState: "accepted", operationalNote: null, deliveredAt: null, autoCompleteAt: null, operationalHistory: [], ...overrides };
}
function seedOperations(state, overrides = {}) {
  const values = [state, false, null, "Steam", "", "", "", "", false];
  for (const [index, value] of Object.entries(overrides)) values[Number(index)] = value;
  fixtures.set("OrderOperationsPanel", values);
}
const message = { id: "message-1", orderId: "order-1", senderId: "customer-1", senderRole: "customer", senderName: "Test Customer", senderAvatarUrl: null, body: "Please keep my settings.", flagged: false, createdAt: now, messageType: "user" };
function seedChat(overrides = {}) {
  const values = [[message], "", false, null, false, false, 0, { loaded: true, enabled: true, booster: { displayName: "Test Booster" }, participant: { role: "customer", displayName: "Test Customer", timezone: "America/Mexico_City", online: true, lastSeenAt: now } }];
  for (const [index, value] of Object.entries(overrides)) values[Number(index)] = value;
  fixtures.set("OrderLiveChat", values);
}
function reset(state = operationsState()) {
  fixtures.clear(); seedOperations(state); seedChat();
  fixtures.set("OrderAccountDetails", [false, "", "", false, false, false, null]);
}
function order(overrides = {}) {
  return { id: "order-1", orderNumber: "BP-123456", status: "in_progress", paymentStatus: "paid", currency: "USD", subtotal: 35, discount: 0, total: 35, customerNote: null, createdAt: now, updatedAt: now, items: [{ id: "item-1", gameName: "Rocket League", serviceName: "Rank Boost", serviceCategory: "rank", configuration: { currentRank: "gold-1", targetRank: "platinum-1", platform: "pc", expressDelivery: true }, priceBreakdown: [{ label: "Rank Boost", amount: 30 }, { label: "Express Delivery", amount: 5 }], subtotal: 35, discount: 0, total: 35, ruleSetVersion: "test" }], ...overrides };
}
const props = (record = order(), role = "customer") => ({ order: record, history: [], currentUserId: "customer-1", currentUserRole: role, initialMessages: [message], boosterAssignment: { displayName: "Test Booster", avatarUrl: null }, boosterPayout: 10.54 });
const html = (Component, data) => renderToStaticMarkup(React.createElement(Component, data));
const aside = (markup) => markup.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)?.[1] ?? "";
function expand(node) {
  if (node == null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(expand);
  if (typeof node.type === "function") return expand(invoke(node.type, node.props));
  return { ...node, props: { ...node.props, children: expand(node.props?.children) } };
}
function nodes(node, found = []) {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) { node.forEach((child) => nodes(child, found)); return found; }
  found.push(node); nodes(node.props?.children, found); return found;
}
const textOf = (node) => typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(textOf).join("") : node?.props ? textOf(node.props.children) : "";
const tree = (Component, data) => expand(React.createElement(Component, data));
function button(tree, label) { return nodes(tree).find((node) => node.type === "button" && textOf(node) === label); }
const operationsProps = { orderId: "order-1", canManage: true, suggestedPlatform: "Steam", orderStatus: "in_progress" };

for (const status of ["pending_payment", "paid", "queued", "in_progress", "completed", "cancelled", "refunded"]) {
  test(`customer and booster render ${status} without mutating the snapshot`, () => {
    reset(); const record = order({ status, paymentStatus: status === "pending_payment" ? "unpaid" : status === "refunded" ? "refunded" : "paid" });
    const before = JSON.stringify(record);
    for (const Component of [Customer, Booster]) {
      const markup = html(Component, props(record)); const sidebar = aside(markup);
      assert.equal((sidebar.match(/>Order Details</g) ?? []).length, 1);
      assert.match(sidebar, /BP-123456/); assert.match(sidebar, /Secure Account Access/);
      assert.ok(markup.indexOf("<main") < markup.indexOf("<aside"));
      assert.doesNotMatch(sidebar, /shadow-|drop-shadow|blur-|xl:sticky/);
      assert.equal((markup.match(/>Current Rank</g) ?? []).length, 1);
      assert.equal((markup.match(/>Desired Rank</g) ?? []).length, 1);
    }
    assert.equal(JSON.stringify(record), before);
    assert.match(aside(html(Booster, props(record))), /\$10\.54/);
    assert.doesNotMatch(aside(html(Customer, props(record))), /Booster Payout/);
    assert.equal(html(Customer, props(record)).includes('action="/api/checkout"'), status === "pending_payment");
  });
}

test("secure credential editing remains customer-only and payment/assignment-gated", () => {
  reset(); assert.match(html(Customer, props()), /type="email"/);
  assert.doesNotMatch(html(Customer, props(order(), "admin")), /type="email"/);
  assert.doesNotMatch(html(Booster, props()), /type="email"/);
  const noAssignment = { ...props(order({ paymentStatus: "unpaid" })), boosterAssignment: null };
  assert.doesNotMatch(html(Customer, noAssignment), /type="email"/);
  assert.match(html(Customer, { ...noAssignment, order: order() }), /type="email"/);
  fixtures.set("OrderAccountDetails", [true, "", "", false, false, false, null]);
  assert.match(html(Account, { orderId: "order-1", canEdit: false }), /Reveal/);
  assert.doesNotMatch(html(Account, { orderId: "order-1", canEdit: false }), /type="password"/);
});

for (const operationalState of ["accepted", "in_progress", "waiting_customer", "issue", "delivered", "completed"]) {
  test(`operation cards retain permissions and actions in ${operationalState}`, () => {
    reset(operationsState({ operationalState, canManage: true, isCustomer: false }));
    let rendered = tree(Operations, operationsProps);
    assert.equal(Boolean(button(rendered, "Start Work")), operationalState === "accepted");
    assert.equal(Boolean(button(rendered, "Resume Work")), operationalState === "waiting_customer");
    assert.equal(Boolean(button(rendered, "Deliver Order")), operationalState === "in_progress");
    assert.equal(Boolean(button(rendered, "Report Issue")), !["delivered", "issue", "completed"].includes(operationalState));
    if (operationalState === "in_progress") assert.equal(button(rendered, "Deliver Order").props.disabled, true);
    assert.equal(button(rendered, "Save Validation").props.disabled, true);
    assert.doesNotMatch(html(Operations, operationsProps), /Confirm Delivery/);
    seedOperations(operationsState({ operationalState, canManage: false }));
    rendered = tree(Operations, operationsProps); // Server permission overrides canManage prop.
    assert.equal(button(rendered, "Save Validation"), undefined);
    assert.equal(button(rendered, "Start Work"), undefined);
    assert.equal(Boolean(button(rendered, "Confirm Delivery")), operationalState === "delivered");
    assert.equal(Boolean(button(rendered, "Report a Problem")), operationalState === "delivered");
    if (operationalState === "delivered") assert.equal(button(rendered, "Report a Problem").props.disabled, true);
    const markup = html(Operations, operationsProps);
    assert.equal((markup.match(/<h2[^>]*>User Integrity Validation<\/h2>/g) ?? []).length, 1);
    assert.equal((markup.match(/>Start Order Screenshot</g) ?? []).length, 1);
    assert.equal((markup.match(/>Deliver Order Screenshot</g) ?? []).length, 1);
    assert.ok((markup.match(/data-order-workspace-card=""/g) ?? []).length >= 5);
  });
}

test("validation required, ready to start, deliver-ready and admin issue controls preserve their gates", () => {
  reset(operationsState({ canManage: true, isCustomer: false }));
  assert.match(html(Operations, operationsProps), /Validation Required/);
  seedOperations(operationsState({ currentIntegrity: integrity, canManage: true, isCustomer: false }));
  assert.match(html(Operations, operationsProps), /Awaiting Start Evidence/);
  seedOperations(operationsState({ currentIntegrity: integrity, startEvidence: evidence("start"), canManage: true, isCustomer: false }));
  assert.match(html(Operations, operationsProps), /Ready to Start/);
  seedOperations(operationsState({ operationalState: "in_progress", currentIntegrity: integrity, startEvidence: evidence("start"), deliveryEvidence: evidence("delivery"), canManage: true, isCustomer: false }));
  assert.equal(button(tree(Operations, operationsProps), "Deliver Order").props.disabled, false);
  seedOperations(operationsState({ operationalState: "issue", canManage: true, canAdminister: true, isCustomer: false }));
  assert.ok(button(tree(Operations, operationsProps), "Resolve & Resume Work"));
  seedOperations(operationsState({ operationalState: "issue", canManage: true, canAdminister: false, isCustomer: false }));
  assert.equal(button(tree(Operations, operationsProps), "Resolve & Resume Work"), undefined);
});

test("operation loading/error and evidence/history remain inside separate cards", () => {
  reset(); fixtures.get("OrderOperationsPanel")[1] = true;
  assert.match(html(Operations, operationsProps), /data-order-workspace-card="".*Loading order operations/s);
  seedOperations(operationsState({ currentIntegrity: integrity, startEvidence: evidence("start"), deliveryEvidence: evidence("delivery") }), { 2: "Test operational error" });
  const markup = html(Operations, operationsProps);
  assert.match(markup, /role="alert"/); assert.match(markup, /Test operational error/);
  assert.match(markup, /https:\/\/example.com\/start.png/); assert.match(markup, /https:\/\/example.com\/delivery.png/);
  assert.match(markup, /Operational history timeline/);
});

test("rank assets and pixel sizes remain canonical and flat only inside workspaces", () => {
  const Rank = component("orders/game-order-presentation", "GameRankValue");
  for (const [gameName, currentRank, targetRank, asset] of [["Rocket League", "gold-1", "platinum-1", "rocket-league/gold.png"], ["Valorant", "gold-1", "platinum-1", "valorant/gold.png"], ["Marvel Rivals", "gold", "platinum", "marvel-rivals/gold.png"], ["Overwatch 2", "gold", "platinum", "overwatch/gold.png"]]) {
    reset(); const record = order(); record.items[0].gameName = gameName;
    Object.assign(record.items[0].configuration, { currentRank, targetRank, currentDivision: gameName === "Overwatch 2" ? "3" : "III", targetDivision: gameName === "Overwatch 2" ? "2" : "II" });
    for (const [Component, expected] of [[Customer, ["Marvel Rivals", "Overwatch 2"].includes(gameName) ? 34 : 46], [Booster, 46]]) {
      const markup = aside(html(Component, props(record)));
      assert.match(markup, new RegExp(asset.replaceAll(".", "\\.")));
      assert.match(markup, new RegExp(`width="${expected}" height="${expected}"`));
      assert.doesNotMatch(markup, /drop-shadow/);
    }
    assert.match(html(Rank, { gameName, value: currentRank }), /drop-shadow/);
  }
});

test("chat keeps participants, timezone, messages, timestamps, safety copy and disabled send", () => {
  reset();
  for (const visualVariant of ["default", "customer-premium"]) {
    const data = { orderId: "order-1", currentUserId: "booster-1", initialMessages: [message], visualVariant };
    const markup = html(Chat, data);
    assert.match(markup, /Test Customer/); assert.match(markup, /America\/Mexico City/);
    assert.match(markup, /Please keep my settings/); assert.match(markup, /9?[0-9]:00/);
    assert.match(markup, /Secure Account Access/); assert.match(markup, /Never send account passwords/);
    assert.doesNotMatch(markup, /shadow|blur-|bg-gradient|linear-gradient/);
    const controls = nodes(tree(Chat, data));
    assert.equal(controls.find((n) => n.type === "button" && n.props["aria-label"] === "Send message").props.disabled, true);
    assert.ok(controls.find((n) => n.type === "textarea" && typeof n.props.onChange === "function"));
  }
});

test("chat submits and refreshes through existing endpoints; failures preserve draft", async () => {
  reset(); const data = { orderId: "order-1", currentUserId: "booster-1", initialMessages: [message] };
  seedChat({ 1: " Test draft " }); const calls = []; const oldFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => { calls.push({ url, init }); return Response.json(url.includes("?limit") ? { messages: [message], hasMore: false } : {}); };
    await nodes(tree(Chat, data)).find((n) => n.type === "form").props.onSubmit({ preventDefault() {} });
    assert.equal(calls[0].url, "/api/orders/order-1/messages");
    assert.equal(calls[0].init.method, "POST"); assert.deepEqual(JSON.parse(calls[0].init.body), { body: "Test draft" });
    assert.equal(calls[1].url, "/api/orders/order-1/messages?limit=60");
    assert.equal(fixtures.get("OrderLiveChat")[1], "");
    seedChat({ 1: "Retain this draft" });
    globalThis.fetch = async () => Response.json({ error: "Test send error" }, { status: 500 });
    await nodes(tree(Chat, data)).find((n) => n.type === "form").props.onSubmit({ preventDefault() {} });
    assert.equal(fixtures.get("OrderLiveChat")[1], "Retain this draft");
    assert.match(html(Chat, data), /Test send error/);
  } finally { globalThis.fetch = oldFetch; }
});

test("operational and credential callbacks retain payloads without external writes", async () => {
  reset(operationsState({ canManage: true, isCustomer: false }));
  const calls = []; const oldFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => { calls.push({ url, init }); return Response.json(operationsState({ canManage: true, isCustomer: false })); };
    await button(tree(Operations, operationsProps), "Start Work").props.onClick();
    assert.deepEqual(JSON.parse(calls[0].init.body), { action: "transition", nextState: "in_progress" });
    assert.equal(calls[0].url, "/api/orders/order-1/lifecycle");
    seedOperations(operationsState({ canManage: true, isCustomer: false }), { 4: "player-123", 5: "Private note" });
    await button(tree(Operations, operationsProps), "Save Validation").props.onClick();
    assert.equal(calls[1].url, "/api/orders/order-1/integrity");
    assert.deepEqual(JSON.parse(calls[1].init.body), { platform: "Steam", playerId: "player-123", internalNote: "Private note" });
    fixtures.set("OrderAccountDetails", [false, "test@example.com", "test-only-password", false, false, false, null]);
    await nodes(tree(Account, { orderId: "order-1", canEdit: true })).find((n) => n.type === "form").props.onSubmit({ preventDefault() {} });
    assert.equal(calls[2].url, "/api/orders/order-1/credentials");
    assert.deepEqual(JSON.parse(calls[2].init.body), { accountEmail: "test@example.com", password: "test-only-password" });
  } finally { globalThis.fetch = oldFetch; }
});

test("mobile structure keeps chat first, intrinsic card widths, wrapping ranks and safe-area composer", () => {
  reset();
  for (const Component of [Customer, Booster]) {
    const elements = nodes(tree(Component, props()));
    const layout = elements.find((n) => n.type === "div" && n.props.className?.includes("xl:grid-cols-[minmax(0,1fr)"));
    assert.ok(layout); assert.doesNotMatch(layout.props.className, /(?:^|\s)grid-cols-\[/);
    const mainIndex = elements.findIndex((n) => n.type === "main");
    const sidebarIndex = elements.findIndex((n) => n.type === "aside");
    assert.ok(mainIndex < sidebarIndex);
    for (const card of elements.filter((n) => n.props["data-order-workspace-card"] !== undefined)) {
      assert.match(card.props.className, /min-w-0/);
      assert.match(card.props.className, /overflow-wrap:anywhere/);
      assert.doesNotMatch(card.props.className, /shadow|(?:^|\s)w-\[/);
    }
    const markup = html(Component, props());
    assert.match(markup, /safe-area-inset-bottom/);
    assert.match(markup, /grid-cols-\[minmax\(0,1fr\)_auto_minmax\(0,1fr\)\]/);
    assert.match(markup, /break-words leading-tight/);
    assert.match(markup, /size-11 shrink-0/);
  }
});
