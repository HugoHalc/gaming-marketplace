# Phase 13L — Brand Hero + Card Edge Fix

This phase groups two approved visual changes.

## 1. Home hero visual
- Uses the user-supplied BoostingPedia brand artwork as the new hero artwork.
- Replaces only the previous right-side hero decorative panel.
- Keeps all existing left-side hero content and copy.
- Artwork is integrated directly into the hero background.
- No card frame, fake panel, game list, or decorative widget remains.
- Uses restrained left and vertical fades so the artwork blends into `#050807`.
- Desktop composition keeps the emblem dominant on the right.
- Existing Home structure, navigation and sections remain unchanged.

## 2. Thin blue asset-edge correction
Affected:
- Rocket League
- Battlefield 6
- Rainbow Six Siege

The previous 3 px masks are removed.
Those three image layers are enlarged by only 0.4% (`scale-[1.004]`) inside the existing clipped card.
This hides the baked blue source edge without leaving any visible gap and without perceptibly changing the composition.

## Unchanged
- native 2048:1143 card ratio
- grid and card sizes
- CTA/status placement
- In Development darkening
- Rocket League availability
- all game-card assets
- exact Marvel Rivals logo
- Rocket League pricing, services and configurators
