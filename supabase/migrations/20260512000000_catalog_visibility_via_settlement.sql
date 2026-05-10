--------------------------------------------------------------------------------
-- Phase 2 (partial): Catalog Visibility via Settlement Membership
--
-- Implements EC-6 from local/sharing-architecture.md: when a custom catalog
-- row (e.g. a user-authored knowledge or quarry) is attached to a settlement,
-- everyone who can SEE that settlement (the owner and any collaborators) can
-- also SEE the catalog row's full content.
--
-- Without these policies, the settlement owner cannot read a custom catalog
-- row authored by a collaborator. The settlement page's DAL helpers
-- (lib/dal/settlement-*.ts) defensively skip those orphaned junction rows so
-- the page renders, but the data is invisible until the policies below are
-- in place.
--
-- Each policy is permissive and OR-combines with existing SELECT policies on
-- the catalog table:
--   * "Allow select for authenticated and non-custom" (built-in rows)
--   * "Allow select for owner and custom"             (your custom rows)
--   * "Allow select for shared and custom"            (legacy *_shared_user)
-- This new policy adds the transitive path: a custom row is visible if any
-- of its settlement junction rows are visible to the caller. RLS on the
-- junction table itself already restricts to (owner OR collaborator), so
-- this single EXISTS chain naturally honours both ownership models.
--
-- Scope notes:
--   * Only the 13 settlement-attached catalogs are covered here. The
--     survivor-attached catalogs (disorder, fighting_art, ...) are deferred
--     to a separate migration; their junctions are nested deeper
--     (catalog -> survivor_<x> -> survivor -> settlement).
--   * UPDATE policies on these tables are NOT touched in this migration.
--     Removing "Allow update for shared and custom" is tracked separately
--     under E2.2 (issue #149).
--   * Realtime publication for these catalogs is tracked under E2.4.
--
-- Citations:
--   local/sharing-architecture.md §10 Phase 2 (2.1, 2.2)
--   local/sharing-architecture.md Appendix B EC-6
--------------------------------------------------------------------------------
create policy "Allow select via settlement membership" on knowledge for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_knowledge sj
      where sj.knowledge_id = knowledge.id
    )
  );
create policy "Allow select via settlement membership" on philosophy for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_philosophy sj
      where sj.philosophy_id = philosophy.id
    )
  );
create policy "Allow select via settlement membership" on gear for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_gear sj
      where sj.gear_id = gear.id
    )
  );
create policy "Allow select via settlement membership" on innovation for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_innovation sj
      where sj.innovation_id = innovation.id
    )
  );
create policy "Allow select via settlement membership" on pattern for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_pattern sj
      where sj.pattern_id = pattern.id
    )
  );
create policy "Allow select via settlement membership" on seed_pattern for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_seed_pattern sj
      where sj.seed_pattern_id = seed_pattern.id
    )
  );
create policy "Allow select via settlement membership" on collective_cognition_reward for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_collective_cognition_reward sj
      where sj.collective_cognition_reward_id = collective_cognition_reward.id
    )
  );
create policy "Allow select via settlement membership" on location for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_location sj
      where sj.location_id = location.id
    )
  );
create policy "Allow select via settlement membership" on milestone for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_milestone sj
      where sj.milestone_id = milestone.id
    )
  );
create policy "Allow select via settlement membership" on principle for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_principle sj
      where sj.principle_id = principle.id
    )
  );
create policy "Allow select via settlement membership" on resource for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_resource sj
      where sj.resource_id = resource.id
    )
  );
create policy "Allow select via settlement membership" on quarry for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_quarry sj
      where sj.quarry_id = quarry.id
    )
  );
create policy "Allow select via settlement membership" on nemesis for
select to authenticated using (
    custom
    and exists (
      select 1
      from settlement_nemesis sj
      where sj.nemesis_id = nemesis.id
    )
  );