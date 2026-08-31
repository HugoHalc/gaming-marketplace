# Phase 14R — Avatar Save Fix + Menu Polish

## Avatar save flow
Avatar saving is now independent from profile-information saving.

### Preset avatar
1. Select one of the 8 presets.
2. Preview updates.
3. Press `Save avatar`.
4. Only `profiles.avatar_url` is updated.

### Custom avatar
1. Choose JPG / PNG / WebP.
2. Preview updates.
3. Press `Save avatar`.
4. Image is uploaded to Supabase Storage.
5. Only `profiles.avatar_url` is updated.

## Why this fixes the previous issue
The previous implementation submitted avatar data together with full name, phone and gamer tag. The new avatar action has no dependency on those fields.

## Error feedback
Avatar errors now distinguish:
- invalid file type
- file too large
- upload failure
- missing selection
- database save failure

## Header
The account `Menu` trigger now uses a minimal three-line hamburger icon instead of the grid icon.

## Migration
No new migration is required if the Phase 14P migration has already been executed.
