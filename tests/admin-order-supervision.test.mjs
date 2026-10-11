import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = readFileSync(
  path.join(
    root,
    "supabase/migrations/20261011050000_admin_order_supervision.sql",
  ),
  "utf8",
);

const ids = {
  adminA: "00000000-0000-0000-0000-000000000001",
  adminB: "00000000-0000-0000-0000-000000000002",
  booster: "00000000-0000-0000-0000-000000000003",
  outsiderBooster: "00000000-0000-0000-0000-000000000004",
  customer: "00000000-0000-0000-0000-000000000005",
  outsiderCustomer: "00000000-0000-0000-0000-000000000006",
  adminOrder: "10000000-0000-0000-0000-000000000001",
  boosterOrder: "10000000-0000-0000-0000-000000000002",
};

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    grant usage on schema auth to authenticated, anon;
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant execute on function auth.uid() to authenticated, anon;

    create table public.profiles(
      id uuid primary key,
      role text not null check (role in ('customer', 'booster', 'admin'))
    );
    create table public.orders(
      id uuid primary key,
      user_id uuid not null references public.profiles,
      status text not null
    );
    create table public.order_booster_assignments(
      order_id uuid primary key references public.orders,
      booster_id uuid not null references public.profiles,
      is_active boolean not null default true
    );
    create table public.order_messages(
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references public.orders,
      sender_id uuid not null references public.profiles,
      sender_role text not null,
      body text not null
    );
    create table public.order_message_reads(
      order_id uuid not null references public.orders,
      user_id uuid not null references public.profiles,
      last_read_at timestamptz not null,
      primary key(order_id, user_id)
    );
    create table public.order_operational_states(
      order_id uuid primary key references public.orders,
      state text not null,
      state_note text,
      delivered_at timestamptz,
      auto_complete_at timestamptz,
      updated_by uuid
    );
    create table public.order_operational_history(
      id bigint generated always as identity primary key,
      order_id uuid not null references public.orders,
      from_state text,
      to_state text not null,
      note text,
      changed_by uuid
    );
    create table public.order_integrity_records(order_id uuid primary key references public.orders);
    create table public.order_evidence_links(
      order_id uuid references public.orders,
      evidence_type text,
      primary key(order_id, evidence_type)
    );
    grant select on public.profiles to authenticated;

    create function public.is_admin_user() returns boolean
    language sql stable security definer set search_path = public, pg_temp as $$
      select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
    $$;
    create function public.is_order_customer(p_order_id uuid) returns boolean
    language sql stable security definer set search_path = public, pg_temp as $$
      select exists(select 1 from public.orders where id=p_order_id and user_id=auth.uid());
    $$;
    create function public.is_assigned_booster(p_order_id uuid) returns boolean
    language sql stable security definer set search_path = public, pg_temp as $$
      select exists(select 1 from public.order_booster_assignments
        where order_id=p_order_id and booster_id=auth.uid() and is_active);
    $$;
    create function public.can_access_order(p_order_id uuid) returns boolean
    language sql stable security definer set search_path = public, pg_temp as $$
      select public.is_order_customer(p_order_id)
        or public.is_admin_user()
        or public.is_assigned_booster(p_order_id);
    $$;
    grant execute on function public.is_admin_user() to authenticated;
    grant execute on function public.is_order_customer(uuid) to authenticated;
    grant execute on function public.is_assigned_booster(uuid) to authenticated;
    grant execute on function public.can_access_order(uuid) to authenticated;

    alter table public.order_messages enable row level security;
    grant select, insert on public.order_messages to authenticated;
    create policy order_messages_participant_read on public.order_messages
      for select to authenticated using (public.can_access_order(order_id));
    create policy order_messages_participant_insert on public.order_messages
      for insert to authenticated with check (public.can_access_order(order_id));

    alter table public.order_message_reads enable row level security;
    grant select, insert, update on public.order_message_reads to authenticated;
    create policy order_message_reads_self on public.order_message_reads
      for all to authenticated
      using (user_id=auth.uid() and public.can_access_order(order_id))
      with check (user_id=auth.uid() and public.can_access_order(order_id));

    insert into public.profiles(id, role) values
      ('${ids.adminA}', 'admin'), ('${ids.adminB}', 'admin'),
      ('${ids.booster}', 'booster'), ('${ids.outsiderBooster}', 'booster'),
      ('${ids.customer}', 'customer'), ('${ids.outsiderCustomer}', 'customer');
    insert into public.orders values
      ('${ids.adminOrder}', '${ids.customer}', 'in_progress'),
      ('${ids.boosterOrder}', '${ids.customer}', 'in_progress');
    insert into public.order_booster_assignments values
      ('${ids.adminOrder}', '${ids.adminB}', true),
      ('${ids.boosterOrder}', '${ids.booster}', true);
    insert into public.order_messages(order_id, sender_id, sender_role, body) values
      ('${ids.adminOrder}', '${ids.customer}', 'customer', 'Admin order message'),
      ('${ids.boosterOrder}', '${ids.customer}', 'customer', 'Booster order message');
    insert into public.order_message_reads values
      ('${ids.adminOrder}', '${ids.customer}', '2026-10-10T10:00:00Z'),
      ('${ids.adminOrder}', '${ids.adminB}', '2026-10-10T11:00:00Z');
    insert into public.order_operational_states(order_id, state) values
      ('${ids.adminOrder}', 'in_progress'),
      ('${ids.boosterOrder}', 'in_progress');
  `);
  await db.exec(migration);
  return db;
}

async function asActor(db, actor, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [actor ?? ""]);
  await db.exec(`set role ${role}`);
}

test("supervising admin reads both assignments but cannot message or operate them", async () => {
  const db = await database();
  try {
    await asActor(db, ids.adminA);
    const messages = await db.query(
      "select order_id, body from public.order_messages order by order_id",
    );
    assert.deepEqual(messages.rows, [
      { order_id: ids.adminOrder, body: "Admin order message" },
      { order_id: ids.boosterOrder, body: "Booster order message" },
    ]);
    await assert.rejects(
      db.query(
        "insert into public.order_messages(order_id,sender_id,sender_role,body) values($1,$2,'admin','blocked')",
        [ids.adminOrder, ids.adminA],
      ),
      /row-level security policy/,
    );
    await assert.rejects(
      db.query("select public.transition_order_operational_state($1,'waiting_customer',null)", [ids.adminOrder]),
      /Only assigned staff/,
    );

    await db.query(
      "insert into public.order_message_reads(order_id,user_id,last_read_at) values($1,$2,'2026-10-10T12:00:00Z')",
      [ids.adminOrder, ids.adminA],
    );
    await db.exec("reset role");
    const reads = await db.query(
      "select user_id,last_read_at from public.order_message_reads where order_id=$1 order by user_id",
      [ids.adminOrder],
    );
    assert.deepEqual(
      reads.rows.map((row) => [row.user_id, new Date(row.last_read_at).toISOString()]),
      [
        [ids.adminA, "2026-10-10T12:00:00.000Z"],
        [ids.adminB, "2026-10-10T11:00:00.000Z"],
        [ids.customer, "2026-10-10T10:00:00.000Z"],
      ],
    );
    assert.equal(
      (await db.query("select booster_id from public.order_booster_assignments where order_id=$1", [ids.adminOrder])).rows[0].booster_id,
      ids.adminB,
    );
  } finally {
    await db.close();
  }
});

test("assigned admin and booster retain operations while unrelated users stay denied", async () => {
  const db = await database();
  try {
    await asActor(db, ids.adminB);
    await db.query(
      "insert into public.order_messages(order_id,sender_id,sender_role,body) values($1,$2,'admin','assigned admin')",
      [ids.adminOrder, ids.adminB],
    );
    assert.equal(
      (await db.query("select public.transition_order_operational_state($1,'waiting_customer',null) as state", [ids.adminOrder])).rows[0].state,
      "waiting_customer",
    );

    await asActor(db, ids.booster);
    await db.query(
      "insert into public.order_messages(order_id,sender_id,sender_role,body) values($1,$2,'booster','assigned booster')",
      [ids.boosterOrder, ids.booster],
    );
    assert.equal(
      (await db.query("select public.transition_order_operational_state($1,'waiting_customer',null) as state", [ids.boosterOrder])).rows[0].state,
      "waiting_customer",
    );

    for (const actor of [ids.outsiderBooster, ids.outsiderCustomer]) {
      await asActor(db, actor);
      assert.equal(
        (await db.query("select count(*)::int as count from public.order_messages")).rows[0].count,
        0,
      );
      await assert.rejects(
        db.query("select public.transition_order_operational_state($1,'in_progress',null)", [ids.adminOrder]),
        /Only assigned staff/,
      );
    }
  } finally {
    await db.close();
  }
});

test("workspace routing distinguishes operator and supervisor without mutating assignment", async () => {
  const source = readFileSync(
    path.join(root, "src/features/admin/server/admin-orders.ts"),
    "utf8",
  ).replace(
    /import \{ createSecretServerClient \} from "@\/lib\/supabase\/server";\n/,
    "",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { getAdminWorkspaceMode } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
  const assignedToAdminB = {
    status: "in_progress",
    assignment: { kind: "admin", assigneeId: ids.adminB },
  };
  const assignedToBooster = {
    status: "in_progress",
    assignment: { kind: "booster", assigneeId: ids.booster },
  };
  const before = JSON.stringify([assignedToAdminB, assignedToBooster]);
  assert.equal(getAdminWorkspaceMode(assignedToAdminB, ids.adminA), "supervisor");
  assert.equal(getAdminWorkspaceMode(assignedToAdminB, ids.adminB), "operator");
  assert.equal(getAdminWorkspaceMode(assignedToBooster, ids.adminA), "supervisor");
  assert.equal(
    getAdminWorkspaceMode({ ...assignedToBooster, status: "completed" }, ids.adminA),
    null,
  );
  assert.equal(
    getAdminWorkspaceMode({ status: "in_progress", assignment: null }, ids.adminA),
    null,
  );
  assert.equal(JSON.stringify([assignedToAdminB, assignedToBooster]), before);
});

test("application wiring exposes read-only supervision and protects sensitive actions", () => {
  const adminList = readFileSync(path.join(root, "src/app/admin/page.tsx"), "utf8");
  const detail = readFileSync(path.join(root, "src/app/admin/orders/[id]/page.tsx"), "utf8");
  const workspace = readFileSync(path.join(root, "src/app/admin/orders/[id]/workspace/page.tsx"), "utf8");
  const operations = readFileSync(path.join(root, "src/features/orders/server/order-operations-repository.ts"), "utf8");
  const chat = readFileSync(path.join(root, "src/features/orders/server/order-chat-service.ts"), "utf8");
  const repository = readFileSync(path.join(root, "src/features/orders/server/order-workspace-repository.ts"), "utf8");

  assert.match(adminList, /status\.value === "in_progress"|value: "in_progress"/);
  assert.match(adminList, /Assigned to \{order\.assignment\.displayName\}/);
  assert.match(adminList, /"Supervise"/);
  assert.match(detail, /read-only supervision mode/);
  assert.match(workspace, /getAdminWorkspaceMode/);
  assert.match(workspace, /supervisionMode=\{workspaceMode === "supervisor"\}/);
  assert.match(operations, /canManage: isAssignedStaff/);
  assert.match(operations, /Only assigned staff can update the order lifecycle/);
  assert.match(chat, /Supervision access is read-only/);
  assert.match(repository, /Supervision access is read-only/);
  assert.match(repository, /Supervision access does not include secure account details/);
  assert.doesNotMatch(
    workspace,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|adminA|adminB|00000000/i,
  );
});
