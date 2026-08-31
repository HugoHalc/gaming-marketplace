# Phase 14M — Seamless Ping-Pong Hold Loop

Replaces the visible final-frame seek loop with a dedicated ping-pong loop asset.

## Playback sequence
1. Cinematic intro plays once from the beginning.
2. At the end, the hero transitions to a dedicated hold-loop asset.
3. The hold loop contains:
   - final 2.5s forward
   - same frames reversed
4. The resulting loop is approximately 5.0s and can repeat without a hard end-to-start jump.

## Assets
- Intro:
  `public/brand/boostingpedia-hooded-rogue-intro.webm`
- Hold loop:
  `public/brand/boostingpedia-hooded-rogue-hold-loop.webm`

## Transition
- 200ms opacity handoff from intro to hold loop.
- Hold loop is preloaded while intro plays.
- No restart to the original opening scene.

## Accessibility
`prefers-reduced-motion` continues to show the static poster.

## Unchanged
- hero framing
- header
- Trustpilot
- CTAs
- game cards
- remaining Home sections
