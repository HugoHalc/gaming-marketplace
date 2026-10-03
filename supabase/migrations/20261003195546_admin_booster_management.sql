-- Existing boosters intentionally receive no automatic game approvals.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Own-row RLS does not protect authorization columns. Preserve account settings
-- while preventing direct role escalation (including an admin's accidental downgrade).
revoke update on public.profiles from public, anon, authenticated;
revoke update (id, role, created_at, updated_at) on public.profiles from public, anon, authenticated;
grant update (full_name, phone, gamer_tag, avatar_url, updated_at) on public.profiles to authenticated;

alter table public.booster_profiles add column activated_at timestamptz;
create table public.booster_game_eligibilities (
  booster_id uuid not null references public.booster_profiles(user_id) on delete cascade,
  game_slug text not null check (game_slug in ('rocket-league','league-of-legends','valorant','marvel-rivals','overwatch-2','dota-2','rainbow-six-siege')),
  created_at timestamptz not null default now(),
  primary key (booster_id, game_slug)
);
alter table public.booster_game_eligibilities enable row level security;
revoke all on public.booster_game_eligibilities from anon, authenticated;
grant select on public.booster_game_eligibilities to authenticated;
create policy booster_own_game_eligibilities on public.booster_game_eligibilities
  for select to authenticated using (booster_id = (select auth.uid()));


create table private.booster_management_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references public.profiles(id),
  booster_id uuid not null references public.profiles(id),
  action text not null check (action in ('enable', 'save', 'disable')),
  before_values jsonb not null,
  after_values jsonb not null,
  created_at timestamptz not null default now()
);
create index booster_management_audit_actor_idx on private.booster_management_audit(actor_id);
create index booster_management_audit_booster_idx on private.booster_management_audit(booster_id, created_at desc);
alter table private.booster_management_audit enable row level security;
revoke all on private.booster_management_audit from public, anon, authenticated;

-- Every item must resolve to an approved canonical game. Legacy snapshots may
-- have a null game_id; only the canonical catalog name/slug resolves that case.
create function private.booster_can_claim_game(p_booster uuid, p_order uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.order_items i where i.order_id = p_order)
    and not exists (
      select 1 from public.order_items i where i.order_id = p_order
      and not exists (
        select 1 from public.booster_game_eligibilities e
        where e.booster_id = p_booster
          and e.game_slug = coalesce(
            (select g.slug from public.games g where g.id = i.game_id),
            case when i.game_id is null then
              trim(both '-' from regexp_replace(lower(trim(i.game_name)), '[^a-z0-9]+', '-', 'g'))
            end)
      )
    );
$$;
revoke all on function private.booster_can_claim_game(uuid, uuid) from public, anon, authenticated;

create function private.admin_booster_accounts(p_query text, p_page integer, p_boosters_only boolean, p_user_id uuid)
returns table(user_id uuid, email text, full_name text, gamer_tag text, role text,
  is_active boolean, payout_rate_bps integer, activated_at timestamptz, game_slugs text[])
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'Administrator access required.';
  end if;
  if p_page is null or p_page < 0 or p_page > 100000 or p_query is null or length(p_query) > 100 then
    raise exception 'Invalid search.';
  end if;
  return query
  select p.id, u.email::text, p.full_name::text, p.gamer_tag::text, p.role::text,
    b.is_active, b.payout_rate_bps, b.activated_at,
    array(select e.game_slug from public.booster_game_eligibilities e where e.booster_id = p.id order by e.game_slug)
  from public.profiles p join auth.users u on u.id = p.id
  left join public.booster_profiles b on b.user_id = p.id
  where (not p_boosters_only or b.user_id is not null)
    and (p_user_id is null or p.id = p_user_id)
    and (p_query = '' or position(lower(p_query) in lower(coalesce(u.email,'') || ' ' || coalesce(p.full_name,'') || ' ' || coalesce(p.gamer_tag,''))) > 0)
  order by p.id limit 21 offset p_page * 20;
end;
$$;
create function public.admin_booster_accounts(p_query text default '', p_page integer default 0,
  p_boosters_only boolean default true, p_user_id uuid default null)
returns table(user_id uuid, email text, full_name text, gamer_tag text, role text,
  is_active boolean, payout_rate_bps integer, activated_at timestamptz, game_slugs text[])
language sql security invoker set search_path = '' as $$
  select * from private.admin_booster_accounts(p_query,p_page,p_boosters_only,p_user_id);
$$;

create function private.manage_booster_access(p_user_id uuid, p_payout_rate_bps integer, p_game_slugs text[], p_action text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_role text;
  v_before jsonb;
  v_after jsonb;
  v_existing boolean;
begin
  if v_actor is null or not exists(select 1 from public.profiles p where p.id = v_actor and p.role = 'admin') then
    raise exception 'Administrator access required.';
  end if;
  if p_action is null or p_action not in ('enable','save','disable') or p_payout_rate_bps is null
     or p_payout_rate_bps not between 0 and 10000 or p_game_slugs is null or cardinality(p_game_slugs) > 7 then
    raise exception 'Invalid booster settings.';
  end if;
  if cardinality(p_game_slugs) <> (select count(distinct slug) from unnest(p_game_slugs) as slug where slug in ('rocket-league','league-of-legends','valorant','marvel-rivals','overwatch-2','dota-2','rainbow-six-siege')) then
    raise exception 'Invalid approved games.';
  end if;
  select p.role::text into v_role from public.profiles p where p.id = p_user_id for update;
  if v_role is null then raise exception 'Account not found.'; end if;
  -- This lock is shared with claim: approval/payout edits and disable cannot race acceptance.
  perform 1 from public.booster_profiles b where b.user_id = p_user_id for update;
  v_existing := found;
  if p_action <> 'enable' and not v_existing then raise exception 'Booster profile not found.'; end if;
  select jsonb_build_object('role',v_role,'profile',(select to_jsonb(b) from public.booster_profiles b where b.user_id=p_user_id),
    'game_slugs',array(select e.game_slug from public.booster_game_eligibilities e where e.booster_id=p_user_id order by e.game_slug)) into v_before;
  if p_action = 'disable' then
    if exists(select 1 from public.order_booster_assignments a join public.orders o on o.id=a.order_id
      where a.booster_id=p_user_id and a.is_active and o.status not in ('completed','cancelled','refunded')) then
      raise exception 'This booster still has active orders.';
    end if;
    update public.booster_profiles set is_active=false where user_id=p_user_id;
    update public.profiles set role='customer' where id=p_user_id and role='booster';
  else
    if p_action='save' and not exists(select 1 from public.booster_profiles b where b.user_id=p_user_id and b.is_active) then
      raise exception 'Enable booster access before saving changes.';
    end if;
    insert into public.booster_profiles(user_id,is_active,payout_rate_bps,activated_at)
      values(p_user_id,true,p_payout_rate_bps,now())
    on conflict(user_id) do update set is_active=true,payout_rate_bps=excluded.payout_rate_bps,
      activated_at=case when not public.booster_profiles.is_active then now() else public.booster_profiles.activated_at end;
    update public.profiles set role='booster' where id=p_user_id and role='customer';
    delete from public.booster_game_eligibilities where booster_id=p_user_id and not(game_slug=any(p_game_slugs));
    insert into public.booster_game_eligibilities(booster_id,game_slug)
      select p_user_id, unnest(p_game_slugs) on conflict do nothing;
  end if;
  select jsonb_build_object('role',p.role,'profile',(select to_jsonb(b) from public.booster_profiles b where b.user_id=p_user_id),
    'game_slugs',array(select e.game_slug from public.booster_game_eligibilities e where e.booster_id=p_user_id order by e.game_slug))
    into v_after from public.profiles p where p.id=p_user_id;
  insert into private.booster_management_audit(actor_id,booster_id,action,before_values,after_values)
    values(v_actor,p_user_id,p_action,v_before,v_after);
end;
$$;
create function public.manage_booster_access(p_user_id uuid,p_payout_rate_bps integer,p_game_slugs text[],p_action text)
returns void language sql security invoker set search_path = '' as $$
  select private.manage_booster_access(p_user_id,p_payout_rate_bps,p_game_slugs,p_action);
$$;

create function private.list_eligible_booster_order_ids()
returns table(order_id uuid) language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.booster_profiles b where b.user_id=auth.uid() and b.is_active) then
    raise exception 'Active booster access required.';
  end if;
  return query select o.id from public.orders o
    where o.payment_status='paid' and o.status in ('paid','queued')
      and not exists(select 1 from public.order_booster_assignments a where a.order_id=o.id and a.is_active)
      and private.booster_can_claim_game(auth.uid(),o.id)
    order by o.created_at desc,o.id limit 100;
end;
$$;
create function public.list_eligible_booster_order_ids()
returns table(order_id uuid) language sql security invoker set search_path = '' as $$
  select * from private.list_eligible_booster_order_ids();
$$;

create or replace function private.claim_eligible_order(p_order_id uuid)
returns table (
  order_id uuid,
  payout_cents integer,
  payout_rate_bps integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  v_status text;
  v_payment_status text;
  v_total_cents integer;
  v_rate_bps integer;
  v_payout_cents integer;
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  select bp.payout_rate_bps
  into v_rate_bps
  from public.booster_profiles bp
  where bp.user_id = actor_id
    and bp.is_active = true
  for update;

  if v_rate_bps is null then
    raise exception 'Active booster access required.';
  end if;

  select o.status, o.payment_status, o.total_cents
  into v_status, v_payment_status, v_total_cents
  from public.orders o
  where o.id = p_order_id
  for update;

  if v_status is null then
    raise exception 'Order not found.';
  end if;

  if v_payment_status <> 'paid' or v_status not in ('paid', 'queued') then
    raise exception 'This order is not available for claiming.';
  end if;

  if exists (
    select 1
    from public.order_booster_assignments a
    where a.order_id = p_order_id
      and a.is_active = true
  ) then
    raise exception 'This order is no longer available.';
  end if;

  if not private.booster_can_claim_game(actor_id, p_order_id) then
    raise exception 'This game is not approved for this booster.';
  end if;

  v_payout_cents := floor(v_total_cents * v_rate_bps / 10000.0)::integer;

  insert into public.order_booster_assignments (
    order_id, booster_id, assigned_by, assigned_at,
    is_active, payout_rate_bps, payout_cents
  )
  values (
    p_order_id, actor_id, actor_id, now(),
    true, v_rate_bps, v_payout_cents
  )
  on conflict on constraint order_booster_assignments_pkey
  do update set
    booster_id = excluded.booster_id,
    assigned_by = excluded.assigned_by,
    assigned_at = excluded.assigned_at,
    is_active = true,
    payout_rate_bps = excluded.payout_rate_bps,
    payout_cents = excluded.payout_cents
  where public.order_booster_assignments.is_active = false;

  if not found then
    raise exception 'This order is no longer available.';
  end if;

  insert into public.order_operational_states(
    order_id, state, state_note, updated_by
  )
  values (
    p_order_id, 'accepted', 'Booster accepted the order.', actor_id
  )
  on conflict on constraint order_operational_states_pkey do update set
    state = 'accepted',
    state_note = 'Booster accepted the order.',
    delivered_at = null,
    auto_complete_at = null,
    completed_at = null,
    updated_by = actor_id;

  insert into public.order_operational_history(
    order_id, from_state, to_state, note, changed_by
  )
  values (
    p_order_id, null, 'accepted', 'Booster accepted the order.', actor_id
  );

  perform set_config('app.order_status_note', 'Booster accepted the order.', true);

  update public.orders
  set status = 'in_progress'
  where id = p_order_id;

  return query
  select p_order_id, v_payout_cents, v_rate_bps;
end;
$$;

create or replace function public.claim_order_for_booster(p_order_id uuid)
returns table(order_id uuid,payout_cents integer,payout_rate_bps integer)
language sql security invoker set search_path = '' as $$
  select * from private.claim_eligible_order(p_order_id);
$$;
revoke all on function private.admin_booster_accounts(text,integer,boolean,uuid) from public, anon, authenticated;
grant execute on function private.admin_booster_accounts(text,integer,boolean,uuid) to authenticated;
revoke all on function public.admin_booster_accounts(text,integer,boolean,uuid) from public, anon, authenticated;
grant execute on function public.admin_booster_accounts(text,integer,boolean,uuid) to authenticated;
revoke all on function private.manage_booster_access(uuid,integer,text[],text) from public, anon, authenticated;
grant execute on function private.manage_booster_access(uuid,integer,text[],text) to authenticated;
revoke all on function public.manage_booster_access(uuid,integer,text[],text) from public, anon, authenticated;
grant execute on function public.manage_booster_access(uuid,integer,text[],text) to authenticated;
revoke all on function private.list_eligible_booster_order_ids() from public, anon, authenticated;
grant execute on function private.list_eligible_booster_order_ids() to authenticated;
revoke all on function public.list_eligible_booster_order_ids() from public, anon, authenticated;
grant execute on function public.list_eligible_booster_order_ids() to authenticated;
revoke all on function private.claim_eligible_order(uuid) from public, anon, authenticated;
grant execute on function private.claim_eligible_order(uuid) to authenticated;
revoke all on function public.claim_order_for_booster(uuid) from public, anon, authenticated;
grant execute on function public.claim_order_for_booster(uuid) to authenticated;
