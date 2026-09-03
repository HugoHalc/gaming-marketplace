# Phase 16L — Customer + Booster Orders UX Polish

Scope:
- /dashboard/orders
- /booster/orders

Goals:
- preserve Phase 16K navigation architecture
- improve scanability and hierarchy
- use real Rocket League rank badge assets where stored rank values are resolvable
- never display unknown/internal rank IDs as if they were customer-facing rank names
- keep booster payout distinct from customer total
- Available / In Progress / Completed remain filters inside Orders
- reduce visual noise and oversized card treatment

A shared Rocket League rank component now centralizes label + badge rendering.

Important:
Numeric/internal rank values are intentionally not guessed. If the stored order configuration cannot be resolved by the existing Rocket League slug convention, the UI does not invent a human rank name.

No backend, pricing, payout, lifecycle or Supabase changes.
