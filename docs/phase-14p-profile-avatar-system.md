# Phase 14P — Profile Avatar System

Implements a real profile-avatar workflow in `/dashboard/profile`.

## User choices
- 8 BoostingPedia preset avatars.
- Upload custom JPG / PNG / WebP.
- Maximum custom image size: 5MB.
- Circular preview before saving.

## Persistence
- Preset avatar paths are stored in `profiles.avatar_url`.
- Custom images are uploaded to the `profile-avatars` Supabase Storage bucket.
- Upload paths are isolated by authenticated user id.

## Header
When a saved avatar exists, the logged-in header uses the avatar image instead of initials.

## Migration
Run:
`supabase/migrations/20260830_profile_avatars.sql`

This migration:
- adds `profiles.avatar_url`
- creates/configures `profile-avatars`
- creates authenticated upload/update policies
- allows public read of profile avatars
