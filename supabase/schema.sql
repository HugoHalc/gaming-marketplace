-- Phase 6 database schema for VantaBoost.
-- Apply to the intended Supabase project only after reviewing existing objects.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  short_description text not null default '',
  accent text not null check (accent in ('emerald','rose','violet','cyan','amber','blue')),
  status text not null default 'draft' check (status in ('active','draft','archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  category text not null check (category in ('rank','wins','placements','coaching')),
  description text not null default '',
  starting_price_cents integer not null check (starting_price_cents >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  status text not null default 'draft' check (status in ('active','draft','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, slug)
);

create table if not exists public.service_fields (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  key text not null check (key ~ '^[A-Za-z][A-Za-z0-9]*$'),
  label text not null,
  description text,
  field_type text not null check (field_type in ('select','number','toggle')),
  required boolean not null default false,
  min_value numeric,
  max_value numeric,
  step_value numeric,
  default_value jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (service_id, key),
  check (min_value is null or max_value is null or min_value <= max_value)
);

create table if not exists public.service_field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.service_fields(id) on delete cascade,
  value text not null,
  label text not null,
  price_multiplier numeric(10,4),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (field_id, value),
  check (price_multiplier is null or price_multiplier > 0)
);

create table if not exists public.pricing_rule_sets (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  version text not null,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  effective_from timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (service_id, version)
);

create unique index if not exists pricing_rule_sets_one_active_per_service
  on public.pricing_rule_sets(service_id) where status = 'active';

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  rule_set_id uuid not null references public.pricing_rule_sets(id) on delete cascade,
  rule_type text not null check (rule_type in ('progression','quantity','option_multiplier','boolean_multiplier','threshold_discount')),
  condition jsonb not null default '{}'::jsonb,
  effect jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  created_at timestamptz not null default now()
);

create index if not exists services_game_status_idx on public.services(game_id, status, sort_order);
create index if not exists service_fields_service_sort_idx on public.service_fields(service_id, sort_order);
create index if not exists service_field_options_field_sort_idx on public.service_field_options(field_id, sort_order);
create index if not exists pricing_rules_rule_set_priority_idx on public.pricing_rules(rule_set_id, priority);

alter table public.games enable row level security;
alter table public.services enable row level security;
alter table public.service_fields enable row level security;
alter table public.service_field_options enable row level security;
alter table public.pricing_rule_sets enable row level security;
alter table public.pricing_rules enable row level security;

-- Explicit Data API grants because new Supabase projects no longer auto-expose new tables.
grant usage on schema public to anon, authenticated;
grant select on public.games, public.services, public.service_fields, public.service_field_options to anon, authenticated;
revoke all on public.pricing_rule_sets, public.pricing_rules from anon, authenticated;

drop policy if exists games_public_read_active on public.games;
create policy games_public_read_active on public.games
  for select to anon, authenticated
  using (status = 'active');

drop policy if exists services_public_read_active on public.services;
create policy services_public_read_active on public.services
  for select to anon, authenticated
  using (
    status = 'active'
    and exists (select 1 from public.games g where g.id = game_id and g.status = 'active')
  );

drop policy if exists service_fields_public_read_active on public.service_fields;
create policy service_fields_public_read_active on public.service_fields
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.services s
      join public.games g on g.id = s.game_id
      where s.id = service_id and s.status = 'active' and g.status = 'active'
    )
  );

drop policy if exists service_field_options_public_read_active on public.service_field_options;
create policy service_field_options_public_read_active on public.service_field_options
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_fields sf
      join public.services s on s.id = sf.service_id
      join public.games g on g.id = s.game_id
      where sf.id = field_id and s.status = 'active' and g.status = 'active'
    )
  );

-- No public policies are created for pricing tables. They are server-only.
