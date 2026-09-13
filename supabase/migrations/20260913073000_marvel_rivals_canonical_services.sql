begin;

alter table public.services
  drop constraint if exists services_category_check;
alter table public.services
  add constraint services_category_check
  check (category = any (array['rank'::text, 'wins'::text, 'placements'::text, 'coaching'::text, 'hero'::text, 'unrated'::text]));

alter table public.order_items
  drop constraint if exists order_items_service_category_check;
alter table public.order_items
  add constraint order_items_service_category_check
  check (service_category = any (array['rank'::text, 'wins'::text, 'placements'::text, 'coaching'::text, 'hero'::text, 'unrated'::text]));

do $$
declare
  marvel_game_id uuid;
begin
  select id
    into marvel_game_id
    from public.games
   where slug = 'marvel-rivals';

  if marvel_game_id is null then
    raise exception 'Marvel Rivals game row was not found.';
  end if;

  insert into public.services (
    game_id,
    slug,
    name,
    category,
    description,
    starting_price_cents,
    currency,
    status,
    sort_order,
    updated_at
  )
  values
    (
      marvel_game_id,
      'rank-boost',
      'Rank Boost',
      'rank',
      'Choose your current rank and target rank, then configure the service around the way you want to play.',
      221,
      'USD',
      'active',
      1,
      now()
    ),
    (
      marvel_game_id,
      'placement-matches',
      'Placements Boost',
      'placements',
      'Configure your placement matches from your previous-season rank or an unranked starting point.',
      168,
      'USD',
      'active',
      2,
      now()
    ),
    (
      marvel_game_id,
      'wins',
      'Competitive Wins',
      'wins',
      'Choose your current competitive rank and the number of wins you want.',
      235,
      'USD',
      'active',
      3,
      now()
    ),
    (
      marvel_game_id,
      'hero-boost',
      'Hero Boost',
      'hero',
      'Configure progression from your current hero level to the level you want to reach.',
      491,
      'USD',
      'active',
      4,
      now()
    ),
    (
      marvel_game_id,
      'unrated-games',
      'Unrated Games',
      'unrated',
      'Choose the number of unrated games you want and configure the service around your preferred setup.',
      419,
      'USD',
      'active',
      5,
      now()
    )
  on conflict (game_id, slug) do update
    set name = excluded.name,
        category = excluded.category,
        description = excluded.description,
        starting_price_cents = excluded.starting_price_cents,
        currency = excluded.currency,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_at = now();

  update public.services
     set status = 'archived',
         updated_at = now()
   where game_id = marvel_game_id
     and slug = 'coaching'
     and status <> 'archived';
end
$$;

commit;
