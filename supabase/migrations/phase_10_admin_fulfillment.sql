-- Phase 10: secure admin fulfillment status transitions.
create or replace function public.capture_order_status_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  status_note text;
begin
  status_note := nullif(current_setting('app.order_status_note', true), '');

  if tg_op = 'INSERT' then
    insert into public.order_status_history(order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, coalesce(auth.uid(), new.user_id));
  elsif new.status is distinct from old.status then
    insert into public.order_status_history(order_id, from_status, to_status, note, changed_by)
    values (new.id, old.status, new.status, status_note, auth.uid());
  end if;

  return new;
end;
$$;

revoke execute on function public.capture_order_status_change() from public, anon, authenticated;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  current_status text;
begin
  if actor_id is null or not exists (
    select 1 from public.profiles
    where id = actor_id and role = 'admin'
  ) then
    raise exception 'Admin access required.';
  end if;

  if p_status not in ('queued', 'in_progress', 'completed', 'cancelled') then
    raise exception 'Unsupported admin status.';
  end if;

  select status into current_status
  from public.orders
  where id = p_order_id
  for update;

  if current_status is null then
    raise exception 'Order not found.';
  end if;

  if not (
    (current_status = 'pending_payment' and p_status = 'cancelled') or
    (current_status = 'paid' and p_status in ('queued', 'cancelled')) or
    (current_status = 'queued' and p_status in ('in_progress', 'cancelled')) or
    (current_status = 'in_progress' and p_status in ('completed', 'cancelled'))
  ) then
    raise exception 'Invalid status transition from % to %.', current_status, p_status;
  end if;

  perform set_config('app.order_status_note', left(coalesce(trim(p_note), ''), 500), true);

  update public.orders
  set status = p_status
  where id = p_order_id;
end;
$$;

revoke all on function public.admin_update_order_status(uuid, text, text) from public, anon;
grant execute on function public.admin_update_order_status(uuid, text, text) to authenticated;
