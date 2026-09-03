# Phase 16O — Paid Orders Visibility Rules

Booster-facing order visibility now consistently requires:

`payment_status = paid`

Applied to:
- Available Orders
- Active Orders
- Completed Orders
- direct assigned booster order access

Available orders still additionally require:
- core status paid or queued
- no active booster assignment

Claim RPC remains authoritative and already validates paid payment status.

Customer order visibility is intentionally unchanged so customers can still see and complete orders with pending payment.

No pricing, payout, lifecycle or database changes.
