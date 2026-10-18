-- BoostingPedia Control Center Phase 01C
-- Read-only administrative integration foundation.
-- This migration does NOT duplicate orders, payments, support, customers or boosters.
-- It only stores authorization artifacts, short-lived sessions and access audit records,
-- plus server-only read functions over the existing source-of-truth tables.

create table if not exists public.control_center_auth_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (char_length(code_hash) = 64),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text not null check (char_length(client_id) between 1 and 120),
  redirect_uri text not null check (char_length(redirect_uri) between 1 and 1000),
  code_challenge text not null check (char_length(code_challenge) between 43 and 128),
  expires_at timestamptz not null,
  used_at timestamptz,
  failed_attempts integer not null default 0 check (failed_attempts between 0 and 5),
  created_at timestamptz not null default now()
);

create index if not exists control_center_auth_codes_expiry_idx
  on public.control_center_auth_codes(expires_at)
  where used_at is null;

alter table public.control_center_auth_codes
  add column if not exists failed_attempts integer not null default 0;
alter table public.control_center_auth_codes
  drop constraint if exists control_center_auth_codes_failed_attempts_check;
alter table public.control_center_auth_codes
  add constraint control_center_auth_codes_failed_attempts_check
  check (failed_attempts between 0 and 5);
alter table public.control_center_auth_codes
  drop constraint if exists control_center_auth_codes_hash_format_check;
alter table public.control_center_auth_codes
  add constraint control_center_auth_codes_hash_format_check
  check (code_hash ~ '^[0-9a-f]{64}$');
alter table public.control_center_auth_codes
  drop constraint if exists control_center_auth_codes_challenge_format_check;
alter table public.control_center_auth_codes
  add constraint control_center_auth_codes_challenge_format_check
  check (code_challenge ~ '^[A-Za-z0-9_-]{43,128}$');

create table if not exists public.control_center_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (char_length(token_hash) = 64),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text not null check (char_length(client_id) between 1 and 120),
  issuer text not null check (char_length(issuer) between 1 and 500),
  audience text not null check (char_length(audience) between 1 and 200),
  scopes text[] not null default array['control_center:read']::text[],
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists control_center_sessions_admin_idx
  on public.control_center_sessions(admin_user_id, expires_at desc);
create index if not exists control_center_sessions_expiry_idx
  on public.control_center_sessions(expires_at)
  where revoked_at is null;

alter table public.control_center_sessions
  drop constraint if exists control_center_sessions_hash_format_check;
alter table public.control_center_sessions
  add constraint control_center_sessions_hash_format_check
  check (token_hash ~ '^[0-9a-f]{64}$');
alter table public.control_center_sessions
  drop constraint if exists control_center_sessions_scope_check;
alter table public.control_center_sessions
  add constraint control_center_sessions_scope_check
  check (scopes = array['control_center:read']::text[]);

create table if not exists public.control_center_access_audit (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.control_center_sessions(id) on delete cascade,
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null,
  request_timestamp timestamptz not null,
  method text not null check (char_length(method) between 1 and 12),
  route text not null check (char_length(route) between 1 and 200),
  ip_hash text,
  user_agent_hash text,
  status_code integer,
  outcome text not null default 'started' check (outcome in ('started','success','client_error','server_error')),
  created_at timestamptz not null default now(),
  unique(session_id, request_id)
);

create index if not exists control_center_access_audit_rate_idx
  on public.control_center_access_audit(session_id, created_at desc);
create index if not exists control_center_access_audit_admin_idx
  on public.control_center_access_audit(admin_user_id, created_at desc);

alter table public.control_center_auth_codes enable row level security;
alter table public.control_center_sessions enable row level security;
alter table public.control_center_access_audit enable row level security;

revoke all privileges on public.control_center_auth_codes from public, anon, authenticated;
revoke all privileges on public.control_center_sessions from public, anon, authenticated;
revoke all privileges on public.control_center_access_audit from public, anon, authenticated;
grant select, insert, update, delete on public.control_center_auth_codes to service_role;
grant select, insert, update, delete on public.control_center_sessions to service_role;
grant select, insert, update on public.control_center_access_audit to service_role;

-- Drop inherited Phase 01A signatures whose result shapes are hardened below.
drop function if exists public.consume_control_center_auth_code(text,text,text,text);
drop function if exists public.begin_control_center_request(
  text,uuid,timestamptz,text,text,text,text,text,text,text,integer,integer
);

create or replace function public.issue_control_center_auth_code(
  p_code_hash text,
  p_admin_user_id uuid,
  p_client_id text,
  p_redirect_uri text,
  p_code_challenge text,
  p_expires_at timestamptz
)
returns table(created boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recent_count integer;
begin
  perform 1 from public.profiles p where p.id = p_admin_user_id for update;
  if not exists (
    select 1 from public.profiles p
    where p.id = p_admin_user_id and p.role = 'admin'
  ) then
    raise exception 'CONTROL_CENTER_ADMIN_REQUIRED';
  end if;
  if p_code_hash !~ '^[0-9a-f]{64}$'
     or char_length(p_client_id) not between 1 and 120
     or char_length(p_redirect_uri) not between 1 and 1000
     or p_code_challenge !~ '^[A-Za-z0-9_-]{43,128}$'
     or p_expires_at <= now()
     or p_expires_at > now() + interval '3 minutes' then
    raise exception 'CONTROL_CENTER_INVALID';
  end if;

  select count(*)::integer into v_recent_count
  from public.control_center_auth_codes c
  where c.admin_user_id = p_admin_user_id
    and c.client_id = p_client_id
    and c.created_at >= now() - interval '5 minutes';
  if v_recent_count >= 10 then
    raise exception 'CONTROL_CENTER_RATE_LIMIT';
  end if;

  insert into public.control_center_auth_codes(
    code_hash, admin_user_id, client_id, redirect_uri, code_challenge, expires_at
  ) values (
    p_code_hash, p_admin_user_id, p_client_id, p_redirect_uri, p_code_challenge, p_expires_at
  );
  return query select true;
end;
$$;

revoke all on function public.issue_control_center_auth_code(text,uuid,text,text,text,timestamptz)
  from public, anon, authenticated;
grant execute on function public.issue_control_center_auth_code(text,uuid,text,text,text,timestamptz)
  to service_role;

create or replace function public.consume_control_center_auth_code(
  p_code_hash text,
  p_client_id text,
  p_redirect_uri text,
  p_code_challenge text
)
returns table(admin_user_id uuid, outcome text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.control_center_auth_codes%rowtype;
begin
  select c.* into v_code
  from public.control_center_auth_codes c
  where c.code_hash = p_code_hash
  for update;

  if v_code.id is null
     or v_code.used_at is not null
     or v_code.expires_at <= now()
     or v_code.client_id <> p_client_id
     or v_code.redirect_uri <> p_redirect_uri then
    return query select null::uuid, 'invalid_grant'::text;
    return;
  end if;

  if v_code.code_challenge <> p_code_challenge then
    update public.control_center_auth_codes c
    set failed_attempts = least(c.failed_attempts + 1, 5),
        used_at = case when c.failed_attempts + 1 >= 5 then now() else c.used_at end
    where c.id = v_code.id;
    return query select null::uuid, 'invalid_grant'::text;
    return;
  end if;

  update public.control_center_auth_codes c set used_at = now() where c.id = v_code.id;
  if not exists (
    select 1 from public.profiles p
    where p.id = v_code.admin_user_id and p.role = 'admin'
  ) then
    return query select null::uuid, 'admin_required'::text;
    return;
  end if;

  return query select v_code.admin_user_id, 'success'::text;
end;
$$;

revoke all on function public.consume_control_center_auth_code(text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.consume_control_center_auth_code(text,text,text,text)
  to service_role;

create or replace function public.begin_control_center_request(
  p_token_hash text,
  p_request_id uuid,
  p_request_timestamp timestamptz,
  p_method text,
  p_route text,
  p_ip_hash text,
  p_user_agent_hash text,
  p_issuer text,
  p_audience text,
  p_required_scope text,
  p_max_requests integer default 120,
  p_window_seconds integer default 60
)
returns table(session_id uuid, admin_user_id uuid, expires_at timestamptz, denial_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.control_center_sessions%rowtype;
  v_recent_count integer;
begin
  if p_request_timestamp is null
     or p_request_timestamp < now() - interval '90 seconds'
     or p_request_timestamp > now() + interval '90 seconds' then
    raise exception 'CONTROL_CENTER_REPLAY_TIMESTAMP';
  end if;
  if p_max_requests is null or p_window_seconds is null
     or p_max_requests < 1 or p_max_requests > 1000
     or p_window_seconds < 1 or p_window_seconds > 3600 then
    raise exception 'CONTROL_CENTER_INVALID_RATE_CONFIG';
  end if;

  select s.* into v_session
  from public.control_center_sessions s
  where s.token_hash = p_token_hash
    and s.revoked_at is null
  limit 1
  for update;

  if v_session.id is null then
    raise exception 'CONTROL_CENTER_INVALID';
  end if;
  if v_session.expires_at <= now() then
    raise exception 'CONTROL_CENTER_EXPIRED';
  end if;
  if p_issuer is null or p_audience is null or p_required_scope is null
     or v_session.issuer <> p_issuer
     or v_session.audience <> p_audience
     or not (p_required_scope = any(v_session.scopes)) then
    raise exception 'CONTROL_CENTER_INVALID';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_session.admin_user_id and p.role = 'admin'
  ) then
    update public.control_center_sessions
    set revoked_at = coalesce(revoked_at, now())
    where id = v_session.id;
    insert into public.control_center_access_audit(
      session_id, admin_user_id, request_id, request_timestamp,
      method, route, ip_hash, user_agent_hash, status_code, outcome
    ) values (
      v_session.id, v_session.admin_user_id, p_request_id, p_request_timestamp,
      left(p_method, 12), left(p_route, 200), p_ip_hash, p_user_agent_hash, 403, 'client_error'
    ) on conflict (session_id, request_id) do nothing;
    return query select v_session.id, v_session.admin_user_id, v_session.expires_at,
      'CONTROL_CENTER_ADMIN_REQUIRED'::text;
    return;
  end if;

  -- Serialize all requests for this session, regardless of rolling-window bucket.
  -- The FOR UPDATE lock above prevents concurrent rate-limit bypasses.
  -- No advisory lock is necessary.

  select count(*)::integer into v_recent_count
  from public.control_center_access_audit a
  where a.session_id = v_session.id
    and a.created_at >= now() - make_interval(secs => p_window_seconds);

  if v_recent_count >= p_max_requests then
    raise exception 'CONTROL_CENTER_RATE_LIMIT';
  end if;

  begin
    insert into public.control_center_access_audit(
      session_id,
      admin_user_id,
      request_id,
      request_timestamp,
      method,
      route,
      ip_hash,
      user_agent_hash
    ) values (
      v_session.id,
      v_session.admin_user_id,
      p_request_id,
      p_request_timestamp,
      left(p_method, 12),
      left(p_route, 200),
      p_ip_hash,
      p_user_agent_hash
    );
  exception when unique_violation then
    raise exception 'CONTROL_CENTER_REPLAY';
  end;

  update public.control_center_sessions
  set last_seen_at = now()
  where id = v_session.id;

  return query
  select v_session.id, v_session.admin_user_id, v_session.expires_at, null::text;
end;
$$;

revoke all on function public.begin_control_center_request(
  text,uuid,timestamptz,text,text,text,text,text,text,text,integer,integer
) from public, anon, authenticated;
grant execute on function public.begin_control_center_request(
  text,uuid,timestamptz,text,text,text,text,text,text,text,integer,integer
) to service_role;

create or replace function public.revoke_control_center_session(
  p_session_id uuid,
  p_admin_user_id uuid
)
returns table(revoked boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  update public.control_center_sessions s
  set revoked_at = coalesce(s.revoked_at, now())
  where s.id = p_session_id
    and s.admin_user_id = p_admin_user_id;
  get diagnostics v_updated = row_count;
  return query select v_updated = 1;
end;
$$;

revoke all on function public.revoke_control_center_session(uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.revoke_control_center_session(uuid,uuid)
  to service_role;

create or replace function public.control_center_overview(p_admin_user_id uuid)
returns table(
  total_orders bigint,
  pending_assignment_orders bigint,
  in_progress_orders bigint,
  open_support_conversations bigint,
  confirmed_revenue_cents bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = p_admin_user_id and p.role = 'admin'
  ) then
    raise exception 'CONTROL_CENTER_ADMIN_REQUIRED';
  end if;

  return query
  select
    (select count(*) from public.orders),
    (
      select count(*)
      from public.orders o
      where o.payment_status = 'paid'
        and o.status in ('paid','queued')
        and not exists (
          select 1 from public.order_booster_assignments a
          where a.order_id = o.id and a.is_active = true
        )
    ),
    (select count(*) from public.orders o where o.status = 'in_progress'),
    (select count(*) from public.support_conversations c where c.status = 'open'),
    (
      select coalesce(sum(o.total_cents), 0)::bigint
      from public.orders o
      where o.payment_status = 'paid'
    ),
    now();
end;
$$;

revoke all on function public.control_center_overview(uuid) from public, anon, authenticated;
grant execute on function public.control_center_overview(uuid) to service_role;

create or replace function public.control_center_list_orders(
  p_admin_user_id uuid,
  p_search text default '',
  p_status text default null,
  p_payment_status text default null,
  p_game text default null,
  p_offset integer default 0,
  p_limit integer default 26
)
returns table(
  id uuid,
  order_number text,
  game_name text,
  service_name text,
  total_cents integer,
  currency text,
  payment_status text,
  fulfillment_status text,
  assignee_id uuid,
  assignment_kind text,
  assignee_display_name text,
  assigned_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = p_admin_user_id and p.role = 'admin'
  ) then
    raise exception 'CONTROL_CENTER_ADMIN_REQUIRED';
  end if;
  if p_offset is null or p_limit is null or p_offset < 0 or p_offset > 1000000 or p_limit < 1 or p_limit > 101
     or char_length(coalesce(p_search, '')) > 100
     or char_length(coalesce(p_status, '')) > 80
     or char_length(coalesce(p_payment_status, '')) > 80
     or char_length(coalesce(p_game, '')) > 80 then
    raise exception 'CONTROL_CENTER_INVALID_QUERY';
  end if;

  return query
  select
    o.id,
    o.order_number::text,
    item.game_name::text,
    item.service_name::text,
    o.total_cents,
    o.currency::text,
    o.payment_status::text,
    o.status::text,
    assignment.booster_id,
    assignment.assignment_kind::text,
    coalesce(profile.gamer_tag, profile.full_name)::text,
    assignment.assigned_at,
    o.created_at,
    o.updated_at
  from public.orders o
  left join lateral (
    select oi.game_name, oi.service_name
    from public.order_items oi
    where oi.order_id = o.id
    order by oi.id
    limit 1
  ) item on true
  left join lateral (
    select a.booster_id, a.assignment_kind, a.assigned_at
    from public.order_booster_assignments a
    where a.order_id = o.id and a.is_active = true
    order by a.assigned_at desc
    limit 1
  ) assignment on true
  left join public.profiles profile on profile.id = assignment.booster_id
  where (p_status is null or o.status::text = p_status)
    and (p_payment_status is null or o.payment_status::text = p_payment_status)
    and (p_game is null or lower(coalesce(item.game_name, '')) = lower(p_game))
    and (
      coalesce(trim(p_search), '') = ''
      or lower(o.order_number) like '%' || lower(trim(p_search)) || '%'
      or lower(coalesce(item.game_name, '')) like '%' || lower(trim(p_search)) || '%'
      or lower(coalesce(item.service_name, '')) like '%' || lower(trim(p_search)) || '%'
    )
  order by o.created_at desc, o.id desc
  offset p_offset
  limit p_limit;
end;
$$;

revoke all on function public.control_center_list_orders(uuid,text,text,text,text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.control_center_list_orders(uuid,text,text,text,text,integer,integer)
  to service_role;


create or replace function public.control_center_list_support(
  p_admin_user_id uuid,
  p_status text default null,
  p_offset integer default 0,
  p_limit integer default 26
)
returns table(
  id uuid,
  status text,
  unread_count bigint,
  latest_message_body text,
  latest_message_sender_type text,
  latest_message_created_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = p_admin_user_id and p.role = 'admin'
  ) then
    raise exception 'CONTROL_CENTER_ADMIN_REQUIRED';
  end if;
  if (p_status is not null and p_status not in ('open','closed'))
     or p_offset is null or p_limit is null or p_offset < 0 or p_offset > 1000000 or p_limit < 1 or p_limit > 101 then
    raise exception 'CONTROL_CENTER_INVALID_QUERY';
  end if;

  return query
  select
    c.id,
    c.status::text,
    count(a.id) filter (where a.read_at is null)::bigint,
    latest.body::text,
    latest.sender_type::text,
    latest.created_at,
    c.last_message_at,
    c.created_at,
    c.updated_at
  from public.support_conversations c
  left join lateral (
    select m.body, m.sender_type, m.created_at
    from public.support_messages m
    where m.conversation_id = c.id
    order by m.created_at desc, m.id desc
    limit 1
  ) latest on true
  left join public.support_admin_alerts a
    on a.conversation_id = c.id
   and a.admin_user_id = p_admin_user_id
  where (p_status is null or c.status = p_status)
  group by c.id, latest.body, latest.sender_type, latest.created_at
  order by c.last_message_at desc, c.id desc
  offset p_offset
  limit p_limit;
end;
$$;

revoke all on function public.control_center_list_support(uuid,text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.control_center_list_support(uuid,text,integer,integer)
  to service_role;

create or replace function public.control_center_list_boosters(
  p_admin_user_id uuid,
  p_search text default '',
  p_active_only boolean default true,
  p_offset integer default 0,
  p_limit integer default 26
)
returns table(
  user_id uuid,
  full_name text,
  gamer_tag text,
  is_active boolean,
  activated_at timestamptz,
  updated_at timestamptz,
  game_slugs text[],
  assigned_order_count bigint,
  last_seen_at text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = p_admin_user_id and p.role = 'admin'
  ) then
    raise exception 'CONTROL_CENTER_ADMIN_REQUIRED';
  end if;
  if p_offset is null or p_limit is null or p_offset < 0 or p_offset > 1000000 or p_limit < 1 or p_limit > 101
     or char_length(coalesce(p_search, '')) > 100 then
    raise exception 'CONTROL_CENTER_INVALID_QUERY';
  end if;

  return query
  select
    bp.user_id,
    p.full_name::text,
    p.gamer_tag::text,
    bp.is_active,
    bp.activated_at,
    bp.updated_at,
    array(
      select e.game_slug
      from public.booster_game_eligibilities e
      where e.booster_id = bp.user_id
      order by e.game_slug
    )::text[],
    (
      select count(*)
      from public.order_booster_assignments a
      join public.orders o on o.id = a.order_id
      where a.booster_id = bp.user_id
        and a.is_active = true
        and o.status not in ('completed','cancelled','refunded')
    ),
    null::text
  from public.booster_profiles bp
  join public.profiles p on p.id = bp.user_id
  where (not p_active_only or bp.is_active = true)
    and (
      coalesce(trim(p_search), '') = ''
      or lower(coalesce(p.full_name, '')) like '%' || lower(trim(p_search)) || '%'
      or lower(coalesce(p.gamer_tag, '')) like '%' || lower(trim(p_search)) || '%'
    )
  order by bp.is_active desc, coalesce(p.gamer_tag, p.full_name, bp.user_id::text), bp.user_id
  offset p_offset
  limit p_limit;
end;
$$;

revoke all on function public.control_center_list_boosters(uuid,text,boolean,integer,integer)
  from public, anon, authenticated;
grant execute on function public.control_center_list_boosters(uuid,text,boolean,integer,integer)
  to service_role;

-- MANUAL maintenance only: run via service role / SQL editor on a schedule if desired.
-- Preserve access audit rows for independent retention before pruning sessions.
create or replace function public.cleanup_control_center_auth_artifacts()
returns table(deleted_codes bigint, deleted_sessions bigint)
language plpgsql security definer set search_path = '' as $$
declare v_codes bigint; v_sessions bigint;
begin
  delete from public.control_center_auth_codes
   where expires_at < now() - interval '1 day';
  get diagnostics v_codes = row_count;
  -- Do not cascade-delete audit records: sessions with audit history remain.
  delete from public.control_center_sessions s
   where s.expires_at < now() - interval '30 days'
     and not exists (select 1 from public.control_center_access_audit a where a.session_id = s.id);
  get diagnostics v_sessions = row_count;
  return query select v_codes, v_sessions;
end; $$;
revoke all on function public.cleanup_control_center_auth_artifacts() from public, anon, authenticated;
grant execute on function public.cleanup_control_center_auth_artifacts() to service_role;
