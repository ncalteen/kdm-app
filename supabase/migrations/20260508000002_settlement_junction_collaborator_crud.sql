--------------------------------------------------------------------------------
-- Phase 1.2.a — Collaborator CRUD on Settlement Junction Tables
--
-- Replace the owner-only INSERT/UPDATE/DELETE policies on each `settlement_*`
-- junction table with member policies that accept both the settlement owner
-- AND any user listed in `settlement_shared_user`. Authorization is delegated
-- to two SECURITY DEFINER helpers so RLS evaluation cannot recurse into the
-- shared-user table:
--
--   * is_settlement_owner(uuid)        -- existing helper
--   * is_settlement_collaborator(uuid) -- added in
--                                         20260508000001_is_settlement_collaborator.sql
--
-- SELECT continues to use a member policy on each table — the original
-- "Allow select for owner" + "Allow select for shared" pair is replaced
-- with a single helper-based "Allow select for member" policy. Two reasons:
--   * Consistency with INSERT/UPDATE/DELETE — every CRUD verb is now
--     gated by the same disjunction.
--   * The original "for shared" policy contained a latent correlation bug:
--     its EXISTS subquery referenced the unqualified `settlement_id`
--     column, which PostgreSQL resolves to the subquery's own
--     `su.settlement_id` rather than the outer junction column. With the
--     correlation lost, any user with any share could read junction rows
--     for every settlement (cross-settlement leak). The disjunction
--     threads the row's `settlement_id` through the helper as a
--     parameter, which closes the leak.
--
-- Admin bypass policies are untouched.
--
-- Tables affected (alphabetical):
--   settlement_collective_cognition_reward
--   settlement_gear
--   settlement_innovation
--   settlement_knowledge
--   settlement_location
--   settlement_milestone
--   settlement_nemesis
--   settlement_pattern
--   settlement_philosophy
--   settlement_principle
--   settlement_quarry
--   settlement_resource
--   settlement_seed_pattern
--   settlement_timeline_year
--
-- Reference: `docs/sharing-architecture.md` §5.2 Decision 3 / §10 Phase 1.2 /
-- Appendix A "Phase 1 collaborator CRUD list".
--
-- Closes [E1.2.a] (issue #135).
--------------------------------------------------------------------------------
do $$
declare t text;
junction_tables text [] := array [
    'settlement_collective_cognition_reward',
    'settlement_gear',
    'settlement_innovation',
    'settlement_knowledge',
    'settlement_location',
    'settlement_milestone',
    'settlement_nemesis',
    'settlement_pattern',
    'settlement_philosophy',
    'settlement_principle',
    'settlement_quarry',
    'settlement_resource',
    'settlement_seed_pattern',
    'settlement_timeline_year'
  ];
begin foreach t in array junction_tables loop -- Drop existing SELECT and write policies. SELECT-for-shared is also
-- dropped so the latent cross-settlement leak (described in the header)
-- is closed by the new helper-based policy. Admin-bypass is left in
-- place.
execute format(
  'drop policy if exists "Allow select for owner" on %I',
  t
);
execute format(
  'drop policy if exists "Allow select for shared" on %I',
  t
);
execute format(
  'drop policy if exists "Allow insert for owner" on %I',
  t
);
execute format(
  'drop policy if exists "Allow update for owner" on %I',
  t
);
execute format(
  'drop policy if exists "Allow delete for owner" on %I',
  t
);
-- Member SELECT: caller must own OR collaborate on the parent settlement.
-- Both helpers are SECURITY DEFINER, which sidesteps the recursion that
-- bit the original inline EXISTS subquery and removes the latent
-- correlation bug noted in the header.
execute format(
  $f$ create policy "Allow select for member" on %I for
  select to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $f$,
    t
);
-- Member INSERT: same disjunction.
execute format(
  $f$ create policy "Allow insert for member" on %I for
  insert to authenticated with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $f$,
    t
);
-- Member UPDATE: same disjunction on both USING (current row) and WITH
-- CHECK (post-update row). Junction rows are pinned to a single
-- settlement, so re-checking after the update is effectively a no-op
-- but keeps the policy symmetric and defensive against malicious
-- settlement_id rewrites.
execute format(
  $f$ create policy "Allow update for member" on %I for
  update to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $f$,
    t
);
-- Member DELETE: same disjunction.
execute format(
  $f$ create policy "Allow delete for member" on %I for delete to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) $f$,
  t
);
end loop;
end $$;