# Phase 13P — Hero CSS Mask Blending Fix

This phase starts directly from Phase 13L and does not include the blending experiments from 13M, 13N, or 13O.

## Change
- Restores the Phase 13L hero artwork size and position.
- Removes all hero gradient overlay layers.
- Uses one CSS mask directly on the artwork.
- The mask creates one long, progressive fade from the text side into the artwork.
- The emblem/right half remains fully opaque and crisp.
- No independent top, bottom, or right edge masks.
- No blur on the hero artwork.

## Unchanged
- hero layout and height
- left-side content
- copy and buttons
- navigation
- artwork asset
- emblem position
- palette
- other Home sections
- game cards and functionality
