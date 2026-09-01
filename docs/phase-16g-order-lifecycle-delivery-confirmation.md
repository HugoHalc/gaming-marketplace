# Phase 16G — Order Lifecycle + Delivery Confirmation

## Operational lifecycle

The financial/order status remains separate from the operational lifecycle.

Operational states:

- Accepted
- In Progress
- Waiting for Customer
- Issue
- Delivered
- Completed

This avoids overloading Stripe/payment/order status with booster workflow details.

## Booster flow

After accepting an order:

1. Accepted
2. Start Work → In Progress
3. Booster may mark Waiting for Customer
4. Booster may report an Issue with a required note
5. Booster records:
   - User Integrity Validation
   - Start Screenshot URL
   - Deliver Screenshot URL
6. Booster clicks Deliver Order
7. Operational state becomes Delivered
8. A 48-hour customer review window begins

## Customer delivery review

Delivered orders show:

- Confirm Delivery
- Report a Problem

Confirm Delivery:
- immediately completes the order

Report a Problem:
- note is required
- operational state becomes Issue
- automatic completion is cancelled

## 48-hour automatic completion

When Delivered is recorded:

`auto_complete_at = delivered_at + 48 hours`

Supabase `pg_cron` runs every 15 minutes and completes expired Delivered orders
that remain paid/in-progress and have no customer issue.

This means completion can occur up to roughly 15 minutes after the exact 48-hour
deadline.

## Security

The former Phase 16F direct `complete_booster_order()` RPC is no longer
executable by authenticated users.

A booster cannot bypass the Delivered/customer-review stage.

## Admin

Admins are accepted by the same operational authorization layer.

An admin can resolve an Issue and move it back to In Progress from the
operational workspace.

A richer dedicated Admin Operations UI can be added in a later phase without
changing this lifecycle model.
