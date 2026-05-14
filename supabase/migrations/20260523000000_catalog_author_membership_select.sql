--------------------------------------------------------------------------------
-- Phase 2.5 [E2.12 spillover]: Author-Membership-Bound Transitive SELECT
--
-- Tightens every Phase 2 catalog transitive-SELECT policy so that a custom
-- catalog row is visible through a referencing settlement S only if the
-- row's author is *currently* a member of S (owner OR a
-- `settlement_shared_user` collaborator).
--
-- Previously the transitive policies only required that the *caller* could
-- see the referencing junction. Concretely: if collaborator B authored a
-- custom row, attached it to settlement S owned by A, and was then removed
-- from S, A retained SELECT on the row even though the architectural
-- contract in `local/sharing-architecture.md` Appendix B EC-7 explicitly
-- says A should lose access. The author-membership clause closes that gap.
--
-- This migration:
--
--   1. Adds a `auth.uid()`-independent helper `is_settlement_member(uuid,
--      uuid)` mirroring `is_settlement_owner` / `is_settlement_collaborator`
--      but accepting an explicit target user.
--   2. Drops and recreates every Phase 2 transitive SELECT policy with the
--      author-membership clause added.
--
-- Author SELECT (`Allow select for owner and custom`) is intentionally NOT
-- modified — authors always retain full access to their own custom rows
-- via that companion policy, regardless of their settlement membership.
--
-- Child tables that do not carry their own `user_id` column
-- (`philosophy_rank`, `armor_set_slot`, `quarry_level` family,
-- `nemesis_level` family) inherit the author check from their parent
-- catalog row (`philosophy.user_id`, `armor_set.user_id`, `quarry.user_id`,
-- `nemesis.user_id` respectively).
--
-- Citations:
--   local/sharing-architecture.md Appendix B EC-7
--   issue #152 ([E2.12]) — gap discovered while writing the EC-2..EC-8 lock
--   supabase/migrations/20260512000000_catalog_visibility_via_settlement.sql
--   supabase/migrations/20260514000000_catalog_transitive_select.sql
--   supabase/migrations/20260515000000_catalog_transitive_via_survivor.sql
--   supabase/migrations/20260516000000_catalog_transitive_hunt_showdown.sql
--   supabase/migrations/20260324185335_fix_shared_user_rls_recursion.sql
--     (is_settlement_owner)
--   supabase/migrations/20260508000001_is_settlement_collaborator.sql
--------------------------------------------------------------------------------
--
-- 1. Helper: is_settlement_member(settlement_id, user_id)
--
-- SECURITY DEFINER predicate that returns true when `target_user` either
-- owns the given settlement or is listed as a collaborator on it. Distinct
-- from `is_settlement_collaborator(uuid)` which always uses `auth.uid()`;
-- this helper takes an explicit user id so transitive policies can check
-- the *author's* membership (rather than the caller's).
--
-- A `target_user IS NULL` short-circuits to false so that non-custom rows
-- (which have NULL `user_id`) never match — those are visible via the
-- companion `Allow select for authenticated and non-custom` policy.
create or replace function is_settlement_member(target_settlement uuid, target_user uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select target_user is not null
  and (
    exists (
      select 1
      from public.settlement
      where id = target_settlement
        and user_id = target_user
    )
    or exists (
      select 1
      from public.settlement_shared_user
      where settlement_id = target_settlement
        and shared_user_id = target_user
    )
  );
$$;
revoke all on function public.is_settlement_member(uuid, uuid)
from public;
revoke execute on function public.is_settlement_member(uuid, uuid)
from anon;
grant execute on function public.is_settlement_member(uuid, uuid) to authenticated;
--
-- 2. Settlement-attached catalogs (rewrite the implicit-junction-RLS form
--    from 20260512000000_catalog_visibility_via_settlement.sql to an
--    explicit chain that reaches `settlement` so the author-membership
--    check can apply).
--
do $$
declare entry text [];
catalogs text [] [] := array [
    array ['knowledge', 'settlement_knowledge', 'knowledge_id'],
array ['philosophy', 'settlement_philosophy', 'philosophy_id'],
array ['gear', 'settlement_gear', 'gear_id'],
array ['innovation', 'settlement_innovation', 'innovation_id'],
array ['pattern', 'settlement_pattern', 'pattern_id'],
array ['seed_pattern', 'settlement_seed_pattern', 'seed_pattern_id'],
array ['collective_cognition_reward', 'settlement_collective_cognition_reward', 'collective_cognition_reward_id'],
array ['location', 'settlement_location', 'location_id'],
array ['milestone', 'settlement_milestone', 'milestone_id'],
array ['principle', 'settlement_principle', 'principle_id'],
array ['resource', 'settlement_resource', 'resource_id'],
array ['quarry', 'settlement_quarry', 'quarry_id'],
array ['nemesis', 'settlement_nemesis', 'nemesis_id'] ];
begin foreach entry slice 1 in array catalogs loop execute format(
  'drop policy if exists "Allow select via settlement membership" on %I',
  entry [1]
);
execute format(
  $f$ create policy "Allow select via settlement membership" on %1$I for
  select to authenticated using (
      custom
      and exists (
        select 1
        from %2$I sj
          join settlement s on s.id = sj.settlement_id
        where sj.%3$I = %1$I.id
          and (
            is_settlement_owner(s.id)
            or is_settlement_collaborator(s.id)
          )
          and is_settlement_member(s.id, %1$I.user_id)
      )
    ) $f$,
    entry [1],
    entry [2],
    entry [3]
);
end loop;
end $$;
--
-- 3. Survivor-junction catalogs (rewrite the implicit-junction-RLS form
--    from 20260514000000_catalog_transitive_select.sql to an explicit
--    chain through survivor -> settlement).
--
do $$
declare entry text [];
catalogs text [] [] := array [
    array ['disorder', 'survivor_disorder', 'disorder_id'],
array ['fighting_art', 'survivor_fighting_art', 'fighting_art_id'],
array ['secret_fighting_art', 'survivor_secret_fighting_art', 'secret_fighting_art_id'],
array ['ability_impairment', 'survivor_ability_impairment', 'ability_impairment_id'] ];
begin foreach entry slice 1 in array catalogs loop execute format(
  'drop policy if exists "Allow select via settlement membership" on %I',
  entry [1]
);
execute format(
  $f$ create policy "Allow select via settlement membership" on %1$I for
  select to authenticated using (
      custom
      and exists (
        select 1
        from %2$I sj
          join survivor sv on sv.id = sj.survivor_id
          join settlement s on s.id = sv.settlement_id
        where sj.%3$I = %1$I.id
          and (
            is_settlement_owner(s.id)
            or is_settlement_collaborator(s.id)
          )
          and is_settlement_member(s.id, %1$I.user_id)
      )
    ) $f$,
    entry [1],
    entry [2],
    entry [3]
);
end loop;
end $$;
--
-- 4. Survivor-column catalogs (rewrite from
--    20260515000000_catalog_transitive_via_survivor.sql to add the
--    author-membership clause).
--
drop policy if exists "Allow select via survivor" on weapon_type;
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
        and is_settlement_member(s.id, weapon_type.user_id)
    )
  );
drop policy if exists "Allow select via survivor" on philosophy;
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
        and is_settlement_member(s.id, philosophy.user_id)
    )
  );
drop policy if exists "Allow select via survivor" on neurosis;
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
        and is_settlement_member(s.id, neurosis.user_id)
    )
  );
drop policy if exists "Allow select via survivor" on knowledge;
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
        and is_settlement_member(s.id, knowledge.user_id)
    )
  );
-- `philosophy_rank` inherits the author check from its parent philosophy
-- (philosophy_rank has no `user_id` column).
drop policy if exists "Allow select via survivor" on philosophy_rank;
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
        and is_settlement_member(s.id, p.user_id)
    )
  );
--
-- 5. Hunt / showdown / armor / quarry-level / nemesis-level catalogs
--    (rewrite from 20260516000000_catalog_transitive_hunt_showdown.sql).
--
-- 5a. `trait` — author-membership applied to each OR branch.
drop policy if exists "Allow select via hunt/showdown/quarry/nemesis" on trait;
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
          and is_settlement_member(hm.settlement_id, trait.user_id)
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
          and is_settlement_member(sm.settlement_id, trait.user_id)
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
          and is_settlement_member(sq.settlement_id, trait.user_id)
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
          and is_settlement_member(sn.settlement_id, trait.user_id)
      )
    )
  );
-- 5b. `mood` — symmetric to trait.
drop policy if exists "Allow select via hunt/showdown/quarry/nemesis" on mood;
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
          and is_settlement_member(hm.settlement_id, mood.user_id)
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
          and is_settlement_member(sm.settlement_id, mood.user_id)
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
          and is_settlement_member(sq.settlement_id, mood.user_id)
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
          and is_settlement_member(sn.settlement_id, mood.user_id)
      )
    )
  );
-- 5c. `armor_set` — author-membership via gear_grid -> survivor ->
--      settlement chain.
drop policy if exists "Allow select via gear_grid" on armor_set;
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
        and is_settlement_member(sv.settlement_id, armor_set.user_id)
    )
  );
-- 5d. `armor_set_slot` — inherits author check from parent armor_set.
drop policy if exists "Allow select via gear_grid" on armor_set_slot;
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
        and is_settlement_member(sv.settlement_id, a.user_id)
    )
  );
-- 5e. `quarry_level` / `nemesis_level` — inherit author check from parent
--      quarry / nemesis.
drop policy if exists "Allow select via settlement membership" on quarry_level;
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
        and is_settlement_member(sq.settlement_id, q.user_id)
    )
  );
drop policy if exists "Allow select via settlement membership" on nemesis_level;
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
        and is_settlement_member(sn.settlement_id, n.user_id)
    )
  );
-- 5f. `quarry_level_trait` / `quarry_level_mood` / `nemesis_level_trait` /
--      `nemesis_level_mood` — parent quarry / nemesis author check.
drop policy if exists "Allow select via settlement membership" on quarry_level_trait;
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
        and is_settlement_member(sq.settlement_id, q.user_id)
    )
  );
drop policy if exists "Allow select via settlement membership" on quarry_level_mood;
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
        and is_settlement_member(sq.settlement_id, q.user_id)
    )
  );
drop policy if exists "Allow select via settlement membership" on nemesis_level_trait;
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
        and is_settlement_member(sn.settlement_id, n.user_id)
    )
  );
drop policy if exists "Allow select via settlement membership" on nemesis_level_mood;
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
        and is_settlement_member(sn.settlement_id, n.user_id)
    )
  );