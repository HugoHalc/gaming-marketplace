-- Phase 6 seed data. Safe to rerun: natural keys are used for upserts.

insert into public.games (slug, name, short_description, accent, status, featured, sort_order)
values
  ('league-of-legends','League of Legends','Rank progression, wins, placements, and coaching for competitive players.','emerald','active',true,10),
  ('valorant','VALORANT','Competitive rank services, wins, placements, and focused coaching.','rose','active',true,20),
  ('marvel-rivals','Marvel Rivals','Competitive progression, wins, and personalized performance coaching.','violet','active',true,30),
  ('rocket-league','Rocket League','Rank progression, competitive wins, and mechanics-focused coaching.','blue','active',false,40),
  ('overwatch-2','Overwatch 2','Rank progression and coaching built around role and queue preferences.','amber','active',false,50),
  ('teamfight-tactics','Teamfight Tactics','Rank progression and coaching for players climbing the competitive ladder.','cyan','active',false,60)
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  accent = excluded.accent,
  status = excluded.status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  updated_at = now();

with service_seed(game_slug, slug, name, category, description, starting_price_cents, sort_order) as (
  values
    ('league-of-legends','rank-boost','Rank Boost','rank','Configure your current and target rank with transparent pricing.',1299,10),
    ('league-of-legends','wins','Wins','wins','Choose a target number of competitive wins.',899,20),
    ('league-of-legends','placement-matches','Placement Matches','placements','Configure the number of placement matches you need.',1499,30),
    ('league-of-legends','coaching','Coaching','coaching','One-on-one sessions for mechanics, macro, and decision-making.',2499,40),
    ('valorant','rank-boost','Rank Boost','rank','Configure current rank, target rank, region, and queue preferences.',1399,10),
    ('valorant','wins','Competitive Wins','wins','Select the number of competitive wins you want to complete.',999,20),
    ('valorant','placement-matches','Placement Matches','placements','Configure your placement-match package before checkout.',1599,30),
    ('valorant','coaching','Coaching','coaching','One-on-one sessions focused on mechanics, decisions, and consistency.',2499,40),
    ('marvel-rivals','rank-boost','Rank Boost','rank','Competitive progression configured around your current and target rank.',1249,10),
    ('marvel-rivals','wins','Competitive Wins','wins','Choose the number of competitive wins that match your goal.',849,20),
    ('marvel-rivals','coaching','Coaching','coaching','Focused sessions covering mechanics, hero choices, and team decisions.',2299,40),
    ('rocket-league','rank-boost','Rank Boost','rank','Configure competitive rank progression for your preferred playlist.',1199,10),
    ('rocket-league','wins','Competitive Wins','wins','Select a competitive win package for your preferred playlist.',799,20),
    ('rocket-league','coaching','Coaching','coaching','Mechanics and decision-making sessions tailored to your current level.',2199,40),
    ('overwatch-2','rank-boost','Rank Boost','rank','Configure competitive progression by role, queue, and target rank.',1349,10),
    ('overwatch-2','coaching','Coaching','coaching','Focused role-based coaching for positioning, tempo, and decisions.',2399,40),
    ('teamfight-tactics','rank-boost','Rank Boost','rank','Configure your current tier and target competitive rank.',1099,10),
    ('teamfight-tactics','coaching','Coaching','coaching','Improve economy, tempo, composition choices, and positioning.',1999,40)
)
insert into public.services (game_id, slug, name, category, description, starting_price_cents, currency, status, sort_order)
select g.id, s.slug, s.name, s.category, s.description, s.starting_price_cents, 'USD', 'active', s.sort_order
from service_seed s
join public.games g on g.slug = s.game_slug
on conflict (game_id, slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  starting_price_cents = excluded.starting_price_cents,
  currency = excluded.currency,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Configurator fields are copied to every service of the same category.
insert into public.service_fields (service_id, key, label, description, field_type, required, min_value, max_value, step_value, default_value, sort_order)
select s.id, x.key, x.label, x.description, x.field_type, x.required, x.min_value, x.max_value, x.step_value, x.default_value::jsonb, x.sort_order
from public.services s
join lateral (
  values
    ('currentRank','Current rank','Select your current competitive rank.','select',true,null::numeric,null::numeric,null::numeric,'"8"',10),
    ('targetRank','Target rank','Your target must be above your current rank.','select',true,null,null,null,'"12"',20),
    ('region','Server region',null,'select',true,null,null,null,'"na"',30),
    ('queue','Queue',null,'select',true,null,null,null,'"solo"',40),
    ('priority','Priority start','Move your order into the priority assignment queue.','toggle',false,null,null,null,'false',50)
) as x(key,label,description,field_type,required,min_value,max_value,step_value,default_value,sort_order) on s.category = 'rank'
on conflict (service_id, key) do update set label=excluded.label, description=excluded.description, field_type=excluded.field_type, required=excluded.required, min_value=excluded.min_value, max_value=excluded.max_value, step_value=excluded.step_value, default_value=excluded.default_value, sort_order=excluded.sort_order;

insert into public.service_fields (service_id, key, label, description, field_type, required, min_value, max_value, step_value, default_value, sort_order)
select s.id, x.key, x.label, x.description, x.field_type, x.required, x.min_value, x.max_value, x.step_value, x.default_value::jsonb, x.sort_order
from public.services s
join lateral (
  values
    ('wins','Number of wins','Choose how many competitive wins you need.','number',true,1::numeric,20::numeric,1::numeric,'3',10),
    ('region','Server region',null,'select',true,null,null,null,'"na"',20),
    ('queue','Queue',null,'select',true,null,null,null,'"solo"',30),
    ('priority','Priority start','Faster assignment when capacity is available.','toggle',false,null,null,null,'false',40)
) as x(key,label,description,field_type,required,min_value,max_value,step_value,default_value,sort_order) on s.category = 'wins'
on conflict (service_id, key) do update set label=excluded.label, description=excluded.description, field_type=excluded.field_type, required=excluded.required, min_value=excluded.min_value, max_value=excluded.max_value, step_value=excluded.step_value, default_value=excluded.default_value, sort_order=excluded.sort_order;

insert into public.service_fields (service_id, key, label, description, field_type, required, min_value, max_value, step_value, default_value, sort_order)
select s.id, x.key, x.label, x.description, x.field_type, x.required, x.min_value, x.max_value, x.step_value, x.default_value::jsonb, x.sort_order
from public.services s
join lateral (
  values
    ('matches','Placement matches',null,'number',true,1::numeric,10::numeric,1::numeric,'5',10),
    ('region','Server region',null,'select',true,null,null,null,'"na"',20),
    ('priority','Priority start','Prioritize assignment when capacity is available.','toggle',false,null,null,null,'false',30)
) as x(key,label,description,field_type,required,min_value,max_value,step_value,default_value,sort_order) on s.category = 'placements'
on conflict (service_id, key) do update set label=excluded.label, description=excluded.description, field_type=excluded.field_type, required=excluded.required, min_value=excluded.min_value, max_value=excluded.max_value, step_value=excluded.step_value, default_value=excluded.default_value, sort_order=excluded.sort_order;

insert into public.service_fields (service_id, key, label, description, field_type, required, min_value, max_value, step_value, default_value, sort_order)
select s.id, x.key, x.label, x.description, x.field_type, x.required, x.min_value, x.max_value, x.step_value, x.default_value::jsonb, x.sort_order
from public.services s
join lateral (
  values
    ('hours','Coaching hours',null,'number',true,1::numeric,8::numeric,1::numeric,'1',10),
    ('focus','Session focus',null,'select',true,null,null,null,'"review"',20),
    ('priority','Priority scheduling','Prioritize the earliest available coaching slots.','toggle',false,null,null,null,'false',30)
) as x(key,label,description,field_type,required,min_value,max_value,step_value,default_value,sort_order) on s.category = 'coaching'
on conflict (service_id, key) do update set label=excluded.label, description=excluded.description, field_type=excluded.field_type, required=excluded.required, min_value=excluded.min_value, max_value=excluded.max_value, step_value=excluded.step_value, default_value=excluded.default_value, sort_order=excluded.sort_order;

-- Shared region options.
insert into public.service_field_options (field_id, value, label, price_multiplier, sort_order)
select sf.id, x.value, x.label, null, x.sort_order
from public.service_fields sf
join lateral (values ('na','North America',10),('eu','Europe',20),('latam','Latin America',30),('apac','Asia Pacific',40)) x(value,label,sort_order) on sf.key='region'
on conflict (field_id, value) do update set label=excluded.label, price_multiplier=excluded.price_multiplier, sort_order=excluded.sort_order;

-- Rank options.
with rank_options(value,label,sort_order) as (
  values
    ('0','Iron IV',0),('1','Iron III',1),('2','Iron II',2),('3','Iron I',3),
    ('4','Bronze IV',4),('5','Bronze III',5),('6','Bronze II',6),('7','Bronze I',7),
    ('8','Silver IV',8),('9','Silver III',9),('10','Silver II',10),('11','Silver I',11),
    ('12','Gold IV',12),('13','Gold III',13),('14','Gold II',14),('15','Gold I',15),
    ('16','Platinum IV',16),('17','Platinum III',17),('18','Platinum II',18),('19','Platinum I',19),
    ('20','Diamond IV',20),('21','Diamond III',21),('22','Diamond II',22),('23','Diamond I',23),
    ('24','Master',24),('25','Grandmaster',25)
)
insert into public.service_field_options (field_id, value, label, price_multiplier, sort_order)
select sf.id, ro.value, ro.label, null, ro.sort_order
from public.service_fields sf cross join rank_options ro
where sf.key in ('currentRank','targetRank')
on conflict (field_id, value) do update set label=excluded.label, sort_order=excluded.sort_order;

-- Queue options differ by service category.
insert into public.service_field_options (field_id, value, label, price_multiplier, sort_order)
select sf.id, 'solo', 'Solo queue', null, 10
from public.service_fields sf where sf.key='queue'
on conflict (field_id, value) do update set label=excluded.label, price_multiplier=excluded.price_multiplier, sort_order=excluded.sort_order;

insert into public.service_field_options (field_id, value, label, price_multiplier, sort_order)
select sf.id, 'duo', 'Duo queue', case when s.category='rank' then 1.22 else 1.18 end, 20
from public.service_fields sf join public.services s on s.id=sf.service_id
where sf.key='queue'
on conflict (field_id, value) do update set label=excluded.label, price_multiplier=excluded.price_multiplier, sort_order=excluded.sort_order;

-- Coaching focus options.
insert into public.service_field_options (field_id, value, label, price_multiplier, sort_order)
select sf.id, x.value, x.label, x.multiplier, x.sort_order
from public.service_fields sf
join lateral (values
  ('review','VOD review',null::numeric,10),
  ('mechanics','Mechanics',null::numeric,20),
  ('strategy','Strategy & decision-making',null::numeric,30),
  ('live','Live session',1.12::numeric,40)
) x(value,label,multiplier,sort_order) on sf.key='focus'
on conflict (field_id, value) do update set label=excluded.label, price_multiplier=excluded.price_multiplier, sort_order=excluded.sort_order;

-- One active versioned rule set per service.
insert into public.pricing_rule_sets (service_id, version, status)
select id, 'v1.0', 'active' from public.services
on conflict (service_id, version) do update set status='active';

-- Rebuild rules for v1.0 deterministically.
delete from public.pricing_rules pr
using public.pricing_rule_sets prs
where pr.rule_set_id=prs.id and prs.version='v1.0';

insert into public.pricing_rules (rule_set_id, rule_type, condition, effect, priority)
select prs.id, 'progression', '{"category":"rank"}'::jsonb, '{"currentField":"currentRank","targetField":"targetRank","minimumPerStepCents":425,"basePercentage":0.42}'::jsonb, 10
from public.pricing_rule_sets prs join public.services s on s.id=prs.service_id
where prs.version='v1.0' and s.category='rank';

insert into public.pricing_rules (rule_set_id, rule_type, condition, effect, priority)
select prs.id, 'quantity', jsonb_build_object('category',s.category), jsonb_build_object('field',case s.category when 'wins' then 'wins' when 'placements' then 'matches' when 'coaching' then 'hours' end), 10
from public.pricing_rule_sets prs join public.services s on s.id=prs.service_id
where prs.version='v1.0' and s.category in ('wins','placements','coaching');

insert into public.pricing_rules (rule_set_id, rule_type, condition, effect, priority)
select prs.id, 'option_multiplier', '{"field":"queue","value":"duo"}'::jsonb,
       jsonb_build_object('multiplier',case when s.category='rank' then 1.22 else 1.18 end,'label','Duo queue modifier'), 40
from public.pricing_rule_sets prs join public.services s on s.id=prs.service_id
where prs.version='v1.0' and s.category in ('rank','wins');

insert into public.pricing_rules (rule_set_id, rule_type, condition, effect, priority)
select prs.id, 'option_multiplier', '{"field":"focus","value":"live"}'::jsonb, '{"multiplier":1.12,"label":"Live session modifier"}'::jsonb, 40
from public.pricing_rule_sets prs join public.services s on s.id=prs.service_id
where prs.version='v1.0' and s.category='coaching';

insert into public.pricing_rules (rule_set_id, rule_type, condition, effect, priority)
select prs.id, 'boolean_multiplier', '{"field":"priority","value":true}'::jsonb, '{"multiplier":1.15,"label":"Priority modifier"}'::jsonb, 50
from public.pricing_rule_sets prs where prs.version='v1.0';

insert into public.pricing_rules (rule_set_id, rule_type, condition, effect, priority)
select prs.id, 'threshold_discount', '{"minimumSubtotalCents":10000}'::jsonb, '{"percentage":0.05,"label":"Package discount"}'::jsonb, 90
from public.pricing_rule_sets prs where prs.version='v1.0';
