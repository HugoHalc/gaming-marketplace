# Phase 16C — Customer Order Workspace Rebuild

Visual-only rebuild for:

`/dashboard/orders/[id]`

## Direction

The order detail is now treated as an operational workspace instead of a collection of independent cards.

Desktop hierarchy:

- Main workspace: ~68%
- Operational sidebar: ~32%

## Main workspace

- compact order header
- real status
- real total
- real Current → Target when rank values can be resolved
- compact real-event progress strip
- large conversation workspace reserved for future live chat
- configuration rows
- price breakdown rows

The chat area is intentionally large so Phase 16D can connect a real order chat without forcing it into a small dashboard card.

## Right operational sidebar

One unified surface containing:

- Order Details
- Booster
- Account Details
- User Integrity Validation
- Order Start Screenshot
- Order Final Screenshot

Internal sections use dividers instead of independent outer cards.

## Important security behavior

Phase 16C does NOT store or transmit credentials.

The Account Details email/password fields are disabled visual placeholders only.

Phase 16C does NOT:
- create credential storage
- create verification records
- upload screenshots
- create booster assignment data
- create messages
- create chat endpoints

No game-account credentials are read from or written to the backend.

## Preserved behavior

- current route
- current customer order lookup
- current order history
- Stripe checkout action
- payment states
- order statuses
- totals
- order configuration
- authentication
- backend
