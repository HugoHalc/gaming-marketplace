# Phase 5 — Service Configurator

Phase 5 adds `/games/[game]/[service]` and a data-driven service configurator.

## Architecture

- Service pages resolve game and service by slug on the server.
- Configurator fields come from typed schemas rather than page-specific form markup.
- The client stores only the current selection and requests quote previews from `POST /api/quotes/preview`.
- The quote endpoint resolves the catalog entities again and calculates pricing server-side.
- The browser-provided total is never trusted because no total is submitted by the client.
- Quote responses include a mock pricing rule-set version to establish price traceability before Supabase is introduced.

## Mock pricing behavior

Rank services price progression distance plus selected modifiers. Wins, placement matches, and coaching scale by quantity. Duo/live/priority options can add modifiers. Larger mock packages receive a small package discount.

This pricing model is intentionally temporary. Phase 6 will move catalog, field definitions, pricing rules, versions, and persistence into Supabase/PostgreSQL while keeping the same UI and server-authoritative contract.
