# Phase 13J — Remove Blue Asset Edge Hotfix

Small visual-only correction after Phase 13I.

## Problem
The approved source artwork for:
- Rocket League
- Battlefield 6
- Rainbow Six Siege

contains a very thin blue line at the outer image edge. Because Phase 13I now shows the artwork at its correct native aspect ratio, that source edge is visible inside the card.

## Fix
For those three cards only, the image layer extends approximately 1 px beyond the clipping container (`-inset-px`).

This hides the source-image edge behind the existing rounded card clipping.

## Important
This does NOT:
- regenerate images
- edit image files
- change card dimensions
- change aspect ratio
- change perceived zoom
- change object positioning
- change grid or layout
- affect CTA/status
- affect In Development darkening
- touch Rocket League logic
