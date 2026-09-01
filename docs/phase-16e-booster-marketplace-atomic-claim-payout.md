# Phase 16E — Booster Marketplace + Atomic Order Claim + Payout Foundation

## Commercial rule

The booster payout is calculated from the FINAL customer order total:

`payout_cents = floor(order.total_cents × payout_rate_bps / 10000)`

Default booster rate:

`5000 bps = 50%`

Example:

- original configuration: $100
- final customer total after discount: $90
- booster rate: 50%
- booster payout snapshot: $45

The payout is saved into `order_booster_assignments` when the booster accepts the order.

Changing the booster's payout percentage later does NOT rewrite historical assignment payouts.

## Admin vs booster visibility

Admin:
- existing admin order dashboard continues to show the full customer order total (100%)

Booster:
- Available Orders shows only `Your payout`
- Active Orders shows only the locked payout snapshot
- Completed Orders shows only the locked payout snapshot
- booster order workspace replaces the customer total with `Your payout`
- gross customer Price Breakdown is hidden in booster mode

## Booster capability is independent from admin role

`booster_profiles` determines whether a user can enter the booster marketplace.

This allows an account to be:

- `profiles.role = admin`
- AND have an active `booster_profiles` row

So the current owners/partners can retain admin permissions while also accepting boosts.

## Order lifecycle

1. Customer pays.
2. Order reaches `payment_status = paid` and status `paid` or `queued`.
3. It appears in `/booster`.
4. Eligible booster sees their payout before accepting.
5. Booster clicks `Accept Order`.
6. `claim_order_for_booster()` locks the order row.
7. The first valid claim creates/updates the assignment.
8. Payout percentage and payout cents are snapshotted.
9. Order status moves to `in_progress`.
10. Other boosters can no longer claim it.
11. It appears under `My Active Orders`.
12. Booster opens `/booster/orders/[id]` for chat and account access.

## Concurrency

The SQL function uses `SELECT ... FOR UPDATE`.

Two simultaneous Accept clicks cannot both successfully claim the same order.

## Setup for the first boosters

After applying the migration, create a `booster_profiles` row for each admin/partner who should accept orders.

Do NOT change their `profiles.role` from `admin`.

Example SQL:

```sql
insert into public.booster_profiles (user_id, is_active, payout_rate_bps)
values ('YOUR_PROFILE_UUID', true, 5000)
on conflict (user_id)
do update set is_active = true, payout_rate_bps = 5000;
```

Use the real profile UUID from `public.profiles`.

## Deferred

- automatic payout transfers
- booster wallet/balance
- payout withdrawal
- evidence uploads
- integrity validation
- booster performance/rating system
