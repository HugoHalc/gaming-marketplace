-- Admin order supervision: every administrator can read active work while
-- only the customer or currently assigned staff can participate or operate it.

drop policy if exists order_messages_participant_insert on public.order_messages;
create policy order_messages_participant_insert
on public.order_messages
for insert to authenticated
with check (
  (
    public.is_order_customer(order_id)
    or public.is_assigned_booster(order_id)
  )
  and sender_id = (select auth.uid())
  and sender_role = (
    select p.role from public.profiles p where p.id = auth.uid()
  )
);

create or replace function public.transition_order_operational_state(
  p_order_id uuid,
  p_next_state text,
  p_note text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  v_current text;
  v_is_admin boolean;
  v_is_assigned_staff boolean;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  v_is_admin := public.is_admin_user();
  v_is_assigned_staff := public.is_assigned_booster(p_order_id);

  if not v_is_assigned_staff then
    raise exception 'Only assigned staff can update the order lifecycle.';
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

revoke all on function public.transition_order_operational_state(uuid, text, text)
  from public, anon;
grant execute on function public.transition_order_operational_state(uuid, text, text)
  to authenticated;
