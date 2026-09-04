-- Phase 17A.1 — Live Support service_role grants
-- Live Support is intentionally accessed only through server-side API routes.
-- Browser roles remain without direct table privileges.

grant select, insert, update, delete
on table public.support_conversations
to service_role;

grant select, insert, update, delete
on table public.support_messages
to service_role;
