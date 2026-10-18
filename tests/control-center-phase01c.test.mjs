import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const pgliteModule = await import("@electric-sql/pglite").catch(() => null);
const PGlite = pgliteModule?.PGlite;

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const migration = read("supabase/migrations/20261016010000_control_center_phase01c.sql");
const security = read("src/features/control-center/server/security.ts");
const data = read("src/features/control-center/server/data.ts");
const authorizeRoute = read("src/app/api/control-center/v1/auth/authorize/route.ts");
const tokenRoute = read("src/app/api/control-center/v1/auth/token/route.ts");
const revokeRoute = read("src/app/api/control-center/v1/auth/revoke/route.ts");

const admin = "00000000-0000-4000-8000-000000000001";
const customer = "00000000-0000-4000-8000-000000000002";
const booster = "00000000-0000-4000-8000-000000000003";
const order = "10000000-0000-4000-8000-000000000001";
const conversation = "20000000-0000-4000-8000-000000000001";
const message = "30000000-0000-4000-8000-000000000001";

function walk(dir) {
  return readdirSync(path.join(root, dir)).flatMap((name) => {
    const relative = path.join(dir, name);
    return statSync(path.join(root, relative)).isDirectory() ? walk(relative) : [relative];
  });
}

const routeText = walk("src/app/api/control-center/v1")
  .filter((file) => file.endsWith("route.ts"))
  .map(read)
  .join("\n");

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create table public.profiles(
      id uuid primary key, role text not null, full_name text, gamer_tag text
    );
    create table public.orders(
      id uuid primary key, order_number text not null, user_id uuid references public.profiles,
      status text not null, payment_status text not null, currency text not null,
      total_cents integer not null, created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table public.order_items(
      id uuid primary key default gen_random_uuid(), order_id uuid references public.orders,
      game_name text not null, service_name text not null
    );
    create table public.order_booster_assignments(
      order_id uuid primary key references public.orders, booster_id uuid references public.profiles,
      assignment_kind text not null, assigned_at timestamptz not null default now(),
      is_active boolean not null default true
    );
    create table public.support_conversations(
      id uuid primary key, status text not null, last_message_at timestamptz not null default now(),
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table public.support_messages(
      id uuid primary key, conversation_id uuid references public.support_conversations,
      sender_type text not null, body text not null, created_at timestamptz not null default now()
    );
    create table public.support_admin_alerts(
      id uuid primary key default gen_random_uuid(), admin_user_id uuid references public.profiles,
      conversation_id uuid references public.support_conversations,
      message_id uuid references public.support_messages, read_at timestamptz
    );
    create table public.booster_profiles(
      user_id uuid primary key references public.profiles, is_active boolean not null,
      activated_at timestamptz, updated_at timestamptz not null default now()
    );
    create table public.booster_game_eligibilities(
      booster_id uuid references public.booster_profiles, game_slug text not null
    );
    insert into public.profiles(id, role, full_name, gamer_tag) values
      ('${admin}', 'admin', 'Admin', null),
      ('${customer}', 'customer', 'Customer', null),
      ('${booster}', 'booster', 'Booster', 'SafeTag');
    insert into public.orders(id, order_number, user_id, status, payment_status, currency, total_cents)
      values ('${order}', 'VB-TEST000001', '${customer}', 'in_progress', 'paid', 'USD', 2500);
    insert into public.order_items(order_id, game_name, service_name)
      values ('${order}', 'Rocket League', 'Rank Boost');
    insert into public.order_booster_assignments(order_id, booster_id, assignment_kind)
      values ('${order}', '${booster}', 'booster');
    insert into public.support_conversations(id, status) values ('${conversation}', 'open');
    insert into public.support_messages(id, conversation_id, sender_type, body)
      values ('${message}', '${conversation}', 'visitor', 'Help');
    insert into public.support_admin_alerts(admin_user_id, conversation_id, message_id)
      values ('${admin}', '${conversation}', '${message}');
    insert into public.booster_profiles(user_id, is_active) values ('${booster}', true);
    insert into public.booster_game_eligibilities values ('${booster}', 'rocket-league');
  `);
  await db.exec(migration);
  return db;
}

test("Control Center business APIs are read-only and exclude sensitive fields", () => {
  const combined = `${data}\n${routeText}`;
  for (const table of ["orders", "payments", "support_messages", "support_conversations", "booster_profiles", "profiles"]) {
    assert.doesNotMatch(combined, new RegExp(`from\\([\\"']${table}[\\"']\\)[\\s\\S]{0,120}\\.(insert|update|delete|upsert)\\(`, "i"));
  }
  for (const forbidden of ["account_password", "gaming_password", "order_account_credentials", "stripe_secret_key", "paypal_client_secret", "supabase_secret_key"]) {
    assert.equal(combined.toLowerCase().includes(forbidden), false, forbidden);
  }
});

test("OAuth authorization requires exact response type, scope, redirect and PKCE S256", () => {
  assert.match(authorizeRoute, /response_type/);
  assert.match(authorizeRoute, /scope/);
  assert.match(security, /input\.responseType !== "code"/);
  assert.match(security, /input\.scope !== ACCESS_SCOPE/);
  assert.match(security, /input\.codeChallengeMethod !== "S256"/);
  assert.match(security, /config\.redirectUris\.has\(redirectUri\)/);
  assert.match(security, /randomBytes\(32\)/);
});

test("token exchange accepts standard form encoding, stays secret and has no refresh token", () => {
  assert.match(tokenRoute, /application\/x-www-form-urlencoded/);
  assert.match(tokenRoute, /authorization_code/);
  assert.match(tokenRoute, /sha256Base64Url\(verifier\)/);
  assert.doesNotMatch(tokenRoute, /refresh_token/);
  assert.doesNotMatch(routeText, /console\.(?:log|info|debug).*token/i);
});

test("request protection covers issuer, audience, scope, expiry, replay, rate and revocation", () => {
  for (const expected of [
    "v_session.expires_at <= now()",
    "v_session.issuer <> p_issuer",
    "v_session.audience <> p_audience",
    "p_required_scope = any(v_session.scopes)",
    "CONTROL_CENTER_REPLAY",
    "CONTROL_CENTER_RATE_LIMIT",
    "unique(session_id, request_id)",
    "revoke_control_center_session",
  ]) assert.ok(migration.includes(expected), expected);
  assert.match(revokeRoute, /authenticateControlCenterRequest/);
});

test("auth artifacts and functions deny anon/authenticated and responses are private", () => {
  for (const table of ["control_center_auth_codes", "control_center_sessions", "control_center_access_audit"]) {
    assert.match(migration, new RegExp(`revoke all privileges on public\\.${table} from public, anon, authenticated`));
  }
  assert.doesNotMatch(migration, /grant execute on function public\.(?:issue|consume|begin|revoke)_control_center[\s\S]{0,260}to authenticated/);
  const http = read("src/features/control-center/server/http.ts");
  assert.match(http, /Cache-Control.*no-store/);
  assert.match(http, /Referrer-Policy.*no-referrer/);
});

test("booster activity does not trust user-editable auth metadata", () => {
  assert.doesNotMatch(migration, /raw_user_meta_data/);
  assert.doesNotMatch(migration, /join auth\.users/);
  assert.match(data, /lastSeenAt: null/);
  assert.match(data, /activityDataAvailability: "unavailable"/);
});

test("authorization codes are one-use, PKCE-limited and role-bound", { skip: !PGlite }, async () => {
  const db = await database();
  try {
    await db.exec("set role service_role");
    const hash = "a".repeat(64);
    const challenge = "b".repeat(43);
    await db.query("select * from public.issue_control_center_auth_code($1,$2,$3,$4,$5,now() + interval '2 minutes')", [
      hash, admin, "boostingpedia-control-center", "https://boost-command-core.base44.app/functions/boostingpediaOauthCallback", challenge,
    ]);
    const first = (await db.query("select * from public.consume_control_center_auth_code($1,$2,$3,$4)", [
      hash, "boostingpedia-control-center", "https://boost-command-core.base44.app/functions/boostingpediaOauthCallback", challenge,
    ])).rows[0];
    assert.deepEqual(first, { admin_user_id: admin, outcome: "success" });
    const replay = (await db.query("select * from public.consume_control_center_auth_code($1,$2,$3,$4)", [
      hash, "boostingpedia-control-center", "https://boost-command-core.base44.app/functions/boostingpediaOauthCallback", challenge,
    ])).rows[0];
    assert.deepEqual(replay, { admin_user_id: null, outcome: "invalid_grant" });

    await db.exec("reset role");
    await db.query("update public.profiles set role = 'customer' where id = $1", [admin]);
    await db.exec("set role service_role");
    await assert.rejects(
      db.query("select * from public.issue_control_center_auth_code($1,$2,$3,$4,$5,now() + interval '2 minutes')", [
        "c".repeat(64), admin, "boostingpedia-control-center", "https://boost-command-core.base44.app/functions/boostingpediaOauthCallback", challenge,
      ]),
      /CONTROL_CENTER_ADMIN_REQUIRED/,
    );
  } finally {
    await db.close();
  }
});

test("session replay, expiration, role loss and explicit revocation are enforced", { skip: !PGlite }, async () => {
  const db = await database();
  try {
    await db.exec("set role service_role");
    const insert = await db.query(`
      insert into public.control_center_sessions(token_hash, admin_user_id, client_id, issuer, audience, expires_at)
      values ($1,$2,'boostingpedia-control-center','https://boostingpedia.com','boostingpedia-control-center',now() + interval '10 minutes')
      returning id
    `, ["d".repeat(64), admin]);
    const sessionId = insert.rows[0].id;
    const requestId = "40000000-0000-4000-8000-000000000001";
    const args = ["d".repeat(64), requestId, "GET", "/api/control-center/v1/overview"];
    const begin = () => db.query(`select * from public.begin_control_center_request(
      $1,$2,now(),$3,$4,null,null,'https://boostingpedia.com','boostingpedia-control-center','control_center:read',120,60
    )`, args);
    assert.equal((await begin()).rows[0].denial_code, null);
    await assert.rejects(begin(), /CONTROL_CENTER_REPLAY/);

    await db.exec("reset role");
    await db.query("update public.profiles set role = 'customer' where id = $1", [admin]);
    await db.exec("set role service_role");
    const denied = (await db.query(`select * from public.begin_control_center_request(
      $1,$2,now(),'GET','/api/control-center/v1/orders',null,null,'https://boostingpedia.com','boostingpedia-control-center','control_center:read',120,60
    )`, ["d".repeat(64), "40000000-0000-4000-8000-000000000002"])).rows[0];
    assert.equal(denied.denial_code, "CONTROL_CENTER_ADMIN_REQUIRED");
    assert.ok((await db.query("select revoked_at from public.control_center_sessions where id = $1", [sessionId])).rows[0].revoked_at);

    await db.exec("reset role");
    await db.query("update public.profiles set role = 'admin' where id = $1", [admin]);
    await db.exec("set role service_role");
    const second = await db.query(`
      insert into public.control_center_sessions(token_hash, admin_user_id, client_id, issuer, audience, expires_at)
      values ($1,$2,'boostingpedia-control-center','https://boostingpedia.com','boostingpedia-control-center',now() + interval '10 minutes') returning id
    `, ["e".repeat(64), admin]);
    assert.equal((await db.query("select * from public.revoke_control_center_session($1,$2)", [second.rows[0].id, admin])).rows[0].revoked, true);
    await assert.rejects(db.query(`select * from public.begin_control_center_request(
      $1,$2,now(),'GET','/api/control-center/v1/overview',null,null,'https://boostingpedia.com','boostingpedia-control-center','control_center:read',120,60
    )`, ["e".repeat(64), "40000000-0000-4000-8000-000000000003"]), /CONTROL_CENTER_INVALID/);
  } finally {
    await db.close();
  }
});

test("read contracts preserve assignment and calculate live overview without writes", { skip: !PGlite }, async () => {
  const db = await database();
  try {
    await db.exec("set role service_role");
    const overview = (await db.query("select * from public.control_center_overview($1)", [admin])).rows[0];
    assert.equal(overview.total_orders, 1n);
    assert.equal(overview.in_progress_orders, 1n);
    assert.equal(overview.open_support_conversations, 1n);
    assert.equal(overview.confirmed_revenue_cents, 2500n);
    const listed = (await db.query("select * from public.control_center_list_orders($1,'',null,null,null,0,26)", [admin])).rows[0];
    assert.equal(listed.assignment_kind, "booster");
    assert.equal(listed.assignee_id, booster);
    const listedBooster = (await db.query("select * from public.control_center_list_boosters($1,'',true,0,26)", [admin])).rows[0];
    assert.equal(listedBooster.last_seen_at, null);
  } finally {
    await db.close();
  }
});
