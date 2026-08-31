# Phase 14S — Custom Avatar Preview Fix

Fixes the profile preview for user-uploaded custom avatars.

## Problem
Preset avatars displayed correctly because they are local assets.
Custom avatars are stored at a Supabase Storage public URL. The preview was using `next/image`, which requires remote host configuration and therefore failed to render the custom URL.

## Fix
The large Profile Preview now uses a native `<img>`:
- local preset avatars still render correctly
- Supabase Storage URLs render correctly
- temporary `blob:` previews from newly selected uploads render correctly

## Unchanged
- avatar saving
- Supabase Storage
- header avatar
- preset selector grid
- profile fields
- Menu icon
