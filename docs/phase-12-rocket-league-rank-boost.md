# Phase 12A — Rocket League Rank Boost

This delivery implements the first game-specific commercial configurator for BoostingPedia.

## Scope

Only:

- Rocket League
- Rank Boost

Other services and games continue using the existing generic configurator.

## Customer experience

- Visual rank-family cards with placeholder BoostingPedia badges.
- No Division I–IV selector.
- Tier I / II / III where applicable.
- Supersonic Legend as the final rank without an additional tier.
- Target rank must always be higher than current rank.
- Competitive playlists:
  - 1v1 Duel — base
  - 2v2 Doubles — base
  - 3v3 Standard — +20%
- Extra Modes:
  - Rumble — +20%
  - Hoops — +20%
  - Dropshot — +20%
  - Snow Day — +20%
  - Heatseeker — +20%
  - 4v4 Squads — +30%
- Platforms:
  - PC
  - PlayStation
  - Xbox
  - Nintendo Switch
- Boost methods:
  - Account Boost — base
  - Play With Booster — +45%
- Upgrades:
  - Appear Offline — free
  - Live Stream — +$10
  - Express Delivery — +20%
  - Rank Insurance — +50%

Appear Offline is disabled for Play With Booster.

## Pricing

Rocket League Rank Boost uses a dedicated server-only calculation path in
`src/features/pricing/server/rocket-league-rank-pricing.ts`.

This means browser-supplied prices are never trusted.

The current version is:

`rocket-league-rank-v1.0`

The tier-step prices and approved package ceilings are based on the launch pricing matrix discussed for BoostingPedia.

## Artwork

The current rank badges are intentionally original placeholders. Replace them later with custom BoostingPedia rank artwork without changing the pricing or selection logic.

## No database migration

This first implementation does not require a Supabase migration.

The existing order flow remains:

configure → server quote → authentication → create order → dashboard → Stripe checkout.
