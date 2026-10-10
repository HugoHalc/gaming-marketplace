import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = readFileSync(
  path.join(root, "supabase/migrations/20261010235500_admin_self_order_acceptance.sql"),
  "utf8",
);
const adminOne = "00000000-0000-0000-0000-000000000001";
const adminTwo = "00000000-0000-0000-0000-000000000002";
const customer = "00000000-0000-0000-0000-000000000003";
const booster = "00000000-0000-0000-0000-000000000004";
const stripeOrder = "10000000-0000-0000-0000-000000000001";
const paypalOrder = "10000000-0000-0000-0000-000000000002";
const unpaidOrder = "10000000-0000-0000-0000-000000000003";
const cancelledOrder = "10000000-0000-0000-0000-000000000004";

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create schema private;
    grant usage on schema auth, private to authenticated, anon;
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant execute on function auth.uid() to authenticated, anon;

    create table public.profiles(
      id uuid primary key,
      role text not null check (role in ('customer', 'booster', 'admin')),
      full_name text
    );
    create table public.booster_profiles(
      user_id uuid primary key references public.profiles,
      is_active boolean not null,
      payout_rate_bps integer not null
    );
    create table public.orders(
      id uuid primary key,
      user_id uuid references public.profiles,
      status text not null,
      payment_status text not null,
      total_cents integer not null,
      created_at timestamptz not null default now()
    );
    create table public.payments(
      id uuid primary key default gen_random_uuid(),
      order_id uuid references public.orders,
      provider text not null
    );
    create table public.order_booster_assignments(
      order_id uuid primary key references public.orders,
      booster_id uuid not null references public.profiles,
      assigned_by uuid not null references public.profiles,
      assigned_at timestamptz not null default now(),
      is_active boolean not null default true,
      payout_rate_bps integer not null,
      payout_cents integer not null,
      constraint order_booster_assignments_payout_rate_check check (payout_rate_bps between 0 and 10000),
      constraint order_booster_assignments_payout_cents_check check (payout_cents >= 0)
    );
    create table public.order_operational_states(
      order_id uuid primary key references public.orders,
      state text,
      state_note text,
      updated_by uuid,
      delivered_at timestamptz,
      auto_complete_at timestamptz,
      completed_at timestamptz
    );
    create table public.order_operational_history(
      id bigint generated always as identity primary key,
      order_id uuid,
      from_state text,
      to_state text,
      note text,
      changed_by uuid
    );

    insert into public.profiles(id, role, full_name) values
      ('${adminOne}', 'admin', 'Admin One'),
      ('${adminTwo}', 'admin', 'Admin Two'),
      ('${customer}', 'customer', 'Customer'),
      ('${booster}', 'booster', 'Booster');
    insert into public.booster_profiles values ('${booster}', true, 5500);
    insert into public.orders(id, user_id, status, payment_status, total_cents) values
      ('${stripeOrder}', '${customer}', 'paid', 'paid', 1000),
      ('${paypalOrder}', '${customer}', 'queued', 'paid', 2000),
      ('${unpaidOrder}', '${customer}', 'pending_payment', 'unpaid', 3000),
      ('${cancelledOrder}', '${customer}', 'cancelled', 'paid', 4000);
    insert into public.payments(order_id, provider) values
      ('${stripeOrder}', 'stripe'),
      ('${paypalOrder}', 'paypal');
  `);
  await db.exec(migration);
  return db;
}

async function asActor(db, actor, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [actor ?? ""]);
  await db.exec(`set role ${role}`);
}

async function accept(db, orderId) {
  return db.query("select * from public.accept_order_as_admin($1)", [orderId]);
}

test("two admins without booster profiles accept Stripe and PayPal orders with no payout", async () => {
  const db = await database();
  try {
    await asActor(db, adminOne);
    const stripeResult = (await accept(db, stripeOrder)).rows[0];
    assert.equal(stripeResult.assignment_kind, "admin");

    await asActor(db, adminTwo);
    const paypalResult = (await accept(db, paypalOrder)).rows[0];
    assert.equal(paypalResult.assignment_kind, "admin");

    await db.exec("reset role");
    const assignments = (await db.query(`
      select order_id, booster_id, assigned_by, assignment_kind,
        payout_rate_bps, payout_cents
      from public.order_booster_assignments
      order by order_id
    `)).rows;
    assert.deepEqual(assignments, [
      {
        order_id: stripeOrder,
        booster_id: adminOne,
        assigned_by: adminOne,
        assignment_kind: "admin",
        payout_rate_bps: null,
        payout_cents: null,
      },
      {
        order_id: paypalOrder,
        booster_id: adminTwo,
        assigned_by: adminTwo,
        assignment_kind: "admin",
        payout_rate_bps: null,
        payout_cents: null,
      },
    ]);
    assert.equal(
      (await db.query("select count(*)::int as count from public.booster_profiles where user_id in ($1, $2)", [adminOne, adminTwo])).rows[0].count,
      0,
    );
    assert.deepEqual(
      (await db.query("select id, role from public.profiles where id in ($1, $2) order by id", [adminOne, adminTwo])).rows,
      [{ id: adminOne, role: "admin" }, { id: adminTwo, role: "admin" }],
    );
    assert.equal(
      (await db.query("select count(*)::int as count from public.order_operational_history")).rows[0].count,
      2,
    );
  } finally {
    await db.close();
  }
});

test("authorization, payment state and assignment races are rejected authoritatively", async () => {
  const db = await database();
  try {
    for (const actor of [customer, booster]) {
      await asActor(db, actor);
      await assert.rejects(accept(db, stripeOrder), /Administrator access required/);
    }
    await asActor(db, null, "anon");
    await assert.rejects(accept(db, stripeOrder), /permission denied/);

    await asActor(db, adminOne);
    await assert.rejects(accept(db, unpaidOrder), /not available for acceptance/);
    await assert.rejects(accept(db, cancelledOrder), /not available for acceptance/);
    await accept(db, stripeOrder);

    await asActor(db, adminTwo);
    await assert.rejects(accept(db, stripeOrder), /no longer available|not available for acceptance/);

    await db.exec("reset role");
    assert.equal(
      (await db.query("select count(*)::int as count from public.order_booster_assignments where order_id = $1", [stripeOrder])).rows[0].count,
      1,
    );
  } finally {
    await db.close();
  }
});

test("booster payout snapshots remain mandatory and application wiring stays admin-only", async () => {
  const db = await database();
  try {
    await db.exec(`
      insert into public.order_booster_assignments(
        order_id, booster_id, assigned_by, payout_rate_bps, payout_cents
      ) values ('${stripeOrder}', '${booster}', '${adminOne}', 5500, 550);
    `);
    const assignment = (await db.query("select assignment_kind, payout_rate_bps, payout_cents from public.order_booster_assignments")).rows[0];
    assert.deepEqual(assignment, {
      assignment_kind: "booster",
      payout_rate_bps: 5500,
      payout_cents: 550,
    });
    await assert.rejects(
      db.exec(`update public.order_booster_assignments set payout_rate_bps = null where order_id = '${stripeOrder}'`),
      /payout_shape_check/,
    );
  } finally {
    await db.close();
  }

  const route = readFileSync(
    path.join(root, "src/app/api/admin/orders/[id]/accept/route.ts"),
    "utf8",
  );
  const server = readFileSync(
    path.join(root, "src/features/admin/server/admin-order-acceptance.ts"),
    "utf8",
  );
  const adminPage = readFileSync(path.join(root, "src/app/admin/page.tsx"), "utf8");
  assert.match(server, /requireAdmin\(\)/);
  assert.match(server, /accept_order_as_admin/);
  assert.match(route, /status: 409/);
  assert.match(adminPage, /Available paid orders/);
  assert.match(adminPage, /Accepted by me/);
  assert.match(migration, /for update/);
  assert.doesNotMatch(migration, /user_metadata/);
});
