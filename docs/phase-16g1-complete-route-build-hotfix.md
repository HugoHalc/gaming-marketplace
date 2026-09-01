# Phase 16G.1 — Complete Route Build Hotfix

## Build failure

Vercel reported:

`Export completeOperationalOrder doesn't exist in target module`

Phase 16G intentionally removed the direct completion function from the order
operations repository, but the Phase 16F API route remained in the repository.

## Fix

The legacy endpoint:

`POST /api/orders/[id]/complete`

now returns HTTP 410 Gone.

It no longer imports or invokes `completeOperationalOrder`.

The only supported completion path is now:

- booster marks Delivered
- customer confirms delivery
- OR 48-hour review window expires
- OR a reported issue blocks automatic completion
