# Phase 14K — Loop Video Hero

Replaces the static rogue artwork with the supplied WebM animation.

## Production video
- Source: `Hooded_figure_summons_green_fire_202608301847.webm`
- Output: `public/brand/boostingpedia-hooded-rogue-loop.webm`
- Audio track removed.
- Re-encoded as VP9 WebM for web delivery.
- File size: 1.15 MB

## Playback
- autoplay
- muted
- loop
- playsInline
- no controls
- preload=metadata
- static poster fallback

## Framing
- visual stays on the right side of the hero
- moved inward from the far-right edge
- desktop object-position: ~58% center
- XL object-position: ~60% center
- restrained horizontal fade into the left hero background
- subtle top/bottom fades only
- no card, frame or heavy blur

## Reduced motion
Users with `prefers-reduced-motion: reduce` see the static rogue artwork instead of the looping video.

## Unchanged
- header
- hero copy
- Trustpilot
- CTAs
- left-side spacing
- game cards
- remaining Home sections
