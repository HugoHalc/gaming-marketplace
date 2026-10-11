import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const source = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const migration = source("supabase/migrations/20261011035410_service_completion_email_outbox.sql");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypeScript(relativePath, mocks = {}) {
  const filename = path.join(root, relativePath);
  const compiled = ts.transpileModule(source(relativePath), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loadedModule = { exports: {} };
  const localRequire = (name) => name === "server-only" ? {} : mocks[name] ?? require(name);
  vm.runInThisContext(`(function(require,module,exports){${compiled.outputText}\n})`, { filename })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const customer = "00000000-0000-0000-0000-000000000001";
const missingCustomer = "00000000-0000-0000-0000-000000000002";
const activeOrder = "10000000-0000-0000-0000-000000000001";
const historicalOrder = "10000000-0000-0000-0000-000000000002";
const missingDataOrder = "10000000-0000-0000-0000-000000000003";

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema auth;
    create schema private;
    create table auth.users(id uuid primary key, email text);
    create table public.profiles(id uuid primary key, full_name text);
    create table public.orders(
      id uuid primary key,
      order_number text not null unique,
      user_id uuid not null references public.profiles,
      status text not null
    );
    create table public.order_items(
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references public.orders,
      service_name text not null
    );
    insert into public.profiles values
      ('${customer}', 'Hugo <Tester>'),
      ('${missingCustomer}', null);
    insert into auth.users values
      ('${customer}', 'customer@example.com'),
      ('${missingCustomer}', null);
    insert into public.orders values
      ('${activeOrder}', 'BP-ACTIVE', '${customer}', 'in_progress'),
      ('${historicalOrder}', 'BP-HISTORY', '${customer}', 'completed'),
      ('${missingDataOrder}', 'BP-MISSING', '${missingCustomer}', 'in_progress');
    insert into public.order_items(order_id, service_name) values
      ('${activeOrder}', 'Rank Boost'),
      ('${historicalOrder}', 'Competitive Wins'),
      ('${missingDataOrder}', 'Placements Boost');
  `);
  await db.exec(migration);
  return db;
}

test("only a real in_progress to completed transition creates one durable event", async () => {
  const db = await database();
  try {
    assert.equal((await db.query("select count(*)::int as count from public.order_email_outbox")).rows[0].count, 0);
    await db.exec(`update public.orders set status = 'completed' where id = '${activeOrder}'`);
    await db.exec(`update public.orders set status = 'completed' where id = '${activeOrder}'`);
    await db.exec(`update public.orders set status = 'in_progress' where id = '${activeOrder}'`);
    await db.exec(`update public.orders set status = 'completed' where id = '${activeOrder}'`);
    const events = (await db.query("select * from public.order_email_outbox order by created_at")).rows;
    assert.equal(events.length, 1);
    assert.equal(events[0].order_number, "BP-ACTIVE");
    assert.equal(events[0].recipient_name, "Hugo <Tester>");
    assert.equal(events[0].recipient_email, "customer@example.com");
    assert.equal(events[0].service_name, "Rank Boost");
    assert.equal(events[0].status, "pending");
    assert.equal(events.some((event) => event.order_id === historicalOrder), false);
  } finally {
    await db.close();
  }
});

test("missing identity data is retained as blocked and hydrated without a second event", async () => {
  const db = await database();
  try {
    await db.exec(`update public.orders set status = 'completed' where id = '${missingDataOrder}'`);
    let event = (await db.query("select * from public.order_email_outbox")).rows[0];
    assert.equal(event.status, "blocked");
    assert.equal(event.retry_deadline_at, null);
    assert.match(event.last_error, /missing_recipient_name/);
    assert.match(event.last_error, /missing_recipient_email/);

    await db.exec("update public.order_email_outbox set created_at = now() - interval '30 days'");
    await db.exec(`update public.profiles set full_name = 'Real Customer' where id = '${missingCustomer}'`);
    await db.exec(`update auth.users set email = 'real@example.com' where id = '${missingCustomer}'`);
    await db.exec("set role service_role");
    const claimed = (await db.query("select * from public.claim_order_completion_email_events(10)")).rows;
    assert.equal(claimed.length, 1);
    assert.equal(claimed[0].recipient_name, "Real Customer");
    assert.equal(claimed[0].recipient_email, "real@example.com");
    assert.ok(claimed[0].retry_deadline_at);
    await db.exec("reset role");
    event = (await db.query("select * from public.order_email_outbox")).rows[0];
    assert.equal(event.attempt_count, 1);
  } finally {
    await db.close();
  }
});

test("claiming is exclusive, retry keeps the same event, and expired leases are not resent", async () => {
  const db = await database();
  try {
    await db.exec(`update public.orders set status = 'completed' where id = '${activeOrder}'`);
    await db.exec("set role service_role");
    const first = (await db.query("select * from public.claim_order_completion_email_events(10)")).rows[0];
    assert.ok(first.processing_token);
    assert.equal((await db.query("select * from public.claim_order_completion_email_events(10)")).rows.length, 0);
    assert.equal((await db.query(
      "select public.resolve_order_completion_email_event($1,$2,'retry',null,'resend_500_unknown',now() + interval '1 minute') as resolved",
      [first.event_id, first.processing_token],
    )).rows[0].resolved, true);
    await db.exec("reset role");
    await db.exec("update public.order_email_outbox set next_attempt_at = now() - interval '1 second'");
    await db.exec("set role service_role");
    const second = (await db.query("select * from public.claim_order_completion_email_events(10)")).rows[0];
    assert.equal(second.event_id, first.event_id);
    assert.equal(second.attempt_count, 2);
    await db.exec("reset role");
    await db.exec("update public.order_email_outbox set locked_until = now() - interval '1 second'");
    await db.exec("set role service_role");
    assert.equal((await db.query("select * from public.claim_order_completion_email_events(10)")).rows.length, 0);
    await db.exec("reset role");
    assert.equal((await db.query("select status from public.order_email_outbox")).rows[0].status, "uncertain");
  } finally {
    await db.close();
  }
});

test("authenticated clients cannot read or mutate completion email events", async () => {
  const db = await database();
  try {
    await db.exec(`update public.orders set status = 'completed' where id = '${activeOrder}'`);
    await db.exec("set role authenticated");
    await assert.rejects(db.query("select * from public.order_email_outbox"), /permission denied/);
    await assert.rejects(db.query("select * from public.claim_order_completion_email_events(10)"), /permission denied/);
  } finally {
    await db.close();
  }
});

test("email HTML safely preserves Trustpilot AFS data and customer-facing links", () => {
  const email = loadTypeScript("src/features/email/service-completed-email.ts", {
    "@/config/site": { siteConfig: { url: "https://boostingpedia.com" } },
  });
  const built = email.buildServiceCompletedEmail({
    orderId: "order/id",
    orderNumber: "BP-<123>",
    serviceName: "Rank & Boost",
    recipientName: `Hugo </script><img src=x onerror=alert(1)>`,
    recipientEmail: "hugo+test@example.com",
  });
  assert.equal(built.subject, "Your BoostingPedia order BP-<123> is complete");
  assert.match(built.html, /<script type="application\/json\+trustpilot">/);
  assert.doesNotMatch(built.html, /<script type="application\/json\+trustpilot">[^]*<\/script><img/);
  const json = built.html.match(/<script type="application\/json\+trustpilot">([^]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(json), {
    recipientName: `Hugo </script><img src=x onerror=alert(1)>`,
    recipientEmail: "hugo+test@example.com",
    referenceId: "BP-<123>",
  });
  assert.match(built.html, /Hugo &lt;\/script&gt;&lt;img/);
  assert.match(built.html, /https:\/\/boostingpedia\.com\/dashboard\/orders\/order%2Fid/);
  assert.match(built.html, /https:\/\/boostingpedia\.com\/contact/);
  assert.match(built.text, /Rank & Boost/);
});

test("Resend request uses real BCC and stable idempotency without exposing it in content", async () => {
  const resend = loadTypeScript("src/features/email/server/resend-email.ts");
  let call;
  const result = await resend.sendResendEmail("re_secret", {
    from: "BoostingPedia <orders@boostingpedia.com>",
    to: "customer@example.com",
    bcc: "boostingpedia.com+14b1374d40@invite.trustpilot.com",
    subject: "Completed",
    html: "<p>Complete</p>",
    text: "Complete",
    idempotencyKey: "service-completed/event-id",
  }, async (url, init) => {
    call = { url, init };
    return new Response(JSON.stringify({ id: "email-provider-id" }), { status: 200 });
  });
  assert.deepEqual(result, { outcome: "sent", providerMessageId: "email-provider-id" });
  assert.equal(call.url, "https://api.resend.com/emails");
  assert.equal(call.init.headers["Idempotency-Key"], "service-completed/event-id");
  const body = JSON.parse(call.init.body);
  assert.deepEqual(body.to, ["customer@example.com"]);
  assert.deepEqual(body.bcc, ["boostingpedia.com+14b1374d40@invite.trustpilot.com"]);
  assert.doesNotMatch(body.html, /14b1374d40/);
  assert.doesNotMatch(body.text, /14b1374d40/);
});

test("provider rejections retry safely while ambiguous network results stop automatically", async () => {
  const resend = loadTypeScript("src/features/email/server/resend-email.ts");
  const payload = { from: "a", to: "b", bcc: "c", subject: "d", html: "e", text: "f", idempotencyKey: "g" };
  const transient = await resend.sendResendEmail("key", payload, async () =>
    new Response(JSON.stringify({ name: "rate_limit_exceeded" }), { status: 429 }));
  assert.equal(transient.outcome, "retry");
  const conflict = await resend.sendResendEmail("key", payload, async () =>
    new Response(JSON.stringify({ name: "invalid_idempotent_request" }), { status: 409 }));
  assert.equal(conflict.outcome, "failed");
  const ambiguous = await resend.sendResendEmail("key", payload, async () => {
    throw new Error("connection reset");
  });
  assert.equal(ambiguous.outcome, "uncertain");
});

test("worker is production-only, strictly enabled and protected by a configured secret", () => {
  const route = source("src/app/api/cron/order-completion-emails/route.ts");
  assert.match(route, /!cronSecret/);
  assert.match(route, /timingSafeEqual/);
  assert.match(route, /process\.env\.VERCEL_ENV === "production"/);
  assert.match(route, /process\.env\.TRUSTPILOT_AFS_ENABLED === "true"/);
  assert.match(route, /processOrderCompletionEmailOutbox/);
});
