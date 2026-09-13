begin;

do $$
declare
  overwatch_game_id uuid;
begin
  select id
    into overwatch_game_id
    from public.games
   where slug = 'overwatch-2';

  if overwatch_game_id is null then
    raise exception 'Overwatch 2 game row was not found.';
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
      overwatch_game_id,
      'rank-boost',
      'Rank Boost',
      'rank',
      'Progress from your current Overwatch rank to a selected target rank.',
      362,
      'USD',
      'active',
      10,
      now()
    ),
    (
      overwatch_game_id,
      'wins',
      'Competitive Wins',
      'wins',
      'Purchase 1 to 5 competitive wins based on your current Overwatch rank.',
      161,
      'USD',
      'active',
      20,
      now()
    ),
    (
      overwatch_game_id,
      'competitive-drives',
      'Competitive Drives',
      'wins',
      'Configure Competitive Drive progress in 50-point steps up to 4000.',
      25,
      'USD',
      'active',
      30,
      now()
    ),
    (
      overwatch_game_id,
      'placement-matches',
      'Placements Boost',
      'placements',
      'Purchase 1 to 10 placement matches using your previous rank or Unranked.',
      97,
      'USD',
      'active',
      40,
      now()
    ),
    (
      overwatch_game_id,
      'unrated-matches',
      'Unrated Matches',
      'wins',
      'Purchase 1 to 10 unrated matches with no rank selection required.',
      241,
      'USD',
      'active',
      50,
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
   where game_id = overwatch_game_id
     and slug = 'coaching'
     and status <> 'archived';

  update public.order_items as order_item
     set service_id = service.id
    from public.services as service
   where order_item.game_id = overwatch_game_id
     and order_item.service_id is null
     and service.game_id = overwatch_game_id
     and (
       (order_item.service_name = 'Rank Boost' and service.slug = 'rank-boost')
       or (order_item.service_name = 'Competitive Wins' and service.slug = 'wins')
       or (order_item.service_name = 'Competitive Drives' and service.slug = 'competitive-drives')
       or (order_item.service_name = 'Placements Boost' and service.slug = 'placement-matches')
       or (order_item.service_name = 'Unrated Matches' and service.slug = 'unrated-matches')
     );
end
$$;

commit;
