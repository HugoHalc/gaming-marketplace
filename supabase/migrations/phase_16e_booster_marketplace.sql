-- Phase 16E: Booster Marketplace + Atomic Claim + Payout Foundation
-- Apply AFTER phase_16d_live_chat_secure_access.sql.

create table if not exists public.booster_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  is_active boolean not null default true,
  payout_rate_bps integer not null default 5000
    check (payout_rate_bps between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_booster_profile_updated_at()
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

drop trigger if exists booster_profiles_set_updated_at on public.booster_profiles;
create trigger booster_profiles_set_updated_at
before update on public.booster_profiles
for each row execute function public.set_booster_profile_updated_at();

alter table public.booster_profiles enable row level security;
revoke all on public.booster_profiles from anon, authenticated;
grant select on public.booster_profiles to authenticated;

drop policy if exists booster_profiles_self_read on public.booster_profiles;
create policy booster_profiles_self_read
on public.booster_profiles
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Existing 16D assignment table now stores the commercial snapshot.
alter table public.order_booster_assignments
  add column if not exists payout_rate_bps integer,
  add column if not exists payout_cents integer;

update public.order_booster_assignments a
set
  payout_rate_bps = coalesce(
    a.payout_rate_bps,
    (select bp.payout_rate_bps from public.booster_profiles bp where bp.user_id = a.booster_id),
    5000
  ),
  payout_cents = coalesce(
    a.payout_cents,
    (
      select floor(o.total_cents * coalesce(
        a.payout_rate_bps,
        (select bp2.payout_rate_bps from public.booster_profiles bp2 where bp2.user_id = a.booster_id),
        5000
      ) / 10000.0)::integer
      from public.orders o
      where o.id = a.order_id
    )
  )
where a.payout_rate_bps is null or a.payout_cents is null;

alter table public.order_booster_assignments
  alter column payout_rate_bps set not null,
  alter column payout_cents set not null;

alter table public.order_booster_assignments
  drop constraint if exists order_booster_assignments_payout_rate_check,
  add constraint order_booster_assignments_payout_rate_check
    check (payout_rate_bps between 0 and 10000);

alter table public.order_booster_assignments
  drop constraint if exists order_booster_assignments_payout_cents_check,
  add constraint order_booster_assignments_payout_cents_check
    check (payout_cents >= 0);

-- Assigned boosters can read the underlying order domain.
drop policy if exists orders_booster_read_assigned on public.orders;
create policy orders_booster_read_assigned
on public.orders
for select to authenticated
using (
  exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = id
      and a.booster_id = auth.uid()
      and a.is_active = true
  )
);

drop policy if exists order_items_booster_read_assigned on public.order_items;
create policy order_items_booster_read_assigned
on public.order_items
for select to authenticated
using (
  exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = order_id
      and a.booster_id = auth.uid()
      and a.is_active = true
  )
);

drop policy if exists order_status_history_booster_read_assigned on public.order_status_history;
create policy order_status_history_booster_read_assigned
on public.order_status_history
for select to authenticated
using (
  exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = order_id
      and a.booster_id = auth.uid()
      and a.is_active = true
  )
);

-- Atomic marketplace claim.
-- The order row is locked before assignment, so concurrent claims cannot both win.
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
  on conflict (order_id) do update
  set
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

  -- Accepting an available order means work starts immediately.
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
