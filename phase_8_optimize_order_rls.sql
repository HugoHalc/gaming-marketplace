-- Follow-up hardening/optimization applied after the Phase 8 order schema.
revoke all privileges on public.orders, public.order_items, public.order_status_history from anon, authenticated;
grant select on public.orders, public.order_items, public.order_status_history to authenticated;

create or replace function public.capture_order_status_change()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history(order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, new.user_id);
  elsif new.status is distinct from old.status then
    insert into public.order_status_history(order_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end; $$;
revoke execute on function public.capture_order_status_change() from public, anon, authenticated;

create index if not exists order_items_game_idx on public.order_items(game_id);
create index if not exists order_items_service_idx on public.order_items(service_id);
create index if not exists order_status_history_changed_by_idx on public.order_status_history(changed_by);

drop policy if exists orders_customer_read_own on public.orders;
drop policy if exists orders_admin_read_all on public.orders;
drop policy if exists orders_read_access on public.orders;
create policy orders_read_access on public.orders for select to authenticated using (
  user_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists order_items_customer_read_own on public.order_items;
drop policy if exists order_items_admin_read_all on public.order_items;
drop policy if exists order_items_read_access on public.order_items;
create policy order_items_read_access on public.order_items for select to authenticated using (
  exists (
    select 1 from public.orders o where o.id = order_id and (
      o.user_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
    )
  )
);

drop policy if exists order_status_history_customer_read_own on public.order_status_history;
drop policy if exists order_status_history_admin_read_all on public.order_status_history;
drop policy if exists order_status_history_read_access on public.order_status_history;
create policy order_status_history_read_access on public.order_status_history for select to authenticated using (
  exists (
    select 1 from public.orders o where o.id = order_id and (
      o.user_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
    )
  )
);
