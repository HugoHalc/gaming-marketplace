begin;

do $$
declare
  rocket_league_game_id uuid;
  valorant_game_id uuid;
  league_of_legends_game_id uuid;
begin
  select id into rocket_league_game_id
  from public.games
  where slug = 'rocket-league';

  select id into valorant_game_id
  from public.games
  where slug = 'valorant';

  select id into league_of_legends_game_id
  from public.games
  where slug = 'league-of-legends';

  if rocket_league_game_id is null then
    raise exception 'Rocket League game row was not found.';
  end if;

  if valorant_game_id is null then
    raise exception 'Valorant game row was not found.';
  end if;

  if league_of_legends_game_id is null then
    raise exception 'League of Legends game row was not found.';
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
      rocket_league_game_id,
      'tournament-boost',
      'Tournament Boost',
      'wins',
      'Tournament progression configured by your current rank, playlist and preferred boost method.',
      1119,
      'USD',
      'active',
      30,
      now()
    ),
    (
      rocket_league_game_id,
      'rewards-boost',
      'Rewards Boost',
      'wins',
      'Season reward progression with flexible win packages and automatic package discounts.',
      123,
      'USD',
      'active',
      40,
      now()
    ),
    (
      rocket_league_game_id,
      'placements-boost',
      'Placements Boost',
      'placements',
      'Complete your Rocket League placement matches with a dedicated service flow.',
      129,
      'USD',
      'active',
      50,
      now()
    )
  on conflict (game_id, slug) do update
    set name = excluded.name,
        category = excluded.category,
        starting_price_cents = excluded.starting_price_cents,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_at = now();

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
      valorant_game_id,
      'rank-boost',
      'Rank Boost',
      'rank',
      'Valorant rank progression from your current rank to your selected target rank.',
      387,
      'USD',
      'active',
      10,
      now()
    ),
    (
      valorant_game_id,
      'wins',
      'Competitive Wins',
      'wins',
      'Purchase 1 to 5 competitive wins based on your current Valorant rank.',
      170,
      'USD',
      'active',
      20,
      now()
    ),
    (
      valorant_game_id,
      'placement-matches',
      'Placements Boost',
      'placements',
      'Purchase 1 to 5 Valorant placement matches based on your current rank.',
      132,
      'USD',
      'active',
      30,
      now()
    )
  on conflict (game_id, slug) do update
    set name = excluded.name,
        category = excluded.category,
        starting_price_cents = excluded.starting_price_cents,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_at = now();

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
      league_of_legends_game_id,
      'rank-boost',
      'Rank Boost',
      'rank',
      'League of Legends rank progression with LP, server, queue and boost-method configuration.',
      289,
      'USD',
      'active',
      10,
      now()
    ),
    (
      league_of_legends_game_id,
      'wins',
      'Ranked Wins Boost',
      'wins',
      'Ranked wins priced from your current League of Legends rank and selected options.',
      138,
      'USD',
      'active',
      20,
      now()
    ),
    (
      league_of_legends_game_id,
      'placement-matches',
      'Placements Boost',
      'placements',
      'Placement matches priced from your previous League of Legends rank.',
      79,
      'USD',
      'active',
      30,
      now()
    ),
    (
      league_of_legends_game_id,
      'unrated-matches',
      'Unrated Matches Boost',
      'wins',
      'Unrated match packages with server, queue, boost-method and optional extras.',
      209,
      'USD',
      'active',
      40,
      now()
    ),
    (
      league_of_legends_game_id,
      'arena-boost',
      'Arena Boost',
      'wins',
      'Arena match packages with role, server, boost method and verified pricing options.',
      1050,
      'USD',
      'active',
      50,
      now()
    ),
    (
      league_of_legends_game_id,
      'mastery-boost',
      'Mastery Boost',
      'rank',
      'Mastery Points Farm and Marks of Mastery with verified server-calculated pricing.',
      350,
      'USD',
      'active',
      60,
      now()
    ),
    (
      league_of_legends_game_id,
      'clash-boost',
      'Clash Boost',
      'wins',
      'Clash progression configured by tier, games, boosters, server and boost method.',
      209,
      'USD',
      'active',
      70,
      now()
    )
  on conflict (game_id, slug) do update
    set name = excluded.name,
        category = excluded.category,
        starting_price_cents = excluded.starting_price_cents,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_at = now();

  update public.services
  set status = 'archived',
      updated_at = now()
  where game_id in (rocket_league_game_id, valorant_game_id, league_of_legends_game_id)
    and slug = 'coaching'
    and status <> 'archived';

  update public.order_items as order_item
  set service_id = service.id
  from public.services as service
  where order_item.game_id = rocket_league_game_id
    and order_item.service_id is null
    and service.game_id = rocket_league_game_id
    and (
      (order_item.service_name = 'Tournament Boost' and service.slug = 'tournament-boost')
      or (order_item.service_name = 'Rewards Boost' and service.slug = 'rewards-boost')
      or (order_item.service_name = 'Placements Boost' and service.slug = 'placements-boost')
    );

  update public.order_items as order_item
  set service_id = service.id
  from public.services as service
  where order_item.game_id = valorant_game_id
    and order_item.service_id is null
    and service.game_id = valorant_game_id
    and order_item.service_name = 'Rank Boost'
    and service.slug = 'rank-boost';
end
$$;

commit;
