# Phase 16I — Booster Order Workspace Redesign

## Goal

Redesign only:

`/booster/orders/[id]`

The customer order workspace is not replaced in this phase.

## Layout

Desktop:
- large live chat workspace on the left
- compact operational rail on the right

The chat is intentionally the dominant surface.

## Right rail

Contains:
- payout / order summary
- secure account details
- user integrity validation
- start screenshot
- delivery screenshot
- booster lifecycle controls
- recent order history

Existing Phase 16D–16G components and server authorization remain in use.

## Visual direction

BoostingPedia dark premium identity:
- background `#050807`
- compact surfaces
- minimal borders
- primary green only for important status/actions
- no excessive glow
- reduced card fragmentation

## Rank badges

The header reuses existing Rocket League rank assets from:

`/public/ranks/rocket-league/`

## Scope protection

This phase does not:
- change Rocket League pricing
- change payout calculations
- change lifecycle SQL
- change customer permissions
- change chat moderation
- change credential encryption
