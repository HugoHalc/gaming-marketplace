# Phase 9 — Stripe Checkout

Phase 9 adds one-time USD payment collection for server-validated orders using Stripe-hosted Checkout.

## Flow

1. Customer creates a server-validated order (`pending_payment`).
2. The protected order detail page posts only the order ID to `/api/checkout`.
3. The server reloads the order through RLS, validates its immutable item totals and pricing snapshot, and creates a Stripe Checkout Session using the stored cents amount.
4. The server persists a `payments` record and redirects to Stripe-hosted Checkout.
5. Stripe redirects the browser back for UX only. Browser redirects never mark an order paid.
6. `/api/stripe/webhook` verifies the raw request body with `STRIPE_WEBHOOK_SECRET` and updates payment/order state.
7. `stripe_webhook_events` records processed event IDs for idempotent retries.

## Server-only environment variables

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Do not prefix either variable with `NEXT_PUBLIC_`.

## Webhook events

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.payment_failed`
- `charge.refunded`

## Security

- Client never sends an amount to Stripe.
- Checkout reads the authenticated user's existing order.
- Mock pricing snapshots cannot be paid.
- Stripe webhook signatures are verified using the raw body.
- Stripe metadata carries order ID/order number for reconciliation.
- Payment and webhook tables are server-writable only; customers get RLS-scoped SELECT on their own payment records.
