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
-- Cross-settlement consistency on the join table:
--   `settlement_phase_returning_survivor` carries three independent
--   foreign keys (`settlement_id`, `settlement_phase_id`, `survivor_id`)
--   with no schema-level constraint forcing them to point at the same
--   settlement. Without an extra RLS predicate, a member of settlement
--   A could write `{settlement_id: A, settlement_phase_id: <A's phase>,
--   survivor_id: <a survivor from settlement B>}`, creating a join row
--   whose three references straddle settlements. The INSERT and
--   UPDATE WITH CHECK predicates below add EXISTS subqueries that
--   require the referenced phase row and the referenced survivor row
--   to live in the same settlement as the join row's `settlement_id`.
--   Both subqueries run under the caller's RLS, which is sufficient
--   here because the caller already has SELECT access to phase /
--   survivor rows of settlements they own or collaborate on (see
--   `Allow select for member` on `settlement_phase` and the existing
--   `Allow select for shared` on `survivor`).
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
--   * `docs/sharing-architecture.md` §5.2 Decision 3 / §10 Phase 1.2.b.
--
-- Closes [E1.2.b] (issue #138).
--------------------------------------------------------------------------------
--
-- Drop the existing owner-only / shared SELECT policies on both tables.
-- Admin-bypass policies are intentionally left in place.
--
do $$
declare t text;
phase_tables text [] := array [
    'settlement_phase',
    'settlement_phase_returning_survivor'
  ];
begin foreach t in array phase_tables loop execute format(
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
end loop;
end $$;
--
-- settlement_phase — standard member policies. The phase row is pinned to
-- a single settlement, so the helper-based disjunction is sufficient.
--
create policy "Allow select for member" on settlement_phase
for
select to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow insert for member" on settlement_phase for
insert to authenticated with check (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow update for member" on settlement_phase for
update to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) with check (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow delete for member" on settlement_phase for delete to authenticated using (
  is_settlement_owner(settlement_id)
  or is_settlement_collaborator(settlement_id)
);
--
-- settlement_phase_returning_survivor — member policies plus a
-- cross-settlement consistency check on writes. The join table carries
-- three independent foreign keys; the EXISTS subqueries below ensure
-- the referenced phase and survivor live in the same settlement as the
-- join row. SELECT and DELETE only require the basic membership check.
--
create policy "Allow select for member" on settlement_phase_returning_survivor
for
select to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow insert for member" on settlement_phase_returning_survivor for
insert to authenticated with check (
    (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    )
    and exists (
      select 1
      from settlement_phase sp
      where sp.id = settlement_phase_returning_survivor.settlement_phase_id
        and sp.settlement_id = settlement_phase_returning_survivor.settlement_id
    )
    and exists (
      select 1
      from survivor sv
      where sv.id = settlement_phase_returning_survivor.survivor_id
        and sv.settlement_id = settlement_phase_returning_survivor.settlement_id
    )
  );
create policy "Allow update for member" on settlement_phase_returning_survivor for
update to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) with check (
    (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    )
    and exists (
      select 1
      from settlement_phase sp
      where sp.id = settlement_phase_returning_survivor.settlement_phase_id
        and sp.settlement_id = settlement_phase_returning_survivor.settlement_id
    )
    and exists (
      select 1
      from survivor sv
      where sv.id = settlement_phase_returning_survivor.survivor_id
        and sv.settlement_id = settlement_phase_returning_survivor.settlement_id
    )
  );
create policy "Allow delete for member" on settlement_phase_returning_survivor for delete to authenticated using (
  is_settlement_owner(settlement_id)
  or is_settlement_collaborator(settlement_id)
);