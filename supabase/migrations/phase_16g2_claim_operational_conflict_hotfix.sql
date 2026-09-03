-- Phase 16G.2
-- Fix ambiguous ON CONFLICT target inside claim_order_for_booster.
-- No data migration. No pricing/payout changes.

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

  insert into public.order_operational_states (
    order_id, state, state_note, updated_by
  )
  values (
    p_order_id, 'accepted', 'Booster accepted the order.', actor_id
  )
  on conflict on constraint order_operational_states_pkey
  do update set
    state = 'accepted',
    state_note = 'Booster accepted the order.',
    delivered_at = null,
    auto_complete_at = null,
    completed_at = null,
    updated_by = actor_id;

  insert into public.order_operational_history (
    order_id, from_state, to_state, note, changed_by
  )
  values (
    p_order_id, null, 'accepted', 'Booster accepted the order.', actor_id
  );

  perform set_config(
    'app.order_status_note',
    'Booster accepted the order.',
    true
  );

  update public.orders
  set status = 'in_progress'
  where id = p_order_id;

  return query
  select p_order_id, v_payout_cents, v_rate_bps;
end;
$$;

revoke all on function public.claim_order_for_booster(uuid) from public, anon;
grant execute on function public.claim_order_for_booster(uuid) to authenticated;
