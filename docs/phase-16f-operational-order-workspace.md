# Phase 16F — Operational Order Workspace

## What this phase fixes

### Accept Order

The Phase 16E PostgreSQL function used:

`ON CONFLICT (order_id)`

inside a function that also returned a column named `order_id`.

PostgreSQL treated that reference as ambiguous.

Phase 16F replaces it with:

`ON CONFLICT ON CONSTRAINT order_booster_assignments_pkey`

The marketplace claim remains atomic.

## User Integrity Validation

This is NOT document/KYC verification.

It stores the customer's gaming/platform identity used for the order:

- Platform
- Player ID / Account ID
- optional internal staff note

Example:

`Epic Games — Veneno#1234`

Each order receives its own identity snapshot.

Previous identity snapshots for the same BoostingPedia customer are surfaced to
assigned staff on future orders under `Previously seen IDs`.

This provides operational history without automatically labeling a customer as
good/bad or making automated risk decisions.

Internal notes are not returned to customer viewers.

## Start Order Screenshot

Boosters/admins paste an external HTTPS image URL.

Example:

`https://i.imgur.com/...`

BoostingPedia does NOT receive or store the image file.

Only the URL and submission metadata are stored.

## Deliver Order Screenshot

Same model as Start Screenshot.

The final evidence URL is required before order completion.

## Completion gate

`Complete Order` requires:

1. User Integrity Validation
2. Start Order Screenshot URL
3. Deliver Order Screenshot URL

The requirements are enforced both in the UI and in PostgreSQL through
`complete_booster_order()`.

The order must also be:

- payment_status = paid
- status = in_progress

## Permissions

Customer:
- can see the identity recorded for their current order
- can open Start/Deliver Screenshot links
- cannot modify integrity/evidence
- does not receive internal integrity notes

Assigned booster:
- can create/update integrity
- sees previous IDs for that customer
- can create/update screenshot links
- can complete the order once all gates are ready

Admin:
- retains full order access
- can manage the same operational data from an authorized order workspace

## Deferred

- direct image uploads
- automatic image-host validation
- automated customer risk scores
- evidence image proxying/storage
- payout transfer/wallet
