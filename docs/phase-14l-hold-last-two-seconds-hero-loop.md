# Phase 14L — Hold Last Two Seconds Hero Loop

Updates only the Home hero video playback behavior.

## New behavior
- The hero video now plays normally from the beginning **one time**.
- After the first full pass, it no longer restarts from frame 0.
- Instead, it loops only the **last 2 seconds** of the clip.
- This preserves the cinematic build-up and keeps the final logo-holding pose in a seamless micro-loop.

## Technical implementation
- Added `HeroHoldLoopVideo` client component.
- Removed native `loop` usage from the hero `<video>`.
- Uses:
  - `ended` to enter hold-loop mode
  - `timeupdate` to loop the final segment
- Keeps:
  - `autoplay`
  - `muted`
  - `playsInline`
  - `preload="metadata"`
  - no controls

## Reduced motion
- If `prefers-reduced-motion: reduce` is enabled, the component renders the static poster image instead of the video.

## Unchanged
- Hero framing
- Header
- Trustpilot line
- CTA buttons
- Game cards
- Remaining Home sections
