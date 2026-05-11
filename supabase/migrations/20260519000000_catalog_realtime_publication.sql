--------------------------------------------------------------------------------
-- Phase 2 [E2.4]: Add catalog tables to `supabase_realtime`.
--
-- The transitive-SELECT work in [E2.1.a], [E2.1.b], and [E2.1.c] made every
-- custom catalog row reachable to settlement collaborators via the RLS
-- predicate. Without inclusion in the `supabase_realtime` publication
-- though, those rows still do not stream INSERT/UPDATE/DELETE events to
-- subscribed clients, so a collaborator's rules-text view goes stale until
-- a manual reload.
--
-- This migration adds every catalog table covered by the three transitive
-- SELECT migrations (plus the catalogs that are reachable in principle but
-- did not yet get a transitive policy — `character`, `strain_milestone`,
-- `wanderer`, `constellation`, `survivor_status` — per the issue scope).
-- Publication membership is strictly additive: the row is only delivered
-- if the subscriber's RLS check passes, so adding a table whose
-- transitive SELECT lands later does not change behavior in the interim.
--
-- The list below is one entry per *physical* table. The issue text
-- (#155) lists `armor_set_slots`, `quarry_level_trait_mood`, and
-- `nemesis_level_trait_mood` which conflate file / migration names with
-- actual table identifiers; this migration uses the canonical singular
-- name (`armor_set_slot`) and splits the trait/mood pairs into the two
-- physical tables (`quarry_level_trait` + `quarry_level_mood`,
-- `nemesis_level_trait` + `nemesis_level_mood`).
--
-- The publication membership is enforced one statement per table because
-- `alter publication ... add table` does not accept a list literal and
-- the existing convention (see `20260506000000_audit_realtime_publication.sql`)
-- is to wrap each in an idempotent guard. The DRY form below uses a single
-- `do $$ ... foreach ... loop` block: replays / partial application are
-- safe because the inner `pg_publication_tables` check skips any table
-- already in the publication.
--
-- Out of scope: client-side subscription wiring (E2.5). Catalogs whose
-- legacy SELECT policy still gates visibility behind `*_shared_user` are
-- included in the publication — the row simply will not be delivered to
-- non-owners until [E2.5] / Appendix A Phase 2.5 cleanup.
--
-- Citations:
--   local/sharing-architecture.md §5.2 Decision 6, §10 Phase 2 item 2.4
--   supabase/migrations/20260506000000_audit_realtime_publication.sql
--   supabase/migrations/20260514000000_catalog_transitive_select.sql
--   supabase/migrations/20260515000000_catalog_transitive_via_survivor.sql
--   supabase/migrations/20260516000000_catalog_transitive_hunt_showdown.sql
--------------------------------------------------------------------------------
do $$
declare t text;
catalog_tables text [] := array [
  'knowledge',
  'disorder',
  'gear',
  'pattern',
  'seed_pattern',
  'innovation',
  'fighting_art',
  'secret_fighting_art',
  'collective_cognition_reward',
  'location',
  'milestone',
  'principle',
  'resource',
  'quarry',
  'nemesis',
  'ability_impairment',
  'neurosis',
  'philosophy',
  'philosophy_rank',
  'weapon_type',
  'trait',
  'mood',
  'armor_set',
  'armor_set_slot',
  'quarry_level',
  'quarry_level_trait',
  'quarry_level_mood',
  'nemesis_level',
  'nemesis_level_trait',
  'nemesis_level_mood',
  'character',
  'strain_milestone',
  'wanderer',
  'constellation',
  'survivor_status'
];
begin foreach t in array catalog_tables loop if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = t
) then execute format(
  'alter publication supabase_realtime add table %I',
  t
);
end if;
end loop;
end $$;