# Phase 16K — Unified Dashboard & Orders Navigation

Goal: simplify operational navigation so a new user only needs to understand:

- Dashboard
- Orders

Customer:
- /dashboard = account overview
- /dashboard/orders = customer orders

Booster:
- /booster = booster overview
- /booster/orders = available / in-progress / completed orders

Important:
- Existing customer/booster authorization remains intact.
- Admin remains a secondary access path, not part of normal operational navigation.
- Account Settings remains secondary.
- No pricing, payout, order lifecycle or database changes.
- Available / In Progress / Completed are filters inside Orders, not separate menu destinations.
