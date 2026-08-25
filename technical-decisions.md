# Technical Decisions

## Decisions made in Phase 1

### 1. Modular monolith over microservices
A single Next.js application plus PostgreSQL is the right initial production architecture. It keeps transactions and deployment simple and can still maintain strict internal feature boundaries.

### 2. Server Components by default
Pages and data-heavy UI should remain server-rendered unless browser state or interactive events require a Client Component.

### 3. Data-driven configurator
Service configuration fields and allowed options will be persisted as data. The frontend renders known field types from configuration rather than creating a custom hardcoded form for each service.

### 4. Versioned pricing rules
Pricing will be evaluated from stored rules and attached to a versioned rule set. Orders keep a snapshot of the rules/results they were purchased under.

### 5. Server-authoritative totals
Client-side calculations are previews only. Checkout and order creation always recalculate the price on trusted server infrastructure.

### 6. Two initial application roles
Start with `customer` and `admin`. More granular roles should only be introduced when operational workflows require them.

### 7. USD-first commerce model
The first commerce implementation should use USD as its explicit transaction currency. Multi-currency can be designed later without pretending it is a simple formatting change.

### 8. Mock-first frontend
Phase 1–5 can use typed mock repositories so UX evolves quickly. Supabase replaces those repositories once the information architecture and configurator behavior are stable.

### 9. Temporary brand is replaceable
The current name and palette are working assets. Semantic design tokens and centralized site configuration prevent temporary branding from leaking across the codebase.

## Decisions still required before their implementation phase

- Stripe Checkout vs Payment Element for the final payment UX
- guest checkout vs mandatory account before purchase
- whether order messaging is asynchronous comments or realtime chat
- promotion stacking policy
- tax/VAT obligations and supported sales regions
- data retention rules for customer and order information
- exact admin audit requirements
- production brand name and cleared domain
