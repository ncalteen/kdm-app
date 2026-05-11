--------------------------------------------------------------------------------
-- Phase 2 [E2.1.b]: Catalog Transitive SELECT via survivor columns.
--
-- Catalog rows referenced directly by survivor columns (not by a separate
-- junction table) become transitively visible to anyone who can see the
-- parent survivor's settlement — i.e. the settlement owner OR a
-- `settlement_shared_user` collaborator. Chain:
--
--   catalog -> survivor.<fk_col> -> survivor.settlement_id -> settlement
--
-- Tables and the survivor columns that reach them:
--   * `weapon_type`     ← survivor.weapon_type_id
--   * `philosophy`      ← survivor.philosophy_id
--   * `neurosis`        ← survivor.neurosis_id
--   * `knowledge`       ← survivor.knowledge_1_id,
--                          survivor.knowledge_2_id,
--                          survivor.tenet_knowledge_id
--   * `philosophy_rank` ← visible iff its parent philosophy is visible via
--                          a survivor (mirrors the Allow-select-via-survivor
--                          predicate one hop up)
--
-- `tenet_knowledge_id` is not listed in #159's verbatim scope (the issue
-- enumerates `knowledge_1_id` + `knowledge_2_id`) but it is a real FK to
-- `knowledge` on `survivor` (introduced in 20260220192245_survivor.sql:117)
-- and Arc survivors store tenet rules via this column. Excluding it would
-- leave a visibility gap that contradicts the stated goal "so survivor
-- knowledges are visible". All three knowledge FKs are covered here.
--
-- Postgres ORs multiple permissive SELECT policies. For `knowledge` this
-- new policy adds the survivor path on top of the
-- `Allow select via settlement membership` policy created in
-- 20260512000000 (settlement_knowledge attachment path).
--
-- The legacy `Allow select for shared and custom` policies on
-- weapon_type / philosophy / neurosis / philosophy_rank are intentionally
-- LEFT IN PLACE in this migration. They are scheduled for removal in the
-- Phase 2.5 `*_shared_user` deprecation pass (Appendix A "Tables to
-- deprecate / drop"). The Phase 2 transitive predicate added here is
-- additive: OR-combined with the existing SELECT policies, it grants the
-- new path without changing the legacy behaviour.
--
-- UPDATE/INSERT/DELETE policies are not touched. Author-only enforcement
-- of catalog rules text is tracked under [E2.2] (issue #149).
--
-- Citations:
--   local/sharing-architecture.md §5.2 Decision 2, Appendix A,
--   Appendix B EC-2/EC-6/EC-7
--   supabase/migrations/20260508000001_is_settlement_collaborator.sql
--   supabase/migrations/20260512000000_catalog_visibility_via_settlement.sql
--   supabase/migrations/20260514000000_catalog_transitive_select.sql
--------------------------------------------------------------------------------
create policy "Allow select via survivor" on weapon_type for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.weapon_type_id = weapon_type.id
        and (
          s.user_id = (
            select auth.uid()
          )
          or is_settlement_collaborator(s.id)
        )
    )
  );
create policy "Allow select via survivor" on philosophy for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.philosophy_id = philosophy.id
        and (
          s.user_id = (
            select auth.uid()
          )
          or is_settlement_collaborator(s.id)
        )
    )
  );
create policy "Allow select via survivor" on neurosis for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.neurosis_id = neurosis.id
        and (
          s.user_id = (
            select auth.uid()
          )
          or is_settlement_collaborator(s.id)
        )
    )
  );
create policy "Allow select via survivor" on knowledge for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where (
          sv.knowledge_1_id = knowledge.id
          or sv.knowledge_2_id = knowledge.id
          or sv.tenet_knowledge_id = knowledge.id
        )
        and (
          s.user_id = (
            select auth.uid()
          )
          or is_settlement_collaborator(s.id)
        )
    )
  );
create policy "Allow select via survivor" on philosophy_rank for
select to authenticated using (
    exists (
      select 1
      from philosophy p
        join survivor sv on sv.philosophy_id = p.id
        join settlement s on s.id = sv.settlement_id
      where p.id = philosophy_rank.philosophy_id
        and p.custom
        and (
          s.user_id = (
            select auth.uid()
          )
          or is_settlement_collaborator(s.id)
        )
    )
  );