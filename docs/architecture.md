# Product Architecture

## Architectural goals

The platform is designed as a modular monolith first. The goal is to keep deployment, data consistency, and development simple while preserving clean boundaries between product areas.

### Core principles

- Use Next.js App Router with Server Components by default.
- Keep client components limited to interactive UI that genuinely needs browser state.
- Keep domain logic outside page components.
- Treat pricing as server-authoritative.
- Keep catalog configuration data-driven so games and services can be added without shipping new frontend logic.
- Introduce Supabase only when the catalog and service configuration UX are sufficiently stable.
- Prefer a single application and PostgreSQL database before considering separate services.

## Recommended route architecture

```text
src/app/
├── (marketing)/
│   ├── page.tsx
│   ├── games/
│   │   ├── page.tsx
│   │   └── [game]/
│   │       ├── page.tsx
│   │       └── [service]/page.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── checkout/page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── profile/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── orders/page.tsx
│   ├── games/page.tsx
│   ├── services/page.tsx
│   └── users/page.tsx
└── api/
    └── webhooks/
        └── stripe/route.ts
```

Route groups should be introduced when the marketing shell and authenticated application shell diverge. They are intentionally not created in Phase 1 because empty route structure creates noise without product value.

## Recommended source structure

```text
src/
├── app/                   # Routes, layouts, metadata, loading/error boundaries
├── components/
│   ├── brand/             # Product identity components
│   ├── layout/            # Shared structural UI
│   └── ui/                # shadcn-style primitives
├── config/                # Static application configuration
├── features/
│   ├── auth/
│   ├── catalog/
│   ├── checkout/
│   ├── orders/
│   ├── pricing/
│   ├── profile/
│   └── admin/
├── lib/                   # Framework and infrastructure utilities
├── server/                # Server-only orchestration and data access (introduced with backend)
└── types/                 # Truly cross-domain types only
```

Each feature can grow into `components`, `data`, `types`, `schemas`, `actions`, and `services` only when needed.

## Rendering strategy

- Marketing pages: Server Components, static or cached where possible.
- Catalog pages: Server Components with database-backed queries and route-level caching where appropriate.
- Service configurator: Server-rendered initial state with a focused Client Component for interactive selections and price previews.
- Final pricing: recalculated and validated on the server before creating checkout sessions or orders.
- Dashboard and admin: authenticated Server Components for reads; Server Actions or explicit route handlers for mutations depending on the use case.

## Pricing architecture

Pricing should be modeled as data plus a deterministic evaluation engine.

A service defines configurable fields. Pricing rules inspect the selected values and apply one or more operations to a base amount.

Conceptual flow:

```text
service configuration
  -> normalize selections
  -> validate allowed combinations
  -> load active pricing rule set
  -> evaluate base price
  -> apply modifiers
  -> apply promotion rules
  -> round using currency policy
  -> return quote with rule-set version
```

The browser may call a quote endpoint or Server Action to receive price previews. The checkout flow must recalculate the quote server-side using the current rule set. The client never submits a trusted total.

A future order should persist a pricing snapshot so historical orders remain auditable after pricing rules change.

## Authentication and authorization

Supabase Auth will own identity. Application-specific user data belongs in `profiles` and role/permission data should be designed separately from authentication metadata.

Recommended roles for the first production version:

- `customer`
- `admin`

Do not add staff subroles until there is a concrete operational need. Authorization must be enforced in PostgreSQL Row Level Security and in server-side application boundaries.

## Infrastructure boundaries

- Supabase: PostgreSQL, Auth, Row Level Security, optional realtime only where justified.
- Stripe: payment intent / checkout lifecycle and webhooks.
- Vercel: Next.js hosting and runtime.
- GitHub: source control and CI workflow.

Stripe webhook events, not client redirects, should be treated as the source of truth for payment completion.
