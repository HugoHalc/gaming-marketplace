-- Add PayPal Orders v2 alongside the existing Stripe Checkout integration.
alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('stripe', 'paypal'));

alter table public.payments
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text,
  add column if not exists paypal_payer_id text;

create unique index if not exists payments_paypal_order_id_idx
  on public.payments(paypal_order_id)
  where paypal_order_id is not null;

create unique index if not exists payments_paypal_capture_id_idx
  on public.payments(paypal_capture_id)
  where paypal_capture_id is not null;

create table if not exists public.paypal_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.paypal_webhook_events enable row level security;

revoke all privileges on public.paypal_webhook_events from anon, authenticated;
grant all privileges on public.paypal_webhook_events to service_role;
