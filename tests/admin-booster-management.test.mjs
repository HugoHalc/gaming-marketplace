import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = readFileSync(path.join(root, "supabase/migrations/20261003195546_admin_booster_management.sql"), "utf8");
const integrityMigration = readFileSync(path.join(root, "supabase/migrations/20261004191019_booster_role_integrity.sql"), "utf8");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const admin = "00000000-0000-0000-0000-000000000001";
const customer = "00000000-0000-0000-0000-000000000002";
const other = "00000000-0000-0000-0000-000000000003";
const rlOrder = "10000000-0000-0000-0000-000000000001";
const valorantOrder = "10000000-0000-0000-0000-000000000002";
const nextOrder = "10000000-0000-0000-0000-000000000003";
// A disposable real PostgreSQL engine. Only the schema dependencies of the
// migration are modeled; no production network or credentials are used.
async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key,email text);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
    $$;
    grant usage on schema auth to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;
    create table public.profiles(id uuid primary key references auth.users,full_name text,gamer_tag text,phone text,avatar_url text,created_at timestamptz default now(),updated_at timestamptz default now(),role text not null check(role in ('admin','customer','booster')));
    alter table public.profiles enable row level security;
    grant select,update on public.profiles to authenticated;
    create policy own_profile_read on public.profiles for select to authenticated using(id=auth.uid());
    create policy own_profile_write on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
    create table public.games(id uuid primary key,slug text,name text);
    create table public.booster_profiles(user_id uuid primary key references public.profiles,is_active boolean not null default true,payout_rate_bps integer not null default 5000 check(payout_rate_bps between 0 and 10000),created_at timestamptz default now(),updated_at timestamptz default now());
    alter table public.booster_profiles enable row level security;
    grant select on public.booster_profiles to authenticated;
    create policy own_booster on public.booster_profiles for select to authenticated using(user_id=auth.uid());
    create table public.orders(id uuid primary key,status text,payment_status text,total_cents integer,created_at timestamptz default now());
    create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid references public.orders,game_id uuid references public.games,game_name text);
    create table public.order_booster_assignments(order_id uuid primary key references public.orders,booster_id uuid references public.profiles,assigned_by uuid,assigned_at timestamptz,is_active boolean,payout_rate_bps integer,payout_cents integer);
    alter table public.order_booster_assignments enable row level security;
    grant select on public.order_booster_assignments to authenticated;
    create policy own_assignment on public.order_booster_assignments for select to authenticated using(booster_id=auth.uid());
    create table public.order_operational_states(order_id uuid primary key references public.orders,state text,state_note text,updated_by uuid,delivered_at timestamptz,auto_complete_at timestamptz,completed_at timestamptz);
    create table public.order_operational_history(order_id uuid,from_state text,to_state text,note text,changed_by uuid);
    insert into auth.users values('${admin}','admin@test.invalid'),('${customer}','player@test.invalid'),('${other}','other@test.invalid');
    insert into public.profiles(id,full_name,gamer_tag,role) values('${admin}','Admin','admin','admin'),('${customer}','Player','GamerOne','customer'),('${other}','Other','OtherTag','booster');
    insert into public.games values('20000000-0000-0000-0000-000000000001','rocket-league','Rocket League'),('20000000-0000-0000-0000-000000000002','valorant','VALORANT');
    insert into public.orders(id,status,payment_status,total_cents) values('${rlOrder}','paid','paid',10001),('${valorantOrder}','paid','paid',20000),('${nextOrder}','queued','paid',10001);
    insert into public.order_items(order_id,game_id,game_name) values('${rlOrder}','20000000-0000-0000-0000-000000000001','Rocket League'),('${valorantOrder}','20000000-0000-0000-0000-000000000002','Rocket League'),('${nextOrder}',null,'Rocket League');
  `);
  await db.exec(readFileSync(path.join(root,"supabase/migrations/phase_16g2_claim_operational_conflict_hotfix.sql"),"utf8"));
  await db.exec(migration);
  await db.exec(integrityMigration);
  return db;
}
async function asActor(db, actor, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [actor ?? ""]);
  await db.exec(`set role ${role}`);
}
async function manage(db, target, bps = 5000, games = ["rocket-league"], intent = "enable") {
  return db.query("select public.manage_booster_access($1,$2,$3,$4)", [target, bps, games, intent]);
}
async function claim(db, order) {
  return db.query("select * from public.claim_order_for_booster($1)", [order]);
}
async function value(db, sql) { return (await db.query(sql)).rows[0]; }

test("SQL: role changes, admin preservation, canonical eligibility and atomic claim", async () => {
  const db = await database();
  try {
    await asActor(db, admin);
    await manage(db, customer, 5000);
    await manage(db, admin, 7000);
    const accounts = (await db.query("select * from public.admin_booster_accounts('GamerOne',0,false,null)")).rows;
    assert.equal(accounts.length, 1); assert.equal(accounts[0].role, "booster");
    const admins = (await db.query("select * from public.admin_booster_accounts('',0,true,$1)", [admin])).rows;
    assert.equal(admins[0].role, "admin"); assert.equal(admins[0].is_active, true);
    await asActor(db, customer);
    const available = (await db.query("select * from public.list_eligible_booster_order_ids()")).rows;
    assert.deepEqual(new Set(available.map((row) => row.order_id)), new Set([rlOrder, nextOrder]));
    await assert.rejects(claim(db, valorantOrder), /not approved/);
    const result = (await claim(db, rlOrder)).rows[0];
    assert.equal(result.payout_rate_bps, 5000); assert.equal(result.payout_cents, 5000);
    await assert.rejects(claim(db, rlOrder), /not available|no longer available/);
    await db.exec("reset role");
    assert.equal((await value(db, `select state from public.order_operational_states where order_id='${rlOrder}'`)).state, "accepted");
    assert.equal((await value(db, "select count(*)::int as n from public.order_operational_history")).n, 1);
    assert.equal((await value(db, `select status from public.orders where id='${valorantOrder}'`)).status, "paid");
  } finally { await db.close(); }
});

test("SQL: migration repairs orphan roles and admin listing follows active access", async () => {
  const db = await database();
  try {
    await db.exec("reset role");
    assert.deepEqual(
      await value(db, `select p.role,(b.user_id is not null) as has_profile from public.profiles p left join public.booster_profiles b on b.user_id=p.id where p.id='${other}'`),
      { role: "customer", has_profile: false },
    );
    await asActor(db, other);
    await assert.rejects(db.query("select * from public.list_eligible_booster_order_ids()"), /Active booster access required/);
    await asActor(db, admin);
    assert.equal((await db.query("select * from public.admin_booster_accounts('',0,true,$1)", [other])).rows.length, 0);
    await manage(db, customer);
    const active = (await db.query("select * from public.admin_booster_accounts('',0,true,$1)", [customer])).rows[0];
    assert.equal(active.role, "booster");
    assert.equal(active.is_active, true);
  } finally { await db.close(); }
});

test("SQL: activation and deactivation are synchronized, idempotent and atomic", async () => {
  const db = await database();
  try {
    await asActor(db, admin);
    await manage(db, customer, 6000, ["rocket-league"], "enable");
    await db.exec("reset role");
    const enabledAudit = (await value(db, "select count(*)::int as n from private.booster_management_audit")).n;
    await asActor(db, admin);
    await manage(db, customer, 6000, ["rocket-league"], "enable");
    await db.exec("reset role");
    assert.equal((await value(db, "select count(*)::int as n from private.booster_management_audit")).n, enabledAudit);
    assert.deepEqual(
      await value(db, `select p.role,b.is_active,b.payout_rate_bps from public.profiles p join public.booster_profiles b on b.user_id=p.id where p.id='${customer}'`),
      { role: "booster", is_active: true, payout_rate_bps: 6000 },
    );

    await asActor(db, admin);
    await manage(db, customer, 6000, [], "disable");
    await db.exec("reset role");
    const disabledAudit = (await value(db, "select count(*)::int as n from private.booster_management_audit")).n;
    await asActor(db, admin);
    await manage(db, customer, 6000, [], "disable");
    await db.exec("reset role");
    assert.equal((await value(db, "select count(*)::int as n from private.booster_management_audit")).n, disabledAudit);
    assert.deepEqual(
      await value(db, `select p.role,b.is_active from public.profiles p join public.booster_profiles b on b.user_id=p.id where p.id='${customer}'`),
      { role: "customer", is_active: false },
    );

    await db.exec(`
      create function private.reject_integrity_audit() returns trigger language plpgsql as $$
      begin raise exception 'injected late failure'; end $$;
      create trigger reject_integrity_audit before insert on private.booster_management_audit
      for each row execute function private.reject_integrity_audit();
    `);
    await asActor(db, admin);
    await assert.rejects(manage(db, customer, 7000, ["valorant"], "enable"), /injected late failure/);
    await db.exec("reset role");
    assert.deepEqual(
      await value(db, `select p.role,b.is_active,b.payout_rate_bps from public.profiles p join public.booster_profiles b on b.user_id=p.id where p.id='${customer}'`),
      { role: "customer", is_active: false, payout_rate_bps: 6000 },
    );
  } finally { await db.close(); }
});

test("SQL: deferred constraints reject direct orphan states and preserve admins", async () => {
  const db = await database();
  try {
    await db.exec("reset role");
    await assert.rejects(
      db.exec(`begin; update public.profiles set role='booster' where id='${other}'; commit;`),
      /Booster role requires an active booster profile/,
    );
    await db.exec("rollback");
    await assert.rejects(
      db.exec(`begin; insert into public.booster_profiles(user_id,is_active,payout_rate_bps) values('${other}',true,5000); commit;`),
      /Active booster access requires the booster role/,
    );
    await db.exec("rollback");
    assert.equal((await value(db, `select role from public.profiles where id='${admin}'`)).role, "admin");
  } finally { await db.close(); }
});

test("SQL: payout snapshots, game removal, active-order disable guard and safe deactivation", async () => {
  const db = await database();
  try {
    await asActor(db, admin); await manage(db, customer);
    await asActor(db, customer); await claim(db, rlOrder);
    await asActor(db, admin); await manage(db, customer, 6000, ["rocket-league"], "save");
    await asActor(db, customer);
    assert.equal((await value(db, `select payout_rate_bps from public.order_booster_assignments where order_id='${rlOrder}'`)).payout_rate_bps, 5000);
    assert.equal((await claim(db, nextOrder)).rows[0].payout_rate_bps, 6000);
    await asActor(db, admin); await manage(db, customer, 6000, [], "save");
    await assert.rejects(manage(db, customer, 6000, [], "disable"), /This booster still has active orders\./);
    await asActor(db, customer);
    assert.equal((await db.query("select * from public.list_eligible_booster_order_ids()")).rows.length, 0);
    assert.equal((await value(db, "select count(*)::int as n from public.order_booster_assignments")).n, 2);
    await db.exec("reset role");
    await db.exec("update public.orders set status='completed' where status='in_progress'");
    await asActor(db, admin); await manage(db, customer, 6000, [], "disable");
    const account = (await db.query("select * from public.admin_booster_accounts('',0,true,$1)", [customer])).rows[0];
    assert.equal(account.role, "customer"); assert.equal(account.is_active, false);
    await manage(db, admin); await manage(db, admin, 5000, [], "disable");
    assert.equal((await db.query("select * from public.admin_booster_accounts('',0,true,$1)", [admin])).rows[0].role, "admin");
    await asActor(db, customer); await assert.rejects(claim(db, valorantOrder), /Active booster access required/);
    await db.exec("reset role");
    assert.equal((await value(db, "select count(*)::int as n from public.order_booster_assignments")).n, 2);
    const audit = (await db.query("select * from private.booster_management_audit order by id")).rows;
    assert.ok(audit.length >= 6); assert.ok(audit.every((row) => row.actor_id === admin && row.created_at && row.before_values && row.after_values));
  } finally { await db.close(); }
});

test("SQL: RLS and RPC authorization reject normal-client writes and request tampering", async () => {
  const db = await database();
  try {
    await asActor(db, admin); await manage(db, customer); await manage(db, admin);
    for (const actor of [other, customer]) {
      await asActor(db, actor);
      await assert.rejects(manage(db, actor, 10000, ["valorant"]), /Administrator access required/);
      await assert.rejects(db.query("select * from public.admin_booster_accounts()"), /Administrator access required/);
      await assert.rejects(db.query("update public.profiles set role='admin' where id=auth.uid()"), /permission denied/);
      await db.query("update public.profiles set phone='test' where id=auth.uid()");
      await assert.rejects(db.query("update public.booster_profiles set payout_rate_bps=10000"), /permission denied/);
      await assert.rejects(db.query("insert into public.booster_game_eligibilities values($1,'valorant',now())", [actor]), /permission denied/);
      await assert.rejects(db.query("delete from public.booster_game_eligibilities"), /permission denied/);
      await assert.rejects(db.query("select * from private.booster_management_audit"), /permission denied/);
      const rows = (await db.query("select * from public.booster_game_eligibilities")).rows;
      assert.ok(rows.every((row) => row.booster_id === actor));
      assert.equal(rows.length, actor === customer ? 1 : 0);
    }
    await asActor(db, null, "anon");
    await assert.rejects(db.query("select * from public.admin_booster_accounts()"), /permission denied/);
    await asActor(db, null);
    await assert.rejects(manage(db, customer), /Administrator access required/);
    await asActor(db, admin);
    for (const invalid of [[-1, ["rocket-league"]], [10001, ["rocket-league"]], [5000, ["unknown-game"]], [5000, ["rocket-league", "rocket-league"]], [5000, [null]], [5000, null]]) {
      await assert.rejects(manage(db, customer, ...invalid), /Invalid/);
    }
    await assert.rejects(manage(db, "00000000-0000-0000-0000-000000000099"), /Account not found/);
    await db.exec("reset role");
    assert.equal((await value(db, "select count(*)::int as n from private.booster_management_audit")).n, 2);
  } finally { await db.close(); }
});

test("SQL: legacy name resolution, all-item eligibility, empty orders and pagination", async () => {
  const db = await database();
  try {
    await asActor(db, admin); await manage(db, customer, 0, ["dota-2", "rainbow-six-siege"]);
    await db.exec("reset role");
    for (let i = 4; i <= 8; i++) await db.query("insert into public.orders(id,status,payment_status,total_cents) values($1,'paid','paid',500)", [`10000000-0000-0000-0000-${String(i).padStart(12,"0")}`]);
    await db.exec(`insert into public.order_items(order_id,game_name) values
      ('10000000-0000-0000-0000-000000000004','Dota 2'),
      ('10000000-0000-0000-0000-000000000005','Rainbow Six Siege'),
      ('10000000-0000-0000-0000-000000000006','Unknown Game'),
      ('10000000-0000-0000-0000-000000000007','Dota 2'),
      ('10000000-0000-0000-0000-000000000007','Valorant');`);
    await asActor(db, customer);
    const ids = (await db.query("select * from public.list_eligible_booster_order_ids()")).rows.map((row) => row.order_id);
    assert.deepEqual(ids.sort(), ["10000000-0000-0000-0000-000000000004", "10000000-0000-0000-0000-000000000005"]);
    assert.equal((await claim(db, ids[0])).rows[0].payout_cents, 0);
    for (let i=6;i<=8;i++) await assert.rejects(claim(db, `10000000-0000-0000-0000-${String(i).padStart(12,"0")}`), /not approved/);
    await db.exec("reset role");
    for (let i=10;i<40;i++) {
      const id = `00000000-0000-0000-0000-${String(i).padStart(12,"0")}`;
      await db.query("insert into auth.users values($1,$2)", [id, `page${i}@test.invalid`]);
      await db.query("insert into public.profiles(id,full_name,gamer_tag,role) values($1,'Page user',null,'customer')", [id]);
    }
    await asActor(db, admin);
    const first = (await db.query("select * from public.admin_booster_accounts('page',0,false,null)")).rows;
    const second = (await db.query("select * from public.admin_booster_accounts('page',1,false,null)")).rows;
    assert.equal(first.length, 21); assert.equal(second.length, 10);
    assert.ok(!second.some((row) => first.slice(0,20).some((entry) => entry.user_id === row.user_id)));
    await assert.rejects(db.query("select * from public.admin_booster_accounts('',-1,false,null)"), /Invalid search/);
  } finally { await db.close(); }
});

function load(relative, stubs = {}) {
  const filename = path.join(root, relative);
  const mod = { exports: {} };
  const code = ts.transpileModule(readFileSync(filename,"utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { FormData, URLSearchParams, Set, Error, Number, String, console })(
    (name) => Object.hasOwn(stubs, name) ? stubs[name] : require(name), mod, mod.exports);
  return mod.exports;
}

test("payout percentage parsing uses exact basis points and rejects malformed input", () => {
  const { payoutPercentToBps } = load("src/features/admin/lib/booster-settings.ts");
  for (const [input, bps] of [["0",0],["50",5000],["60.01",6001],["100",10000],["0.29",29]]) assert.equal(payoutPercentToBps(input), bps);
  for (const input of ["-1","101","1e2","NaN","Infinity","50.001","", " 50", "100.01"]) assert.throws(() => payoutPercentToBps(input));
});

test("server action verifies admin before RPC, validates games and requires disable confirmation", async () => {
  let adminAllowed = true, calls = [], rpcError = null;
  const settings = load("src/features/admin/lib/booster-settings.ts");
  const { saveBoosterAccess } = load("src/app/admin/boosters/actions.ts", {
    "next/cache": { revalidatePath() {} },
    "@/features/auth/server/auth": { async requireAdmin() { if (!adminAllowed) throw new Error("Forbidden"); } },
    "@/lib/supabase/auth": { async createAuthServerClient() { return { async rpc(name, args) { calls.push({name,args}); return { error: rpcError }; } }; } },
    "@/features/catalog/data/launch-games": { publicGameNavigation: [{slug:"rocket-league"},{slug:"valorant"}] },
    "@/features/admin/lib/booster-settings": settings,
  });
  const form = () => { const data = new FormData(); data.set("userId", customer); data.set("intent", "enable"); data.set("payout","60.01"); data.append("games","rocket-league"); return data; };
  adminAllowed=false; await assert.rejects(saveBoosterAccess({},form()), /Forbidden/); assert.equal(calls.length,0);
  adminAllowed=true; assert.ok((await saveBoosterAccess({},form())).success); assert.equal(calls[0].args.p_payout_rate_bps,6001);
  const invalid=form(); invalid.append("games","unknown-game"); assert.ok((await saveBoosterAccess({},invalid)).error); assert.equal(calls.length,1);
  const disable=form(); disable.set("intent","disable"); assert.ok((await saveBoosterAccess({},disable)).error); assert.equal(calls.length,1);
  disable.set("confirmDisable","yes"); rpcError={message:"This booster still has active orders."}; assert.equal((await saveBoosterAccess({},disable)).error,rpcError.message);
  rpcError={message:"internal secret"}; assert.ok(!(await saveBoosterAccess({},disable)).error.includes("internal secret"));
});

test("migration uses private definer functions, pinned search paths and synchronized claim/edit locks", () => {
  assert.ok(!/public\.[\w]+[\s\S]{0,250}security definer/i.test(migration));
  assert.ok(migration.includes("for update;"));
  assert.ok(migration.includes("revoke all on function private.manage_booster_access"));
  assert.ok(migration.includes("revoke all on function public.claim_order_for_booster"));
  assert.ok(!migration.includes("user_metadata"));
  const board = readFileSync(path.join(root,"src/features/booster/server/booster-orders.ts"),"utf8");
  assert.ok(board.includes('rpc("list_eligible_booster_order_ids")'));
  assert.ok(board.includes('.in("id", eligibleIds)'));
});

test("admin panel and access form render minimal account data, accessible controls and pending states", async () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const games = ["rocket-league", "league-of-legends", "valorant", "marvel-rivals", "overwatch-2", "dota-2", "rainbow-six-siege"].map((slug) => ({ slug, name: slug.replaceAll("-", " ") }));
  const account = { user_id: customer, email: "player@test.invalid", full_name: "Player", gamer_tag: "GamerOne", role: "booster", is_active: true, payout_rate_bps: 6000, activated_at: null, game_slugs: ["rocket-league"] };
  let pending = false;
  const { BoosterAccessForm } = load("src/components/admin/booster-access-form.tsx", {
    react: { ...React, useActionState: (_action, initial) => [initial, () => {}, pending] },
    "@/app/admin/boosters/actions": { saveBoosterAccess() {} },
  });
  const activeMarkup = renderToStaticMarkup(React.createElement(BoosterAccessForm, { account, games }));
  assert.equal((activeMarkup.match(/name="games"/g) ?? []).length, 7);
  assert.ok(activeMarkup.includes("Save Changes") && activeMarkup.includes("Disable Booster Access"));
  assert.ok(activeMarkup.includes('name="confirmDisable"') && activeMarkup.includes('required=""'));
  assert.ok(activeMarkup.includes('value="60"'));
  pending = true;
  assert.equal((renderToStaticMarkup(React.createElement(BoosterAccessForm, { account, games })).match(/disabled=""/g) ?? []).length, 2);
  pending = false;
  const adminMarkup = renderToStaticMarkup(React.createElement(BoosterAccessForm, { account: { ...account, role: "admin", is_active: false }, games }));
  assert.ok(adminMarkup.includes("Admin access will be preserved.") && adminMarkup.includes("Enable Booster Access"));
  assert.ok(!adminMarkup.includes("Disable Booster Access"));
  let allowed = true;
  const { default: Page } = load("src/app/admin/boosters/page.tsx", {
    "@/components/admin/booster-management-header": { BoosterManagementHeader: () => React.createElement("header", {}, "Booster management", React.createElement("a", { href: "/admin/boosters?add=1" }, "Add Booster")) },
    "@/features/booster-applications/components/admin-applications-page": { AdminApplicationsPage: () => React.createElement("section", {}, "Applications") },
    "next/link": { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) },
    "@/components/layout/container": { Container: ({ children }) => React.createElement("div", {}, children) },
    "@/components/marketing/site-header": { SiteHeader: () => React.createElement("header", {}, "Site header") },
    "@/components/admin/booster-access-form": { BoosterAccessForm },
    "@/features/auth/server/auth": { async requireAdmin() { if (!allowed) throw new Error("Forbidden"); } },
    "@/features/catalog/data/launch-games": { publicGameNavigation: games },
    "@/features/admin/server/admin-boosters": { async listBoosterAccounts() { return { accounts: [account], hasNextPage: true }; } },
    "@/features/admin/lib/booster-settings": load("src/features/admin/lib/booster-settings.ts"),
  });
  const markup = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ user: customer, q: "player", add: "1" }) }));
  for (const text of ["Booster management", "Add Booster", "Find an existing account", "Edit Booster", "Approved games", "Not recorded", "Next", "role=\"search\"", "min-w-0"]) assert.ok(markup.includes(text), text);
  assert.ok(!markup.includes("service_role") && !markup.includes("Accept Order"));
  allowed = false;
  await assert.rejects(Page({ searchParams: Promise.resolve({}) }), /Forbidden/);
});
