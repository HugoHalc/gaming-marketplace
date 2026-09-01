-- Phase 16E.1 hotfix
-- Fixes recursive RLS and overly-broad booster order-item/history policies.

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_order_customer(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and o.user_id = auth.uid()
  );
$$;

create or replace function public.is_assigned_booster(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = p_order_id
      and a.booster_id = auth.uid()
      and a.is_active = true
  );
$$;

revoke all on function public.is_admin_user() from public, anon;
revoke all on function public.is_order_customer(uuid) from public, anon;
revoke all on function public.is_assigned_booster(uuid) from public, anon;
grant execute on function public.is_admin_user() to authenticated;
grant execute on function public.is_order_customer(uuid) to authenticated;
grant execute on function public.is_assigned_booster(uuid) to authenticated;

-- Remove recursive policies introduced in 16E.
drop policy if exists orders_booster_read_assigned on public.orders;
create policy orders_booster_read_assigned
on public.orders
for select to authenticated
using (public.is_assigned_booster(id));

drop policy if exists order_items_booster_read_assigned on public.order_items;
create policy order_items_booster_read_assigned
on public.order_items
for select to authenticated
using (public.is_assigned_booster(order_id));

drop policy if exists order_status_history_booster_read_assigned on public.order_status_history;
create policy order_status_history_booster_read_assigned
on public.order_status_history
for select to authenticated
using (public.is_assigned_booster(order_id));

-- Assignment policy must not query orders through normal RLS, otherwise it
-- creates orders -> assignments -> orders recursion.
drop policy if exists order_assignments_participant_read on public.order_booster_assignments;
create policy order_assignments_participant_read
on public.order_booster_assignments
for select to authenticated
using (
  booster_id = auth.uid()
  or public.is_order_customer(order_id)
  or public.is_admin_user()
);

-- Also simplify booster profile admin check through a definer helper.
drop policy if exists booster_profiles_self_read on public.booster_profiles;
create policy booster_profiles_self_read
on public.booster_profiles
for select to authenticated
using (
  user_id = auth.uid()
  or public.is_admin_user()
);

-- Keep can_access_order aligned with the non-recursive helpers.
create or replace function public.can_access_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.is_order_customer(p_order_id)
    or public.is_admin_user()
    or public.is_assigned_booster(p_order_id);
$$;

revoke all on function public.can_access_order(uuid) from public, anon;
grant execute on function public.can_access_order(uuid) to authenticated;
