-- Phase 16D: Live Order Chat + Secure Account Access + Booster Assignment
-- Review and apply to the intended BoostingPedia Supabase project.

create extension if not exists pgcrypto;

-- Allow the booster role while preserving customer/admin.
do $$
declare
  constraint_name text;
begin
  select c.conname
    into constraint_name
  from pg_constraint c
  where c.conrelid = 'public.profiles'::regclass
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%role%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'booster', 'admin'));

create table if not exists public.order_booster_assignments (
  order_id uuid primary key references public.orders(id) on delete cascade,
  booster_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  is_active boolean not null default true,
  check (booster_id <> assigned_by or booster_id = assigned_by)
);

create index if not exists order_booster_assignments_booster_idx
  on public.order_booster_assignments(booster_id, assigned_at desc);

create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  sender_role text not null check (sender_role in ('customer', 'booster', 'admin')),
  body text not null check (char_length(body) between 1 and 1500),
  flagged boolean not null default false,
  detected_terms text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index if not exists order_messages_order_created_idx
  on public.order_messages(order_id, created_at asc);

create table if not exists public.order_message_reads (
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (order_id, user_id)
);

create table if not exists public.order_moderation_flags (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  message_id uuid not null references public.order_messages(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  detected_terms text[] not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create index if not exists order_moderation_flags_status_created_idx
  on public.order_moderation_flags(status, created_at desc);

-- Encrypted application payload only. Ciphertext is produced server-side with AES-256-GCM.
create table if not exists public.order_credentials (
  order_id uuid primary key references public.orders(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  encryption_version integer not null default 1 check (encryption_version = 1),
  updated_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_order_credentials_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists order_credentials_set_updated_at on public.order_credentials;
create trigger order_credentials_set_updated_at
before update on public.order_credentials
for each row execute function public.set_order_credentials_updated_at();

create or replace function public.can_access_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and (
        o.user_id = auth.uid()
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        )
        or exists (
          select 1
          from public.order_booster_assignments a
          where a.order_id = o.id
            and a.booster_id = auth.uid()
            and a.is_active = true
        )
      )
  );
$$;

revoke all on function public.can_access_order(uuid) from public, anon;
grant execute on function public.can_access_order(uuid) to authenticated;

alter table public.order_booster_assignments enable row level security;
alter table public.order_messages enable row level security;
alter table public.order_message_reads enable row level security;
alter table public.order_moderation_flags enable row level security;
alter table public.order_credentials enable row level security;

-- Assignments: customer can see their own assignment; booster can see theirs; admin can see all.
revoke all on public.order_booster_assignments from anon, authenticated;
grant select on public.order_booster_assignments to authenticated;

drop policy if exists order_assignments_participant_read on public.order_booster_assignments;
create policy order_assignments_participant_read
on public.order_booster_assignments
for select to authenticated
using (
  booster_id = auth.uid()
  or exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Messages can only be selected/inserted by order participants.
revoke all on public.order_messages from anon, authenticated;
grant select, insert on public.order_messages to authenticated;

drop policy if exists order_messages_participant_read on public.order_messages;
create policy order_messages_participant_read
on public.order_messages
for select to authenticated
using (public.can_access_order(order_id));

drop policy if exists order_messages_participant_insert on public.order_messages;
create policy order_messages_participant_insert
on public.order_messages
for insert to authenticated
with check (
  public.can_access_order(order_id)
  and sender_id = auth.uid()
  and sender_role = (
    select p.role from public.profiles p where p.id = auth.uid()
  )
);

revoke all on public.order_message_reads from anon, authenticated;
grant select, insert, update on public.order_message_reads to authenticated;

drop policy if exists order_message_reads_self on public.order_message_reads;
create policy order_message_reads_self
on public.order_message_reads
for all to authenticated
using (user_id = auth.uid() and public.can_access_order(order_id))
with check (user_id = auth.uid() and public.can_access_order(order_id));

-- Moderation flags are admin-only through Data API.
revoke all on public.order_moderation_flags from anon, authenticated;
grant select, update on public.order_moderation_flags to authenticated;

drop policy if exists order_moderation_flags_admin_read on public.order_moderation_flags;
create policy order_moderation_flags_admin_read
on public.order_moderation_flags
for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists order_moderation_flags_admin_update on public.order_moderation_flags;
create policy order_moderation_flags_admin_update
on public.order_moderation_flags
for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Credentials are intentionally not exposed to authenticated Data API users.
-- All credential access goes through authenticated server endpoints using the service secret.
revoke all on public.order_credentials from anon, authenticated;
