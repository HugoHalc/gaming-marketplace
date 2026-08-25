-- Phase 9 Stripe Checkout payment domain.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists payments_order_created_idx on public.payments(order_id, created_at desc);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_payment_intent_idx on public.payments(stripe_payment_intent_id) where stripe_payment_intent_id is not null;

alter table public.payments enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all privileges on public.payments, public.stripe_webhook_events from anon, authenticated;
grant select on public.payments to authenticated;
grant all privileges on public.payments, public.stripe_webhook_events to service_role;

drop policy if exists payments_read_own_or_admin on public.payments;
create policy payments_read_own_or_admin on public.payments
for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and (
        o.user_id = (select auth.uid())
        or exists (
          select 1 from public.profiles p
          where p.id = (select auth.uid()) and p.role = 'admin'
        )
      )
  )
);
