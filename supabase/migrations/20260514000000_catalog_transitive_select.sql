--------------------------------------------------------------------------------
-- Phase 2 [E2.1.a]: Catalog Transitive SELECT — settlement_* / survivor_*
-- junctions.
--
-- Replaces each catalog table's legacy `Allow select for shared and custom`
-- policy (backed by *_shared_user triads, now quarantined per architecture
-- §10 Phase 2.5) with a transitive SELECT predicate so that a custom catalog
-- row is readable when:
--   * the caller authored it (preserved by `Allow select for owner and
--     custom`), OR
--   * the row is referenced by any settlement/survivor junction the caller
--     can already see — i.e. they are the settlement owner or a
--     `settlement_shared_user` collaborator.
--
-- Settlement-attached catalogs (12): the transitive
-- `Allow select via settlement membership` policy was added in
-- 20260512000000_catalog_visibility_via_settlement.sql. This migration only
-- drops the legacy SELECT-for-shared policy on those tables.
--
-- Survivor-attached catalogs (4): no transitive policy exists yet, so this
-- migration adds `Allow select via settlement membership` AND drops the
-- legacy SELECT-for-shared policy. The chain is
-- `catalog -> survivor_<x> -> survivor -> settlement`. RLS on
-- `survivor_<x>` (Phase 1 [E1.4], 20260508000004) already restricts visible
-- rows to (settlement owner OR collaborator), so the implicit-junction-RLS
-- form matches the shape used for the settlement-attached catalogs.
--
-- Explicitly out of scope:
--   * `philosophy`, `weapon_type`, `neurosis` — survivor-column-direct
--     catalogs covered by [E2.1.b].
--   * `character`, `strain_milestone`, `wanderer`, `constellation` — no
--     `settlement_*` or `survivor_*` junction references them today; their
--     legacy SELECT-for-shared policy is left in place pending a Phase 2.5
--     cleanup that drops the `*_shared_user` triads outright.
--   * `survivor_status` — reachable only via hunt/showdown junctions, which
--     belong to [E2.1.c]; legacy SELECT-for-shared remains until that
--     issue lands the transitive path.
--
-- UPDATE-for-shared policies are intentionally NOT touched here. Author-only
-- UPDATE/INSERT/DELETE is enforced by [E2.2] (issue #149).
--
-- Citations:
--   docs/settlement-sharing-architecture.md §10 Phase 2 (2.1, 2.2), Appendix A,
--   Appendix B EC-6
--   supabase/migrations/20260508000001_is_settlement_collaborator.sql
--   supabase/migrations/20260508000004_survivor_collaborator_crud.sql
--   supabase/migrations/20260512000000_catalog_visibility_via_settlement.sql
--------------------------------------------------------------------------------
--
-- 1. Drop legacy `Allow select for shared and custom` on the 12
--    settlement-attached catalogs (transitive policy already exists).
--
do $$
declare t text;
settlement_catalogs text [] := array [
    'knowledge',
    'gear',
    'pattern',
    'seed_pattern',
    'innovation',
    'collective_cognition_reward',
    'location',
    'milestone',
    'principle',
    'resource',
    'quarry',
    'nemesis'
  ];
begin foreach t in array settlement_catalogs loop execute format(
  'drop policy if exists "Allow select for shared and custom" on %I',
  t
);
end loop;
end $$;
--
-- 2. Survivor-attached catalogs: add transitive SELECT, drop legacy.
--    Each chain hops through the survivor_<x> junction whose own RLS
--    already enforces (settlement owner OR collaborator) on the parent
--    survivor's settlement.
--
create policy "Allow select via settlement membership" on disorder for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor_disorder sj
      where sj.disorder_id = disorder.id
    )
  );
drop policy if exists "Allow select for shared and custom" on disorder;
create policy "Allow select via settlement membership" on fighting_art for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor_fighting_art sj
      where sj.fighting_art_id = fighting_art.id
    )
  );
drop policy if exists "Allow select for shared and custom" on fighting_art;
create policy "Allow select via settlement membership" on secret_fighting_art for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor_secret_fighting_art sj
      where sj.secret_fighting_art_id = secret_fighting_art.id
    )
  );
drop policy if exists "Allow select for shared and custom" on secret_fighting_art;
create policy "Allow select via settlement membership" on ability_impairment for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor_ability_impairment sj
      where sj.ability_impairment_id = ability_impairment.id
    )
  );
drop policy if exists "Allow select for shared and custom" on ability_impairment;