# Phase 16A — Customer Dashboard Foundation

## Real data audit

The implementation was based on the current repository model, not assumed dashboard features.

Available and used:
- authenticated identity / profile / avatar
- customer orders
- real order total and configuration
- current order status
- order status history
- unread notification count
- notification list
- existing profile editor
- existing logout endpoint

Current backend limitations intentionally respected:
- no customer-visible assigned booster field exists in `OrderRecord`
- no live chat / messages repository exists
- no support route or live support implementation exists
- no percentage-based order progress exists
- no secure account credentials workflow exists yet
- no customer verification workflow exists yet

Therefore Phase 16A does not invent:
- booster names or online states
- messages
- support availability
- progress percentages
- verification tasks
- credentials
- fake activity

## Dashboard architecture

New shared authenticated shell:
`src/components/dashboard/dashboard-shell.tsx`

New dashboard layout:
`src/app/dashboard/layout.tsx`

The public marketplace header is removed from dashboard pages and replaced by:
- desktop customer sidebar
- compact dashboard topbar
- mobile navigation drawer
- real session avatar
- real notification count
- existing logout action

## Overview

Uses real order data for:
- active order count
- completed order count
- active order
- recent orders
- totals
- configuration
- status history
- notifications

Unread Messages remains `0` because live chat does not exist yet.

The Messages navigation item is visually reserved but disabled and has no fictitious route.

Support remains omitted until the real live chat/support system exists.

## Future compatibility

The foundation is prepared for:
- Phase 16B — Customer Order Workspace
- Phase 16C — Live Order Chat
- future Booster/Admin dashboard visual reuse
