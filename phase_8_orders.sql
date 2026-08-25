-- Phase 8 order domain. Applied to Boostingpedia via Supabase migration.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','queued','in_progress','completed','cancelled','refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  currency text not null default 'USD' check (currency = 'USD'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  game_name text not null,
  service_name text not null,
  service_category text not null check (service_category in ('rank','wins','placements','coaching')),
  configuration jsonb not null default '{}'::jsonb,
  price_breakdown jsonb not null default '[]'::jsonb,
  rule_set_version text not null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_status_history_order_created_idx on public.order_status_history(order_id, created_at);

create or replace function public.set_order_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_order_updated_at();

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

drop trigger if exists orders_capture_status on public.orders;
create trigger orders_capture_status after insert or update of status on public.orders
for each row execute function public.capture_order_status_change();
revoke execute on function public.capture_order_status_change() from public, anon, authenticated;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

revoke all privileges on public.orders, public.order_items, public.order_status_history from anon, authenticated;
grant select on public.orders, public.order_items, public.order_status_history to authenticated;

drop policy if exists orders_customer_read_own on public.orders;
create policy orders_customer_read_own on public.orders for select to authenticated using (user_id = auth.uid());
drop policy if exists orders_admin_read_all on public.orders;
create policy orders_admin_read_all on public.orders for select to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists order_items_customer_read_own on public.order_items;
create policy order_items_customer_read_own on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists order_items_admin_read_all on public.order_items;
create policy order_items_admin_read_all on public.order_items for select to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists order_status_history_customer_read_own on public.order_status_history;
create policy order_status_history_customer_read_own on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists order_status_history_admin_read_all on public.order_status_history;
create policy order_status_history_admin_read_all on public.order_status_history for select to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
