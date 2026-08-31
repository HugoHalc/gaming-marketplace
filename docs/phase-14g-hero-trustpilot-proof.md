# Phase 14G — Hero Trustpilot Proof

Adds real Trustpilot social proof to the Home hero without changing its general layout.

## Current public Trustpilot data
- Rating label: Excellent
- Score: 4.3 / 5
- Reviews: 9
- Profile: https://www.trustpilot.com/review/boostingpedia.com

## Visual treatment
- compact proof row below supporting copy
- no card, heavy box, bright border, or strong shadow
- Trustpilot green appears only in the stars / Trustpilot identifier
- neutral BoostingPedia text colors everywhere else
- partial fifth-star fill represents 4.3 accurately
- wraps cleanly on mobile
- proof row links to the public Trustpilot profile

## Maintainability
All displayed values are centralized in `heroTrustpilot` in `src/app/page.tsx`.

## Unchanged
- headline
- supporting copy
- hero art and animation
- overall hero layout
- header
- game cards
- remaining Home sections
