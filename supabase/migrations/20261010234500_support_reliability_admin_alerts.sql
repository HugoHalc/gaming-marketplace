-- Live Support reliability: per-admin reads, durable alerts and idempotent sends.

alter table public.support_messages
  add column if not exists client_message_id uuid null;

create unique index if not exists support_messages_client_idempotency_idx
  on public.support_messages (conversation_id, sender_type, client_message_id)
  where client_message_id is not null;

create table if not exists public.support_admin_reads (
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  last_read_message_id uuid null references public.support_messages(id) on delete set null,
  last_read_at timestamptz null,
  updated_at timestamptz not null default now(),
  primary key (admin_user_id, conversation_id)
);

create table if not exists public.support_admin_alerts (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  message_id uuid not null references public.support_messages(id) on delete cascade,
  read_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (admin_user_id, message_id)
);

create index if not exists support_admin_reads_conversation_idx
  on public.support_admin_reads (conversation_id, admin_user_id);
create index if not exists support_admin_alerts_admin_unread_idx
  on public.support_admin_alerts (admin_user_id, created_at desc)
  where read_at is null;
create index if not exists support_admin_alerts_conversation_idx
  on public.support_admin_alerts (admin_user_id, conversation_id, created_at desc);

alter table public.support_admin_reads enable row level security;
alter table public.support_admin_alerts enable row level security;

revoke all privileges on public.support_admin_reads, public.support_admin_alerts from public, anon, authenticated;
grant select, insert, update, delete on public.support_admin_reads, public.support_admin_alerts to service_role;
grant select on public.support_admin_alerts to authenticated;

drop policy if exists support_admin_alerts_admin_read_own on public.support_admin_alerts;
create policy support_admin_alerts_admin_read_own
on public.support_admin_alerts
for select
to authenticated
using (
  admin_user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
  )
);

create or replace function public.enqueue_support_admin_alerts()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.sender_type <> 'visitor' then
    return new;
  end if;

  insert into public.support_admin_alerts (admin_user_id, conversation_id, message_id, created_at)
  select profile.id, new.conversation_id, new.id, new.created_at
  from public.profiles profile
  where profile.role = 'admin'
  on conflict (admin_user_id, message_id) do nothing;

  return new;
end;
$$;

drop trigger if exists support_messages_enqueue_admin_alerts on public.support_messages;
create trigger support_messages_enqueue_admin_alerts
after insert on public.support_messages
for each row execute function public.enqueue_support_admin_alerts();

revoke all on function public.enqueue_support_admin_alerts() from public, anon, authenticated;
grant execute on function public.enqueue_support_admin_alerts() to service_role;

-- Preserve the existing shared unread baseline for every current admin.
insert into public.support_admin_alerts (admin_user_id, conversation_id, message_id, created_at)
select profile.id, message.conversation_id, message.id, message.created_at
from public.profiles profile
join public.support_conversations conversation on true
join public.support_messages message on message.conversation_id = conversation.id
where profile.role = 'admin'
  and message.sender_type = 'visitor'
  and (
    conversation.admin_last_read_at is null
    or message.created_at > conversation.admin_last_read_at
  )
on conflict (admin_user_id, message_id) do nothing;

create or replace function public.mark_support_admin_read(
  p_admin_user_id uuid,
  p_conversation_id uuid,
  p_message_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_message_created_at timestamptz;
begin
  if not exists (
    select 1 from public.profiles
    where id = p_admin_user_id and role = 'admin'
  ) then
    raise exception 'Admin access required';
  end if;

  select created_at into v_message_created_at
  from public.support_messages
  where id = p_message_id and conversation_id = p_conversation_id;

  if v_message_created_at is null then
    raise exception 'Support message not found';
  end if;

  insert into public.support_admin_reads (
    admin_user_id, conversation_id, last_read_message_id, last_read_at, updated_at
  ) values (
    p_admin_user_id, p_conversation_id, p_message_id, v_message_created_at, now()
  )
  on conflict (admin_user_id, conversation_id) do update
  set last_read_message_id = excluded.last_read_message_id,
      last_read_at = excluded.last_read_at,
      updated_at = now()
  where public.support_admin_reads.last_read_at is null
     or (excluded.last_read_at, excluded.last_read_message_id)
        > (public.support_admin_reads.last_read_at, public.support_admin_reads.last_read_message_id);

  update public.support_admin_alerts alert
  set read_at = coalesce(alert.read_at, now())
  from public.support_messages message
  where alert.admin_user_id = p_admin_user_id
    and alert.conversation_id = p_conversation_id
    and alert.message_id = message.id
    and (message.created_at, message.id) <= (v_message_created_at, p_message_id)
    and alert.read_at is null;
end;
$$;

create or replace function public.mark_support_customer_read(
  p_conversation_id uuid,
  p_message_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_message_created_at timestamptz;
begin
  select created_at into v_message_created_at
  from public.support_messages
  where id = p_message_id and conversation_id = p_conversation_id;

  if v_message_created_at is null then
    raise exception 'Support message not found';
  end if;

  update public.support_conversations
  set customer_last_read_at = greatest(
        coalesce(customer_last_read_at, '-infinity'::timestamptz),
        v_message_created_at
      ),
      updated_at = now()
  where id = p_conversation_id;
end;
$$;

revoke all on function public.mark_support_admin_read(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.mark_support_customer_read(uuid, uuid) from public, anon, authenticated;
grant execute on function public.mark_support_admin_read(uuid, uuid, uuid) to service_role;
grant execute on function public.mark_support_customer_read(uuid, uuid) to service_role;

create or replace function public.list_support_admin_queue(
  p_admin_user_id uuid,
  p_status text default null
)
returns table (
  id uuid,
  customer_id uuid,
  visitor_name text,
  visitor_email text,
  status text,
  last_message_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  customer_last_read_at timestamptz,
  latest_message_body text,
  latest_message_sender_type text,
  latest_message_created_at timestamptz,
  unread_count bigint
)
language sql
security invoker
set search_path = public, pg_temp
as $$
  select
    conversation.id,
    conversation.customer_id,
    conversation.visitor_name,
    conversation.visitor_email,
    conversation.status,
    conversation.last_message_at,
    conversation.created_at,
    conversation.updated_at,
    conversation.customer_last_read_at,
    latest.body,
    latest.sender_type,
    latest.created_at,
    count(alert.id) filter (where alert.read_at is null) as unread_count
  from public.support_conversations conversation
  left join lateral (
    select message.body, message.sender_type, message.created_at
    from public.support_messages message
    where message.conversation_id = conversation.id
    order by message.created_at desc, message.id desc
    limit 1
  ) latest on true
  left join public.support_admin_alerts alert
    on alert.conversation_id = conversation.id
   and alert.admin_user_id = p_admin_user_id
  where (p_status is null or conversation.status = p_status)
    and exists (
      select 1 from public.profiles profile
      where profile.id = p_admin_user_id and profile.role = 'admin'
    )
  group by conversation.id, latest.body, latest.sender_type, latest.created_at
  order by conversation.last_message_at desc, conversation.id desc
  limit 100;
$$;

revoke all on function public.list_support_admin_queue(uuid, text) from public, anon, authenticated;
grant execute on function public.list_support_admin_queue(uuid, text) to service_role;

-- Only this RLS-protected alert table is exposed to Postgres Changes.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'support_admin_alerts'
  ) then
    alter publication supabase_realtime add table public.support_admin_alerts;
  end if;
end;
$$;
