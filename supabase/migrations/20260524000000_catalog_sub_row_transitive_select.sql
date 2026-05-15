--------------------------------------------------------------------------------
-- Phase 2 [E2.6]: Catalog sub-row + survivor_status transitive visibility.
--
-- `20260520000000_drop_catalog_shared_user_tables.sql` dropped the legacy
-- `Allow select for shared and custom` policy on the catalog sub-rows below
-- but explicitly deferred installing a replacement transitive predicate:
--
--     "...dropping it here means custom rows on those tables are author-only
--      for now, which is acceptable until those catalogs get their own
--      transitive predicates."
--
-- This migration closes that gap by installing
-- `Allow select via settlement membership` (or, where the parent walks
-- gear_grid, `Allow select via gear_grid`) on each of the following sub-row
-- tables. Each policy piggy-backs on the parent catalog's own visibility
-- chain — when the parent row is reachable to the caller via a settlement
-- they own or collaborate on, the sub-rows fall out for free.
--
-- Three logical groups:
--
--   1. Crafting cost children of `gear` / `pattern` / `seed_pattern`. Visible
--      when the parent recipe is `custom` and attached to a settlement the
--      caller can see via `settlement_gear` / `settlement_pattern` /
--      `settlement_seed_pattern`. We rely on the parent table's own
--      `Allow select via settlement membership` policy (installed in
--      `20260512000000_catalog_visibility_via_settlement.sql`) by re-running
--      the same EXISTS join on the parent's settlement junction. This keeps
--      the join chain symmetric with the parent and avoids relying on
--      transitive RLS inside the EXISTS subquery.
--
--   2. `armor_set_slot_gear` — visible iff the parent armor_set is custom
--      and attached to a settlement via `gear_grid.selected_armor_set_id`
--      (matching `armor_set` / `armor_set_slot` policies installed in
--      `20260516000000_catalog_transitive_hunt_showdown.sql`).
--
--      NOTE: The legacy `armor_set_gear` table was dropped in
--      `20260425000000_armor_set_slots.sql` line 76 and is intentionally
--      not addressed here. The slot-based model in `armor_set_slot_gear`
--      is its replacement.
--
--   3. `quarry_level_survivor_status` / `nemesis_level_survivor_status` —
--      visible iff the parent quarry/nemesis is custom and attached to a
--      settlement the caller can see (mirrors the trait/mood policies on
--      `quarry_level_trait`, `nemesis_level_trait`, etc.). Direct sub-rows
--      of `quarry` / `nemesis` (locations, timeline years, hunt board,
--      hunt board positions, collective cognition rewards) follow the
--      same pattern but join the parent table directly. `wanderer_*`
--      child tables are intentionally excluded — `wanderer` has no
--      settlement junction, so its custom children remain author-only.
--
-- And finally:
--
--   4. `survivor_status` itself (the catalog parent) gets a 4-way UNION
--      transitive SELECT mirroring the `trait` and `mood` predicates from
--      `20260516000000`. A custom `survivor_status` is reachable through
--      `hunt_monster_survivor_status`, `showdown_monster_survivor_status`,
--      `quarry_level_survivor_status`, or `nemesis_level_survivor_status`.
--
-- Both `Allow select for owner and custom` (author) and
-- `Allow select for authenticated and non-custom` (catalog-default) remain
-- untouched on every table here. This migration only adds the transitive
-- predicates that complete the Phase 2 picture per docs/sharing-
-- architecture.md §10 Phase 2.
--
-- Citations:
--   docs/settlement-sharing-architecture.md §5.2 Decision 2, §10 Phase 2 (2.2)
--   supabase/migrations/20260512000000_catalog_visibility_via_settlement.sql
--   supabase/migrations/20260516000000_catalog_transitive_hunt_showdown.sql
--   supabase/migrations/20260520000000_drop_catalog_shared_user_tables.sql
--------------------------------------------------------------------------------
--
-- 1. Crafting cost children of `gear` — visible iff parent `gear.custom`
--    is attached to a settlement the caller can see via `settlement_gear`.
--    Mirrors the parent `Allow select via settlement membership` policy.
--
create policy "Allow select via settlement membership" on gear_gear_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
        join settlement_gear sj on sj.gear_id = g.id
      where g.id = gear_gear_cost.gear_id
        and g.custom
    )
  );
create policy "Allow select via settlement membership" on gear_resource_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
        join settlement_gear sj on sj.gear_id = g.id
      where g.id = gear_resource_cost.gear_id
        and g.custom
    )
  );
create policy "Allow select via settlement membership" on gear_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
        join settlement_gear sj on sj.gear_id = g.id
      where g.id = gear_resource_type_cost.gear_id
        and g.custom
    )
  );
create policy "Allow select via settlement membership" on gear_other_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
        join settlement_gear sj on sj.gear_id = g.id
      where g.id = gear_other_cost.gear_id
        and g.custom
    )
  );
--
-- 2. Crafting cost children of `pattern` — visible iff parent
--    `pattern.custom` is attached to a settlement the caller can see via
--    `settlement_pattern`.
--
create policy "Allow select via settlement membership" on pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
        join settlement_pattern sj on sj.pattern_id = p.id
      where p.id = pattern_gear_cost.pattern_id
        and p.custom
    )
  );
create policy "Allow select via settlement membership" on pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
        join settlement_pattern sj on sj.pattern_id = p.id
      where p.id = pattern_resource_cost.pattern_id
        and p.custom
    )
  );
create policy "Allow select via settlement membership" on pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
        join settlement_pattern sj on sj.pattern_id = p.id
      where p.id = pattern_resource_type_cost.pattern_id
        and p.custom
    )
  );
create policy "Allow select via settlement membership" on pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from pattern p
        join settlement_pattern sj on sj.pattern_id = p.id
      where p.id = pattern_innovation_requirement.pattern_id
        and p.custom
    )
  );
--
-- 3. Crafting cost children of `seed_pattern` — visible iff parent
--    `seed_pattern.custom` is attached to a settlement the caller can see
--    via `settlement_seed_pattern`.
--
create policy "Allow select via settlement membership" on seed_pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
        join settlement_seed_pattern sj on sj.seed_pattern_id = sp.id
      where sp.id = seed_pattern_gear_cost.seed_pattern_id
        and sp.custom
    )
  );
create policy "Allow select via settlement membership" on seed_pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
        join settlement_seed_pattern sj on sj.seed_pattern_id = sp.id
      where sp.id = seed_pattern_resource_cost.seed_pattern_id
        and sp.custom
    )
  );
create policy "Allow select via settlement membership" on seed_pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
        join settlement_seed_pattern sj on sj.seed_pattern_id = sp.id
      where sp.id = seed_pattern_resource_type_cost.seed_pattern_id
        and sp.custom
    )
  );
create policy "Allow select via settlement membership" on seed_pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
        join settlement_seed_pattern sj on sj.seed_pattern_id = sp.id
      where sp.id = seed_pattern_innovation_requirement.seed_pattern_id
        and sp.custom
    )
  );
--
-- 4. `armor_set_slot_gear` — visible iff parent armor_set is custom and
--    attached to a settlement via `gear_grid.selected_armor_set_id`,
--    matching the parent `armor_set` / `armor_set_slot` policies in
--    `20260516000000_catalog_transitive_hunt_showdown.sql`.
--
create policy "Allow select via gear_grid" on armor_set_slot_gear for
select to authenticated using (
    exists (
      select 1
      from armor_set_slot asl
        join armor_set a on a.id = asl.armor_set_id
        join gear_grid gg on gg.selected_armor_set_id = a.id
        join survivor sv on sv.id = gg.survivor_id
      where asl.id = armor_set_slot_gear.armor_set_slot_id
        and a.custom
        and (
          is_settlement_owner(sv.settlement_id)
          or is_settlement_collaborator(sv.settlement_id)
        )
    )
  );
--
-- 5. `quarry_level_survivor_status` / `nemesis_level_survivor_status` —
--    mirror `quarry_level_trait` / `nemesis_level_trait` in
--    `20260516000000_catalog_transitive_hunt_showdown.sql`. Visible iff
--    parent quarry/nemesis is custom and attached to a settlement the
--    caller can see.
--
create policy "Allow select via settlement membership" on quarry_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
        join settlement_quarry sq on sq.quarry_id = q.id
      where ql.id = quarry_level_survivor_status.quarry_level_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on nemesis_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
        join settlement_nemesis sn on sn.nemesis_id = n.id
      where nl.id = nemesis_level_survivor_status.nemesis_level_id
        and n.custom
        and (
          is_settlement_owner(sn.settlement_id)
          or is_settlement_collaborator(sn.settlement_id)
        )
    )
  );
--
-- 5b. Direct sub-rows of `quarry` and `nemesis` that were not addressed
--     in `[5]`. The legacy `Allow select for shared and custom` policy
--     on these tables was dropped in
--     `20260520000000_drop_catalog_shared_user_tables.sql` and never
--     replaced, leaving collaborators able to see the custom
--     parent (via `quarry` / `nemesis`'s own transitive predicate
--     installed in `20260514000000_catalog_transitive_select.sql` and
--     `20260523000000_catalog_author_membership_select.sql`) but
--     missing the parent's locations, timeline years, hunt board, hunt
--     board positions, and collective cognition rewards. Each policy
--     mirrors `[5]` but joins the parent table directly instead of
--     going through `quarry_level` / `nemesis_level`.
--
--     `wanderer_*` child tables are deliberately not addressed here —
--     `wanderer` has no settlement junction (no `settlement_wanderer`
--     table; wanderers are copied into `survivor` rows at promotion
--     time), so custom wanderers and their children are author-only by
--     design after [E2.6].
--
create policy "Allow select via settlement membership" on quarry_location for
select to authenticated using (
    exists (
      select 1
      from quarry q
        join settlement_quarry sq on sq.quarry_id = q.id
      where q.id = quarry_location.quarry_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on quarry_timeline_year for
select to authenticated using (
    exists (
      select 1
      from quarry q
        join settlement_quarry sq on sq.quarry_id = q.id
      where q.id = quarry_timeline_year.quarry_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on quarry_hunt_board for
select to authenticated using (
    exists (
      select 1
      from quarry q
        join settlement_quarry sq on sq.quarry_id = q.id
      where q.id = quarry_hunt_board.quarry_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on quarry_hunt_board_position for
select to authenticated using (
    exists (
      select 1
      from quarry q
        join settlement_quarry sq on sq.quarry_id = q.id
      where q.id = quarry_hunt_board_position.quarry_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on quarry_collective_cognition_reward for
select to authenticated using (
    exists (
      select 1
      from quarry q
        join settlement_quarry sq on sq.quarry_id = q.id
      where q.id = quarry_collective_cognition_reward.quarry_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on nemesis_location for
select to authenticated using (
    exists (
      select 1
      from nemesis n
        join settlement_nemesis sn on sn.nemesis_id = n.id
      where n.id = nemesis_location.nemesis_id
        and n.custom
        and (
          is_settlement_owner(sn.settlement_id)
          or is_settlement_collaborator(sn.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on nemesis_timeline_year for
select to authenticated using (
    exists (
      select 1
      from nemesis n
        join settlement_nemesis sn on sn.nemesis_id = n.id
      where n.id = nemesis_timeline_year.nemesis_id
        and n.custom
        and (
          is_settlement_owner(sn.settlement_id)
          or is_settlement_collaborator(sn.settlement_id)
        )
    )
  );
--
-- 6. `survivor_status` — the catalog parent itself. Mirrors the 4-way
--    UNION transitive SELECT for `trait` and `mood` from
--    `20260523000000_catalog_author_membership_select.sql` (which
--    rewrote the original `20260516000000` policies to include the
--    author-membership check). Each reachability branch ends with
--    `is_settlement_member(<branch>.settlement_id, survivor_status.user_id)`
--    so visibility revokes the moment the status author is removed
--    from `settlement_shared_user` — closing the EC-7 gap for
--    `survivor_status` the same way `trait`/`mood` were closed.
--
--    A custom `survivor_status` is reachable to a caller through any of:
--      a) `hunt_monster_survivor_status` -> `hunt_monster.settlement_id`
--      b) `showdown_monster_survivor_status` -> `showdown_monster.settlement_id`
--      c) `quarry_level_survivor_status` -> `quarry_level` ->
--         `settlement_quarry`
--      d) `nemesis_level_survivor_status` -> `nemesis_level` ->
--         `settlement_nemesis`
--
--    The `quarry` / `nemesis` joins added in `[5]` above are intentionally
--    omitted here: per the `trait`/`mood` precedent, `settlement_quarry`
--    / `settlement_nemesis` membership already implies the parent is
--    attached to a settlement the caller can see, and `quarry`/`nemesis`
--    RLS independently enforces `custom`.
--
create policy "Allow select via hunt/showdown/quarry/nemesis" on survivor_status for
select to authenticated using (
    custom
    and (
      exists (
        select 1
        from hunt_monster_survivor_status hmss
          join hunt_monster hm on hm.id = hmss.hunt_monster_id
        where hmss.survivor_status_id = survivor_status.id
          and (
            is_settlement_owner(hm.settlement_id)
            or is_settlement_collaborator(hm.settlement_id)
          )
          and is_settlement_member(hm.settlement_id, survivor_status.user_id)
      )
      or exists (
        select 1
        from showdown_monster_survivor_status smss
          join showdown_monster sm on sm.id = smss.showdown_monster_id
        where smss.survivor_status_id = survivor_status.id
          and (
            is_settlement_owner(sm.settlement_id)
            or is_settlement_collaborator(sm.settlement_id)
          )
          and is_settlement_member(sm.settlement_id, survivor_status.user_id)
      )
      or exists (
        select 1
        from quarry_level_survivor_status qlss
          join quarry_level ql on ql.id = qlss.quarry_level_id
          join settlement_quarry sq on sq.quarry_id = ql.quarry_id
        where qlss.survivor_status_id = survivor_status.id
          and (
            is_settlement_owner(sq.settlement_id)
            or is_settlement_collaborator(sq.settlement_id)
          )
          and is_settlement_member(sq.settlement_id, survivor_status.user_id)
      )
      or exists (
        select 1
        from nemesis_level_survivor_status nlss
          join nemesis_level nl on nl.id = nlss.nemesis_level_id
          join settlement_nemesis sn on sn.nemesis_id = nl.nemesis_id
        where nlss.survivor_status_id = survivor_status.id
          and (
            is_settlement_owner(sn.settlement_id)
            or is_settlement_collaborator(sn.settlement_id)
          )
          and is_settlement_member(sn.settlement_id, survivor_status.user_id)
      )
    )
  );