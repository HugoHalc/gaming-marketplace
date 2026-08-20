# Phase 6 — Supabase foundation

## Goal
Replace hard-coded catalog/configurator data progressively with a secure Supabase-backed repository layer while preserving a mock fallback until the project is active and environment variables are configured.

## Tables
- `games`
- `services`
- `service_fields`
- `service_field_options`
- `pricing_rule_sets`
- `pricing_rules`

Orders, profiles, payments, promotions, reviews, and user-owned data remain deferred to later phases.

## Access model
Public catalog/configurator tables have read-only RLS policies for active records. Pricing tables have RLS enabled and no `anon`/`authenticated` grants or policies. Internal pricing rules are read only through a server-only Supabase secret key.

## Runtime strategy
`catalog-repository.ts` and `configurator-repository.ts` read Supabase when public environment variables exist. If Supabase is unavailable, they fall back to the Phase 5 mocks so the storefront remains operable during setup.

## Environment
See `.env.example`. Never expose `SUPABASE_SECRET_KEY` to Client Components or prefix it with `NEXT_PUBLIC_`.

## Activation status
The intended existing project appears to be `Boostingpedia` (`gzwlmbhsceaemleqngrj`), but it was inactive during Phase 6 and the connector blocked automatic restoration. Schema application and generated database types must be completed after the project is active.
