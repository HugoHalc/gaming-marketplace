# Phase 3 — Games Catalog

## Scope completed

- Added `/games` as the primary catalog route.
- Added client-side search across games and service copy.
- Added service-type filters for rank, wins, placements, and coaching.
- Added responsive catalog cards with availability, service badges, and starting price.
- Expanded typed mock catalog data to six games and multiple services.
- Added selector logic to derive active services and minimum starting price from data.
- Updated primary navigation and homepage game links to use the catalog route.

## Architecture note

The catalog browser receives fully prepared catalog data from a Server Component. Only filtering and search state run on the client. Catalog composition, service relationships, status filtering, and starting-price derivation remain outside presentation components.

## Deferred to Phase 4

- `/games/[game]` pages.
- Game-specific hero content and service hierarchy.
- Direct service detail links.
- Database-backed catalog content.
