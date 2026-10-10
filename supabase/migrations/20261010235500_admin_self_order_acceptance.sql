-- Allow administrators to accept paid work without becoming boosters.
-- Admin assignments intentionally have no payout snapshot until a separate
-- compensation policy is approved.

alter table public.order_booster_assignments
  add column if not exists assignment_kind text;

update public.order_booster_assignments
set assignment_kind = 'booster'
where assignment_kind is null;

alter table public.order_booster_assignments
  alter column assignment_kind set default 'booster',
  alter column assignment_kind set not null,
  alter column payout_rate_bps drop not null,
  alter column payout_cents drop not null;

alter table public.order_booster_assignments
  drop constraint if exists order_booster_assignments_assignment_kind_check,
  add constraint order_booster_assignments_assignment_kind_check
    check (assignment_kind in ('booster', 'admin')),
  drop constraint if exists order_booster_assignments_payout_shape_check,
  add constraint order_booster_assignments_payout_shape_check
    check (
      (
        assignment_kind = 'booster'
        and payout_rate_bps is not null
        and payout_cents is not null
      )
      or (
        assignment_kind = 'admin'
        and payout_rate_bps is null
        and payout_cents is null
      )
    );

create or replace function public.normalize_order_assignment_kind()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.payout_rate_bps is null and new.payout_cents is null then
    new.assignment_kind := 'admin';
  else
    new.assignment_kind := 'booster';
  end if;
  return new;
end;
$$;

drop trigger if exists normalize_order_assignment_kind on public.order_booster_assignments;
create trigger normalize_order_assignment_kind
before insert or update of payout_rate_bps, payout_cents, assignment_kind
on public.order_booster_assignments
for each row execute function public.normalize_order_assignment_kind();

create or replace function private.accept_order_as_admin(p_order_id uuid)
returns table (
  order_id uuid,
  assignment_kind text,
  assigned_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  v_status text;
  v_payment_status text;
  v_assigned_at timestamptz := now();
begin
  if actor_id is null or not exists (
    select 1
    from public.profiles p
    where p.id = actor_id
      and p.role = 'admin'
  ) then
    raise exception 'Administrator access required.';
  end if;

  select o.status, o.payment_status
  into v_status, v_payment_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if v_payment_status <> 'paid' or v_status not in ('paid', 'queued') then
    raise exception 'This order is not available for acceptance.';
  end if;

  if exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = p_order_id
      and a.is_active = true
  ) then
    raise exception 'This order is no longer available.';
  end if;

  insert into public.order_booster_assignments (
    order_id,
    booster_id,
    assigned_by,
    assigned_at,
    is_active,
    payout_rate_bps,
    payout_cents,
    assignment_kind
  )
  values (
    p_order_id,
    actor_id,
    actor_id,
    v_assigned_at,
    true,
    null,
    null,
    'admin'
  )
  on conflict on constraint order_booster_assignments_pkey
  do update set
    booster_id = excluded.booster_id,
    assigned_by = excluded.assigned_by,
    assigned_at = excluded.assigned_at,
    is_active = true,
    payout_rate_bps = null,
    payout_cents = null,
    assignment_kind = 'admin'
  where public.order_booster_assignments.is_active = false;

  if not found then
    raise exception 'This order is no longer available.';
  end if;

  insert into public.order_operational_states (
    order_id,
    state,
    state_note,
    updated_by
  )
  values (
    p_order_id,
    'accepted',
    'Administrator accepted the order.',
    actor_id
  )
  on conflict on constraint order_operational_states_pkey do update set
    state = 'accepted',
    state_note = 'Administrator accepted the order.',
    delivered_at = null,
    auto_complete_at = null,
    completed_at = null,
    updated_by = actor_id;

  insert into public.order_operational_history (
    order_id,
    from_state,
    to_state,
    note,
    changed_by
  )
  values (
    p_order_id,
    null,
    'accepted',
    'Administrator accepted the order.',
    actor_id
  );

  perform set_config(
    'app.order_status_note',
    'Administrator accepted the order.',
    true
  );

  update public.orders
  set status = 'in_progress'
  where id = p_order_id;

  return query
  select p_order_id, 'admin'::text, v_assigned_at;
end;
$$;

create or replace function public.accept_order_as_admin(p_order_id uuid)
returns table (
  order_id uuid,
  assignment_kind text,
  assigned_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.accept_order_as_admin(p_order_id);
$$;

revoke all on function private.accept_order_as_admin(uuid)
  from public, anon, authenticated;
grant execute on function private.accept_order_as_admin(uuid)
  to authenticated;
revoke all on function public.accept_order_as_admin(uuid)
  from public, anon, authenticated;
grant execute on function public.accept_order_as_admin(uuid)
  to authenticated;
