--------------------------------------------------------------------------------
-- PR #207 Hardening — Junction Attach Requires Catalog Visibility
--
-- Closes a side-channel introduced by the new transitive SELECT policy on
-- catalog tables (`20260512000000_catalog_visibility_via_settlement.sql`).
-- That policy makes a custom catalog row readable when it is attached to
-- any settlement the caller can SELECT. Without an additional check on the
-- junction's own INSERT/UPDATE, any settlement member could attach a
-- guessed/leaked foreign catalog UUID to one of their own settlements and
-- then read its rules text via the new visibility predicate.
--
-- This migration rewrites the `Allow insert for member` and
-- `Allow update for member` policies on every settlement_* junction that
-- references a custom-content catalog table and AND-s in a visibility
-- check on the referenced catalog row:
--
--   exists (select 1 from public.<catalog> c where c.id = <fk>)
--
-- PostgreSQL applies RLS to references inside policy expressions, so the
-- subselect only returns a row when the caller can SELECT it under the
-- catalog table's existing policies. The catalog SELECT policies already
-- accept:
--   * built-in (non-custom) rows for any authenticated user,
--   * the author's own custom rows,
--   * custom rows the author has shared via the legacy *_shared_user
--     junction (kept in place pre-E2.5 cleanup),
--   * custom rows already attached to a settlement the caller can SELECT
--     (the new Phase-2 transitive policy).
-- Everything else is rejected, which is exactly the closure we want.
--
-- Tables touched (13 — `settlement_timeline_year` is excluded because it
-- references no catalog table and is therefore not affected):
--
--   settlement_collective_cognition_reward → collective_cognition_reward
--   settlement_gear                        → gear
--   settlement_innovation                  → innovation
--   settlement_knowledge                   → knowledge
--   settlement_location                    → location
--   settlement_milestone                   → milestone
--   settlement_nemesis                     → nemesis
--   settlement_pattern                     → pattern
--   settlement_philosophy                  → philosophy
--   settlement_principle                   → principle
--   settlement_quarry                      → quarry
--   settlement_resource                    → resource
--   settlement_seed_pattern                → seed_pattern
--
-- The settlement-membership half of the predicate is unchanged
-- (`is_settlement_owner(settlement_id) or
-- is_settlement_collaborator(settlement_id)`); the new clause is purely
-- additive.
--
-- Reference: `docs/settlement-sharing-architecture.md` Appendix B EC-6
-- (transitive visibility); PR #207 review feedback.
--------------------------------------------------------------------------------
do $$
declare rec record;
begin for rec in
select *
from (
    values (
        'settlement_collective_cognition_reward',
        'collective_cognition_reward',
        'collective_cognition_reward_id'
      ),
      (
        'settlement_gear',
        'gear',
        'gear_id'
      ),
      (
        'settlement_innovation',
        'innovation',
        'innovation_id'
      ),
      (
        'settlement_knowledge',
        'knowledge',
        'knowledge_id'
      ),
      (
        'settlement_location',
        'location',
        'location_id'
      ),
      (
        'settlement_milestone',
        'milestone',
        'milestone_id'
      ),
      (
        'settlement_nemesis',
        'nemesis',
        'nemesis_id'
      ),
      (
        'settlement_pattern',
        'pattern',
        'pattern_id'
      ),
      (
        'settlement_philosophy',
        'philosophy',
        'philosophy_id'
      ),
      (
        'settlement_principle',
        'principle',
        'principle_id'
      ),
      (
        'settlement_quarry',
        'quarry',
        'quarry_id'
      ),
      (
        'settlement_resource',
        'resource',
        'resource_id'
      ),
      (
        'settlement_seed_pattern',
        'seed_pattern',
        'seed_pattern_id'
      )
  ) as t(junction, catalog, fk_col) loop -- INSERT: drop and recreate with the catalog-visibility AND-clause.
  execute format(
    'drop policy if exists "Allow insert for member" on public.%I',
    rec.junction
  );
execute format(
  $f$ create policy "Allow insert for member" on public.%I for
  insert to authenticated with check (
      (
        public.is_settlement_owner(settlement_id)
        or public.is_settlement_collaborator(settlement_id)
      )
      and exists (
        select 1
        from public.%I c
        where c.id = %I
      )
    ) $f$,
    rec.junction,
    rec.catalog,
    rec.fk_col
);
-- UPDATE: same hardening on WITH CHECK. USING stays as the existing
-- membership disjunction so that members can still RE-read the row
-- they own (or co-own) when the policy is consulted. The catalog-
-- visibility check is applied to the post-update row only.
execute format(
  'drop policy if exists "Allow update for member" on public.%I',
  rec.junction
);
execute format(
  $f$ create policy "Allow update for member" on public.%I for
  update to authenticated using (
      public.is_settlement_owner(settlement_id)
      or public.is_settlement_collaborator(settlement_id)
    ) with check (
      (
        public.is_settlement_owner(settlement_id)
        or public.is_settlement_collaborator(settlement_id)
      )
      and exists (
        select 1
        from public.%I c
        where c.id = %I
      )
    ) $f$,
    rec.junction,
    rec.catalog,
    rec.fk_col
);
end loop;
end $$;