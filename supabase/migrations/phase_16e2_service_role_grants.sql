-- Phase 16E.2: Service Role Grants Hotfix
-- Required after Phase 16D / 16E tables were created through SQL migrations.
--
-- The BoostingPedia server repository uses the Supabase secret/service role
-- after it has explicitly authorized the current user. PostgreSQL table
-- privileges are still required even though service_role bypasses RLS.

grant select, insert, update, delete
on table public.order_booster_assignments
to service_role;

grant select, insert, update, delete
on table public.order_messages
to service_role;

grant select, insert, update, delete
on table public.order_message_reads
to service_role;

grant select, insert, update, delete
on table public.order_moderation_flags
to service_role;

grant select, insert, update, delete
on table public.order_credentials
to service_role;

grant select, insert, update, delete
on table public.booster_profiles
to service_role;

-- Keep authenticated exposure intentionally narrow.
-- This does NOT grant authenticated users direct access to encrypted credentials.
revoke all
on table public.order_credentials
from anon, authenticated;

-- Sequence privileges are included defensively for tables/functions that may
-- acquire generated sequence-backed columns in later migrations.
grant usage, select
on all sequences in schema public
to service_role;
