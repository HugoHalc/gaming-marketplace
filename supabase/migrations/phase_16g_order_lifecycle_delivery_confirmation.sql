-- Phase 16G
-- Operational lifecycle + customer delivery confirmation + 48-hour auto completion.
-- Apply after Phase 16F.

create extension if not exists pg_cron with schema extensions;

create table if not exists public.order_operational_states (
  order_id uuid primary key references public.orders(id) on delete cascade,
  state text not null check (
    state in ('accepted', 'in_progress', 'waiting_customer', 'issue', 'delivered', 'completed')
  ),
  state_note text check (state_note is null or char_length(state_note) <= 500),
  delivered_at timestamptz,
  auto_complete_at timestamptz,
  completed_at timestamptz,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_operational_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_state text,
  to_state text not null,
  note text check (note is null or char_length(note) <= 500),
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_operational_history_order_idx
  on public.order_operational_history(order_id, created_at asc);

create index if not exists order_operational_auto_complete_idx
  on public.order_operational_states(auto_complete_at)
  where state = 'delivered';

create or replace function public.set_order_operational_updated_at()
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

drop trigger if exists order_operational_states_updated_at on public.order_operational_states;
create trigger order_operational_states_updated_at
before update on public.order_operational_states
for each row execute function public.set_order_operational_updated_at();

alter table public.order_operational_states enable row level security;
alter table public.order_operational_history enable row level security;

revoke all on public.order_operational_states from anon, authenticated;
revoke all on public.order_operational_history from anon, authenticated;

grant select, insert, update, delete on public.order_operational_states to service_role;
grant select, insert, update, delete on public.order_operational_history to service_role;

-- Backfill existing assigned orders.
insert into public.order_operational_states (
  order_id,
  state,
  delivered_at,
  auto_complete_at,
  completed_at,
  updated_by
)
select
  o.id,
  case
    when o.status = 'completed' then 'completed'
    else 'in_progress'
  end,
  null,
  null,
  case when o.status = 'completed' then o.updated_at else null end,
  a.booster_id
from public.orders o
join public.order_booster_assignments a
  on a.order_id = o.id
 and a.is_active = true
where o.status in ('paid', 'queued', 'in_progress', 'completed')
on conflict (order_id) do nothing;

insert into public.order_operational_history(order_id, from_state, to_state, note, changed_by)
select
  s.order_id,
  null,
  s.state,
  'Operational lifecycle initialized.',
  s.updated_by
from public.order_operational_states s
where not exists (
  select 1
  from public.order_operational_history h
  where h.order_id = s.order_id
);

-- Accept Order remains atomic and now initializes the operational lifecycle.
create or replace function public.claim_order_for_booster(p_order_id uuid)
returns table (
  order_id uuid,
  payout_cents integer,
  payout_rate_bps integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  v_status text;
  v_payment_status text;
  v_total_cents integer;
  v_rate_bps integer;
  v_payout_cents integer;
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  select bp.payout_rate_bps
  into v_rate_bps
  from public.booster_profiles bp
  where bp.user_id = actor_id
    and bp.is_active = true;

  if v_rate_bps is null then
    raise exception 'Active booster access required.';
  end if;

  select o.status, o.payment_status, o.total_cents
  into v_status, v_payment_status, v_total_cents
  from public.orders o
  where o.id = p_order_id
  for update;

  if v_status is null then
    raise exception 'Order not found.';
  end if;

  if v_payment_status <> 'paid' or v_status not in ('paid', 'queued') then
    raise exception 'This order is not available for claiming.';
  end if;

  if exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = p_order_id
      and a.is_active = true
  ) then
    raise exception 'This order is no longer available.';
  end if;

  v_payout_cents := floor(v_total_cents * v_rate_bps / 10000.0)::integer;

  insert into public.order_booster_assignments (
    order_id, booster_id, assigned_by, assigned_at,
    is_active, payout_rate_bps, payout_cents
  )
  values (
    p_order_id, actor_id, actor_id, now(),
    true, v_rate_bps, v_payout_cents
  )
  on conflict on constraint order_booster_assignments_pkey
  do update set
    booster_id = excluded.booster_id,
    assigned_by = excluded.assigned_by,
    assigned_at = excluded.assigned_at,
    is_active = true,
    payout_rate_bps = excluded.payout_rate_bps,
    payout_cents = excluded.payout_cents
  where public.order_booster_assignments.is_active = false;

  if not found then
    raise exception 'This order is no longer available.';
  end if;

  insert into public.order_operational_states(
    order_id, state, state_note, updated_by
  )
  values (
    p_order_id, 'accepted', 'Booster accepted the order.', actor_id
  )
  on conflict (order_id) do update set
    state = 'accepted',
    state_note = 'Booster accepted the order.',
    delivered_at = null,
    auto_complete_at = null,
    completed_at = null,
    updated_by = actor_id;

  insert into public.order_operational_history(
    order_id, from_state, to_state, note, changed_by
  )
  values (
    p_order_id, null, 'accepted', 'Booster accepted the order.', actor_id
  );

  perform set_config('app.order_status_note', 'Booster accepted the order.', true);

  update public.orders
  set status = 'in_progress'
  where id = p_order_id;

  return query
  select p_order_id, v_payout_cents, v_rate_bps;
end;
$$;

revoke all on function public.claim_order_for_booster(uuid) from public, anon;
grant execute on function public.claim_order_for_booster(uuid) to authenticated;

-- Booster/admin operational transitions.
create or replace function public.transition_order_operational_state(
  p_order_id uuid,
  p_next_state text,
  p_note text default null
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  v_current text;
  v_is_admin boolean;
  v_is_booster boolean;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  v_is_admin := public.is_admin_user();
  v_is_booster := public.is_assigned_booster(p_order_id);

  if not (v_is_admin or v_is_booster) then
    raise exception 'Order access denied.';
  end if;

  select s.state
  into v_current
  from public.order_operational_states s
  where s.order_id = p_order_id
  for update;

  if v_current is null then
    raise exception 'Operational state not found.';
  end if;

  if p_next_state not in ('in_progress', 'waiting_customer', 'issue', 'delivered') then
    raise exception 'Invalid operational transition.';
  end if;

  if p_next_state = 'issue' and v_note is null then
    raise exception 'A problem note is required.';
  end if;

  if p_next_state = 'in_progress' then
    if v_current not in ('accepted', 'waiting_customer') and not (v_is_admin and v_current = 'issue') then
      raise exception 'This order cannot start/resume from its current state.';
    end if;
  elsif p_next_state = 'waiting_customer' then
    if v_current <> 'in_progress' then
      raise exception 'Only work in progress can wait for the customer.';
    end if;
  elsif p_next_state = 'issue' then
    if v_current not in ('accepted', 'in_progress', 'waiting_customer', 'delivered') then
      raise exception 'A problem cannot be reported from the current state.';
    end if;
  elsif p_next_state = 'delivered' then
    if v_current not in ('in_progress', 'waiting_customer') then
      raise exception 'Only active work can be delivered.';
    end if;

    if not exists (
      select 1 from public.order_integrity_records i
      where i.order_id = p_order_id
    ) then
      raise exception 'User Integrity Validation is required.';
    end if;

    if not exists (
      select 1 from public.order_evidence_links e
      where e.order_id = p_order_id and e.evidence_type = 'start'
    ) then
      raise exception 'Start Order Screenshot is required.';
    end if;

    if not exists (
      select 1 from public.order_evidence_links e
      where e.order_id = p_order_id and e.evidence_type = 'delivery'
    ) then
      raise exception 'Deliver Order Screenshot is required.';
    end if;
  end if;

  update public.order_operational_states
  set
    state = p_next_state,
    state_note = v_note,
    delivered_at = case when p_next_state = 'delivered' then now() else delivered_at end,
    auto_complete_at = case
      when p_next_state = 'delivered' then now() + interval '48 hours'
      when p_next_state = 'issue' then null
      else auto_complete_at
    end,
    updated_by = actor_id
  where order_id = p_order_id;

  insert into public.order_operational_history(
    order_id, from_state, to_state, note, changed_by
  )
  values (
    p_order_id, v_current, p_next_state, v_note, actor_id
  );

  return p_next_state;
end;
$$;

revoke all on function public.transition_order_operational_state(uuid, text, text) from public, anon;
grant execute on function public.transition_order_operational_state(uuid, text, text) to authenticated;

-- Customer confirms delivered work.
create or replace function public.confirm_order_delivery(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  v_customer_id uuid;
  v_current text;
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  select o.user_id
  into v_customer_id
  from public.orders o
  where o.id = p_order_id;

  if v_customer_id is null or v_customer_id <> actor_id then
    raise exception 'Only the customer can confirm this delivery.';
  end if;

  select s.state
  into v_current
  from public.order_operational_states s
  where s.order_id = p_order_id
  for update;

  if v_current <> 'delivered' then
    raise exception 'This order is not waiting for delivery confirmation.';
  end if;

  update public.order_operational_states
  set
    state = 'completed',
    state_note = 'Customer confirmed delivery.',
    auto_complete_at = null,
    completed_at = now(),
    updated_by = actor_id
  where order_id = p_order_id;

  insert into public.order_operational_history(
    order_id, from_state, to_state, note, changed_by
  )
  values (
    p_order_id, 'delivered', 'completed', 'Customer confirmed delivery.', actor_id
  );

  perform set_config('app.order_status_note', 'Customer confirmed delivery.', true);

  update public.orders
  set status = 'completed'
  where id = p_order_id
    and status = 'in_progress';

  return true;
end;
$$;

revoke all on function public.confirm_order_delivery(uuid) from public, anon;
grant execute on function public.confirm_order_delivery(uuid) to authenticated;

-- Customer can stop the 48-hour auto completion by reporting a problem.
create or replace function public.report_delivery_problem(
  p_order_id uuid,
  p_note text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  v_customer_id uuid;
  v_current text;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  if v_note is null then
    raise exception 'Please describe the problem.';
  end if;

  if char_length(v_note) > 500 then
    raise exception 'Problem description is too long.';
  end if;

  select o.user_id
  into v_customer_id
  from public.orders o
  where o.id = p_order_id;

  if v_customer_id is null or v_customer_id <> actor_id then
    raise exception 'Only the customer can report a delivery problem.';
  end if;

  select s.state
  into v_current
  from public.order_operational_states s
  where s.order_id = p_order_id
  for update;

  if v_current <> 'delivered' then
    raise exception 'This order is not waiting for delivery confirmation.';
  end if;

  update public.order_operational_states
  set
    state = 'issue',
    state_note = v_note,
    auto_complete_at = null,
    updated_by = actor_id
  where order_id = p_order_id;

  insert into public.order_operational_history(
    order_id, from_state, to_state, note, changed_by
  )
  values (
    p_order_id, 'delivered', 'issue', v_note, actor_id
  );

  return true;
end;
$$;

revoke all on function public.report_delivery_problem(uuid, text) from public, anon;
grant execute on function public.report_delivery_problem(uuid, text) to authenticated;

-- Direct booster completion from Phase 16F is disabled.
revoke execute on function public.complete_booster_order(uuid) from authenticated;

-- Cron target. No customer action after 48 hours = accepted delivery.
create or replace function public.auto_complete_delivered_orders()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select s.order_id
    from public.order_operational_states s
    join public.orders o on o.id = s.order_id
    where s.state = 'delivered'
      and s.auto_complete_at is not null
      and s.auto_complete_at <= now()
      and o.status = 'in_progress'
      and o.payment_status = 'paid'
    for update of s skip locked
  loop
    update public.order_operational_states
    set
      state = 'completed',
      state_note = 'Automatically completed after 48 hours without a customer issue.',
      auto_complete_at = null,
      completed_at = now(),
      updated_by = null
    where order_id = r.order_id;

    insert into public.order_operational_history(
      order_id, from_state, to_state, note, changed_by
    )
    values (
      r.order_id,
      'delivered',
      'completed',
      'Automatically completed after 48 hours without a customer issue.',
      null
    );

    perform set_config(
      'app.order_status_note',
      'Automatically completed after 48 hours without a customer issue.',
      true
    );

    update public.orders
    set status = 'completed'
    where id = r.order_id
      and status = 'in_progress';

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.auto_complete_delivered_orders() from public, anon, authenticated;

-- Run every 15 minutes. Unschedule older job if this migration is reapplied.
do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'boostingpedia-auto-complete-deliveries'
  limit 1;

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'boostingpedia-auto-complete-deliveries',
    '*/15 * * * *',
    'select public.auto_complete_delivered_orders();'
  );
end $$;
