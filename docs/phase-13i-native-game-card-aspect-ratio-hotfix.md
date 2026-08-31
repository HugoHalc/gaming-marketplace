# Phase 13I — Native Game Card Aspect Ratio Hotfix

This hotfix fixes the actual cause of the game-card cropping.

## Root cause
The approved artwork is 2048 × 1143 (aspect ratio ≈ 1.792), while the Home cards were taller / more square. With `object-cover`, the browser had to crop the artwork horizontally.

## Fix
- Home cards now use `aspect-[2048/1143]`.
- Removed all per-game scale adjustments.
- Removed all per-game object-position adjustments.
- Artwork now uses `object-cover object-center`.
- The card ratio now matches the source artwork ratio.

## Preserved
- 3-column desktop grid
- card widths
- borders/radius
- CTA and status placement
- hover behavior
- Rocket League Available state
- In-development darkened state
- exact uploaded Marvel Rivals logo
- Rainbow Six Siege artwork as supplied
- all Home structure and UX
- Rocket League logic, pricing and configurators
