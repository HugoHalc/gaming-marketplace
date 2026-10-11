create table public.order_email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  event_type text not null,
  customer_user_id uuid not null references public.profiles(id) on delete restrict,
  order_number text not null,
  service_name text,
  recipient_name text,
  recipient_email text,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  retry_deadline_at timestamptz,
  processing_token uuid,
  locked_at timestamptz,
  locked_until timestamptz,
  provider_message_id text,
  provider_accepted_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_email_outbox_event_type_check
    check (event_type = 'service_completed'),
  constraint order_email_outbox_status_check
    check (status in ('pending', 'processing', 'sent', 'blocked', 'failed', 'uncertain')),
  constraint order_email_outbox_attempt_count_check
    check (attempt_count >= 0),
  constraint order_email_outbox_completion_once
    unique (order_id, event_type)
);

create index order_email_outbox_pending_idx
  on public.order_email_outbox(next_attempt_at, created_at)
  where status = 'pending';

create index order_email_outbox_processing_lease_idx
  on public.order_email_outbox(locked_until)
  where status = 'processing';

alter table public.order_email_outbox enable row level security;

revoke all on table public.order_email_outbox from public, anon, authenticated;
grant select, insert, update on table public.order_email_outbox to service_role;

create or replace function private.enqueue_service_completed_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient_name text;
  v_recipient_email text;
  v_service_name text;
  v_status text;
  v_error text;
begin
  select
    nullif(trim(p.full_name), ''),
    nullif(trim(u.email::text), '')
  into v_recipient_name, v_recipient_email
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.id = new.user_id;

  select nullif(
    string_agg(distinct nullif(trim(oi.service_name), ''), ', ' order by nullif(trim(oi.service_name), '')),
    ''
  )
  into v_service_name
  from public.order_items oi
  where oi.order_id = new.id;

  v_status := case
    when v_recipient_name is not null
      and v_recipient_email is not null
      and v_service_name is not null
    then 'pending'
    else 'blocked'
  end;

  v_error := case when v_status = 'blocked' then concat_ws(
    ', ',
    case when v_recipient_name is null then 'missing_recipient_name' end,
    case when v_recipient_email is null then 'missing_recipient_email' end,
    case when v_service_name is null then 'missing_service_name' end
  ) end;

  insert into public.order_email_outbox (
    order_id,
    event_type,
    customer_user_id,
    order_number,
    service_name,
    recipient_name,
    recipient_email,
    status,
    last_error
  )
  values (
    new.id,
    'service_completed',
    new.user_id,
    new.order_number,
    v_service_name,
    v_recipient_name,
    v_recipient_email,
    v_status,
    v_error
  )
  on conflict on constraint order_email_outbox_completion_once do nothing;

  return new;
end;
$$;

revoke all on function private.enqueue_service_completed_email()
  from public, anon, authenticated, service_role;

drop trigger if exists orders_enqueue_service_completed_email on public.orders;
create trigger orders_enqueue_service_completed_email
after update of status on public.orders
for each row
when (old.status = 'in_progress' and new.status = 'completed')
execute function private.enqueue_service_completed_email();

create or replace function private.claim_order_completion_email_events(
  p_limit integer default 10
)
returns table (
  event_id uuid,
  order_id uuid,
  order_number text,
  service_name text,
  recipient_name text,
  recipient_email text,
  attempt_count integer,
  processing_token uuid,
  retry_deadline_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 50 then
    raise exception 'Invalid claim limit.';
  end if;

  update public.order_email_outbox e
  set
    status = 'uncertain',
    last_error = 'worker_lease_expired_after_ambiguous_processing',
    processing_token = null,
    locked_at = null,
    locked_until = null,
    updated_at = now()
  where e.status = 'processing'
    and e.locked_until < now();

  update public.order_email_outbox e
  set
    recipient_name = nullif(trim(p.full_name), ''),
    recipient_email = nullif(trim(u.email::text), ''),
    service_name = coalesce(
      e.service_name,
      (
        select nullif(
          string_agg(distinct nullif(trim(oi.service_name), ''), ', ' order by nullif(trim(oi.service_name), '')),
          ''
        )
        from public.order_items oi
        where oi.order_id = e.order_id
      )
    ),
    updated_at = now()
  from public.profiles p
  left join auth.users u on u.id = p.id
  where e.status = 'blocked'
    and p.id = e.customer_user_id;

  update public.order_email_outbox e
  set
    status = 'pending',
    last_error = null,
    next_attempt_at = now(),
    updated_at = now()
  where e.status = 'blocked'
    and e.recipient_name is not null
    and e.recipient_email is not null
    and e.service_name is not null;

  update public.order_email_outbox e
  set
    status = 'failed',
    last_error = coalesce(e.last_error, 'provider_idempotency_window_expired'),
    updated_at = now()
  where e.status = 'pending'
    and e.retry_deadline_at is not null
    and e.retry_deadline_at <= now();

  return query
  with candidates as (
    select e.id
    from public.order_email_outbox e
    where e.status = 'pending'
      and e.next_attempt_at <= now()
      and (e.retry_deadline_at is null or e.retry_deadline_at > now())
    order by e.next_attempt_at, e.created_at
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.order_email_outbox e
    set
      status = 'processing',
      attempt_count = e.attempt_count + 1,
      retry_deadline_at = coalesce(e.retry_deadline_at, now() + interval '23 hours'),
      processing_token = gen_random_uuid(),
      locked_at = now(),
      locked_until = now() + interval '10 minutes',
      updated_at = now()
    from candidates c
    where e.id = c.id
    returning e.*
  )
  select
    c.id,
    c.order_id,
    c.order_number,
    c.service_name,
    c.recipient_name,
    c.recipient_email,
    c.attempt_count,
    c.processing_token,
    c.retry_deadline_at
  from claimed c;
end;
$$;

create or replace function public.claim_order_completion_email_events(
  p_limit integer default 10
)
returns table (
  event_id uuid,
  order_id uuid,
  order_number text,
  service_name text,
  recipient_name text,
  recipient_email text,
  attempt_count integer,
  processing_token uuid,
  retry_deadline_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.claim_order_completion_email_events(p_limit);
$$;

create or replace function private.resolve_order_completion_email_event(
  p_event_id uuid,
  p_processing_token uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_error text default null,
  p_retry_at timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_retry_deadline timestamptz;
begin
  if p_outcome not in ('sent', 'retry', 'failed', 'uncertain') then
    raise exception 'Invalid email event outcome.';
  end if;

  select e.retry_deadline_at
  into v_retry_deadline
  from public.order_email_outbox e
  where e.id = p_event_id
    and e.status = 'processing'
    and e.processing_token = p_processing_token
  for update;

  if not found then
    return false;
  end if;

  if p_outcome = 'sent' then
    if nullif(trim(coalesce(p_provider_message_id, '')), '') is null then
      raise exception 'Provider message ID is required.';
    end if;

    update public.order_email_outbox
    set
      status = 'sent',
      provider_message_id = p_provider_message_id,
      provider_accepted_at = now(),
      last_error = null,
      processing_token = null,
      locked_at = null,
      locked_until = null,
      updated_at = now()
    where id = p_event_id;
  elsif p_outcome = 'retry'
    and p_retry_at is not null
    and p_retry_at < v_retry_deadline then
    update public.order_email_outbox
    set
      status = 'pending',
      next_attempt_at = p_retry_at,
      last_error = left(coalesce(p_error, 'provider_rejected_transiently'), 1000),
      processing_token = null,
      locked_at = null,
      locked_until = null,
      updated_at = now()
    where id = p_event_id;
  else
    update public.order_email_outbox
    set
      status = case when p_outcome = 'uncertain' then 'uncertain' else 'failed' end,
      last_error = left(coalesce(
        p_error,
        case
          when p_outcome = 'retry' then 'provider_idempotency_window_expired'
          else 'email_delivery_failed'
        end
      ), 1000),
      processing_token = null,
      locked_at = null,
      locked_until = null,
      updated_at = now()
    where id = p_event_id;
  end if;

  return true;
end;
$$;

create or replace function public.resolve_order_completion_email_event(
  p_event_id uuid,
  p_processing_token uuid,
  p_outcome text,
  p_provider_message_id text default null,
  p_error text default null,
  p_retry_at timestamptz default null
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.resolve_order_completion_email_event(
    p_event_id,
    p_processing_token,
    p_outcome,
    p_provider_message_id,
    p_error,
    p_retry_at
  );
$$;

revoke all on function private.claim_order_completion_email_events(integer)
  from public, anon, authenticated;
revoke all on function public.claim_order_completion_email_events(integer)
  from public, anon, authenticated;
revoke all on function private.resolve_order_completion_email_event(uuid, uuid, text, text, text, timestamptz)
  from public, anon, authenticated;
revoke all on function public.resolve_order_completion_email_event(uuid, uuid, text, text, text, timestamptz)
  from public, anon, authenticated;

grant usage on schema private to service_role;
grant execute on function private.claim_order_completion_email_events(integer)
  to service_role;
grant execute on function public.claim_order_completion_email_events(integer)
  to service_role;
grant execute on function private.resolve_order_completion_email_event(uuid, uuid, text, text, text, timestamptz)
  to service_role;
grant execute on function public.resolve_order_completion_email_event(uuid, uuid, text, text, text, timestamptz)
  to service_role;
