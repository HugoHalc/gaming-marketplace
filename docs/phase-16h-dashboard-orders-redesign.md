# Phase 16H — Dashboard Orders Redesign

## Goal

Turn `/dashboard` into a useful order hub inspired by the supplied marketplace
reference while retaining BoostingPedia's own identity.

## Dashboard

The previous generic account overview is replaced by an order-focused workspace.

Desktop structure:

- compact game filter sidebar
- status tabs
- order search
- grid/list toggle
- dense order cards
- responsive 3 / 2 / 1 column behavior

## Rocket League rank badges

The dashboard reuses the exact existing rank assets already used by the Rocket
League service/configurator:

`/public/ranks/rocket-league/`

No duplicate rank artwork is introduced.

Current and Desired ranks render with their corresponding badge where the order
configuration contains a resolvable rank.

## Operational lifecycle

Phase 16G operational state is read server-side and shown in the dashboard.

This allows a main order whose database status is still `in_progress` to show
`Delivered`, `Waiting Customer`, or `Issue` correctly.

## Navigation

The customer dashboard navigation is capability-aware.

Active booster profile:
- Booster Workspace → `/booster`

Admin profile:
- Admin → `/admin`

An admin account that also has an active booster profile sees both destinations.

This intentionally does not infer booster access from `profiles.role`.

## Scope

Phase 16H does NOT redesign the interior of:

`/booster/orders/[id]`

That is reserved for the next visual phase.
