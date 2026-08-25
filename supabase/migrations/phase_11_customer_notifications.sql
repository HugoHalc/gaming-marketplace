-- Phase 11 customer in-app notifications and event hooks.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  type text not null check (type in (
    'order_created','payment_confirmed','order_queued','order_started',
    'order_completed','order_cancelled','order_refunded'
  )),
  title text not null,
  message text not null,
  href text,
  source_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;
create index if not exists notifications_order_idx
  on public.notifications(order_id);

alter table public.notifications enable row level security;
revoke all privileges on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all privileges on public.notifications to service_role;

drop policy if exists notifications_customer_read_own on public.notifications;
create policy notifications_customer_read_own on public.notifications
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists notifications_customer_mark_read on public.notifications;
create policy notifications_customer_mark_read on public.notifications
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and user_id = auth.uid();
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and read_at is null;
end;
$$;

revoke all on function public.mark_notification_read(uuid) from public, anon;
revoke all on function public.mark_all_notifications_read() from public, anon;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

create or replace function public.create_order_status_notification()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_order_number text;
  v_type text;
  v_title text;
  v_message text;
begin
  select o.user_id, o.order_number
  into v_user_id, v_order_number
  from public.orders o
  where o.id = new.order_id;

  if v_user_id is null then
    return new;
  end if;

  case new.to_status
    when 'pending_payment' then
      v_type := 'order_created';
      v_title := 'Order created';
      v_message := v_order_number || ' is ready for payment.';
    when 'paid' then
      v_type := 'payment_confirmed';
      v_title := 'Payment confirmed';
      v_message := 'Payment for ' || v_order_number || ' was verified successfully.';
    when 'queued' then
      v_type := 'order_queued';
      v_title := 'Order queued';
      v_message := v_order_number || ' is now waiting for fulfillment.';
    when 'in_progress' then
      v_type := 'order_started';
      v_title := 'Fulfillment started';
      v_message := 'Work has started on ' || v_order_number || '.';
    when 'completed' then
      v_type := 'order_completed';
      v_title := 'Order completed';
      v_message := v_order_number || ' has been completed.';
    when 'cancelled' then
      v_type := 'order_cancelled';
      v_title := 'Order cancelled';
      v_message := v_order_number || ' was cancelled.';
    when 'refunded' then
      v_type := 'order_refunded';
      v_title := 'Order refunded';
      v_message := 'The payment for ' || v_order_number || ' was refunded.';
    else
      return new;
  end case;

  insert into public.notifications(user_id, order_id, type, title, message, href, source_key)
  values (
    v_user_id,
    new.order_id,
    v_type,
    v_title,
    v_message,
    '/dashboard/orders/' || new.order_id::text,
    'order-status:' || new.id::text
  )
  on conflict (source_key) do nothing;

  return new;
end;
$$;

revoke execute on function public.create_order_status_notification() from public, anon, authenticated;

drop trigger if exists order_status_create_notification on public.order_status_history;
create trigger order_status_create_notification
after insert on public.order_status_history
for each row execute function public.create_order_status_notification();
