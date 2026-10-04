-- Repair legacy role drift and prevent role/profile state from diverging again.
-- Phase 1 and Phase 2 remain the only privileged activation paths.
begin;

update public.profiles p
set role = 'customer', updated_at = now()
where p.role = 'booster'
  and not exists (
    select 1
    from public.booster_profiles b
    where b.user_id = p.id and b.is_active = true
  );

create or replace function private.enforce_booster_role_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_role text;
  v_active boolean;
begin
  if tg_table_name = 'profiles' then
    v_user_id := case when tg_op = 'DELETE' then old.id else new.id end;
  else
    v_user_id := case when tg_op = 'DELETE' then old.user_id else new.user_id end;
  end if;

  select p.role::text into v_role
  from public.profiles p
  where p.id = v_user_id;

  -- Account deletion may cascade through booster_profiles.
  if v_role is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select b.is_active into v_active
  from public.booster_profiles b
  where b.user_id = v_user_id;

  if v_role = 'booster' and coalesce(v_active, false) is not true then
    raise exception 'Booster role requires an active booster profile.';
  end if;
  if v_role = 'customer' and coalesce(v_active, false) is true then
    raise exception 'Active booster access requires the booster role.';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.enforce_booster_role_integrity() from public, anon, authenticated;

drop trigger if exists profiles_booster_role_integrity on public.profiles;
create constraint trigger profiles_booster_role_integrity
after insert or update of role on public.profiles
deferrable initially deferred
for each row execute function private.enforce_booster_role_integrity();

drop trigger if exists booster_profiles_role_integrity on public.booster_profiles;
create constraint trigger booster_profiles_role_integrity
after insert or update or delete on public.booster_profiles
deferrable initially deferred
for each row execute function private.enforce_booster_role_integrity();

create or replace function private.admin_booster_accounts(
  p_query text,
  p_page integer,
  p_boosters_only boolean,
  p_user_id uuid
)
returns table(
  user_id uuid,
  email text,
  full_name text,
  gamer_tag text,
  role text,
  is_active boolean,
  payout_rate_bps integer,
  activated_at timestamptz,
  game_slugs text[]
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Administrator access required.';
  end if;
  if p_page is null or p_page < 0 or p_page > 100000
     or p_query is null or length(p_query) > 100 then
    raise exception 'Invalid search.';
  end if;

  return query
  select
    p.id,
    u.email::text,
    p.full_name::text,
    p.gamer_tag::text,
    case
      when p.role = 'admin' then 'admin'
      when b.is_active is true then 'booster'
      else 'customer'
    end::text,
    b.is_active,
    b.payout_rate_bps,
    b.activated_at,
    array(
      select e.game_slug
      from public.booster_game_eligibilities e
      where e.booster_id = p.id
      order by e.game_slug
    )
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.booster_profiles b on b.user_id = p.id
  where (not p_boosters_only or b.user_id is not null)
    and (p_user_id is null or p.id = p_user_id)
    and (
      p_query = ''
      or position(
        lower(p_query) in lower(
          coalesce(u.email, '') || ' ' ||
          coalesce(p.full_name, '') || ' ' ||
          coalesce(p.gamer_tag, '')
        )
      ) > 0
    )
  order by p.id
  limit 21 offset p_page * 20;
end;
$$;

create or replace function private.manage_booster_access(
  p_user_id uuid,
  p_payout_rate_bps integer,
  p_game_slugs text[],
  p_action text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text;
  v_after_role text;
  v_before jsonb;
  v_after jsonb;
  v_existing boolean;
  v_is_active boolean;
  v_existing_payout integer;
  v_existing_games text[];
  v_requested_games text[];
begin
  if v_actor is null or not exists (
    select 1 from public.profiles p
    where p.id = v_actor and p.role = 'admin'
  ) then
    raise exception 'Administrator access required.';
  end if;
  if p_action is null or p_action not in ('enable', 'save', 'disable')
     or p_payout_rate_bps is null or p_payout_rate_bps not between 0 and 10000
     or p_game_slugs is null or cardinality(p_game_slugs) > 7 then
    raise exception 'Invalid booster settings.';
  end if;
  if cardinality(p_game_slugs) <> (
    select count(distinct slug)
    from unnest(p_game_slugs) as slug
    where slug in (
      'rocket-league', 'league-of-legends', 'valorant', 'marvel-rivals',
      'overwatch-2', 'dota-2', 'rainbow-six-siege'
    )
  ) then
    raise exception 'Invalid approved games.';
  end if;

  v_requested_games := array(
    select slug from unnest(p_game_slugs) slug order by slug
  );

  select p.role::text into v_role
  from public.profiles p
  where p.id = p_user_id
  for update;
  if v_role is null then raise exception 'Account not found.'; end if;

  -- This lock order is shared with claim and application approval.
  select b.is_active, b.payout_rate_bps
  into v_is_active, v_existing_payout
  from public.booster_profiles b
  where b.user_id = p_user_id
  for update;
  v_existing := found;
  if p_action <> 'enable' and not v_existing then
    raise exception 'Booster profile not found.';
  end if;

  v_existing_games := array(
    select e.game_slug
    from public.booster_game_eligibilities e
    where e.booster_id = p_user_id
    order by e.game_slug
  );
  select jsonb_build_object(
    'role', v_role,
    'profile', (select to_jsonb(b) from public.booster_profiles b where b.user_id = p_user_id),
    'game_slugs', v_existing_games
  ) into v_before;

  -- Repeated requests that already produced the requested state are no-ops.
  if p_action = 'disable' and v_existing and not coalesce(v_is_active, false)
     and v_role in ('customer', 'admin') then
    return;
  end if;
  if p_action in ('enable', 'save') and v_existing and v_is_active
     and v_existing_payout = p_payout_rate_bps
     and v_existing_games = v_requested_games
     and v_role in ('booster', 'admin') then
    return;
  end if;

  if p_action = 'disable' then
    if exists (
      select 1
      from public.order_booster_assignments a
      join public.orders o on o.id = a.order_id
      where a.booster_id = p_user_id
        and a.is_active
        and o.status not in ('completed', 'cancelled', 'refunded')
    ) then
      raise exception 'This booster still has active orders.';
    end if;
    update public.booster_profiles
    set is_active = false
    where user_id = p_user_id;
    update public.profiles
    set role = 'customer'
    where id = p_user_id and role = 'booster';
  else
    if p_action = 'save' and not coalesce(v_is_active, false) then
      raise exception 'Enable booster access before saving changes.';
    end if;
    insert into public.booster_profiles(
      user_id, is_active, payout_rate_bps, activated_at
    ) values (
      p_user_id, true, p_payout_rate_bps, now()
    )
    on conflict(user_id) do update
    set is_active = true,
        payout_rate_bps = excluded.payout_rate_bps,
        activated_at = case
          when not public.booster_profiles.is_active then now()
          else public.booster_profiles.activated_at
        end;
    update public.profiles
    set role = 'booster'
    where id = p_user_id and role = 'customer';
    delete from public.booster_game_eligibilities
    where booster_id = p_user_id
      and not (game_slug = any(p_game_slugs));
    insert into public.booster_game_eligibilities(booster_id, game_slug)
    select p_user_id, unnest(p_game_slugs)
    on conflict do nothing;
  end if;

  select p.role::text into v_after_role
  from public.profiles p
  where p.id = p_user_id;
  select b.is_active into v_is_active
  from public.booster_profiles b
  where b.user_id = p_user_id;
  if (v_after_role = 'booster' and coalesce(v_is_active, false) is not true)
     or (v_after_role = 'customer' and coalesce(v_is_active, false) is true) then
    raise exception 'Booster role integrity check failed.';
  end if;

  select jsonb_build_object(
    'role', p.role,
    'profile', (select to_jsonb(b) from public.booster_profiles b where b.user_id = p_user_id),
    'game_slugs', array(
      select e.game_slug
      from public.booster_game_eligibilities e
      where e.booster_id = p_user_id
      order by e.game_slug
    )
  ) into v_after
  from public.profiles p
  where p.id = p_user_id;

  insert into private.booster_management_audit(
    actor_id, booster_id, action, before_values, after_values
  ) values (
    v_actor, p_user_id, p_action, v_before, v_after
  );
end;
$$;

commit;
