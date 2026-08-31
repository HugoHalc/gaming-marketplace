# Phase 15A — Rocket League Storefront Copy + Visual Polish

Scope is restricted to the Rocket League output of `/games/[game]`.

## Hero copy
Keeps the existing hero layout and CTAs.

Rocket League description:
`Choose the service that matches your competitive goal and configure your boost around your rank, playlist, and preferred progression.`

Hero chip:
`Competitive sports` → `Competitive boosting`

Keeps:
- `Playlist-aware configuration`
- dynamic `5 services`

## Services intro
For Rocket League only, removes customer-visible implementation language:
`Each service opens its own dedicated configurator.`

Replaced with:
`Browse the available services and choose the option that best matches your competitive goal.`

No service cards, configurator routes, pricing or service logic are changed.

## Storefront section
Rocket League now uses:

Eyebrow:
`Built for Rocket League`

Headline:
`Everything you need to configure your boost with confidence.`

Supporting copy:
`Choose your service, configure the details that matter, and see exactly what you are ordering before checkout.`

### Cards
1. Built around your rank
2. Clear pricing before checkout
3. Track your progress

Icons:
- Layers3
- ReceiptText
- Activity

Visual treatment:
- dark neutral cards
- subtle white borders
- controlled Rocket League blue icon treatment
- extremely subtle border/background hover
- no glow
- no lift
- no new green blocks
- no 01/02/03 markers in this section

## Compatibility
The route remains shared by other game storefronts. All new copy and visual behavior is gated behind:
`game.slug === "rocket-league"`

Other game storefronts preserve their existing output.

## Unchanged
- Header
- Footer
- Routes
- Hero layout
- Service cards
- Configurators
- Pricing
- Service logic
