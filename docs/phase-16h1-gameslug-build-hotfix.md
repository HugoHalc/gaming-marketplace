# Phase 16H.1 — gameSlug Build Hotfix

Vercel TypeScript error:

`Property 'gameSlug' does not exist on type 'OrderItemRecord'.`

The dashboard game filter now normalizes the existing `gameName` field instead.
No visual behavior, database logic, pricing, or lifecycle logic is changed.
