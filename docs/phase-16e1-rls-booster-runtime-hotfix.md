# Phase 16E.1 — RLS + Booster Runtime Hotfix

## Production symptoms

- `/dashboard` returned a server error with `Unable to load orders.`
- `/booster` returned `Unable to load available orders.`

## Root cause

Phase 16E added an `orders` RLS policy that queried
`order_booster_assignments`.

The assignment policy queried `orders` again to determine customer ownership.

This introduced a recursive policy graph:

`orders -> order_booster_assignments -> orders`

PostgreSQL rejects this during authenticated order reads.

Two additional booster policies used an ambiguous identifier that PostgreSQL
resolved as:

`a.order_id = a.order_id`

instead of comparing the assignment's order ID to the outer row's order ID.

That policy has been removed and replaced by security-definer helper functions
with explicit order IDs.

## Fix

Adds:

- `is_admin_user()`
- `is_order_customer(order_id)`
- `is_assigned_booster(order_id)`

All are small stable security-definer predicates.

The RLS policies now call these predicates and no longer recursively query
tables through each other's RLS policies.

## Booster repository

The booster repository no longer relies on one nested PostgREST relation query.
Orders and order items are loaded separately and joined server-side.

Errors are logged with the underlying Supabase error so future production
diagnostics are actionable.
