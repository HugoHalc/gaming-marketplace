import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { randomBytes } from "node:crypto";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
function load(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const mod = { exports: {} };
  const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })((name) => name === "server-only" ? {} : mocks[name] ?? require(name), mod, mod.exports);
  return mod.exports;
}
const crypto = load("src/lib/security/order-credentials.ts");
const mode = load("src/features/orders/presentation/account-details-mode.ts");
const originalKey = process.env.BOOSTINGPEDIA_CREDENTIALS_KEY;
process.env.BOOSTINGPEDIA_CREDENTIALS_KEY = randomBytes(32).toString("base64");
test.after(() => { if (originalKey === undefined) delete process.env.BOOSTINGPEDIA_CREDENTIALS_KEY; else process.env.BOOSTINGPEDIA_CREDENTIALS_KEY = originalKey; });

for (const game of ["Rocket League", "League of Legends", "Marvel Rivals", "Overwatch 2", "Dota 2"]) {
  test(`${game}: account and player modes use the immutable method`, () => {
    assert.equal(mode.getAccountDetailsMode(game, { boostMethod: "account" }), "account");
    assert.equal(mode.getAccountDetailsMode(game, { boostMethod: "solo" }), "account");
    assert.equal(mode.getAccountDetailsMode(game, { boostMethod: "duo" }), "player");
    assert.equal(mode.getAccountDetailsMode(game, {}), null);
  });
}
test("Valorant and Siege interpret their own mode keys without treating LoL solo-duo queue as Duo", () => {
  assert.equal(mode.getAccountDetailsMode("Valorant", { queue: "duo" }), "player");
  assert.equal(mode.getAccountDetailsMode("Rainbow Six Siege", { gameMode: "solo" }), "account");
  assert.equal(mode.getAccountDetailsMode("League of Legends", { queue: "solo-duo" }), null);
});
test("encrypted player details and legacy account payloads round-trip; tampering is rejected", () => {
  const sample = randomBytes(12).toString("hex");
  for (const payload of [{ accountEmail: `${sample}@example.invalid`, password: sample }, { kind: "player", username: sample }]) {
    const encrypted = crypto.encryptOrderCredentials(payload);
    assert.ok(!encrypted.ciphertext.includes(sample));
    assert.deepEqual(crypto.decryptOrderCredentials(encrypted), payload);
    const altered = { ...encrypted, authTag: randomBytes(16).toString("base64") };
    assert.throws(() => crypto.decryptOrderCredentials(altered));
  }
});
function server({ role = "customer", owner = true, assigned = false, method = "duo", itemsError = false } = {}) {
  const writes = [];
  const client = { from(table) {
    let op = "select";
    const query = {
      select() { return query; }, eq() { return query; },
      upsert(value) { writes.push(value); op = "upsert"; return query; },
      maybeSingle() { return Promise.resolve(result()); },
      then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
    };
    function result() {
      if (table === "orders") return { data: { id: "order-1", user_id: owner ? "viewer" : "someone-else" }, error: null };
      if (table === "order_booster_assignments") return { data: assigned ? { order_id: "order-1" } : null, error: null };
      if (table === "order_items") return { data: [{ game_name: "Marvel Rivals", configuration: method ? { boostMethod: method } : {} }], error: itemsError ? new Error("unavailable") : null };
      return { data: op === "upsert" ? null : null, error: null };
    }
    return query;
  } };
  return { writes, repository: load("src/features/orders/server/order-workspace-repository.ts", {
    "@/lib/supabase/server": { createSecretServerClient: () => client },
    "@/features/auth/server/auth": { requireUser: async () => ({ id: "viewer", profile: { role } }) },
    "@/lib/security/order-credentials": crypto,
    "@/features/orders/presentation/account-details-mode": mode,
  }) };
}
test("owner saves username without password; stored row has only encrypted data", async () => {
  const { repository, writes } = server();
  const username = randomBytes(12).toString("hex");
  await repository.saveOrderCredentials("order-1", { kind: "player", username });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].updated_by, "viewer");
  assert.equal(writes[0].username, undefined);
  assert.deepEqual(crypto.decryptOrderCredentials({ ...writes[0], authTag: writes[0].auth_tag, encryptionVersion: writes[0].encryption_version }), { kind: "player", username });
});
for (const [role, assigned] of [["booster", true], ["admin", false], ["customer", false]]) {
  test(`${role} non-owner cannot write Account Details`, async () => {
    const { repository, writes } = server({ role, owner: false, assigned });
    await assert.rejects(repository.saveOrderCredentials("order-1", { kind: "player", username: "synthetic-player" }), /Only the customer|Order access denied/);
    assert.equal(writes.length, 0);
  });
}
test("wrong-mode, invalid username and failed snapshot reads never write", async () => {
  for (const [options, payload] of [
    [{ method: "solo" }, { kind: "player", username: "synthetic-player" }],
    [{ method: "duo" }, { accountEmail: "synthetic@example.invalid", password: "synthetic-only" }],
    [{ method: "duo" }, { kind: "player", username: " " }],
    [{ method: "duo" }, { kind: "player", username: "x".repeat(161) }],
    [{ itemsError: true }, { kind: "player", username: "synthetic-player" }],
  ]) {
    const { repository, writes } = server(options);
    await assert.rejects(repository.saveOrderCredentials("order-1", payload));
    assert.equal(writes.length, 0);
  }
});
test("Solo and historical snapshots retain legacy account writes", async () => {
  for (const method of ["solo", null]) {
    const { repository, writes } = server({ method });
    await repository.saveOrderCredentials("order-1", { accountEmail: "synthetic@example.invalid", password: "synthetic-only" });
    assert.equal(writes.length, 1);
  }
});
