# Phase 15E — Price Summary & Mobile Conversion Polish

Scope is restricted to:
`/games/rocket-league/rank-boost`

Only these areas changed:
- desktop Order Summary
- price presentation
- quote loading state
- mobile sticky bar

## Desktop summary
Keeps the existing order:
1. Your boost
2. Rocket League Rank Boost
3. Current → Target
4. Playlist / Platform / Method
5. breakdown
6. Total
7. Server-validated price
8. Create secure order
9. trust microcopy

## Price
- Uses real `quote.total`
- 36px-equivalent `font-gaming-value`
- white #F4F7F5
- no green price
- no artificial savings/discount UI
- no crossed-out values

## Loading
- small 12px green-highlight spinner
- `Updating price…`
- no fake `$0.00`
- `—` is shown when no real quote exists yet
- once validated, state switches to a small green check + `Server-validated price`

## Mobile sticky bar
- keeps neutral white/[0.08] border
- compact `Your total`
- 24–25px-equivalent price
- `Updating…` when recalculating
- `View order` remains visible and green
- no extra height or green container glow

## Unchanged
- pricing
- API
- selectors
- playlist
- platform
- boost method
- customize
- create-order behavior
- header/footer
