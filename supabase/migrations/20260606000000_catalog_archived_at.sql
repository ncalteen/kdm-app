--------------------------------------------------------------------------------
-- [E4.7] Catalog archive support.
--
-- Custom catalog rows now get a nullable archived_at timestamp. Author DELETEs
-- still hard-delete rows when they are unattached or only attached to the
-- author's own settlements. When the row is still referenced by another
-- settlement, the delete guard marks the row archived and skips the hard delete
-- so existing settlement joins keep rendering the custom rules text. Once a row
-- is archived, future DELETEs are stricter: the guard only permits permanent
-- deletion after every settlement reference has been removed.
--------------------------------------------------------------------------------
do $$
declare t text;
catalog_tables text [] := array [
  'ability_impairment',
  'armor_set',
  'character',
  'collective_cognition_reward',
  'constellation',
  'disorder',
  'fighting_art',
  'gear',
  'innovation',
  'knowledge',
  'location',
  'milestone',
  'mood',
  'nemesis',
  'neurosis',
  'pattern',
  'philosophy',
  'principle',
  'quarry',
  'resource',
  'secret_fighting_art',
  'seed_pattern',
  'strain_milestone',
  'survivor_status',
  'trait',
  'wanderer',
  'weapon_type'
];
begin foreach t in array catalog_tables loop execute format(
  'alter table public.%I add column if not exists archived_at timestamptz;',
  t
);
execute format(
  'alter policy "Allow select for authenticated and non-custom" on public.%I using (not custom and archived_at is null);',
  t
);
end loop;
end $$;
create or replace function public.enforce_catalog_delete_guard() returns trigger language plpgsql security definer
set search_path = '' as $$
declare blocking_count int := 0;
blocking_names text [] := array []::text [];
begin -- Bypass for service-role / admin contexts. Triggers fire even when RLS
-- is bypassed, so fixture teardown and auth.users cascade-deletes must
-- skip the guard explicitly. `public.is_admin()` covers the
-- `auth.role() = 'admin'` case (and stays in lock-step with that helper
-- if its definition ever changes). The two explicit checks handle the
-- Supabase service_role and the no-auth / direct-DB context (where
-- `auth.role()` returns NULL) that `is_admin()` would not match.
if (
  auth.role() = 'service_role'
  or auth.role() is null
  or public.is_admin()
) then return old;
end if;
-- Non-custom rows: catalog seed data. The RLS policies govern these;
-- the guard does not apply.
if not old.custom then return old;
end if;
case
  tg_table_name
  when 'ability_impairment' then with blocking as (
    select distinct s.id,
      s.settlement_name
    from public.survivor_ability_impairment j
      join public.survivor sv on sv.id = j.survivor_id
      join public.settlement s on s.id = sv.settlement_id
    where j.ability_impairment_id = old.id
      and (
        old.archived_at is not null
        or s.user_id <> old.user_id
      )
  )
  select count(*),
    (
      array_agg(
        settlement_name
        order by settlement_name
      )
    ) [1:3] into blocking_count,
    blocking_names
  from blocking;
when 'armor_set' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.gear_grid gg
    join public.survivor sv on sv.id = gg.survivor_id
    join public.settlement s on s.id = sv.settlement_id
  where gg.selected_armor_set_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'collective_cognition_reward' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_collective_cognition_reward j
    join public.settlement s on s.id = j.settlement_id
  where j.collective_cognition_reward_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'disorder' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.survivor_disorder j
    join public.survivor sv on sv.id = j.survivor_id
    join public.settlement s on s.id = sv.settlement_id
  where j.disorder_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'fighting_art' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.survivor_fighting_art j
    join public.survivor sv on sv.id = j.survivor_id
    join public.settlement s on s.id = sv.settlement_id
  where j.fighting_art_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'gear' then -- Settlement-attached gear: settlement_gear, survivor_cursed_gear,
-- and any of the 9 gear_grid pos_* slots (3x3 layout).
with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_gear j
    join public.settlement s on s.id = j.settlement_id
  where j.gear_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.survivor_cursed_gear j
    join public.survivor sv on sv.id = j.survivor_id
    join public.settlement s on s.id = sv.settlement_id
  where j.gear_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.gear_grid gg
    join public.survivor sv on sv.id = gg.survivor_id
    join public.settlement s on s.id = sv.settlement_id
  where (
      gg.pos_top_left = old.id
      or gg.pos_top_center = old.id
      or gg.pos_top_right = old.id
      or gg.pos_mid_left = old.id
      or gg.pos_mid_center = old.id
      or gg.pos_mid_right = old.id
      or gg.pos_bottom_left = old.id
      or gg.pos_bottom_center = old.id
      or gg.pos_bottom_right = old.id
    )
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'innovation' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_innovation j
    join public.settlement s on s.id = j.settlement_id
  where j.innovation_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'knowledge' then -- knowledge is reachable via settlement_knowledge (direct) AND via
-- three survivor columns (knowledge_1_id, knowledge_2_id,
-- tenet_knowledge_id), matching the SELECT predicate in
-- 20260515000000_catalog_transitive_via_survivor.sql.
with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_knowledge j
    join public.settlement s on s.id = j.settlement_id
  where j.knowledge_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.survivor sv
    join public.settlement s on s.id = sv.settlement_id
  where (
      sv.knowledge_1_id = old.id
      or sv.knowledge_2_id = old.id
      or sv.tenet_knowledge_id = old.id
    )
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'location' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_location j
    join public.settlement s on s.id = j.settlement_id
  where j.location_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'milestone' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_milestone j
    join public.settlement s on s.id = j.settlement_id
  where j.milestone_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'mood' then -- mood is reachable via four hunt/showdown/quarry/nemesis junctions,
-- matching the SELECT predicate in
-- 20260516000000_catalog_transitive_hunt_showdown.sql.
with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.hunt_monster_mood j
    join public.hunt_monster m on m.id = j.hunt_monster_id
    join public.settlement s on s.id = m.settlement_id
  where j.mood_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.showdown_monster_mood j
    join public.showdown_monster m on m.id = j.showdown_monster_id
    join public.settlement s on s.id = m.settlement_id
  where j.mood_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.quarry_level_mood j
    join public.quarry_level ql on ql.id = j.quarry_level_id
    join public.settlement_quarry sq on sq.quarry_id = ql.quarry_id
    join public.settlement s on s.id = sq.settlement_id
  where j.mood_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.nemesis_level_mood j
    join public.nemesis_level nl on nl.id = j.nemesis_level_id
    join public.settlement_nemesis sn on sn.nemesis_id = nl.nemesis_id
    join public.settlement s on s.id = sn.settlement_id
  where j.mood_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'nemesis' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_nemesis j
    join public.settlement s on s.id = j.settlement_id
  where j.nemesis_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'neurosis' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.survivor sv
    join public.settlement s on s.id = sv.settlement_id
  where sv.neurosis_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'pattern' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_pattern j
    join public.settlement s on s.id = j.settlement_id
  where j.pattern_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'philosophy' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_philosophy j
    join public.settlement s on s.id = j.settlement_id
  where j.philosophy_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.survivor sv
    join public.settlement s on s.id = sv.settlement_id
  where sv.philosophy_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'principle' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_principle j
    join public.settlement s on s.id = j.settlement_id
  where j.principle_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'quarry' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_quarry j
    join public.settlement s on s.id = j.settlement_id
  where j.quarry_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'resource' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_resource j
    join public.settlement s on s.id = j.settlement_id
  where j.resource_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'secret_fighting_art' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.survivor_secret_fighting_art j
    join public.survivor sv on sv.id = j.survivor_id
    join public.settlement s on s.id = sv.settlement_id
  where j.secret_fighting_art_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'seed_pattern' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.settlement_seed_pattern j
    join public.settlement s on s.id = j.settlement_id
  where j.seed_pattern_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'survivor_status' then -- survivor_status is reachable via four hunt/showdown/quarry/nemesis
-- junctions (parallel to mood/trait).
with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.hunt_monster_survivor_status j
    join public.hunt_monster m on m.id = j.hunt_monster_id
    join public.settlement s on s.id = m.settlement_id
  where j.survivor_status_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.showdown_monster_survivor_status j
    join public.showdown_monster m on m.id = j.showdown_monster_id
    join public.settlement s on s.id = m.settlement_id
  where j.survivor_status_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.quarry_level_survivor_status j
    join public.quarry_level ql on ql.id = j.quarry_level_id
    join public.settlement_quarry sq on sq.quarry_id = ql.quarry_id
    join public.settlement s on s.id = sq.settlement_id
  where j.survivor_status_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.nemesis_level_survivor_status j
    join public.nemesis_level nl on nl.id = j.nemesis_level_id
    join public.settlement_nemesis sn on sn.nemesis_id = nl.nemesis_id
    join public.settlement s on s.id = sn.settlement_id
  where j.survivor_status_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'trait' then -- trait is reachable via four hunt/showdown/quarry/nemesis junctions,
-- matching the SELECT predicate in
-- 20260516000000_catalog_transitive_hunt_showdown.sql.
with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.hunt_monster_trait j
    join public.hunt_monster m on m.id = j.hunt_monster_id
    join public.settlement s on s.id = m.settlement_id
  where j.trait_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.showdown_monster_trait j
    join public.showdown_monster m on m.id = j.showdown_monster_id
    join public.settlement s on s.id = m.settlement_id
  where j.trait_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.quarry_level_trait j
    join public.quarry_level ql on ql.id = j.quarry_level_id
    join public.settlement_quarry sq on sq.quarry_id = ql.quarry_id
    join public.settlement s on s.id = sq.settlement_id
  where j.trait_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
  union
  select distinct s.id,
    s.settlement_name
  from public.nemesis_level_trait j
    join public.nemesis_level nl on nl.id = j.nemesis_level_id
    join public.settlement_nemesis sn on sn.nemesis_id = nl.nemesis_id
    join public.settlement s on s.id = sn.settlement_id
  where j.trait_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
when 'weapon_type' then with blocking as (
  select distinct s.id,
    s.settlement_name
  from public.survivor sv
    join public.settlement s on s.id = sv.settlement_id
  where sv.weapon_type_id = old.id
    and (
      old.archived_at is not null
      or s.user_id <> old.user_id
    )
)
select count(*),
  (
    array_agg(
      settlement_name
      order by settlement_name
    )
  ) [1:3] into blocking_count,
  blocking_names
from blocking;
else -- character / constellation / strain_milestone / wanderer have no
-- settlement-attached junctions today. The trigger still fires for
-- symmetry (so adding a future settlement junction can plug into
-- the same dispatch), but blocking_count stays 0 and the delete
-- proceeds.
null;
end case
;
-- For active rows, the branch predicates above count non-author settlements.
-- For archived rows, they count any settlement reference so permanent deletion
-- only succeeds after the item is fully detached.
if blocking_count > 0 then execute format(
  'update public.%I set archived_at = coalesce(archived_at, now()) where id = $1',
  tg_table_name
) using old.id;
return null;
end if;
return old;
end;
$$;
--
-- Attach the trigger to every catalog table (every table with
-- `custom` + `user_id` columns). The trigger name is the same on every
-- table because Postgres scopes trigger names per-table.
--
do $$
declare t text;
catalog_tables text [] := array [
  'ability_impairment',
  'armor_set',
  'character',
  'collective_cognition_reward',
  'constellation',
  'disorder',
  'fighting_art',
  'gear',
  'innovation',
  'knowledge',
  'location',
  'milestone',
  'mood',
  'nemesis',
  'neurosis',
  'pattern',
  'philosophy',
  'principle',
  'quarry',
  'resource',
  'secret_fighting_art',
  'seed_pattern',
  'strain_milestone',
  'survivor_status',
  'trait',
  'wanderer',
  'weapon_type'
];
begin foreach t in array catalog_tables loop execute format(
  'drop trigger if exists enforce_catalog_delete_guard on public.%I;',
  t
);
execute format(
  'create trigger enforce_catalog_delete_guard before delete on public.%I for each row execute function public.enforce_catalog_delete_guard();',
  t
);
end loop;
end $$;