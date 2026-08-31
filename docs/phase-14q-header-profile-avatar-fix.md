# Phase 14Q — Header Profile Avatar Fix

Corrects the authenticated header avatar.

## Behavior
- If `profiles.avatar_url` exists, the saved profile image is displayed.
- If no avatar is saved, the existing initials remain as fallback.
- Works with both:
  - BoostingPedia preset avatars (`/avatars/...`)
  - custom Supabase Storage avatar URLs

## Implementation detail
Uses a native `<img>` inside the 40px circular header avatar. This avoids requiring extra Next.js remote-image hostname configuration for Supabase Storage URLs.

## Unchanged
- profile avatar picker
- upload flow
- header layout
- Menu
- notifications
- navigation
- hero
