# VantaBoost

Temporary working project for a premium gaming services marketplace.

## Status

Phase 1 is implemented: architecture, temporary branding, initial design system, typed mock catalog boundaries, and product documentation.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui-compatible component ownership model
- Supabase (planned)
- Stripe (planned)
- Vercel (planned)

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Documentation

- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/design-system.md`
- `docs/mvp.md`
- `docs/technical-decisions.md`

## Product language

All product UI, code identifiers, comments, metadata, mock content, notifications, and product documentation are written in English.


## Current routes

- `/` — marketing homepage
- `/games` — searchable game catalog
- `/games/[game]` — individual game landing pages

Service configurator routes are planned for Phase 5.

## Phase 6 — Supabase foundation

The storefront now has a Supabase-ready repository layer for catalog, configurator fields, and server-only pricing rules. When Supabase environment variables are absent or unavailable, the application falls back to the Phase 5 mock data. See `docs/phase-6-supabase.md`, `supabase/schema.sql`, `supabase/seed.sql`, and `.env.example`.

## Phase 7

Authentication is implemented with Supabase Auth and SSR cookies. See `docs/phase-7-auth.md`.

## Phase 8 — Orders

Phase 8 adds server-validated order creation, customer order history, order detail pages, status history, and RLS-protected order tables. Stripe payment handling remains a later phase.

## Phase 9 — Stripe Checkout

One-time Stripe-hosted Checkout, webhook-verified payment state, and payment persistence are implemented. See `docs/phase-9-stripe-checkout.md`.


## Phase 11
Customer in-app notifications, unread counters, order status guidance, and dashboard polish. Discord delivery remains a later external integration built on the same order event stream.
