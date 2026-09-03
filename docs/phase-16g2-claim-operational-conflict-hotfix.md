# Phase 16G.2 — Claim Operational Conflict Hotfix

Production symptom: POST /api/booster/orders/[id]/claim returned 409.

The tested order is paid and unassigned, so it is valid for claiming.

Root cause:
Phase 16G used `ON CONFLICT (order_id)` for `order_operational_states`
inside a function that also returns a column named `order_id`.

Fix:
`ON CONFLICT ON CONSTRAINT order_operational_states_pkey`

No payout, price, lifecycle, or authorization logic changes.
