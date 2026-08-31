# Phase 7 — Authentication

## Scope

- Email/password registration and sign-in with Supabase Auth.
- Cookie-based SSR sessions via `@supabase/ssr`.
- Auth confirmation endpoint supporting both `token_hash` and PKCE `code` callbacks.
- Password recovery and password update.
- Protected `/dashboard`, `/dashboard/profile`, and `/admin` routes.
- `profiles` table linked 1:1 to `auth.users`.
- Roles: `customer` and `admin`.
- New users default to `customer`; existing legacy admin mappings are preserved during backfill.

## Security model

- Server authorization uses `auth.getClaims()` rather than trusting `getSession()`.
- RLS limits profile reads/updates to the authenticated owner.
- Authenticated users have column-level update permissions for profile fields only; `role` cannot be changed from the browser.
- Admin access is verified server-side from the authenticated user's own profile.
- Auth clients are request-scoped on the server and sessions are refreshed through Next.js `proxy.ts`.

## Supabase migration

The production database contains the `phase_7_auth_profiles` migration. It creates `public.profiles`, a private trigger function for new Auth users, RLS policies, and a legacy-user backfill without modifying the existing `usuarios`/`pedidos` tables.

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SECRET_KEY` remains server-only and is used by pricing infrastructure, not browser authentication.
