--------------------------------------------------------------------------------
-- Phase 1.2.d — Collaborator CRUD on Hunt + Showdown Tables
--
-- Replace the owner-only SELECT/INSERT/UPDATE/DELETE policies on every hunt
-- and showdown table with member policies that accept both the settlement
-- owner AND any user listed in `settlement_shared_user`. Authorization is
-- delegated to two SECURITY DEFINER helpers so RLS evaluation cannot recurse
-- into the shared-user table:
--
--   * is_settlement_owner(uuid)        -- existing helper
--   * is_settlement_collaborator(uuid) -- added in
--                                         20260508000001_is_settlement_collaborator.sql
--
-- Two table groupings:
--
--   1. Direct-settlement tables (9): the row carries `settlement_id`.
--      Predicate is the simple disjunction
--        is_settlement_owner(settlement_id)
--        or is_settlement_collaborator(settlement_id)
--      Tables: hunt, hunt_ai_deck, hunt_hunt_board, hunt_monster,
--              hunt_survivor, showdown, showdown_ai_deck,
--              showdown_monster, showdown_survivor.
--
--   2. Monster-scoped junctions (6): the row carries `hunt_monster_id` or
--      `showdown_monster_id` (no `settlement_id`). The predicate threads
--      through the parent monster row:
--        exists (
--          select 1 from <hunt|showdown>_monster m
--          where m.id = <table>.<hunt|showdown>_monster_id
--            and (
--              is_settlement_owner(m.settlement_id)
--              or is_settlement_collaborator(m.settlement_id)
--            )
--        )
--      The inner SELECT against the parent monster is satisfied by the
--      "Allow select for member" policy created in this same migration.
--      Tables: hunt_monster_trait, hunt_monster_mood,
--              hunt_monster_survivor_status, showdown_monster_trait,
--              showdown_monster_mood, showdown_monster_survivor_status.
--
-- SELECT continues to use a single member policy on each table — the
-- original "Allow select for owner" + "Allow select for shared" pair is
-- replaced with a single helper-based "Allow select for member" policy.
-- Two reasons:
--   * Consistency with INSERT/UPDATE/DELETE — every CRUD verb is now gated
--     by the same disjunction.
--   * The 9 direct-settlement tables' "Allow select for shared" policies
--     contained the same latent correlation bug fixed for the junction
--     tables in 20260508000002, the phase tables in 20260508000003, and
--     `survivor` in 20260508000004: their EXISTS subqueries referenced
--     the unqualified `settlement_id` column, which PostgreSQL resolved
--     to the subquery's own `su.settlement_id` rather than the outer
--     row's column. With the correlation lost, any user with any share
--     could read hunt / showdown rows for every settlement
--     (cross-settlement leak). The new helper-based policy threads the
--     row's `settlement_id` through `is_settlement_collaborator()` as a
--     parameter and closes the leak.
--
--     The 6 monster-scoped junctions' SELECT-for-shared policies were
--     already correctly qualified (they explicitly join through the
--     parent monster row with an aliased `su`), but they are
--     consolidated here for symmetry.
--
-- Admin bypass policies are untouched.
--
-- Reference:
--   * supabase/migrations/20260223215817_hunt.sql — and siblings: original
--     owner-only policies on the direct-settlement tables.
--   * supabase/migrations/20260422000005_hunt_monster_trait_mood.sql,
--     20260422000006_showdown_monster_trait_mood.sql,
--     20260424000006_hunt_showdown_monster_survivor_status.sql — original
--     owner-only policies on the monster-scoped junctions.
--   * supabase/migrations/20260508000002_settlement_junction_collaborator_crud.sql
--   * supabase/migrations/20260508000003_settlement_phase_collaborator_crud.sql
--   * supabase/migrations/20260508000004_survivor_collaborator_crud.sql
--   * `local/sharing-architecture.md` §5.2 Decision 3 / §10 Phase 1.2.d.
--
-- Closes [E1.2.d] (issue #140).
--------------------------------------------------------------------------------
--
-- 1. Direct-settlement tables — settlement_id is on the row.
--
do $$
declare
  t text;
  direct_tables text[] := array[
    'hunt',
    'hunt_ai_deck',
    'hunt_hunt_board',
    'hunt_monster',
    'hunt_survivor',
    'showdown',
    'showdown_ai_deck',
    'showdown_monster',
    'showdown_survivor'
  ];
begin
  foreach t in array direct_tables loop
    execute format('drop policy if exists "Allow select for owner" on %I', t);
    execute format('drop policy if exists "Allow select for shared" on %I', t);
    execute format('drop policy if exists "Allow insert for owner" on %I', t);
    execute format('drop policy if exists "Allow update for owner" on %I', t);
    execute format('drop policy if exists "Allow delete for owner" on %I', t);

    execute format(
      $f$create policy "Allow select for member" on %I
        for select to authenticated using (
          is_settlement_owner(settlement_id)
          or is_settlement_collaborator(settlement_id)
        )$f$,
      t
    );
    execute format(
      $f$create policy "Allow insert for member" on %I
        for insert to authenticated with check (
          is_settlement_owner(settlement_id)
          or is_settlement_collaborator(settlement_id)
        )$f$,
      t
    );
    execute format(
      $f$create policy "Allow update for member" on %I
        for update to authenticated using (
          is_settlement_owner(settlement_id)
          or is_settlement_collaborator(settlement_id)
        ) with check (
          is_settlement_owner(settlement_id)
          or is_settlement_collaborator(settlement_id)
        )$f$,
      t
    );
    execute format(
      $f$create policy "Allow delete for member" on %I
        for delete to authenticated using (
          is_settlement_owner(settlement_id)
          or is_settlement_collaborator(settlement_id)
        )$f$,
      t
    );
  end loop;
end $$;
--
-- 2. Monster-scoped junctions — resolve membership via the parent
--    hunt_monster / showdown_monster row.
--
do $$
declare
  spec record;
begin
  for spec in
    select *
    from (values
      ('hunt_monster_trait',               'hunt_monster',     'hunt_monster_id'),
      ('hunt_monster_mood',                'hunt_monster',     'hunt_monster_id'),
      ('hunt_monster_survivor_status',     'hunt_monster',     'hunt_monster_id'),
      ('showdown_monster_trait',           'showdown_monster', 'showdown_monster_id'),
      ('showdown_monster_mood',            'showdown_monster', 'showdown_monster_id'),
      ('showdown_monster_survivor_status', 'showdown_monster', 'showdown_monster_id')
    ) as t (child, parent, fk)
  loop
    execute format(
      'drop policy if exists "Allow select for owner" on %I',
      spec.child
    );
    execute format(
      'drop policy if exists "Allow select for shared" on %I',
      spec.child
    );
    execute format(
      'drop policy if exists "Allow insert for owner" on %I',
      spec.child
    );
    execute format(
      'drop policy if exists "Allow update for owner" on %I',
      spec.child
    );
    execute format(
      'drop policy if exists "Allow delete for owner" on %I',
      spec.child
    );

    -- %1 child table, %2 parent table, %3 FK column.
    execute format(
      $f$create policy "Allow select for member" on %1$I
        for select to authenticated using (
          exists (
            select 1 from %2$I m
            where m.id = %1$I.%3$I
              and (
                is_settlement_owner(m.settlement_id)
                or is_settlement_collaborator(m.settlement_id)
              )
          )
        )$f$,
      spec.child, spec.parent, spec.fk
    );
    execute format(
      $f$create policy "Allow insert for member" on %1$I
        for insert to authenticated with check (
          exists (
            select 1 from %2$I m
            where m.id = %1$I.%3$I
              and (
                is_settlement_owner(m.settlement_id)
                or is_settlement_collaborator(m.settlement_id)
              )
          )
        )$f$,
      spec.child, spec.parent, spec.fk
    );
    execute format(
      $f$create policy "Allow update for member" on %1$I
        for update to authenticated using (
          exists (
            select 1 from %2$I m
            where m.id = %1$I.%3$I
              and (
                is_settlement_owner(m.settlement_id)
                or is_settlement_collaborator(m.settlement_id)
              )
          )
        ) with check (
          exists (
            select 1 from %2$I m
            where m.id = %1$I.%3$I
              and (
                is_settlement_owner(m.settlement_id)
                or is_settlement_collaborator(m.settlement_id)
              )
          )
        )$f$,
      spec.child, spec.parent, spec.fk
    );
    execute format(
      $f$create policy "Allow delete for member" on %1$I
        for delete to authenticated using (
          exists (
            select 1 from %2$I m
            where m.id = %1$I.%3$I
              and (
                is_settlement_owner(m.settlement_id)
                or is_settlement_collaborator(m.settlement_id)
              )
          )
        )$f$,
      spec.child, spec.parent, spec.fk
    );
  end loop;
end $$;
