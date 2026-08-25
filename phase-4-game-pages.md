# Phase 4 — Individual Game Pages

## Scope

Phase 4 adds production-oriented dynamic game landing pages at `/games/[game]` without introducing database, authentication, checkout, or service configurator logic.

## Delivered

- Dynamic game route with static params for active mock catalog games.
- Dynamic page metadata and canonical URLs.
- Dedicated hero and game-specific context for every active game.
- Service grid derived from the same typed catalog source used by `/games`.
- Starting-price summaries derived from active services.
- Game-specific trust points and product-context highlights.
- Related-game navigation.
- Catalog cards now link directly to the individual game route.
- Invalid or inactive game slugs return the existing 404 experience.

## Architectural note

The route resolves by game `slug` through a selector rather than importing mock arrays directly into the page. When Supabase replaces mock data, the route can retain the same page-level contract while the selector/repository implementation changes underneath.

Service cards intentionally stop before detailed configuration. The `/games/[game]/[service]` route and interactive configurator belong to Phase 5.
