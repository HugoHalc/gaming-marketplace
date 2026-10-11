import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const source = readFileSync(
  path.join(root, "src/features/admin/server/admin-orders.ts"),
  "utf8",
).replace(
  /import \{ createSecretServerClient \} from "@\/lib\/supabase\/server";\n/,
  "",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { mapOrder } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

function assignment(overrides = {}) {
  return {
    booster_id: "admin-1",
    assigned_by: "admin-2",
    assigned_at: "2026-10-10T20:00:00.000Z",
    is_active: true,
    assignment_kind: "admin",
    profiles: {
      full_name: "Operations Admin",
      gamer_tag: "OpsAdmin",
      phone: null,
    },
    ...overrides,
  };
}

function order(overrides = {}) {
  return {
    id: "order-1",
    user_id: "customer-1",
    order_number: "VB-0DF338EE55",
    status: "paid",
    payment_status: "paid",
    currency: "USD",
    subtotal_cents: 1500,
    discount_cents: 0,
    total_cents: 1500,
    customer_note: null,
    created_at: "2026-10-10T19:00:00.000Z",
    updated_at: "2026-10-10T20:00:00.000Z",
    order_items: [],
    payments: [
      {
        id: "payment-1",
        provider: "stripe",
        status: "paid",
        amount_cents: 1500,
        currency: "USD",
        stripe_checkout_session_id: "cs_live_fixture",
        stripe_payment_intent_id: "pi_live_fixture",
        paypal_order_id: null,
        paypal_capture_id: null,
        paid_at: "2026-10-10T19:01:00.000Z",
        created_at: "2026-10-10T19:00:00.000Z",
      },
    ],
    profiles: {
      full_name: "Customer",
      gamer_tag: "CustomerTag",
      phone: null,
    },
    order_booster_assignments: null,
    ...overrides,
  };
}

test("maps an object relationship without losing an admin assignment", () => {
  const mapped = mapOrder(order({ order_booster_assignments: assignment() }));

  assert.deepEqual(mapped.assignment, {
    assigneeId: "admin-1",
    assignedById: "admin-2",
    assignedAt: "2026-10-10T20:00:00.000Z",
    kind: "admin",
    displayName: "OpsAdmin",
  });
  assert.equal(mapped.isAvailable, false);
  assert.equal(mapped.payments[0].provider, "stripe");
});

test("keeps list relationships and selects the active booster assignment", () => {
  const mapped = mapOrder(
    order({
      order_number: "VB-CFE98B4F8B",
      payments: [
        {
          ...order().payments[0],
          id: "payment-2",
          provider: "paypal",
          stripe_checkout_session_id: null,
          stripe_payment_intent_id: null,
          paypal_order_id: "PAYPAL-ORDER-FIXTURE",
          paypal_capture_id: "PAYPAL-CAPTURE-FIXTURE",
        },
      ],
      order_booster_assignments: [
        assignment({ is_active: false }),
        assignment({
          booster_id: "booster-1",
          assigned_by: "admin-1",
          assignment_kind: "booster",
          profiles: [{ full_name: "Booster Name", gamer_tag: null, phone: null }],
        }),
      ],
    }),
  );

  assert.equal(mapped.orderNumber, "VB-CFE98B4F8B");
  assert.equal(mapped.assignment.assigneeId, "booster-1");
  assert.equal(mapped.assignment.assignedById, "admin-1");
  assert.equal(mapped.assignment.kind, "booster");
  assert.equal(mapped.assignment.displayName, "Booster Name");
  assert.equal(mapped.isAvailable, false);
  assert.equal(mapped.payments[0].provider, "paypal");
});

test("maps null and inactive relationships without treating them as active", () => {
  const withoutAssignment = mapOrder(order());
  assert.equal(withoutAssignment.assignment, null);
  assert.equal(withoutAssignment.isAvailable, true);

  const inactiveAssignment = mapOrder(
    order({ order_booster_assignments: assignment({ is_active: false }) }),
  );
  assert.equal(inactiveAssignment.assignment, null);
  assert.equal(inactiveAssignment.isAvailable, true);
});

test("an assigned paid order is never exposed by the available filter contract", () => {
  for (const relationship of [assignment(), [assignment()]]) {
    const mapped = mapOrder(order({ order_booster_assignments: relationship }));
    assert.equal(mapped.paymentStatus, "paid");
    assert.notEqual(mapped.assignment, null);
    assert.equal(mapped.isAvailable, false);
  }
});
