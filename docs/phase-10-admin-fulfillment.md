# Phase 10 — Admin Orders + Fulfillment

## Scope

Phase 10 turns the protected `/admin` route into the operational fulfillment console.

### Admin capabilities

- View all customer orders.
- Filter by order status.
- Review service configuration, customer profile data, stored order total, and Stripe payment state.
- Open a dedicated admin order detail page.
- Move orders through controlled fulfillment transitions.
- Add an optional internal note to each manual status change.
- Review the complete status timeline.

## Security model

- `/admin` and `/admin/orders/[id]` require `profiles.role = 'admin'`.
- Reads happen server-side after the admin guard.
- Status writes use the authenticated Supabase client and the `admin_update_order_status` RPC.
- The RPC is `SECURITY DEFINER` but validates `auth.uid()` against `profiles.role = 'admin'` before updating data.
- The database validates allowed transitions.
- `refunded` remains payment-controlled and cannot be selected manually in the fulfillment UI.
- The order status trigger records `changed_by` and an optional note.

## Allowed manual transitions

- `pending_payment → cancelled`
- `paid → queued`
- `paid → cancelled`
- `queued → in_progress`
- `queued → cancelled`
- `in_progress → completed`
- `in_progress → cancelled`

## Routes

- `/admin`
- `/admin/orders/[id]`
