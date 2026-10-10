import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypeScript(relativePath, mocks = {}) {
  const filename = path.join(root, relativePath);
  const compiled = ts.transpileModule(source(relativePath), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  const localRequire = (name) => name === "server-only" ? {} : mocks[name] ?? require(name);
  vm.runInThisContext(`(function(require,module,exports){${compiled.outputText}\n})`, { filename })(localRequire, module, module.exports);
  return module.exports;
}

test("checkout presents Stripe and PayPal without automatically choosing a provider", () => {
  const methods = source("src/components/checkout/order-payment-methods.tsx");
  const choice = source("src/components/checkout/order-checkout-redirect.tsx");
  assert.match(methods, /action="\/api\/checkout"/);
  assert.match(methods, /action="\/api\/paypal\/orders"/);
  assert.match(methods, /disabled=\{disabled\}/);
  assert.match(methods, /Pay with Stripe/);
  assert.match(methods, /Pay with PayPal/);
  assert.doesNotMatch(choice, /\.submit\(\)|useEffect/);
});

test("PayPal Orders v2 is server configured and preserves exact USD cents", () => {
  const paypal = source("src/lib/paypal.ts");
  assert.match(paypal, /PAYPAL_ENVIRONMENT/);
  assert.match(paypal, /PAYPAL_CLIENT_ID/);
  assert.match(paypal, /PAYPAL_CLIENT_SECRET/);
  assert.match(paypal, /api-m\.sandbox\.paypal\.com/);
  assert.match(paypal, /api-m\.paypal\.com/);
  assert.match(paypal, /\/v2\/checkout\/orders/);
  assert.match(paypal, /amountCents \/ 100\)\.toFixed\(2\)/);
  assert.match(paypal, /reference_id: input\.internalOrderId/);
  assert.match(paypal, /custom_id: input\.internalOrderId/);
  assert.match(paypal, /shipping_preference: "NO_SHIPPING"/);
});

test("PayPal creates an exact server-side order and never sends the client secret in its body", async () => {
  const previous = {
    environment: process.env.PAYPAL_ENVIRONMENT,
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    fetch: globalThis.fetch,
  };
  process.env.PAYPAL_ENVIRONMENT = "sandbox";
  process.env.PAYPAL_CLIENT_ID = "client-id";
  process.env.PAYPAL_CLIENT_SECRET = "server-secret";
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (calls.length === 1) return new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 });
    return new Response(JSON.stringify({
      id: "PAYPAL-ORDER-1",
      status: "PAYER_ACTION_REQUIRED",
      links: [{ rel: "payer-action", href: "https://www.paypal.com/checkoutnow?token=PAYPAL-ORDER-1" }],
    }), { status: 200 });
  };

  try {
    const paypal = loadTypeScript("src/lib/paypal.ts");
    const result = await paypal.createPayPalOrder({
      internalOrderId: "11111111-1111-4111-8111-111111111111",
      orderNumber: "BP-123456",
      amountCents: 1500,
      currency: "USD",
      description: "Rocket League — Rank Boost",
      returnUrl: "https://boostingpedia.com/api/paypal/capture?orderId=1",
      cancelUrl: "https://boostingpedia.com/dashboard/orders/1?checkout=cancelled",
    });
    assert.equal(result.order.id, "PAYPAL-ORDER-1");
    assert.equal(calls[0].url, "https://api-m.sandbox.paypal.com/v1/oauth2/token");
    assert.match(calls[0].init.headers.Authorization, /^Basic /);
    const body = JSON.parse(calls[1].init.body);
    assert.equal(body.purchase_units[0].amount.value, "15.00");
    assert.equal(body.purchase_units[0].custom_id, "11111111-1111-4111-8111-111111111111");
    assert.doesNotMatch(calls[1].init.body, /server-secret/);
  } finally {
    globalThis.fetch = previous.fetch;
    for (const [name, value] of [
      ["PAYPAL_ENVIRONMENT", previous.environment],
      ["PAYPAL_CLIENT_ID", previous.clientId],
      ["PAYPAL_CLIENT_SECRET", previous.clientSecret],
    ]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test("PayPal amount parsing is strict and cent exact", () => {
  const repository = loadTypeScript("src/features/payments/server/paypal-payment-repository.ts", {
    "@/lib/paypal": {},
    "@/lib/supabase/server": { createSecretServerClient() { throw new Error("not used"); } },
  });
  assert.equal(repository.paypalAmountToCents("15.00"), 1500);
  assert.equal(repository.paypalAmountToCents("15.5"), 1550);
  assert.throws(() => repository.paypalAmountToCents("15.001"), /Invalid PayPal amount/);
  assert.throws(() => repository.paypalAmountToCents("NaN"), /Invalid PayPal amount/);
});

test("PayPal return capture is bound to the authenticated user's stored order", () => {
  const capture = source("src/app/api/paypal/capture/route.ts");
  assert.match(capture, /getCurrentIdentity\(\)/);
  assert.match(capture, /getCurrentUserOrder\(orderId\)/);
  assert.match(capture, /payment\.order_id !== order\.id/);
  assert.match(capture, /markPayPalOrderCaptured/);
});

test("PayPal webhook verifies signatures and processes events idempotently", () => {
  const webhook = source("src/app/api/paypal/webhook/route.ts");
  assert.match(webhook, /verifyPayPalWebhookSignature/);
  assert.match(webhook, /paypal-transmission-id/);
  assert.match(webhook, /hasProcessedPayPalEvent/);
  assert.match(webhook, /PAYMENT\.CAPTURE\.COMPLETED/);
  assert.match(webhook, /PAYMENT\.CAPTURE\.DENIED/);
  assert.match(webhook, /PAYMENT\.CAPTURE\.REFUNDED/);
  assert.match(webhook, /markPayPalEventProcessed/);
});

test("database migration enables PayPal while retaining Stripe and isolates webhook events", () => {
  const migration = source("supabase/migrations/20261010223000_paypal_payments.sql");
  assert.match(migration, /provider in \('stripe', 'paypal'\)/);
  assert.match(migration, /paypal_order_id text/);
  assert.match(migration, /paypal_capture_id text/);
  assert.match(migration, /create table if not exists public\.paypal_webhook_events/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all privileges.*anon, authenticated/s);
  assert.match(migration, /grant all privileges.*service_role/s);
});

test("example configuration contains placeholders only", () => {
  const env = source(".env.example");
  assert.match(env, /PAYPAL_ENVIRONMENT=sandbox/);
  assert.match(env, /PAYPAL_CLIENT_ID=your_sandbox_client_id/);
  assert.match(env, /PAYPAL_CLIENT_SECRET=your_sandbox_client_secret/);
  assert.match(env, /PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id/);
  assert.doesNotMatch(env, /PAYPAL_CLIENT_SECRET=(?!your_)/);
});
