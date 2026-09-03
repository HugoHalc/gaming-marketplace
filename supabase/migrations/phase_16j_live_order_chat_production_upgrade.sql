alter table public.order_messages
  add column if not exists message_type text not null default 'user',
  add column if not exists system_event_type text,
  add column if not exists risk_status text not null default 'clear',
  add column if not exists moderation_status text not null default 'unreviewed',
  add column if not exists detected_patterns text[] not null default '{}'::text[],
  add column if not exists edited_at timestamptz;

alter table public.order_messages
  alter column sender_id drop not null;

alter table public.order_messages
  drop constraint if exists order_messages_sender_role_check;

alter table public.order_messages
  add constraint order_messages_sender_role_check
  check (sender_role in ('customer', 'booster', 'admin', 'system'));

alter table public.order_messages
  drop constraint if exists order_messages_message_type_check;
alter table public.order_messages
  add constraint order_messages_message_type_check
  check (message_type in ('user', 'system'));

alter table public.order_messages
  drop constraint if exists order_messages_risk_status_check;
alter table public.order_messages
  add constraint order_messages_risk_status_check
  check (risk_status in ('clear', 'review'));

alter table public.order_messages
  drop constraint if exists order_messages_moderation_status_check;
alter table public.order_messages
  add constraint order_messages_moderation_status_check
  check (moderation_status in ('unreviewed', 'reviewed', 'dismissed'));

create index if not exists order_messages_order_created_desc_idx
  on public.order_messages(order_id, created_at desc);

alter table public.order_messages replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_messages'
  ) then
    alter publication supabase_realtime add table public.order_messages;
  end if;
end $$;
