--------------------------------------------------------------------------------
-- Phase 2 [E2.1.c]: Catalog Transitive SELECT — hunt / showdown / armor.
--
-- Adds transitive-visibility policies for the remaining catalog tables
-- that are reachable through hunt-, showdown-, or armor-shaped junctions.
-- A custom catalog row is readable when either:
--   * the caller authored it (preserved by existing
--     `Allow select for owner and custom`), OR
--   * the row is referenced by a junction whose ultimate `settlement_id`
--     is one the caller owns or collaborates on.
--
-- Tables and reference chains:
--
-- `trait` and `mood` — reachable via four junctions, OR-combined in a
-- single policy:
--   * hunt_monster_<trait|mood>     -> hunt_monster.settlement_id     -> settlement
--   * showdown_monster_<trait|mood> -> showdown_monster.settlement_id -> settlement
--   * quarry_level_<trait|mood>     -> quarry_level.quarry_id         -> settlement_quarry  -> settlement
--   * nemesis_level_<trait|mood>    -> nemesis_level.nemesis_id       -> settlement_nemesis -> settlement
--
-- `armor_set` — reachable via the survivor's selected armor on `gear_grid`:
--   armor_set <- gear_grid.selected_armor_set_id
--             -> gear_grid.survivor_id -> survivor.settlement_id -> settlement
--
-- `armor_set_slot` (singular table name; the issue uses "armor_set_slots"
-- generically) — visible iff its parent `armor_set` is visible via the
-- same chain.
--
-- `quarry_level` — visible iff parent `quarry` is custom and attached to
-- a settlement the caller can see:
--   quarry_level.quarry_id -> settlement_quarry -> settlement
--
-- `nemesis_level` — symmetric to quarry_level:
--   nemesis_level.nemesis_id -> settlement_nemesis -> settlement
--
-- Legacy `*_shared_user` SELECT policies on these tables are left in
-- place. They will be dropped in the Phase 2.5 deprecation pass per
-- Appendix A. The Phase 2 transitive predicate added here is purely
-- additive (Postgres ORs permissive SELECT policies).
--
-- UPDATE / INSERT / DELETE policies are not modified. Author-only
-- enforcement is tracked under [E2.2] (issue #149).
--
-- Citations:
--   local/sharing-architecture.md §5.2 Decision 2, Appendix A,
--   Appendix B EC-2/EC-6
--   supabase/migrations/20260508000001_is_settlement_collaborator.sql
--   supabase/migrations/20260512000000_catalog_visibility_via_settlement.sql
--   supabase/migrations/20260514000000_catalog_transitive_select.sql
--   supabase/migrations/20260515000000_catalog_transitive_via_survivor.sql
--------------------------------------------------------------------------------
--
-- 1. `trait` — transitive SELECT via hunt / showdown / quarry_level /
--    nemesis_level junctions.
--
create policy "Allow select via hunt/showdown/quarry/nemesis" on trait for
select to authenticated using (
    custom
    and (
      exists (
        select 1
        from hunt_monster_trait hmt
          join hunt_monster hm on hm.id = hmt.hunt_monster_id
        where hmt.trait_id = trait.id
          and (
            is_settlement_owner(hm.settlement_id)
            or is_settlement_collaborator(hm.settlement_id)
          )
      )
      or exists (
        select 1
        from showdown_monster_trait smt
          join showdown_monster sm on sm.id = smt.showdown_monster_id
        where smt.trait_id = trait.id
          and (
            is_settlement_owner(sm.settlement_id)
            or is_settlement_collaborator(sm.settlement_id)
          )
      )
      or exists (
        select 1
        from quarry_level_trait qlt
          join quarry_level ql on ql.id = qlt.quarry_level_id
          join settlement_quarry sq on sq.quarry_id = ql.quarry_id
        where qlt.trait_id = trait.id
          and (
            is_settlement_owner(sq.settlement_id)
            or is_settlement_collaborator(sq.settlement_id)
          )
      )
      or exists (
        select 1
        from nemesis_level_trait nlt
          join nemesis_level nl on nl.id = nlt.nemesis_level_id
          join settlement_nemesis sn on sn.nemesis_id = nl.nemesis_id
        where nlt.trait_id = trait.id
          and (
            is_settlement_owner(sn.settlement_id)
            or is_settlement_collaborator(sn.settlement_id)
          )
      )
    )
  );
--
-- 2. `mood` — symmetric to `trait`, walking the same four junctions'
--    mood half.
--
create policy "Allow select via hunt/showdown/quarry/nemesis" on mood for
select to authenticated using (
    custom
    and (
      exists (
        select 1
        from hunt_monster_mood hmm
          join hunt_monster hm on hm.id = hmm.hunt_monster_id
        where hmm.mood_id = mood.id
          and (
            is_settlement_owner(hm.settlement_id)
            or is_settlement_collaborator(hm.settlement_id)
          )
      )
      or exists (
        select 1
        from showdown_monster_mood smm
          join showdown_monster sm on sm.id = smm.showdown_monster_id
        where smm.mood_id = mood.id
          and (
            is_settlement_owner(sm.settlement_id)
            or is_settlement_collaborator(sm.settlement_id)
          )
      )
      or exists (
        select 1
        from quarry_level_mood qlm
          join quarry_level ql on ql.id = qlm.quarry_level_id
          join settlement_quarry sq on sq.quarry_id = ql.quarry_id
        where qlm.mood_id = mood.id
          and (
            is_settlement_owner(sq.settlement_id)
            or is_settlement_collaborator(sq.settlement_id)
          )
      )
      or exists (
        select 1
        from nemesis_level_mood nlm
          join nemesis_level nl on nl.id = nlm.nemesis_level_id
          join settlement_nemesis sn on sn.nemesis_id = nl.nemesis_id
        where nlm.mood_id = mood.id
          and (
            is_settlement_owner(sn.settlement_id)
            or is_settlement_collaborator(sn.settlement_id)
          )
      )
    )
  );
--
-- 3. `armor_set` — transitive SELECT via gear_grid -> survivor ->
--    settlement.
--
create policy "Allow select via gear_grid" on armor_set for
select to authenticated using (
    custom
    and exists (
      select 1
      from gear_grid gg
        join survivor sv on sv.id = gg.survivor_id
      where gg.selected_armor_set_id = armor_set.id
        and (
          is_settlement_owner(sv.settlement_id)
          or is_settlement_collaborator(sv.settlement_id)
        )
    )
  );
--
-- 4. `armor_set_slot` — visible iff parent armor_set is visible via the
--    same chain. Parent custom-ness already gates ownership-side policies;
--    here we additionally require parent.custom for symmetry with the
--    `Allow select via gear_grid` policy on armor_set.
--
create policy "Allow select via gear_grid" on armor_set_slot for
select to authenticated using (
    exists (
      select 1
      from armor_set a
        join gear_grid gg on gg.selected_armor_set_id = a.id
        join survivor sv on sv.id = gg.survivor_id
      where a.id = armor_set_slot.armor_set_id
        and a.custom
        and (
          is_settlement_owner(sv.settlement_id)
          or is_settlement_collaborator(sv.settlement_id)
        )
    )
  );
--
-- 5. `quarry_level` — visible iff parent quarry is custom and attached to
--    a settlement the caller can see.
--
create policy "Allow select via settlement membership" on quarry_level for
select to authenticated using (
    exists (
      select 1
      from quarry q
        join settlement_quarry sq on sq.quarry_id = q.id
      where q.id = quarry_level.quarry_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
--
-- 6. `nemesis_level` — symmetric to quarry_level.
--
create policy "Allow select via settlement membership" on nemesis_level for
select to authenticated using (
    exists (
      select 1
      from nemesis n
        join settlement_nemesis sn on sn.nemesis_id = n.id
      where n.id = nemesis_level.nemesis_id
        and n.custom
        and (
          is_settlement_owner(sn.settlement_id)
          or is_settlement_collaborator(sn.settlement_id)
        )
    )
  );
--
-- 7. `quarry_level_trait` / `quarry_level_mood` /
--    `nemesis_level_trait` / `nemesis_level_mood` — required so that the
--    EXISTS subqueries in the `trait`/`mood` policies above can join
--    through these junctions. Without these policies the owner of a
--    shared settlement (who isn't the catalog author) is blocked by
--    junction-table RLS from satisfying the trait/mood EXISTS clause.
--    Visibility tied to the same parent quarry/nemesis -> settlement
--    chain.
--
create policy "Allow select via settlement membership" on quarry_level_trait for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
        join settlement_quarry sq on sq.quarry_id = q.id
      where ql.id = quarry_level_trait.quarry_level_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on quarry_level_mood for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
        join settlement_quarry sq on sq.quarry_id = q.id
      where ql.id = quarry_level_mood.quarry_level_id
        and q.custom
        and (
          is_settlement_owner(sq.settlement_id)
          or is_settlement_collaborator(sq.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on nemesis_level_trait for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
        join settlement_nemesis sn on sn.nemesis_id = n.id
      where nl.id = nemesis_level_trait.nemesis_level_id
        and n.custom
        and (
          is_settlement_owner(sn.settlement_id)
          or is_settlement_collaborator(sn.settlement_id)
        )
    )
  );
create policy "Allow select via settlement membership" on nemesis_level_mood for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
        join settlement_nemesis sn on sn.nemesis_id = n.id
      where nl.id = nemesis_level_mood.nemesis_level_id
        and n.custom
        and (
          is_settlement_owner(sn.settlement_id)
          or is_settlement_collaborator(sn.settlement_id)
        )
    )
  );