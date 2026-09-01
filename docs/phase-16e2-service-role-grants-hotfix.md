# Phase 16E.2 — Service Role Grants Hotfix

## Symptoms confirmed in Vercel production

`/booster`:

- `Available assignment load failed`
- PostgreSQL code `42501`
- `permission denied for table order_booster_assignments`

Customer order detail:

- `Unable to load booster assignment`

Earlier order workspace requests also showed:

- `Unable to load order messages`

## Cause

BoostingPedia's server-side order workspace deliberately uses the Supabase
secret/service client after application-level authorization.

`service_role` bypasses RLS, but PostgreSQL still requires table privileges.

The new Phase 16D / 16E tables did not have explicit service_role grants in the
migration, so server-side reads/inserts failed with `42501`.

## Fix

Explicit service_role privileges are granted to:

- order_booster_assignments
- order_messages
- order_message_reads
- order_moderation_flags
- order_credentials
- booster_profiles

Authenticated users still receive NO direct table privilege on
`order_credentials`.

No order, payout, credential, message, assignment or customer data is modified.
