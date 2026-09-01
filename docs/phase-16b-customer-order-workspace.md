# Phase 16B — Customer Order Workspace

## Scope

Transforms the real customer order detail route:

`/dashboard/orders/[id]`

into a dedicated BoostingPedia customer order workspace.

## Decisions applied

- single vertical workspace
- no real credentials form yet
- no live chat yet
- booster assignment area is visually prepared without inventing booster identity
- existing Stripe payment flow preserved
- existing order configuration, totals and status history preserved
- no percentage progress is invented

## Real data used

The workspace uses only data already exposed by the customer order model:

- order number
- order status
- payment status
- order total
- created date
- game/service
- configurator selection
- price breakdown
- real order status history

## Sections

1. Order header
2. Service progression
3. Real configuration metadata
4. Customer Action Center
5. Recorded status timeline
6. Full configuration + price breakdown
7. Access & evidence foundation
8. Booster assignment foundation
9. Order conversation empty state
10. Payment area
11. Notifications shortcut

## Security constraints

The workspace never displays:
- game account email
- game account password
- identity document
- verification ID
- stored credentials
- fake booster data
- fake chat data
- fake order percentage

Credentials, verification and evidence are represented only as future secure modules.

## Preserved behavior

- `/api/checkout`
- order lookup
- order history lookup
- existing status/payment logic
- dashboard shell from Phase 16A
