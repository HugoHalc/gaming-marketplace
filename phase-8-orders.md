# Phase 8 — Orders

Phase 8 introduces the production order domain without reusing the legacy `pedidos` table.

## Database

- `orders`: customer ownership, status/payment state, immutable money snapshot.
- `order_items`: game/service/configuration/price snapshot for each purchased service.
- `order_status_history`: append-only order lifecycle timeline.
- Customer RLS permits read access only to owned orders.
- Authenticated browser clients have no direct INSERT/UPDATE/DELETE grants on order tables.
- Admin profiles may read all order records; mutation remains server-controlled.

## Creation flow

1. Customer configures a service.
2. Browser requests a quote preview.
3. `POST /api/orders` verifies the authenticated identity.
4. The server reloads game/service/configuration and recalculates the quote.
5. Order creation requires database-backed pricing (mock pricing is rejected).
6. A server-only Supabase secret client stores the order and item snapshots.
7. Customer is redirected to `/dashboard/orders/[id]`.

## Routes

- `/dashboard/orders`
- `/dashboard/orders/[id]`
- `POST /api/orders`

## Required production environment

`SUPABASE_SECRET_KEY` must be configured in Vercel as a server-only environment variable. It must never use a `NEXT_PUBLIC_` prefix.

## Deferred to later phases

- Stripe payment intent/session creation.
- Payment webhooks and payment status transitions.
- Admin order mutation UI and staff fulfillment assignment.
- Customer/staff messaging and operational notes.
