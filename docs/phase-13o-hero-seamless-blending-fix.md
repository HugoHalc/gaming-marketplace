# Phase 13O — Hero Seamless Blending Fix

This phase only refines the visual integration of `boostingpedia-hero-art.webp`.

## What changed
- Removed the stack of independent top / bottom / left / right masks.
- Removed the upper-right blur blob.
- Removed perimeter-style darkening that made the artwork feel rectangular.
- Uses one long horizontal fade from `#050807` to transparent.
- Uses one extremely light vertical vignette only.
- Slightly enlarges the artwork (`scale-[1.035]`) so physical image edges remain outside the visible composition.
- Extends the artwork farther beyond the right side.

## Intent
The emblem should feel like it exists directly inside the hero background rather than inside a softened rectangular image container.

## Unchanged
- hero layout
- hero height
- left-side content
- copy
- buttons
- navigation
- emblem focal position
- artwork asset
- palette
- all other sections
- all game-card behavior
