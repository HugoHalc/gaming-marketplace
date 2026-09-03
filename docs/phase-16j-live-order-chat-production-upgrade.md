# Phase 16J — Live Order Chat Production Upgrade

This upgrades the existing order-bound chat rather than creating a second chat system.

Implemented:
- Supabase Realtime publication for `order_messages`
- authorized customer / assigned booster / admin access remains server-side
- chat disabled until an active booster is assigned
- real booster avatar/name in conversation header
- no fake online/presence state
- message grouping
- date separators
- desktop Enter to send / Shift+Enter newline
- mobile Enter remains newline-friendly
- failure state with Retry and draft preservation
- non-aggressive 30s fallback only when Realtime subscription fails
- smart autoscroll
- "new messages" indicator when reading older messages
- earlier-message pagination
- system-event schema + visual support
- Trust & Safety metadata foundation
- expanded server-side poaching/contact signal detection
- no automatic punishment/blocking
- account-password safety microcopy
- no fake attachment button

The migration has already been applied to the production Supabase project during preparation of this phase.
