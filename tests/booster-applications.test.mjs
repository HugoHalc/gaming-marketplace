import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { PGlite } from "@electric-sql/pglite";
const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const migration = readFileSync(
  path.join(
    root,
    "supabase/migrations/20261003195546_admin_booster_management.sql",
  ),
  "utf8",
);
const applicationMigration = readFileSync(
  path.join(
    root,
    "supabase/migrations/20261003204240_booster_applications.sql",
  ),
  "utf8",
);
const integrityMigration = readFileSync(
  path.join(
    root,
    "supabase/migrations/20261004191019_booster_role_integrity.sql",
  ),
  "utf8",
);
const admin = "00000000-0000-0000-0000-000000000001";
const customer = "00000000-0000-0000-0000-000000000002";
const other = "00000000-0000-0000-0000-000000000003";
const rlOrder = "10000000-0000-0000-0000-000000000001";
const valorantOrder = "10000000-0000-0000-0000-000000000002";
const nextOrder = "10000000-0000-0000-0000-000000000003";
const applicationId = "30000000-0000-0000-0000-000000000001";
const otherApplicationId = "30000000-0000-0000-0000-000000000002";
// A disposable real PostgreSQL engine. Only the schema dependencies of the
// migration are modeled; no production network or credentials are used.
async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key,email text,is_anonymous boolean not null default false);
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
    insert into auth.users(id,email) values('${admin}','admin@test.invalid'),('${customer}','player@test.invalid'),('${other}','other@test.invalid');
    insert into public.profiles(id,full_name,gamer_tag,role) values('${admin}','Admin','admin','admin'),('${customer}','Player','GamerOne','customer'),('${other}','Other','OtherTag','customer');
    insert into public.games values('20000000-0000-0000-0000-000000000001','rocket-league','Rocket League'),('20000000-0000-0000-0000-000000000002','valorant','VALORANT');
    insert into public.orders(id,status,payment_status,total_cents) values('${rlOrder}','paid','paid',10001),('${valorantOrder}','paid','paid',20000),('${nextOrder}','queued','paid',10001);
    insert into public.order_items(order_id,game_id,game_name) values('${rlOrder}','20000000-0000-0000-0000-000000000001','Rocket League'),('${valorantOrder}','20000000-0000-0000-0000-000000000002','Rocket League'),('${nextOrder}',null,'Rocket League');
  `);
  await db.exec(
    readFileSync(
      path.join(
        root,
        "supabase/migrations/phase_16g2_claim_operational_conflict_hotfix.sql",
      ),
      "utf8",
    ),
  );
  await db.exec(migration);
  await db.exec(applicationMigration);
  await db.exec(integrityMigration);
  return db;
}
async function asActor(db, actor, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    actor ?? "",
  ]);
  await db.exec(`set role ${role}`);
}
async function manage(
  db,
  target,
  bps = 5000,
  games = ["rocket-league"],
  intent = "enable",
) {
  return db.query("select public.manage_booster_access($1,$2,$3,$4)", [
    target,
    bps,
    games,
    intent,
  ]);
}
async function value(db, sql) {
  return (await db.query(sql)).rows[0];
}

async function submit(
  db,
  id = applicationId,
  games = ["rocket-league"],
  platforms = {},
  confirmations = [true, true, true, true],
) {
  return db.query(
    "select public.submit_booster_application($1,$2,$3,$4,$5,$6,$7) as id",
    [
      id,
      games,
      platforms,
      "Competitive gaming experience",
      20,
      "America/Mexico_City",
      confirmations,
    ],
  );
}
async function review(
  db,
  id = applicationId,
  version = 1,
  action = "approved",
  bps = 6000,
  games = ["valorant"],
  note = "Internal only",
) {
  return db.query(
    "select public.review_booster_application($1,$2,$3,$4,$5,$6,$7) as id",
    [
      id,
      version,
      action,
      note,
      "You may submit a new application.",
      bps,
      games,
    ],
  );
}
async function withdraw(db, id = applicationId, version = 1) {
  return db.query("select public.withdraw_booster_application($1,$2)", [
    id,
    version,
  ]);
}
async function adminDetail(db, id = applicationId) {
  return (
    await db.query(
      "select * from public.admin_booster_applications('', 'all', 0, $1)",
      [id],
    )
  ).rows[0]?.admin_booster_applications;
}

test("SQL: submission authenticates, enforces ownership, one active request and idempotent retry", async () => {
  const db = await database();
  try {
    await asActor(db, null, "anon");
    await assert.rejects(submit(db), /permission denied/);
    await asActor(db, null);
    await assert.rejects(submit(db), /Authentication required/);
    await db.exec("reset role");
    await db.query("update auth.users set is_anonymous=true where id=$1", [
      customer,
    ]);
    await asActor(db, customer);
    await assert.rejects(submit(db), /registered account/);
    await db.exec("reset role");
    await db.query("update auth.users set is_anonymous=false where id=$1", [
      customer,
    ]);
    await asActor(db, customer);
    assert.equal((await submit(db)).rows[0].id, applicationId);
    assert.equal((await submit(db)).rows[0].id, applicationId);
    await assert.rejects(
      submit(db, otherApplicationId),
      /already have an active/,
    );
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from public.booster_applications",
        )
      ).n,
      1,
    );
    assert.equal(
      (await db.query("select * from public.booster_profiles")).rows.length,
      0,
    );
    for (const query of [
      "update public.booster_applications set status='approved'",
      "delete from public.booster_applications",
      "insert into public.booster_applications(id,user_id,requested_games,experience,weekly_hours,timezone) values(gen_random_uuid(),auth.uid(),array['rocket-league'],'Experience',10,'UTC')",
    ])
      await assert.rejects(db.exec(query), /permission denied/);
    await assert.rejects(review(db), /Administrator access required/);
    await assert.rejects(
      db.query("select * from private.booster_application_reviews"),
      /permission denied/,
    );
    await asActor(db, other);
    assert.equal(
      (await db.query("select * from public.booster_applications")).rows.length,
      0,
    );
    await assert.rejects(withdraw(db), /Application not found/);
    await assert.rejects(review(db), /Administrator access required/);
    await assert.rejects(
      db.query("select * from public.admin_booster_applications()"),
      /Administrator access required/,
    );
  } finally {
    await db.close();
  }
});

test("SQL: approval reuses Phase 1, sets the admin decision and is idempotent without duplicate audits", async () => {
  const db = await database();
  try {
    await asActor(db, customer);
    await submit(db);
    await asActor(db, admin);
    await review(db, applicationId, 1, "under_review");
    await assert.rejects(review(db, applicationId, 1), /Application changed/);
    await review(db, applicationId, 2, "approved", 7012, [
      "valorant",
      "dota-2",
    ]);
    await review(db, applicationId, 2, "approved", 7012, [
      "dota-2",
      "valorant",
    ]);
    await assert.rejects(
      review(db, applicationId, 2, "approved", 5000, ["valorant"]),
      /already been approved/,
    );
    const detail = await adminDetail(db);
    assert.equal(detail.status, "approved");
    assert.equal(detail.version, 3);
    assert.equal(detail.history.length, 2);
    assert.equal(detail.internal_note, "Internal only");
    assert.equal(detail.history[1].actor_id, admin);
    const account = (
      await db.query(
        "select * from public.admin_booster_accounts('',0,true,$1)",
        [customer],
      )
    ).rows[0];
    assert.equal(account.role, "booster");
    assert.equal(account.payout_rate_bps, 7012);
    assert.deepEqual(account.game_slugs.sort(), ["dota-2", "valorant"]);
    assert.equal(account.is_active, true);
    await db.exec("reset role");
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from private.booster_management_audit",
        )
      ).n,
      1,
    );
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from public.booster_game_eligibilities",
        )
      ).n,
      2,
    );
    await asActor(db, customer);
    const candidate = (
      await db.query("select * from public.booster_applications")
    ).rows[0];
    assert.equal(candidate.status, "approved");
    for (const forbidden of [
      "internal_note",
      "actor_id",
      "reviewed_by",
      "payout_rate_bps",
      "approved_games",
    ])
      assert.ok(!Object.hasOwn(candidate, forbidden), forbidden);
    assert.ok(!JSON.stringify(candidate).includes("Internal only"));
    await assert.rejects(
      submit(db, otherApplicationId),
      /Active boosters cannot/,
    );
    await assert.rejects(
      withdraw(db, applicationId, 3),
      /no longer be withdrawn/,
    );
    await asActor(db, admin);
    await assert.rejects(
      review(db, applicationId, 3, "rejected"),
      /no longer reviewable/,
    );
  } finally {
    await db.close();
  }
});

test("SQL: admin approval preserves admin role; already enabled accounts cannot be approved", async () => {
  const db = await database();
  try {
    await asActor(db, admin);
    await submit(db);
    await review(db);
    assert.equal(
      (
        await db.query(
          "select * from public.admin_booster_accounts('',0,true,$1)",
          [admin],
        )
      ).rows[0].role,
      "admin",
    );
    await asActor(db, customer);
    await submit(db, otherApplicationId);
    await asActor(db, admin);
    await manage(db, customer, 5000, ["rocket-league"]);
    await assert.rejects(
      review(db, otherApplicationId),
      /already has active booster/,
    );
    assert.equal(
      (await adminDetail(db, otherApplicationId)).status,
      "submitted",
    );
  } finally {
    await db.close();
  }
});

test("SQL: rejected and withdrawn requests remain immutable history; reapplication uses a new row", async () => {
  const db = await database();
  try {
    await asActor(db, customer);
    await submit(db);
    await asActor(db, admin);
    await review(db, applicationId, 1, "rejected");
    await assert.rejects(
      review(db),
      /Application changed|no longer reviewable/,
    );
    await asActor(db, customer);
    assert.equal(
      (
        await value(
          db,
          "select rejection_reason from public.booster_applications",
        )
      ).rejection_reason,
      "You may submit a new application.",
    );
    await submit(db, otherApplicationId);
    await asActor(db, admin);
    await review(db, otherApplicationId, 1, "under_review");
    await asActor(db, customer);
    await assert.rejects(
      withdraw(db, otherApplicationId, 1),
      /Application changed/,
    );
    await withdraw(db, otherApplicationId, 2);
    await withdraw(db, otherApplicationId, 2);
    await asActor(db, admin);
    await assert.rejects(
      review(db, otherApplicationId, 3),
      /no longer reviewable/,
    );
    await db.exec("reset role");
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from public.booster_applications",
        )
      ).n,
      2,
    );
    await assert.rejects(
      db.exec(
        `update public.booster_applications set status='approved' where id='${otherApplicationId}'`,
      ),
      /Invalid application transition/,
    );
    await assert.rejects(
      db.exec(
        `update public.booster_applications set user_id='${admin}' where id='${applicationId}'`,
      ),
      /immutable/,
    );
  } finally {
    await db.close();
  }
});

test("SQL: invalid approval rolls back Phase 1; invalid input and unsupported platforms rejected", async () => {
  const db = await database();
  try {
    await asActor(db, customer);
    for (const [games, platforms, confirmations] of [
      [[], {}, [true, true, true, true]],
      [["unknown-game"], {}, [true, true, true, true]],
      [["rocket-league", "rocket-league"], {}, [true, true, true, true]],
      [["valorant"], { valorant: ["xbox"] }, [true, true, true, true]],
      [["valorant"], { valorant: ["pc", "pc"] }, [true, true, true, true]],
      [["rocket-league"], {}, [true, true, false, true]],
    ])
      await assert.rejects(
        submit(db, applicationId, games, platforms, confirmations),
        /Invalid application details/,
      );
    await submit(db, applicationId, ["valorant"], { valorant: ["pc"] });
    await asActor(db, admin);
    await assert.rejects(
      review(db, applicationId, 1, "approved", 10001),
      /Invalid booster settings/,
    );
    await assert.rejects(
      review(db, applicationId, 1, "approved", 6000, ["unknown-game"]),
      /Invalid approved games/,
    );
    await db.exec("reset role");
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from public.booster_profiles",
        )
      ).n,
      0,
    );
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from private.booster_management_audit",
        )
      ).n,
      0,
    );
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from private.booster_application_reviews",
        )
      ).n,
      0,
    );
    // An injected late failure proves activation and application approval roll back together.
    await db.exec(
      "create function private.fail_review_test() returns trigger language plpgsql as $$ begin raise exception 'Injected late failure'; end; $$; create trigger fail_review_test before insert on private.booster_application_reviews for each row execute function private.fail_review_test();",
    );
    await asActor(db, admin);
    await assert.rejects(review(db), /Injected late failure/);
    assert.equal((await adminDetail(db)).status, "submitted");
    await db.exec("reset role");
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from public.booster_profiles",
        )
      ).n,
      0,
    );
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from private.booster_management_audit",
        )
      ).n,
      0,
    );
    assert.equal(
      (
        await value(
          db,
          `select role from public.profiles where id='${customer}'`,
        )
      ).role,
      "customer",
    );
  } finally {
    await db.close();
  }
});

test("SQL: repeated competing decisions and withdraw/approve ordering are consistent", async () => {
  // PGlite queues a single PostgreSQL connection: these check winner/loser
  // semantics and idempotency, not multi-session lock timing.
  const db = await database();
  try {
    await asActor(db, customer);
    await submit(db);
    await asActor(db, admin);
    const outcomes = await Promise.allSettled([review(db), review(db)]);
    assert.ok(outcomes.every((result) => result.status === "fulfilled"));
    assert.equal((await adminDetail(db)).history.length, 1);
    await asActor(db, customer);
    await assert.rejects(withdraw(db), /changed|no longer/);
    await asActor(db, other);
    await submit(db, otherApplicationId);
    await withdraw(db, otherApplicationId);
    await asActor(db, admin);
    await assert.rejects(review(db, otherApplicationId), /changed|no longer/);
  } finally {
    await db.close();
  }
});

const cache = new Map();
const mocks = {};
function load(relative, stubs = {}) {
  const filename = [
    path.resolve(root, relative),
    path.resolve(root, relative) + ".ts",
    path.resolve(root, relative) + ".tsx",
  ].find(existsSync);
  assert.ok(filename, relative);
  if (!Object.keys(stubs).length && cache.has(filename))
    return cache.get(filename);
  const mod = { exports: {} };
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const localRequire = (name) => {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/")) return load("src/" + name.slice(2));
    if (name.startsWith(".")) {
      const resolved = path.resolve(path.dirname(filename), name);
      const key = "@/" + path.relative(path.join(root, "src"), resolved);
      if (Object.hasOwn(mocks, key)) return mocks[key];
      return load(path.relative(root, resolved));
    }
    if (name === "server-only") return {};
    return require(name);
  };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    FormData,
    URLSearchParams,
    Set,
    Intl,
    Error,
    Number,
    String,
    console,
  })(localRequire, mod, mod.exports);
  if (!Object.keys(stubs).length) cache.set(filename, mod.exports);
  return mod.exports;
}

test("canonical game/platform adapters reuse real exports and match database validation", async () => {
  const { applicationGames } = load(
    "src/features/booster-applications/catalog.ts",
  );
  const { publicGameNavigation } = load(
    "src/features/catalog/data/launch-games.ts",
  );
  assert.deepEqual(
    Array.from(applicationGames, (game) => game.slug),
    Array.from(publicGameNavigation, (game) => game.slug),
  );
  assert.equal(applicationGames.length, 7);
  const db = await database();
  try {
    for (const game of applicationGames) {
      assert.equal(
        (
          await db.query(
            "select private.valid_booster_application_choices($1,$2) as valid",
            [[game.slug], {}],
          )
        ).rows[0].valid,
        true,
      );
      for (const platform of game.platforms)
        assert.equal(
          (
            await db.query(
              "select private.valid_booster_application_choices($1,$2) as valid",
              [[game.slug], { [game.slug]: [platform.value] }],
            )
          ).rows[0].valid,
          true,
        );
    }
    assert.equal(
      applicationGames.find((game) => game.slug === "valorant").platforms[0]
        .value,
      "pc",
    );
    assert.ok(
      applicationGames
        .find((game) => game.slug === "overwatch-2")
        .platforms.some((platform) => platform.value === "nintendo-switch"),
    );
  } finally {
    await db.close();
  }
});

test("candidate validation associates errors and rejects forged catalogs, missing confirmations and invalid timezones", () => {
  const { parseApplicationForm } = load(
    "src/features/booster-applications/validation.ts",
  );
  const form = new FormData();
  form.append("games", "valorant");
  form.append("platforms", "valorant:pc");
  form.set("experience", "Gaming experience");
  form.set("weeklyHours", "25");
  form.set("timezone", "America/Mexico_City");
  for (const name of ["approval", "onPlatform", "privacy", "rules"])
    form.set(name, "yes");
  assert.equal(Object.keys(parseApplicationForm(form).fields).length, 0);
  form.append("platforms", "valorant:xbox");
  assert.ok(parseApplicationForm(form).fields.platforms);
  form.set("timezone", "Unknown/Zone");
  form.set("weeklyHours", "1e2");
  form.delete("rules");
  const errors = parseApplicationForm(form).fields;
  assert.ok(errors.timezone && errors.weeklyHours && errors.confirmations);
});

test("server actions authorize before RPC, reject forged settings and sanitize backend errors", async () => {
  cache.clear();
  let signedIn = true,
    isAdmin = false,
    calls = [],
    rpcError = null;
  const revalidated = [];
  mocks["next/navigation"] = {
    redirect(url) {
      throw new Error(`REDIRECT:${url}`);
    },
  };
  mocks["next/cache"] = {
    revalidatePath(url) {
      revalidated.push(url);
    },
  };
  mocks["@/features/auth/server/auth"] = {
    async getCurrentIdentity() {
      return signedIn ? { id: customer } : null;
    },
    async requireAdmin() {
      if (!isAdmin) throw new Error("Forbidden");
      return { id: admin };
    },
  };
  mocks["@/lib/supabase/auth"] = {
    async createAuthServerClient() {
      return {
        async rpc(name, args) {
          calls.push({ name, args });
          return { error: rpcError };
        },
      };
    },
  };
  const { submitApplication, withdrawApplication } = load(
    "src/app/become-a-booster/actions.ts",
  );
  const { reviewApplication } = load(
    "src/app/admin/boosters/application-actions.ts",
  );
  const form = new FormData();
  form.set("requestId", applicationId);
  form.set("user_id", other);
  form.set("role", "admin");
  form.set("payout", "100");
  form.append("games", "valorant");
  form.set("experience", "Experience");
  form.set("weeklyHours", "20");
  form.set("timezone", "UTC");
  for (const name of ["approval", "onPlatform", "privacy", "rules"])
    form.set(name, "yes");
  signedIn = false;
  await assert.rejects(
    submitApplication({}, form),
    /REDIRECT:.*become-a-booster/,
  );
  assert.equal(calls.length, 0);
  signedIn = true;
  assert.ok((await submitApplication({}, form)).success);
  assert.equal(calls[0].name, "submit_booster_application");
  assert.ok(
    !Object.hasOwn(calls[0].args, "user_id") &&
      !Object.hasOwn(calls[0].args, "role") &&
      !Object.hasOwn(calls[0].args, "payout"),
  );
  const invalid = new FormData();
  invalid.set("games", "unknown-game");
  assert.ok((await submitApplication({}, invalid)).fields.games);
  assert.equal(calls.length, 1);
  const decision = new FormData();
  decision.set("applicationId", applicationId);
  decision.set("version", "1");
  decision.set("intent", "approved");
  decision.set("payout", "60.01");
  decision.append("games", "valorant");
  await assert.rejects(reviewApplication({}, decision), /Forbidden/);
  assert.equal(calls.length, 1);
  isAdmin = true;
  assert.ok((await reviewApplication({}, decision)).fields.confirmDecision);
  assert.equal(calls.length, 1);
  decision.set("confirmDecision", "yes");
  assert.ok((await reviewApplication({}, decision)).success);
  assert.equal(calls[1].args.p_payout_rate_bps, 6001);
  assert.deepEqual(Array.from(calls[1].args.p_games), ["valorant"]);
  rpcError = { message: "secret backend diagnostic" };
  assert.ok(
    !(await reviewApplication({}, decision)).error.includes("secret backend"),
  );
  rpcError = {
    message: "Application changed. Refresh the page and try again.",
  };
  assert.equal((await reviewApplication({}, decision)).error, rpcError.message);
  const withdrawal = new FormData();
  withdrawal.set("applicationId", applicationId);
  withdrawal.set("version", "1");
  const count = calls.length;
  assert.ok((await withdrawApplication({}, withdrawal)).error);
  assert.equal(calls.length, count);
  assert.ok(
    revalidated.includes("/become-a-booster") &&
      revalidated.includes("/booster/orders"),
  );
});

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
let hookValues = [],
  hookIndex = 0,
  actionState = {},
  pending = false;
function renderComponent(Component, props) {
  hookIndex = 0;
  return Component(props);
}
function elements(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(elements);
  return [node, ...elements(node.props?.children)];
}
function hookMocks() {
  return {
    ...React,
    useState(initial) {
      const index = hookIndex++;
      if (!(index in hookValues))
        hookValues[index] = typeof initial === "function" ? initial() : initial;
      return [
        hookValues[index],
        (value) =>
          (hookValues[index] =
            typeof value === "function" ? value(hookValues[index]) : value),
      ];
    },
    useActionState() {
      return [actionState, () => {}, pending];
    },
  };
}

test("application form renders accessible mobile structures and retains input through errors", () => {
  cache.clear();
  hookValues = [];
  actionState = {};
  pending = false;
  mocks.react = hookMocks();
  const { applicationGames } = load(
    "src/features/booster-applications/catalog.ts",
  );
  const { ApplicationForm } = load(
    "src/features/booster-applications/components/application-form.tsx",
  );
  const props = {
    requestId: applicationId,
    games: applicationGames,
    timezones: ["UTC", "America/Mexico_City"],
  };
  let tree = renderComponent(ApplicationForm, props);
  const control = (name) =>
    elements(tree).find(
      (node) => node.type === "input" && node.props.name === name,
    );
  assert.equal(
    elements(tree).filter(
      (node) => node.type === "input" && node.props.name === "games",
    ).length,
    7,
  );
  control("games").props.onChange({ target: { checked: true } });
  tree = renderComponent(ApplicationForm, props);
  assert.equal(control("games").props.checked, true);
  elements(tree)
    .find((node) => node.type === "textarea")
    .props.onChange({ target: { value: "Experience retained" } });
  control("weeklyHours").props.onChange({ target: { value: "30" } });
  control("timezone").props.onChange({ target: { value: "UTC" } });
  actionState = {
    error: "Please check fields",
    fields: { timezone: "Invalid zone" },
  };
  pending = true;
  tree = renderComponent(ApplicationForm, props);
  const html = renderToStaticMarkup(tree);
  assert.ok(
    html.includes("Experience retained") &&
      html.includes('value="30"') &&
      html.includes('value="UTC"'),
  );
  assert.ok(
    html.includes('aria-invalid="true"') &&
      html.includes('aria-describedby="application-timezone-error"') &&
      html.includes('role="alert"'),
  );
  assert.ok(
    html.includes('disabled=""') &&
      html.includes("min-h-11") &&
      html.includes("sm:grid-cols-2"),
  );
  assert.ok(
    !html.includes("shadow-") &&
      !html.includes("drop-shadow") &&
      !html.includes("overflow-x-auto"),
  );
  pending = false;
  actionState = {};
  delete mocks.react;
});

test("candidate page shows authentication, state, withdrawal and dashboard without internal data", async () => {
  cache.clear();
  hookValues = [];
  actionState = {};
  pending = false;
  let identity = null;
  let data = {
    applications: [],
    latest: undefined,
    activeBooster: false,
    hasNextPage: false,
  };
  mocks.react = hookMocks();
  mocks["next/link"] = {
    __esModule: true,
    default: ({ children, ...props }) =>
      React.createElement("a", props, children),
  };
  mocks["@/components/marketing/site-header"] = {
    SiteHeader: () => React.createElement("header", {}, "Site header"),
  };
  mocks["@/components/marketing/site-footer"] = {
    SiteFooter: () => React.createElement("footer", {}, "Site footer"),
  };
  mocks["@/features/auth/server/auth"] = {
    async getCurrentIdentity() {
      return identity;
    },
  };
  mocks["@/features/booster-applications/server/repository"] = {
    async getCandidateApplications() {
      return data;
    },
  };
  const { default: Page } = load("src/app/become-a-booster/page.tsx");
  let html = renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve({}) }),
  );
  assert.ok(
    html.includes("Sign in to apply") &&
      html.includes("next=%2Fbecome-a-booster"),
  );
  assert.ok(!html.includes("Submit Application"));
  identity = { id: customer };
  hookValues = [];
  html = renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve({}) }),
  );
  assert.ok(html.includes("Submit Application"));
  const application = {
    id: applicationId,
    status: "submitted",
    requested_games: ["rocket-league"],
    platforms: {},
    experience: "Experience",
    weekly_hours: 20,
    timezone: "UTC",
    submitted_at: "2026-10-03T00:00:00Z",
    version: 1,
    rejection_reason: null,
    internal_note: "PRIVATE NOTE",
    actor_id: admin,
    payout_rate_bps: 6000,
  };
  data = {
    applications: [application],
    latest: application,
    activeBooster: false,
    hasNextPage: false,
  };
  hookValues = [];
  html = renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve({}) }),
  );
  assert.ok(
    html.includes("Application submitted") &&
      html.includes("Withdraw Application"),
  );
  assert.ok(!html.includes("Submit Application"));
  for (const secret of [
    "PRIVATE NOTE",
    admin,
    "payout_rate_bps",
    "Internal note",
  ])
    assert.ok(!html.includes(secret));
  data = {
    ...data,
    latest: { ...application, status: "approved" },
    activeBooster: true,
  };
  hookValues = [];
  html = renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve({}) }),
  );
  assert.ok(
    html.includes("Open Booster Dashboard") &&
      html.includes('href="/booster/orders"'),
  );
  assert.ok(!html.includes("Withdraw Application"));
  data = {
    ...data,
    applications: [],
    latest: {
      ...application,
      status: "rejected",
      rejection_reason: "You may apply again.",
    },
    activeBooster: false,
  };
  hookValues = [];
  html = renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve({}) }),
  );
  assert.ok(
    html.includes("Not approved") &&
      html.includes("You may apply again.") &&
      html.includes("Submit a new application"),
  );
  assert.ok(!html.includes("PRIVATE NOTE"));
  delete mocks.react;
});

test("admin views preserve booster management and expose review controls only for active applications", async () => {
  cache.clear();
  hookValues = [];
  actionState = {};
  pending = false;
  mocks.react = hookMocks();
  const { BoosterManagementHeader } = load(
    "src/components/admin/booster-management-header.tsx",
  );
  const header = renderToStaticMarkup(
    React.createElement(BoosterManagementHeader, { view: "applications" }),
  );
  assert.ok(
    header.includes("Applications") &&
      header.includes("Booster access") &&
      header.includes("Add Booster"),
  );
  const { applicationGames } = load(
    "src/features/booster-applications/catalog.ts",
  );
  const { ApplicationReviewForm } = load(
    "src/features/booster-applications/components/review-form.tsx",
  );
  const application = {
    id: applicationId,
    status: "submitted",
    version: 1,
    requested_games: ["valorant"],
    internal_note: "Private note",
  };
  let tree = renderComponent(ApplicationReviewForm, {
    application,
    games: applicationGames,
  });
  elements(tree)
    .find((node) => node.type === "select")
    .props.onChange({ target: { value: "approved" } });
  tree = renderComponent(ApplicationReviewForm, {
    application,
    games: applicationGames,
  });
  let html = renderToStaticMarkup(tree);
  assert.ok(
    html.includes("Authorized games") &&
      html.includes("Payout (%)") &&
      html.includes("Confirm approval"),
  );
  assert.ok(
    elements(tree).find(
      (node) =>
        node.type === "input" &&
        node.props.name === "games" &&
        node.props.value === "valorant",
    ).props.checked,
  );
  const payout = elements(tree).find(
    (node) => node.type === "input" && node.props.name === "payout",
  );
  payout.props.onChange({ target: { value: "70" } });
  actionState = {
    error: "Application changed. Refresh the page and try again.",
  };
  tree = renderComponent(ApplicationReviewForm, {
    application,
    games: applicationGames,
  });
  html = renderToStaticMarkup(tree);
  assert.ok(html.includes('value="70"') && html.includes("Private note"));
  elements(tree)
    .find((node) => node.type === "select")
    .props.onChange({ target: { value: "rejected" } });
  tree = renderComponent(ApplicationReviewForm, {
    application,
    games: applicationGames,
  });
  html = renderToStaticMarkup(tree);
  assert.ok(
    html.includes("Reason shown to the candidate") &&
      !html.includes("Payout (%)"),
  );
  actionState = {};
  hookValues = [];
  const selected = {
    ...application,
    email: "player@test.invalid",
    full_name: "Player",
    gamer_tag: "GamerOne",
    platforms: { valorant: ["pc"] },
    experience: "Experience",
    weekly_hours: 20,
    timezone: "UTC",
    submitted_at: "2026-10-03T00:00:00Z",
    history: [],
    rejection_reason: null,
  };
  mocks["@/features/booster-applications/server/repository"] = {
    async listAdminApplications() {
      return { applications: [selected], hasNextPage: false };
    },
  };
  const { AdminApplicationsPage } = load(
    "src/features/booster-applications/components/admin-applications-page.tsx",
  );
  html = renderToStaticMarkup(
    await AdminApplicationsPage({ params: { application: applicationId } }),
  );
  assert.ok(
    html.includes("Weekly availability") &&
      html.includes("Mark as under review") &&
      html.includes("Applications"),
  );
  selected.status = "approved";
  selected.version = 2;
  hookValues = [];
  html = renderToStaticMarkup(
    await AdminApplicationsPage({ params: { application: applicationId } }),
  );
  assert.ok(!html.includes("Review action"));
  delete mocks.react;
});

test("SQL: two admins cannot replace a committed decision or duplicate activation", async () => {
  const db = await database();
  try {
    await db.exec(
      `update public.profiles set role='admin' where id='${other}'`,
    );
    await asActor(db, customer);
    await submit(db);
    await asActor(db, admin);
    await review(db);
    await asActor(db, other);
    await review(db);
    await assert.rejects(
      review(db, applicationId, 1, "approved", 7000, ["dota-2"]),
      /already been approved/,
    );
    const detail = await adminDetail(db);
    assert.equal(detail.history.length, 1);
    assert.equal(detail.history[0].actor_id, admin);
    await db.exec("reset role");
    assert.equal(
      (
        await value(
          db,
          "select count(*)::int as n from private.booster_management_audit",
        )
      ).n,
      1,
    );
  } finally {
    await db.close();
  }
});

test("candidate repository limits history and selects only safe fields scoped to the verified identity", async () => {
  cache.clear();
  const traces = [];
  let authorized = true;
  const stubs = {
    "@/features/auth/server/auth": {
      async requireUser() {
        if (!authorized) throw new Error("Forbidden");
        return { id: customer };
      },
    },
    "@/lib/supabase/auth": {
      async createAuthServerClient() {
        return {
          from(table) {
            const query = { table };
            traces.push(query);
            const builder = {
              select(value) {
                query.select = value;
                return this;
              },
              eq(field, value) {
                query[field] = value;
                return this;
              },
              order() {
                return this;
              },
              range(start, end) {
                query.range = [start, end];
                return Promise.resolve({ data: [], error: null });
              },
              limit(value) {
                query.limit = value;
                return Promise.resolve({ data: [], error: null });
              },
              maybeSingle() {
                return Promise.resolve({ data: null, error: null });
              },
            };
            return builder;
          },
        };
      },
    },
  };
  const { getCandidateApplications, CANDIDATE_APPLICATION_SELECT } = load(
    "src/features/booster-applications/server/repository.ts",
    stubs,
  );
  await getCandidateApplications(1);
  const applicationQueries = traces.filter(
    (query) => query.table === "booster_applications",
  );
  assert.equal(applicationQueries.length, 2);
  assert.ok(
    applicationQueries.every(
      (query) =>
        query.user_id === customer &&
        query.select === CANDIDATE_APPLICATION_SELECT,
    ),
  );
  assert.deepEqual(Array.from(applicationQueries[0].range), [20, 40]);
  assert.equal(applicationQueries[1].limit, 1);
  for (const forbidden of ["internal_note", "actor_id", "payout_rate_bps"])
    assert.ok(!CANDIDATE_APPLICATION_SELECT.includes(forbidden));
  authorized = false;
  await assert.rejects(getCandidateApplications(), /Forbidden/);
});
