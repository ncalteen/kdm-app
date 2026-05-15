--------------------------------------------------------------------------------
-- Phase 2 [E2.4 cont.]: Add catalog sub-row tables to `supabase_realtime`.
--
-- `20260519000000_catalog_realtime_publication.sql` added the 35 catalog
-- *parent* tables (e.g. `gear`, `pattern`, `seed_pattern`, `armor_set`,
-- `armor_set_slot`, `quarry_level`, `nemesis_level`, `survivor_status`) to
-- the realtime publication. The sub-row tables that hang off those parents
-- still stream nothing, which means a collaborator on a shared settlement
-- watching a custom recipe's cost list (or a custom armor set's slot
-- contents, or a custom monster level's status list) sees the parent
-- update arrive but never receives a corresponding child INSERT / UPDATE /
-- DELETE until they manually reload.
--
-- This migration closes that gap by adding the 22 catalog sub-row tables
-- that received `Allow select via settlement membership` in
-- `20260524000000_catalog_sub_row_transitive_select.sql`. Publication
-- membership is strictly additive — RLS still gates delivery, so adding
-- the table here only changes anything for callers who already satisfy
-- the new SELECT predicate.
--
-- One DO-block / FOREACH loop replays the idempotency pattern from
-- `20260519000000_catalog_realtime_publication.sql`: the inner
-- `pg_publication_tables` check skips any table that was already added by
-- a prior partial application.
--
-- Citations:
--   docs/settlement-sharing-architecture.md §5.2 Decision 6, §10 Phase 2 item 2.4
--   supabase/migrations/20260519000000_catalog_realtime_publication.sql
--   supabase/migrations/20260524000000_catalog_sub_row_transitive_select.sql
--------------------------------------------------------------------------------
do $$
declare t text;
catalog_sub_row_tables text [] := array [
  -- Crafting cost children of `gear` (parent: settlement_gear).
  'gear_gear_cost',
  'gear_resource_cost',
  'gear_resource_type_cost',
  'gear_other_cost',
  -- Crafting cost children of `pattern` (parent: settlement_pattern).
  'pattern_gear_cost',
  'pattern_resource_cost',
  'pattern_resource_type_cost',
  'pattern_innovation_requirement',
  -- Crafting cost children of `seed_pattern` (parent: settlement_seed_pattern).
  'seed_pattern_gear_cost',
  'seed_pattern_resource_cost',
  'seed_pattern_resource_type_cost',
  'seed_pattern_innovation_requirement',
  -- Armor set slot contents (parent chain: armor_set_slot -> armor_set ->
  -- gear_grid -> survivor -> settlement). Legacy `armor_set_gear` is
  -- intentionally absent — it was dropped in 20260425000000.
  'armor_set_slot_gear',
  -- Monster-level survivor status junctions (parent chains via
  -- settlement_quarry / settlement_nemesis).
  'quarry_level_survivor_status',
  'nemesis_level_survivor_status',
  -- Direct quarry/nemesis sub-rows that received transitive SELECT in
  -- `20260524000000` (locations, timeline years, hunt board, hunt
  -- board positions, collective cognition rewards). Wanderer child
  -- tables are intentionally absent — wanderer has no settlement
  -- junction, so custom wanderer rules stay author-only and would
  -- never satisfy a publication filter.
  'quarry_location',
  'quarry_timeline_year',
  'quarry_hunt_board',
  'quarry_hunt_board_position',
  'quarry_collective_cognition_reward',
  'nemesis_location',
  'nemesis_timeline_year'
];
begin foreach t in array catalog_sub_row_tables loop if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and schemaname = 'public'
    and tablename = t
) then execute format(
  'alter publication supabase_realtime add table public.%I',
  t
);
end if;
end loop;
end $$;