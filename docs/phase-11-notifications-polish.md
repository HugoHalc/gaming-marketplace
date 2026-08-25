# Phase 11 — Customer notifications and dashboard polish

Phase 11 adds a first-party notification layer without depending on an external messaging provider.

## Customer experience

- `/dashboard` now surfaces active orders, orders awaiting payment, and unread updates.
- `/dashboard/notifications` lists payment and fulfillment notifications.
- A notification bell appears in the authenticated site header.
- Customers can mark one notification or all notifications as read.
- Order detail pages explain the current fulfillment state and link to notifications.

## Notification events

Notifications are generated from the authoritative `order_status_history` stream for:

- order created
- payment confirmed
- queued
- fulfillment started
- completed
- cancelled
- refunded

Each notification has a unique source key so status events cannot create duplicates.

## Security

Customers receive `SELECT` access only to their own notifications through RLS. Read state is changed through authenticated RPC functions that verify `auth.uid()`; clients do not receive arbitrary table write access.

## External delivery hook

The order status event stream is intentionally reusable. A later Discord integration can route a new order or status event to a game-specific Discord channel without changing Checkout, Orders, or fulfillment state logic.
