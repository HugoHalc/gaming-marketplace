import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = readFileSync(path.join(root, "supabase/migrations/20261010234500_support_reliability_admin_alerts.sql"), "utf8");
const adminA = "00000000-0000-0000-0000-000000000001";
const adminB = "00000000-0000-0000-0000-000000000002";
const customer = "00000000-0000-0000-0000-000000000003";
const booster = "00000000-0000-0000-0000-000000000004";
const conversation = "10000000-0000-0000-0000-000000000001";

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;
    create table public.profiles(id uuid primary key, role text not null);
    alter table public.profiles enable row level security; grant select on public.profiles to authenticated,service_role;
    create policy profiles_self_read on public.profiles for select to authenticated using(id=auth.uid());
    create table public.support_conversations(id uuid primary key default gen_random_uuid(), visitor_token_hash text not null unique, customer_id uuid references public.profiles, visitor_name text, visitor_email text, status text not null default 'open', last_message_at timestamptz not null default now(), customer_last_read_at timestamptz, admin_last_read_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
    create table public.support_messages(id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.support_conversations on delete cascade, sender_type text not null, sender_user_id uuid references public.profiles, body text not null, created_at timestamptz not null default now());
    alter table public.support_conversations enable row level security; alter table public.support_messages enable row level security;
    grant all on public.support_conversations, public.support_messages to service_role;
    create publication supabase_realtime;
    insert into public.profiles values ('${adminA}','admin'),('${adminB}','admin'),('${customer}','customer'),('${booster}','booster');
    insert into public.support_conversations(id,visitor_token_hash) values('${conversation}','token');
  `);
  await db.exec(migration);
  return db;
}

async function asActor(db, actor) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [actor]);
  await db.exec("set role authenticated");
}

test("SQL: visitor alerts reach both admins only and reads remain independent", async () => {
  const db = await database();
  try {
    const messageId = "20000000-0000-4000-8000-000000000001";
    await db.exec(`set role service_role; insert into public.support_messages(id,conversation_id,sender_type,body,client_message_id) values('${messageId}','${conversation}','visitor','Need help','30000000-0000-4000-8000-000000000001'); reset role;`);
    const recipients = (await db.query("select admin_user_id from public.support_admin_alerts order by admin_user_id")).rows.map((row) => row.admin_user_id);
    assert.deepEqual(recipients, [adminA, adminB]);
    await db.exec(`set role service_role; select public.mark_support_admin_read('${adminA}','${conversation}','${messageId}'); reset role;`);
    const reads = (await db.query("select admin_user_id,read_at is not null as read from public.support_admin_alerts order by admin_user_id")).rows;
    assert.deepEqual(reads, [{ admin_user_id: adminA, read: true }, { admin_user_id: adminB, read: false }]);
    await asActor(db, customer); assert.equal((await db.query("select * from public.support_admin_alerts")).rows.length, 0);
    await asActor(db, booster); assert.equal((await db.query("select * from public.support_admin_alerts")).rows.length, 0);
    await asActor(db, adminB); assert.equal((await db.query("select * from public.support_admin_alerts")).rows.length, 1);
  } finally { await db.close(); }
});

test("SQL: admin messages do not alert and client message IDs are idempotent", async () => {
  const db = await database();
  try {
    await db.exec(`set role service_role; insert into public.support_messages(conversation_id,sender_type,sender_user_id,body,client_message_id) values('${conversation}','admin','${adminA}','Reply','30000000-0000-4000-8000-000000000002');`);
    assert.equal((await db.query("select count(*)::int as count from public.support_admin_alerts")).rows[0].count, 0);
    await assert.rejects(db.exec(`insert into public.support_messages(conversation_id,sender_type,sender_user_id,body,client_message_id) values('${conversation}','admin','${adminA}','Reply','30000000-0000-4000-8000-000000000002')`), /duplicate key/);
  } finally { await db.close(); }
});

test("SQL: stable cursor pagination preserves support history beyond 300 messages", async () => {
  const db = await database();
  try {
    await db.exec(`set role service_role;
      insert into public.support_messages(conversation_id,sender_type,sender_user_id,body,created_at)
      select '${conversation}','admin','${adminA}','Message ' || value, timestamptz '2026-01-01 00:00:00+00' + value * interval '1 second'
      from generate_series(0,304) value;
      reset role;`);
    const ids = [];
    let cursor = null;
    do {
      const parameters = [conversation];
      let condition = "";
      if (cursor) { parameters.push(cursor.created_at, cursor.id); condition = "and (created_at,id) < ($2,$3)"; }
      const rows = (await db.query(`select id,created_at,body from public.support_messages where conversation_id=$1 ${condition} order by created_at desc,id desc limit 50`, parameters)).rows;
      ids.push(...rows.map((row) => row.id)); cursor = rows.length === 50 ? rows.at(-1) : null;
    } while (cursor);
    assert.equal(ids.length, 305); assert.equal(new Set(ids).size, 305);
  } finally { await db.close(); }
});

test("client tracker suppresses initial backlog and deduplicates later alerts", () => {
  const require = createRequire(import.meta.url); const ts = require("typescript"); const filename = path.join(root, "src/features/support/client/admin-support-alerts.ts"); const mod = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInThisContext(`(function(module,exports){${compiled.outputText}})`, { filename })(mod, mod.exports);
  const tracker = new mod.exports.SupportAlertTracker();
  const a = { id: "a", conversationId: "one", messageId: "m1", body: "a", visitorLabel: "Visitor", createdAt: "2026-10-10T00:00:00Z" };
  const b = { ...a, id: "b", messageId: "m2" };
  assert.deepEqual(tracker.observe([a]), []);
  assert.deepEqual(tracker.observe([b, a]).map((item) => item.id), ["b"]);
  assert.deepEqual(tracker.observe([b, a]), []);
});

test("routes and clients enforce explicit read, reliable keyboard sends and paged history", () => {
  const adminRoute = readFileSync(path.join(root, "src/app/api/admin/support/conversations/[id]/route.ts"), "utf8");
  const adminUi = readFileSync(path.join(root, "src/components/support/admin-support-console.tsx"), "utf8");
  const visitorUi = readFileSync(path.join(root, "src/components/support/support-chat-widget.tsx"), "utf8");
  assert.doesNotMatch(adminRoute, /markAdminSupportConversationRead/);
  for (const source of [adminUi, visitorUi]) {
    assert.match(source, /!event\.shiftKey/); assert.match(source, /!event\.nativeEvent\.isComposing/); assert.match(source, /requestSubmit/); assert.match(source, /clientMessageId/); assert.match(source, /Load earlier messages/); assert.match(source, /whitespace-pre-wrap/);
  }
  assert.match(visitorUi, /if \(!enabled\) return/);
  assert.match(adminUi, /Record<string, string>/);
});
