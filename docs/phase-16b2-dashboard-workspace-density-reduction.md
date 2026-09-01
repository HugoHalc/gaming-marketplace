# Phase 16B2 — Customer Dashboard + Order Workspace Density Reduction

Visual-only refinement of:
- `/dashboard`
- `/dashboard/orders/[id]`

## Objective

Reduce the current "cards inside cards" appearance and move the customer account toward:

- dark operational canvas
- one dominant active-order surface
- structured lists instead of nested cards
- typography + alignment + dividers before backgrounds
- a real order workspace rather than a collection of dashboard modules

## Dashboard changes

- removes three independent metric cards
- replaces them with one compact account summary row
- simplifies Active Order to one main surface
- makes resolvable Rocket League ranks more prominent
- uses a compact horizontal timeline based only on real recorded history
- simplifies Active Order footer
- converts Recent Orders into a lighter structured list
- reduces empty Recent Messages height
- removes unnecessary surfaces around secondary information

## Order Workspace changes

- desktop main / sidebar ratio approximately 69 / 31
- compact editorial order header
- Current → Target presented without mini-cards when real rank strings are resolvable
- order progress moved onto canvas with dividers instead of an external card
- configuration becomes information rows
- price breakdown becomes simple rows
- Booster / Conversation / Payment / Secure Account Access consolidated into one sidebar surface
- main column intentionally leaves open space for future Phase 16C full-size chat

## Preserved

- auth
- routes
- order data
- status data
- status history
- Stripe checkout
- payment states
- backend
- APIs
- totals
- configurator selection values

## Safety

The rank renderer only uses a badge/name when the stored value can be resolved against the existing Rocket League rank asset keys.
Numeric/internal identifiers are not converted into invented rank names.
