-- Phase 2 depends on the audited Phase 1 activation, eligibility and audit flow.
-- Public rows contain candidate-safe data only. Review notes/actors stay private.
begin;

create function private.valid_booster_application_choices(p_games text[], p_platforms jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare v_game text; v_values jsonb; v_value text;
begin
  -- Database validation snapshot of canonical repository options; covered by catalog parity tests.
  if p_games is null or cardinality(p_games) not between 1 and 7 or array_ndims(p_games)<>1
    or not p_games <@ array['rocket-league','league-of-legends','valorant','marvel-rivals','overwatch-2','dota-2','rainbow-six-siege']::text[]
    or cardinality(p_games) <> (select count(distinct g) from unnest(p_games) g)
    or p_platforms is null or jsonb_typeof(p_platforms) <> 'object' then return false; end if;
  for v_game, v_values in select * from jsonb_each(p_platforms) loop
    if not v_game=any(p_games) or jsonb_typeof(v_values)<>'array' or jsonb_array_length(v_values)=0 then return false; end if;
    if jsonb_array_length(v_values) <> (select count(distinct x) from jsonb_array_elements_text(v_values) x) then return false; end if;
    for v_value in select jsonb_array_elements_text(v_values) loop
      if not coalesce(case v_game
        when 'valorant' then v_value=any(array['pc'])
        when 'overwatch-2' then v_value=any(array['pc','xbox','playstation','nintendo-switch'])
        when 'rainbow-six-siege' then v_value=any(array['pc','xbox','playstation'])
        else false end,false) then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function private.valid_booster_application_choices(text[],jsonb) from public,anon,authenticated;

create table public.booster_applications (
  id uuid primary key,
  user_id uuid not null references public.profiles(id),
  status text not null default 'submitted' check(status in ('submitted','under_review','approved','rejected','withdrawn')),
  requested_games text[] not null,
  platforms jsonb not null default '{}'::jsonb,
  experience text not null check(length(trim(experience)) between 1 and 3000),
  weekly_hours integer not null check(weekly_hours between 0 and 168),
  timezone text not null check(length(timezone) between 1 and 100),
  confirmations_accepted_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  rejection_reason text check(length(rejection_reason)<=1000),
  version integer not null default 1 check(version>0),
  check(private.valid_booster_application_choices(requested_games, platforms))
);
create unique index booster_applications_one_active_user on public.booster_applications(user_id)
  where status in ('submitted','under_review');
create index booster_applications_user_history_idx on public.booster_applications(user_id,submitted_at desc,id);
create index booster_applications_queue_idx on public.booster_applications(status,submitted_at,id);
alter table public.booster_applications enable row level security;
revoke all on public.booster_applications from public,anon,authenticated;
grant select on public.booster_applications to authenticated;
create policy booster_applications_participant_read on public.booster_applications for select to authenticated
  using (user_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
-- No direct write grants or UPDATE policies: workflow changes go through guarded RPCs.

create table private.booster_application_reviews (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.booster_applications(id),
  actor_id uuid not null references public.profiles(id),
  from_status text not null,
  to_status text not null check(to_status in ('under_review','approved','rejected','withdrawn')),
  internal_note text not null default '' check(length(internal_note)<=2000),
  payout_rate_bps integer check(payout_rate_bps between 0 and 10000),
  approved_games text[],
  created_at timestamptz not null default now()
);
create index booster_application_reviews_app_idx on private.booster_application_reviews(application_id,id desc);
create index booster_application_reviews_actor_idx on private.booster_application_reviews(actor_id);
alter table private.booster_application_reviews enable row level security;
revoke all on private.booster_application_reviews from public,anon,authenticated;

create function private.guard_booster_application_transition()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op='INSERT' then
    if new.status<>'submitted' or new.version<>1 then raise exception 'Invalid initial application state.'; end if;
    return new;
  end if;
  if (new.id,new.user_id,new.requested_games,new.platforms,new.experience,new.weekly_hours,new.timezone,new.submitted_at,new.confirmations_accepted_at)
     is distinct from (old.id,old.user_id,old.requested_games,old.platforms,old.experience,old.weekly_hours,old.timezone,old.submitted_at,old.confirmations_accepted_at) then
    raise exception 'Submitted application details are immutable.';
  end if;
  if not ((old.status='submitted' and new.status in ('under_review','approved','rejected','withdrawn'))
    or (old.status='under_review' and new.status in ('approved','rejected','withdrawn'))) then
    raise exception 'Invalid application transition.';
  end if;
  new.updated_at:=now(); new.version:=old.version+1;
  return new;
end;
$$;
revoke all on function private.guard_booster_application_transition() from public,anon,authenticated;
create trigger guard_booster_application_transition before insert or update on public.booster_applications
  for each row execute function private.guard_booster_application_transition();

create function private.submit_booster_application(p_request_id uuid,p_games text[],p_platforms jsonb,
  p_experience text,p_weekly_hours integer,p_timezone text,p_confirmations boolean[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_actor uuid:=auth.uid(); v_previous public.booster_applications%rowtype;
begin
  if v_actor is null then raise exception 'Authentication required.'; end if;
  if not exists(select 1 from auth.users u where u.id=v_actor and u.is_anonymous is not true) then
    raise exception 'A registered account is required to apply.';
  end if;
  -- Same lock order as Phase 1: account -> booster profile -> application.
  perform 1 from public.profiles p where p.id=v_actor for update;
  if not found then raise exception 'Account not found.'; end if;
  if p_request_id is null or not private.valid_booster_application_choices(p_games,p_platforms)
    or p_experience is null or length(trim(p_experience)) not between 1 and 3000
    or p_weekly_hours is null or p_weekly_hours not between 0 and 168
    or p_timezone is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=p_timezone)
    or p_confirmations is null or cardinality(p_confirmations)<>4 or array_ndims(p_confirmations)<>1
    or exists(select 1 from unnest(p_confirmations) c where c is distinct from true) then
    raise exception 'Invalid application details.';
  end if;
  select * into v_previous from public.booster_applications a where a.id=p_request_id;
  if found then
    if v_previous.user_id=v_actor and v_previous.requested_games=p_games and v_previous.platforms=p_platforms
      and v_previous.experience=trim(p_experience) and v_previous.weekly_hours=p_weekly_hours and v_previous.timezone=p_timezone then
      return v_previous.id;
    end if;
    raise exception 'Invalid submission reference.';
  end if;
  if exists(select 1 from public.booster_profiles b where b.user_id=v_actor and b.is_active) then
    raise exception 'Active boosters cannot submit another application.';
  end if;
  if exists(select 1 from public.booster_applications a where a.user_id=v_actor and a.status in ('submitted','under_review')) then
    raise exception 'You already have an active application.';
  end if;
  insert into public.booster_applications(id,user_id,requested_games,platforms,experience,weekly_hours,timezone)
    values(p_request_id,v_actor,p_games,p_platforms,trim(p_experience),p_weekly_hours,p_timezone);
  return p_request_id;
end;
$$;
create function public.submit_booster_application(p_request_id uuid,p_games text[],p_platforms jsonb,
  p_experience text,p_weekly_hours integer,p_timezone text,p_confirmations boolean[])
returns uuid language sql security invoker set search_path = '' as $$
  select private.submit_booster_application(p_request_id,p_games,p_platforms,p_experience,p_weekly_hours,p_timezone,p_confirmations);
$$;

create function private.withdraw_booster_application(p_id uuid,p_version integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_actor uuid:=auth.uid(); v_application public.booster_applications%rowtype;
begin
  if v_actor is null then raise exception 'Authentication required.'; end if;
  perform 1 from public.profiles p where p.id=v_actor for update;
  select * into v_application from public.booster_applications a where a.id=p_id and a.user_id=v_actor for update;
  if not found then raise exception 'Application not found.'; end if;
  if v_application.status='withdrawn' then return; end if;
  if p_version is null or v_application.version<>p_version then raise exception 'Application changed. Refresh the page and try again.'; end if;
  if v_application.status not in ('submitted','under_review') then raise exception 'This application can no longer be withdrawn.'; end if;
  update public.booster_applications set status='withdrawn' where id=p_id;
  insert into private.booster_application_reviews(application_id,actor_id,from_status,to_status)
    values(p_id,v_actor,v_application.status,'withdrawn');
end;
$$;
create function public.withdraw_booster_application(p_id uuid,p_version integer)
returns void language sql security invoker set search_path = '' as $$
  select private.withdraw_booster_application(p_id,p_version);
$$;

create function private.review_booster_application(p_id uuid,p_version integer,p_action text,
  p_note text,p_reason text,p_payout_rate_bps integer,p_games text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_actor uuid:=auth.uid(); v_target uuid; v_application public.booster_applications%rowtype;
  v_decision private.booster_application_reviews%rowtype;
begin
  if v_actor is null or not exists(select 1 from public.profiles p where p.id=v_actor and p.role='admin') then
    raise exception 'Administrator access required.';
  end if;
  if p_action is null or p_action not in ('under_review','approved','rejected')
    or p_note is null or length(p_note)>2000 or p_reason is null or length(p_reason)>1000 then
    raise exception 'Invalid review details.';
  end if;
  select a.user_id into v_target from public.booster_applications a where a.id=p_id;
  if v_target is null then raise exception 'Application not found.'; end if;
  perform 1 from public.profiles p where p.id=v_target for update;
  perform 1 from public.booster_profiles b where b.user_id=v_target for update;
  select * into v_application from public.booster_applications a where a.id=p_id for update;
  if v_application.status='approved' and p_action='approved' then
    select * into v_decision from private.booster_application_reviews r where r.application_id=p_id and r.to_status='approved' order by r.id desc limit 1;
    if p_payout_rate_bps=v_decision.payout_rate_bps and p_games @> v_decision.approved_games and p_games <@ v_decision.approved_games
      and cardinality(p_games)=cardinality(v_decision.approved_games) then return p_id; end if;
    raise exception 'This application has already been approved.';
  end if;
  if v_application.status='under_review' and p_action='under_review' then return p_id; end if;
  if p_version is null or v_application.version<>p_version then raise exception 'Application changed. Refresh the page and try again.'; end if;
  if v_application.status not in ('submitted','under_review') then raise exception 'This application is no longer reviewable.'; end if;
  if p_action='approved' then
    if exists(select 1 from public.booster_profiles b where b.user_id=v_target and b.is_active) then
      raise exception 'This account already has active booster access.';
    end if;
    if p_games is null or cardinality(p_games)=0 then raise exception 'Select at least one approved game.'; end if;
    -- Phase 1 validates admin, payout and canonical games and writes its own audit.
    -- Its changes and application approval commit or roll back together.
    perform private.manage_booster_access(v_target,p_payout_rate_bps,p_games,'enable');
  end if;
  update public.booster_applications set status=p_action,
    reviewed_at=case when p_action in ('approved','rejected') then now() else null end,
    rejection_reason=case when p_action='rejected' then nullif(trim(p_reason),'') else null end where id=p_id;
  insert into private.booster_application_reviews(application_id,actor_id,from_status,to_status,internal_note,payout_rate_bps,approved_games)
    values(p_id,v_actor,v_application.status,p_action,trim(p_note),
      case when p_action='approved' then p_payout_rate_bps end,case when p_action='approved' then p_games end);
  return p_id;
end;
$$;
create function public.review_booster_application(p_id uuid,p_version integer,p_action text,
  p_note text,p_reason text,p_payout_rate_bps integer,p_games text[])
returns uuid language sql security invoker set search_path = '' as $$
  select private.review_booster_application(p_id,p_version,p_action,p_note,p_reason,p_payout_rate_bps,p_games);
$$;

create function private.admin_booster_applications(p_query text,p_status text,p_page integer,p_id uuid)
returns setof jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin') then
    raise exception 'Administrator access required.';
  end if;
  if p_query is null or length(p_query)>100 or p_status is null or p_status not in ('pending','all','submitted','under_review','approved','rejected','withdrawn')
    or p_page is null or p_page not between 0 and 100000 then raise exception 'Invalid search.'; end if;
  return query select to_jsonb(a)||jsonb_build_object('email',u.email,'full_name',p.full_name,'gamer_tag',p.gamer_tag,
    'internal_note',coalesce((select r.internal_note from private.booster_application_reviews r where r.application_id=a.id order by r.id desc limit 1),''),
    'history',coalesce((select jsonb_agg(jsonb_build_object('actor_id',r.actor_id,'from_status',r.from_status,'to_status',r.to_status,'internal_note',r.internal_note,'created_at',r.created_at) order by r.id)
      from private.booster_application_reviews r where r.application_id=a.id),'[]'::jsonb))
    from public.booster_applications a join public.profiles p on p.id=a.user_id join auth.users u on u.id=a.user_id
    where (p_id is null or a.id=p_id) and (p_id is not null or p_status='all' or (p_status='pending' and a.status in ('submitted','under_review')) or a.status=p_status)
      and (p_query='' or position(lower(p_query) in lower(coalesce(u.email,'')||' '||coalesce(p.full_name,'')||' '||coalesce(p.gamer_tag,'')))>0)
    order by a.submitted_at desc,a.id limit 21 offset p_page*20;
end;
$$;
create function public.admin_booster_applications(p_query text default '',p_status text default 'pending',p_page integer default 0,p_id uuid default null)
returns setof jsonb language sql security invoker set search_path = '' as $$
  select * from private.admin_booster_applications(p_query,p_status,p_page,p_id);
$$;

revoke all on function private.submit_booster_application(uuid,text[],jsonb,text,integer,text,boolean[]) from public,anon,authenticated;
grant execute on function private.submit_booster_application(uuid,text[],jsonb,text,integer,text,boolean[]) to authenticated;
revoke all on function public.submit_booster_application(uuid,text[],jsonb,text,integer,text,boolean[]) from public,anon,authenticated;
grant execute on function public.submit_booster_application(uuid,text[],jsonb,text,integer,text,boolean[]) to authenticated;
revoke all on function private.withdraw_booster_application(uuid,integer) from public,anon,authenticated;
grant execute on function private.withdraw_booster_application(uuid,integer) to authenticated;
revoke all on function public.withdraw_booster_application(uuid,integer) from public,anon,authenticated;
grant execute on function public.withdraw_booster_application(uuid,integer) to authenticated;
revoke all on function private.review_booster_application(uuid,integer,text,text,text,integer,text[]) from public,anon,authenticated;
grant execute on function private.review_booster_application(uuid,integer,text,text,text,integer,text[]) to authenticated;
revoke all on function public.review_booster_application(uuid,integer,text,text,text,integer,text[]) from public,anon,authenticated;
grant execute on function public.review_booster_application(uuid,integer,text,text,text,integer,text[]) to authenticated;
revoke all on function private.admin_booster_applications(text,text,integer,uuid) from public,anon,authenticated;
grant execute on function private.admin_booster_applications(text,text,integer,uuid) to authenticated;
revoke all on function public.admin_booster_applications(text,text,integer,uuid) from public,anon,authenticated;
grant execute on function public.admin_booster_applications(text,text,integer,uuid) to authenticated;

commit;
