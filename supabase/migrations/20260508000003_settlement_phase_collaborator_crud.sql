--------------------------------------------------------------------------------
-- Phase 1.2.b — Collaborator CRUD on Settlement Phase Tables
--
-- Replace the owner-only INSERT/UPDATE/DELETE policies on `settlement_phase`
-- and `settlement_phase_returning_survivor` with member policies that accept
-- both the settlement owner AND any user listed in `settlement_shared_user`.
-- Authorization is delegated to two SECURITY DEFINER helpers so RLS
-- evaluation cannot recurse into the shared-user table:
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
--   * `settlement_phase`'s "Allow select for shared" policy contained the
--     same latent correlation bug fixed for the junction tables in
--     20260508000002: its EXISTS subquery referenced an unqualified
--     `settlement_id` that PostgreSQL resolved to the subquery's own
--     `su.settlement_id` rather than the outer phase row's column,
--     leaking phase rows for every settlement to any user with any
--     share. The helper-based policy threads the row's `settlement_id`
--     through the helper as a parameter and closes the leak.
--     `settlement_phase_returning_survivor`'s SELECT-for-shared policy
--     was already correctly qualified (see 20260324185312), but it is
--     consolidated here for symmetry with the rest of the suite.
--
-- Admin bypass policies are untouched.
--
-- Reference:
--   * supabase/migrations/20260220194908_settlement_phase.sql — original
--     owner-only policies on both tables.
--   * supabase/migrations/20260324185312_fix_settlement_phase_returning_survivor_rls.sql
--     — earlier fix that re-qualified column references on the join table.
--   * supabase/migrations/20260508000002_settlement_junction_collaborator_crud.sql
--     — sibling migration covering Phase 1.2.a junction tables.
--   * `local/sharing-architecture.md` §5.2 Decision 3 / §10 Phase 1.2.b.
--
-- Closes [E1.2.b] (issue #138).
--------------------------------------------------------------------------------
do $$
declare t text;
phase_tables text [] := array [
    'settlement_phase',
    'settlement_phase_returning_survivor'
  ];
begin foreach t in array phase_tables loop -- Drop existing SELECT and write policies. SELECT-for-shared is also
-- dropped so the latent cross-settlement leak (described in the
-- header) is closed by the new helper-based policy on
-- `settlement_phase`. Admin-bypass is left in place.
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
-- Member SELECT: caller must own OR collaborate on the parent
-- settlement. Both helpers are SECURITY DEFINER, which sidesteps
-- the recursion that bit the original inline EXISTS subquery and
-- removes the latent correlation bug noted in the header.
execute format(
  $f$create policy "Allow select for member" on %I for
  select to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $f$,
    t
);
-- Member INSERT: same disjunction.
execute format(
  $f$create policy "Allow insert for member" on %I for
  insert to authenticated with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $f$,
    t
);
-- Member UPDATE: same disjunction on both USING (current row) and
-- WITH CHECK (post-update row). Phase rows are pinned to a single
-- settlement, so re-checking after the update is effectively a
-- no-op but keeps the policy symmetric and defensive against
-- malicious `settlement_id` rewrites.
execute format(
  $f$create policy "Allow update for member" on %I for
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
  $f$create policy "Allow delete for member" on %I for delete to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) $f$,
  t
);
end loop;
end $$;