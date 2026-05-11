--------------------------------------------------------------------------------
-- Phase 2 [E2.6]: Drop the catalog `*_shared_user` junction tables.
--
-- The transitive-SELECT predicates installed in [E2.1.a/b/c] make every
-- custom catalog row reachable to settlement collaborators via settlement
-- membership rather than via a per-row `<table>_shared_user` grant. The
-- legacy share tables hold no production data, so they can be dropped
-- wholesale together with every RLS policy that still references them.
--
-- Three concerns are intentionally collapsed into this single migration so
-- that the catalog stays internally consistent at every commit point:
--
--   1. Drop the 43 leftover `Allow select for shared and custom` policies
--      that still reference a `<table>_shared_user`. [E2.1.a/b/c] only
--      refactored the 16 catalog parents that are settlement- or
--      survivor-attached; the remaining catalog parents (`armor_set`,
--      `character`, `constellation`, `mood`, `neurosis`, `philosophy`,
--      `strain_milestone`, `survivor_status`, `trait`, `wanderer`,
--      `weapon_type`) and roughly two dozen child tables (`gear_*_cost`,
--      `pattern_*`, `nemesis_level*`, `quarry_*`, `seed_pattern_*`,
--      `philosophy_rank`, `wanderer_*`, `armor_set_slot*`) still carried
--      the legacy predicate. Per architecture §10 Phase 2.2 every catalog
--      table's `Allow select for shared and custom` is going away; dropping
--      it here means custom rows on those tables are author-only for now,
--      which is acceptable until those catalogs get their own transitive
--      predicates.
--
--   2. Drop the 27 catalog `*_shared_user` tables. Each is a join table on
--      (<fk>, user_id, shared_user_id) with no inbound FKs, so a plain
--      `drop table` suffices once the dependent policies are gone.
--      `settlement_shared_user` is NOT dropped — it remains the backbone
--      of the multiplayer collaboration model.
--
--   3. Drop the 26 `is_<table>_owner` SECURITY DEFINER helpers whose only
--      call sites were the `Allow insert for authenticated` policies on
--      the `*_shared_user` tables. Two helpers are intentionally retained:
--        * `is_settlement_owner` — still consumed by collaborator-CRUD
--          policies across every settlement-scoped table.
--        * `is_armor_set_owner`  — consumed by `armor_set_gear` and
--          `armor_set_slot` RLS policies (see `20260424000007_armor_set.sql`
--          and `20260425000000_armor_set_slots.sql`).
--
-- The DAL files that read from these tables are deleted in the same change
-- ([E2.7]); catalog `getX()` functions that previously issued a third
-- `from('<table>_shared_user')` query are collapsed into a single broad
-- `from('<table>')` call that relies on RLS to surface visible rows.
--
-- Citations:
--   local/sharing-architecture.md §5.2 Decision 2, §10 Phase 2 (2.2, 2.5),
--     Appendix A "Tables to deprecate / drop"
--   supabase/migrations/20260324185335_fix_shared_user_rls_recursion.sql
--   supabase/migrations/20260514000000_catalog_transitive_select.sql
--   supabase/migrations/20260515000000_catalog_transitive_via_survivor.sql
--   supabase/migrations/20260516000000_catalog_transitive_hunt_showdown.sql
--------------------------------------------------------------------------------
-- 1. Drop every leftover `Allow select for shared and custom` policy that
--    still references a catalog `<table>_shared_user`. (`settlement` keeps
--    its `Allow select for shared` policy — that one references the
--    retained `settlement_shared_user` table.)
do $$
declare t text;
legacy_shared_select_tables text [] := array [
  'armor_set',
  'armor_set_slot',
  'armor_set_slot_gear',
  'character',
  'constellation',
  'gear_gear_cost',
  'gear_other_cost',
  'gear_resource_cost',
  'gear_resource_type_cost',
  'mood',
  'nemesis_level',
  'nemesis_level_mood',
  'nemesis_level_survivor_status',
  'nemesis_level_trait',
  'nemesis_location',
  'nemesis_timeline_year',
  'neurosis',
  'pattern_gear_cost',
  'pattern_innovation_requirement',
  'pattern_resource_cost',
  'pattern_resource_type_cost',
  'philosophy',
  'philosophy_rank',
  'quarry_collective_cognition_reward',
  'quarry_hunt_board',
  'quarry_hunt_board_position',
  'quarry_level',
  'quarry_level_mood',
  'quarry_level_survivor_status',
  'quarry_level_trait',
  'quarry_location',
  'quarry_timeline_year',
  'seed_pattern_gear_cost',
  'seed_pattern_innovation_requirement',
  'seed_pattern_resource_cost',
  'seed_pattern_resource_type_cost',
  'strain_milestone',
  'survivor_status',
  'trait',
  'wanderer',
  'wanderer_ability_impairment',
  'wanderer_timeline_year',
  'weapon_type'
];
begin foreach t in array legacy_shared_select_tables loop execute format(
  'drop policy if exists "Allow select for shared and custom" on public.%I',
  t
);
end loop;
end $$;
-- 2. Drop the 27 catalog `*_shared_user` tables. `if exists` keeps the
--    migration idempotent across local resets.
do $$
declare t text;
shared_user_tables text [] := array [
  'ability_impairment_shared_user',
  'armor_set_shared_user',
  'character_shared_user',
  'collective_cognition_reward_shared_user',
  'constellation_shared_user',
  'disorder_shared_user',
  'fighting_art_shared_user',
  'gear_shared_user',
  'innovation_shared_user',
  'knowledge_shared_user',
  'location_shared_user',
  'milestone_shared_user',
  'mood_shared_user',
  'nemesis_shared_user',
  'neurosis_shared_user',
  'pattern_shared_user',
  'philosophy_shared_user',
  'principle_shared_user',
  'quarry_shared_user',
  'resource_shared_user',
  'secret_fighting_art_shared_user',
  'seed_pattern_shared_user',
  'strain_milestone_shared_user',
  'survivor_status_shared_user',
  'trait_shared_user',
  'wanderer_shared_user',
  'weapon_type_shared_user'
];
begin foreach t in array shared_user_tables loop execute format('drop table if exists public.%I', t);
end loop;
end $$;
-- 3. Drop the 26 SECURITY DEFINER ownership helpers whose sole call sites
--    were the just-dropped `*_shared_user` INSERT policies. Kept:
--      `is_settlement_owner` (used by every settlement-scoped table)
--      `is_armor_set_owner`  (used by `armor_set_gear`, `armor_set_slot`)
do $$
declare fn text;
dead_owner_helpers text [] := array [
  'is_ability_impairment_owner',
  'is_character_owner',
  'is_collective_cognition_reward_owner',
  'is_constellation_owner',
  'is_disorder_owner',
  'is_fighting_art_owner',
  'is_gear_owner',
  'is_innovation_owner',
  'is_knowledge_owner',
  'is_location_owner',
  'is_milestone_owner',
  'is_mood_owner',
  'is_nemesis_owner',
  'is_neurosis_owner',
  'is_pattern_owner',
  'is_philosophy_owner',
  'is_principle_owner',
  'is_quarry_owner',
  'is_resource_owner',
  'is_secret_fighting_art_owner',
  'is_seed_pattern_owner',
  'is_strain_milestone_owner',
  'is_survivor_status_owner',
  'is_trait_owner',
  'is_wanderer_owner',
  'is_weapon_type_owner'
];
begin foreach fn in array dead_owner_helpers loop execute format('drop function if exists public.%I(uuid)', fn);
end loop;
end $$;