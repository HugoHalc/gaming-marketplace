-- Phase 16F
-- Accept Order hotfix + User Integrity + Screenshot URL Evidence + Completion Gate
-- Apply after Phase 16E.2.

-- 1) Customer/player identity snapshot per order.
-- Historical rows can be searched by customer_user_id to recognize IDs used before.
create table if not exists public.order_integrity_records (
  order_id uuid primary key references public.orders(id) on delete cascade,
  customer_user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (char_length(platform) between 1 and 80),
  player_id text not null check (char_length(player_id) between 1 and 160),
  internal_note text check (internal_note is null or char_length(internal_note) <= 500),
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_integrity_customer_history_idx
  on public.order_integrity_records(customer_user_id, updated_at desc);

create table if not exists public.order_evidence_links (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('start', 'delivery')),
  url text not null check (
    char_length(url) between 8 and 2048
    and url ~* '^https://'
  ),
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, evidence_type)
);

create index if not exists order_evidence_order_idx
  on public.order_evidence_links(order_id, evidence_type);

create or replace function public.set_phase16f_updated_at()
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

drop trigger if exists order_integrity_set_updated_at on public.order_integrity_records;
create trigger order_integrity_set_updated_at
before update on public.order_integrity_records
for each row execute function public.set_phase16f_updated_at();

drop trigger if exists order_evidence_set_updated_at on public.order_evidence_links;
create trigger order_evidence_set_updated_at
before update on public.order_evidence_links
for each row execute function public.set_phase16f_updated_at();

-- These operational tables are server-endpoint only.
alter table public.order_integrity_records enable row level security;
alter table public.order_evidence_links enable row level security;

revoke all on public.order_integrity_records from anon, authenticated;
revoke all on public.order_evidence_links from anon, authenticated;

grant select, insert, update, delete
on public.order_integrity_records
to service_role;

grant select, insert, update, delete
on public.order_evidence_links
to service_role;

-- 2) Accept Order hotfix.
-- Phase 16E used ON CONFLICT (order_id) inside a RETURNS TABLE function where
-- order_id is also an output variable. PostgreSQL reports that reference as ambiguous.
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
    order_id,
    booster_id,
    assigned_by,
    assigned_at,
    is_active,
    payout_rate_bps,
    payout_cents
  )
  values (
    p_order_id,
    actor_id,
    actor_id,
    now(),
    true,
    v_rate_bps,
    v_payout_cents
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

-- 3) Completion is transactional and server-enforced.
create or replace function public.complete_booster_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  v_status text;
  v_payment_status text;
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  if not (
    public.is_admin_user()
    or public.is_assigned_booster(p_order_id)
  ) then
    raise exception 'Order access denied.';
  end if;

  select o.status, o.payment_status
  into v_status, v_payment_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if v_status is null then
    raise exception 'Order not found.';
  end if;

  if v_payment_status <> 'paid' or v_status <> 'in_progress' then
    raise exception 'Only a paid order in progress can be completed.';
  end if;

  if not exists (
    select 1
    from public.order_integrity_records i
    where i.order_id = p_order_id
  ) then
    raise exception 'User Integrity Validation is required.';
  end if;

  if not exists (
    select 1
    from public.order_evidence_links e
    where e.order_id = p_order_id
      and e.evidence_type = 'start'
  ) then
    raise exception 'Start Order Screenshot is required.';
  end if;

  if not exists (
    select 1
    from public.order_evidence_links e
    where e.order_id = p_order_id
      and e.evidence_type = 'delivery'
  ) then
    raise exception 'Deliver Order Screenshot is required.';
  end if;

  perform set_config('app.order_status_note', 'Order completed after delivery evidence.', true);

  update public.orders
  set status = 'completed'
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.complete_booster_order(uuid) from public, anon;
grant execute on function public.complete_booster_order(uuid) to authenticated;
