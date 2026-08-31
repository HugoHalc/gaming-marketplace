# Phase 15F — Rocket League Multiselect Upgrades & Rank Badge Consistency

Scope:
- `/games/rocket-league`
- all five Rocket League service configurators

## 1. Optional upgrades
Replaces native checkbox presentation with premium selectable cards.

Applied to:
- Rank Boost
- Competitive Wins
- Tournament Boost
- Rewards Boost
- Placements Boost

Behavior remains multi-select:
- several upgrades may be active at the same time
- each card toggles its existing boolean selection
- no pricing or API logic changed
- disabled states remain disabled
- `Appear Offline` still follows the existing Play With Booster compatibility logic

Visual system:
- default: dark neutral
- selected: elevated dark surface + subtle Rocket League blue border
- confirmation: small BoostingPedia green check
- `FREE`: green
- paid modifiers: muted blue
- no visible native checkbox

The control uses a real `<button>` with `aria-pressed` for accessible toggle semantics.

## 2. Rank Boost storefront card
Corrects the Rank Boost microvisual on `/games/rocket-league`.

Now uses the exact real project assets used by the configurator:
- `/ranks/rocket-league/diamond.png`
- `/ranks/rocket-league/champion.png`
- `/ranks/rocket-league/grand-champion.png`

No generated/generic rank SVGs are used.

## Unchanged
- pricing
- quote API
- calculations
- routes
- option availability
- service order
- service copy
- headers/footers
- checkout/order creation logic
