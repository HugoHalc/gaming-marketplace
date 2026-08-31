# Phase 13K — Mask Blue Asset Edge Hotfix

Phase 13J did not fully hide the blue source edge because the blue pixels extend farther inside the artwork than one outer pixel.

## Actual page-level fix
For these cards only:
- Rocket League
- Battlefield 6
- Rainbow Six Siege

the page now draws two 3 px internal masks:
- right edge
- bottom edge

The masks use the existing card background `#090D0B`, sit above the image, and remain below the CTA/status overlays.

## No image editing
The approved image files are copied unchanged.

## No other changes
- native 2048:1143 aspect ratio remains
- no zoom changes
- no object-position changes
- no grid/layout changes
- no UX changes
- In Development remains darkened
- Rocket League remains Available
