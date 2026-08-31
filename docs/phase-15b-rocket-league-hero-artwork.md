# Phase 15B — Rocket League Hero Artwork

Scope is restricted to the hero artwork of `/games/rocket-league`.

## New asset
`/public/game-heroes/rocket-league-storefront.jpeg`

Uses the supplied cinematic Rocket League artwork as the primary right-side hero visual.

## Desktop
- Artwork occupies ~62% of the right side.
- Car and ball remain concentrated on the right.
- `object-cover` preserves the artwork proportions.
- No card/frame around the asset.
- No visible asset edges.

## Blending
Only two principal blending layers are used:
1. very subtle dark overlay
2. broad left-to-right #050807 → transparent gradient

The previous Rocket League abstract blue glow and large typographic watermark are removed for Rocket League only.

## Grid
The hero grid is restricted to the left portion and reduced to 15% opacity.

## Tablet / Mobile
- Artwork remains present but becomes progressively more transparent.
- Content remains first and readable.
- Car remains the visual priority through object positioning.
- No horizontal overflow.

## Unchanged
- hero structure
- breadcrumb
- eyebrow
- headline
- supporting copy
- chips
- CTAs
- header
- service cards
- storefront sections
- routes
- pricing
- configurators
- functionality

Other game storefronts keep their existing hero treatment.
