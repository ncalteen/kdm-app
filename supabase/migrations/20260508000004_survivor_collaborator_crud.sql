--------------------------------------------------------------------------------
-- Phase 1.2.c — Collaborator CRUD on Survivor + Survivor Junctions + Gear Grid
--
-- Replace the owner-only SELECT/INSERT/UPDATE/DELETE policies on `survivor`,
-- the five survivor-owned junctions, and `gear_grid` with member policies
-- that accept both the settlement owner AND any user listed in
-- `settlement_shared_user`. Authorization is delegated to two SECURITY
-- DEFINER helpers so RLS evaluation cannot recurse into the shared-user
-- table:
--
--   * is_settlement_owner(uuid)        -- existing helper
--   * is_settlement_collaborator(uuid) -- added in
--                                         20260508000001_is_settlement_collaborator.sql
--
-- For `survivor`, the row carries `settlement_id` directly, so the policy
-- predicate is the same simple disjunction used by the settlement-junction
-- migration in 20260508000002.
--
-- For survivor-owned junctions and `gear_grid`, the row carries `survivor_id`
-- (no `settlement_id`), so the predicate threads through the survivor:
--
--   exists (
--     select 1 from survivor sv
--     where sv.id = <table>.survivor_id
--       and (is_settlement_owner(sv.settlement_id)
--            or is_settlement_collaborator(sv.settlement_id))
--   )
--
-- The inner SELECT against `survivor` is itself subject to survivor's RLS;
-- that RLS is replaced earlier in this same migration with a member-friendly
-- policy, so the collaborator path resolves cleanly. The two helpers are
-- SECURITY DEFINER so they bypass `settlement_shared_user`'s RLS and avoid
-- the recursion risk that motivated the helper pattern in the first place
-- (see 20260324185335).
--
-- SELECT continues to use a single member policy on each table — the
-- original "Allow select for owner" + "Allow select for shared" pair is
-- replaced with a single helper-based "Allow select for member" policy.
-- Two reasons:
--   * Consistency with INSERT/UPDATE/DELETE — every CRUD verb is now gated
--     by the same disjunction.
--   * `survivor`'s "Allow select for shared" policy contained the same
--     latent correlation bug fixed for the junction tables in
--     20260508000002 and the phase tables in 20260508000003: its EXISTS
--     subquery referenced an unqualified `settlement_id` that PostgreSQL
--     resolved to the subquery's own `su.settlement_id` rather than the
--     outer survivor row's column, leaking survivor rows for every
--     settlement to any user with any share. The new helper-based
--     "Allow select for member" policy threads the row's `settlement_id`
--     through `is_settlement_collaborator()` as a parameter and closes
--     the leak. The SELECT-for-shared policies on `survivor_disorder`
--     and the rest of the junction set were already correctly qualified
--     (they explicitly join through `survivor` via aliased columns),
--     but they are consolidated here for symmetry with the rest of the
--     suite.
--
-- Out of scope for this migration:
--   * `survivor_status` is a CATALOG table (custom-content RLS pattern),
--     not a survivor-owned junction. It is governed by the catalog
--     sharing model (E2.x) and is intentionally left alone here even
--     though the architecture doc lists it under "survivor child rows".
--   * `hunt_survivor` / `showdown_survivor` are settlement-scoped via
--     `hunt` / `showdown`, not survivor-scoped, and are covered by
--     [E1.2.d] (issue #140).
--
-- Admin bypass policies are untouched.
--
-- Reference:
--   * supabase/migrations/20260220192245_survivor.sql — original
--     owner-only policies on `survivor`.
--   * supabase/migrations/20260220192246_survivor_disorder.sql — and
--     siblings: original survivor-junction policies.
--   * supabase/migrations/20260413223402_survivor_ability_impairment.sql
--   * supabase/migrations/20260503000000_gear_grid_settlement_rls.sql —
--     prior gear_grid rewrite from catalog-style to settlement-scoped.
--   * supabase/migrations/20260508000002_settlement_junction_collaborator_crud.sql
--   * supabase/migrations/20260508000003_settlement_phase_collaborator_crud.sql
--   * `docs/sharing-architecture.md` §5.2 Decision 3 / §10 Phase 1.2.c.
--
-- Closes [E1.2.c] (issue #145).
--------------------------------------------------------------------------------
--
-- 1. survivor — settlement_id is on the row, so the simple disjunction works.
--
drop policy if exists "Allow select for owner" on survivor;
drop policy if exists "Allow select for shared" on survivor;
drop policy if exists "Allow insert for owner" on survivor;
drop policy if exists "Allow update for owner" on survivor;
drop policy if exists "Allow delete for owner" on survivor;
create policy "Allow select for member" on survivor for
select to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow insert for member" on survivor for
insert to authenticated with check (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow update for member" on survivor for
update to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) with check (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  );
create policy "Allow delete for member" on survivor for delete to authenticated using (
  is_settlement_owner(settlement_id)
  or is_settlement_collaborator(settlement_id)
);
--
-- 2. Survivor-owned junctions and gear_grid — survivor_id only; resolve
--    settlement membership via the survivor row.
--
do $$
declare t text;
child_tables text [] := array [
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_secret_fighting_art',
    'survivor_cursed_gear',
    'survivor_ability_impairment',
    'gear_grid'
  ];
begin foreach t in array child_tables loop execute format(
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
execute format(
  $f$create policy "Allow select for member" on %1$I for
  select to authenticated using (
      exists (
        select 1
        from survivor sv
        where sv.id = %1$I.survivor_id
          and (
            is_settlement_owner(sv.settlement_id)
            or is_settlement_collaborator(sv.settlement_id)
          )
      )
    ) $f$,
    t
);
execute format(
  $f$create policy "Allow insert for member" on %1$I for
  insert to authenticated with check (
      exists (
        select 1
        from survivor sv
        where sv.id = %1$I.survivor_id
          and (
            is_settlement_owner(sv.settlement_id)
            or is_settlement_collaborator(sv.settlement_id)
          )
      )
    ) $f$,
    t
);
execute format(
  $f$create policy "Allow update for member" on %1$I for
  update to authenticated using (
      exists (
        select 1
        from survivor sv
        where sv.id = %1$I.survivor_id
          and (
            is_settlement_owner(sv.settlement_id)
            or is_settlement_collaborator(sv.settlement_id)
          )
      )
    ) with check (
      exists (
        select 1
        from survivor sv
        where sv.id = %1$I.survivor_id
          and (
            is_settlement_owner(sv.settlement_id)
            or is_settlement_collaborator(sv.settlement_id)
          )
      )
    ) $f$,
    t
);
execute format(
  $f$create policy "Allow delete for member" on %1$I for delete to authenticated using (
    exists (
      select 1
      from survivor sv
      where sv.id = %1$I.survivor_id
        and (
          is_settlement_owner(sv.settlement_id)
          or is_settlement_collaborator(sv.settlement_id)
        )
    )
  ) $f$,
  t
);
end loop;
end $$;