--------------------------------------------------------------------------------
-- Phase 2 [E2.6 follow-up]: Catalog referenced-row transitive visibility.
--
-- `20260524000000_catalog_sub_row_transitive_select.sql` extended SELECT
-- visibility to the cost / requirement *junction* rows of custom recipes
-- (`gear_gear_cost`, `pattern_gear_cost`, `seed_pattern_gear_cost`,
-- `gear_resource_cost`, `pattern_resource_cost`, `seed_pattern_resource_cost`,
-- `pattern_innovation_requirement`, `seed_pattern_innovation_requirement`,
-- etc.). PR #230 review feedback (thread on
-- 20260524000000_catalog_sub_row_transitive_select.sql line 84) flagged that
-- the *referenced* catalog rows are still hidden:
--
--     "These cost-row policies expose only the cost junction rows, but the
--      referenced catalog rows (`cost_gear_id`, `resource_id`, or
--      `innovation_id`) are still hidden unless they are separately attached
--      to the settlement. The UI resolves cost names through the global
--      gear/resource/innovation maps, so a collaborator-visible custom recipe
--      that uses the author's custom cost item will render as an unknown
--      cost."
--
-- Concretely: collaborator B authors custom gear G_parent and custom gear
-- G_cost, writes a row in `gear_gear_cost(gear_id=G_parent, cost_gear_id=
-- G_cost)`, and attaches G_parent to settlement S owned by A. After
-- `20260524000000`, A can SELECT both `gear_gear_cost` and G_parent. But
-- A still cannot SELECT G_cost itself — none of the existing policies on
-- `gear` cover the case where the row is reachable only through a cost
-- reference, not through a `settlement_gear` junction of its own. The UI
-- then renders the cost line as "Unknown gear".
--
-- This migration closes that gap by adding `Allow select via referenced
-- cost` to `gear`, `resource`, and `innovation`, and `Allow select via
-- referenced quarry/nemesis` to `location` and `collective_cognition_reward`.
-- Each policy fires when the row is custom AND there is a cost /
-- requirement / quarry / nemesis junction referencing it from a
-- settlement-visible custom parent AND BOTH the parent recipe / parent
-- quarry-nemesis author AND the referenced row's own author are still
-- members of that settlement.
--
-- The parent-author membership clause is essential: without it, the
-- SECURITY DEFINER helper would bypass the parent's RLS and continue
-- exposing the referenced row even after the parent author was unshared
-- (their parent recipe is no longer settlement-visible, but the cost it
-- cites would leak as long as the cost author was still a member). The
-- two clauses together keep the visibility envelope identical to: "if
-- the parent recipe is invisible to me, every row it points to is
-- invisible to me through this path as well."
--
-- Implementation notes:
--
--   * The visibility walk is delegated to five SECURITY DEFINER helper
--     functions (one per referenced catalog: gear, resource, innovation,
--     location, collective_cognition_reward). Inlining the joins directly
--     in the policy body caused `42P17` infinite recursion on `gear`
--     because the policy's `from gear parent_gear` self-join re-triggers
--     `gear`'s own RLS, which in turn re-applies this policy. Wrapping the
--     walk in a `SECURITY DEFINER` function bypasses RLS inside the helper
--     while still requiring `auth.uid()`-bound membership predicates
--     (`is_settlement_owner` / `is_settlement_collaborator` /
--     `is_settlement_member`) for the visibility decision.
--   * The helpers return only a boolean, so no row content is exposed
--     beyond the policy's effective `using` decision.
--
--   * The author-membership clauses mirror
--     `20260523000000_catalog_author_membership_select.sql`. The cost
--     junction INSERT policy on `gear_gear_cost` / `pattern_gear_cost` /
--     `seed_pattern_gear_cost` only requires the PARENT recipe to be owned
--     by the inserter (see `20260424000039_gear_extension.sql` line 126),
--     so nothing stops a collaborator-authored recipe from referencing a
--     stranger-authored cost item. Without the referenced-row author check,
--     the new SELECT path would silently expose stranger-authored rows
--     whenever a settlement collaborator happened to cite them. Without
--     the parent-author check, an unshared parent author's recipe would
--     stop being settlement-visible while the referenced row leaked
--     through this helper (an EC-7 hole). Both clauses together keep the
--     visibility envelope identical to "settlement member can read other
--     settlement members' content, only while they remain a member".
--     `quarry_location` / `nemesis_location` / `quarry_collective_
--     cognition_reward` use the same parent (`quarry` / `nemesis`)
--     author-membership gate.
--
-- Reference graph covered:
--
--   gear (referenced as cost_gear_id OR as armor_set_slot_gear.gear_id):
--     gear_gear_cost.cost_gear_id          parent: gear         (settlement_gear)
--     pattern_gear_cost.cost_gear_id       parent: pattern      (settlement_pattern)
--     seed_pattern_gear_cost.cost_gear_id  parent: seed_pattern (settlement_seed_pattern)
--     armor_set_slot_gear.gear_id          parent: armor_set    (gear_grid.selected_armor_set_id -> survivor.settlement_id)
--
--   resource (referenced as resource_id):
--     gear_resource_cost.resource_id          parent: gear         (settlement_gear)
--     pattern_resource_cost.resource_id       parent: pattern      (settlement_pattern)
--     seed_pattern_resource_cost.resource_id  parent: seed_pattern (settlement_seed_pattern)
--
--   innovation (referenced as innovation_id):
--     pattern_innovation_requirement.innovation_id       parent: pattern      (settlement_pattern)
--     seed_pattern_innovation_requirement.innovation_id  parent: seed_pattern (settlement_seed_pattern)
--
--   location (referenced as location_id):
--     quarry_location.location_id   parent: quarry  (settlement_quarry)
--     nemesis_location.location_id  parent: nemesis (settlement_nemesis)
--
--   collective_cognition_reward (referenced as collective_cognition_reward_id):
--     quarry_collective_cognition_reward.collective_cognition_reward_id
--                                   parent: quarry  (settlement_quarry)
--
-- The `*_resource_type_cost` and `*_other_cost` tables reference an enum
-- or a free-text label rather than a catalog row, so they have no
-- referenced-row visibility gap to close.
--
-- Pattern → gear chains via `pattern.crafted_gear_id` are intentionally
-- out of scope for this migration. That column expresses the recipe's
-- OUTPUT (and is unrelated to the cost-rendering gap the reviewer
-- identified). It can be addressed separately if a similar gap surfaces
-- in the crafting UI.
--
-- Citations:
--   docs/settlement-sharing-architecture.md §5.2 Decision 2, §10 Phase 2 (2.2)
--   docs/settlement-sharing-architecture.md Appendix B EC-6, EC-7
--   PR #230 review comment 3249417080
--   supabase/migrations/20260512000000_catalog_visibility_via_settlement.sql
--   supabase/migrations/20260523000000_catalog_author_membership_select.sql
--   supabase/migrations/20260524000000_catalog_sub_row_transitive_select.sql
--------------------------------------------------------------------------------
--
-- 1. Helper: is_gear_visible_via_cost_reference(ref_gear_id, ref_gear_user_id)
--
-- Returns true when `ref_gear_id` is referenced as a cost item by some
-- settlement-attached custom recipe AND both the parent recipe's author
-- AND `ref_gear_user_id` are still members of that settlement AND the
-- caller is the settlement owner or a collaborator.
--
-- `SECURITY DEFINER` is required to break the RLS self-reference on `gear`
-- (the function walks `gear_gear_cost -> gear parent_gear`, which would
-- otherwise re-trigger this policy on the joined `parent_gear` row). The
-- `auth.uid()`-bound predicates remain enforced because
-- `is_settlement_owner` / `is_settlement_collaborator` use `auth.uid()`
-- internally; this helper just bypasses the table-level row filter for the
-- intermediate joins.
--
create or replace function is_gear_visible_via_cost_reference(
ref_gear_id uuid,
ref_gear_user_id uuid
) returns boolean language sql stable security definer
set search_path = '' as $$
select ref_gear_user_id is not null
  and (
    exists (
      select 1
      from public.gear_gear_cost ggc
        join public.gear parent_g on parent_g.id = ggc.gear_id
        join public.settlement_gear sj on sj.gear_id = parent_g.id
      where ggc.cost_gear_id = ref_gear_id
        and parent_g.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_g.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_gear_user_id)
    )
    or exists (
      select 1
      from public.pattern_gear_cost pgc
        join public.pattern parent_p on parent_p.id = pgc.pattern_id
        join public.settlement_pattern sj on sj.pattern_id = parent_p.id
      where pgc.cost_gear_id = ref_gear_id
        and parent_p.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_p.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_gear_user_id)
    )
    or exists (
      select 1
      from public.seed_pattern_gear_cost spgc
        join public.seed_pattern parent_sp on parent_sp.id = spgc.seed_pattern_id
        join public.settlement_seed_pattern sj on sj.seed_pattern_id = parent_sp.id
      where spgc.cost_gear_id = ref_gear_id
        and parent_sp.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_sp.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_gear_user_id)
    )
    or exists (
      -- Custom armor-set slot candidates also reference `gear`. The chain
      -- mirrors the parent `armor_set` / `armor_set_slot` policies in
      -- 20260516000000 / 20260524000000: a settlement member sees the
      -- referenced gear when the parent armor_set is custom and reachable
      -- through `gear_grid.selected_armor_set_id` from one of their
      -- survivors. Parent author here is `armor_set.user_id`; the
      -- ref-author guard remains on `ref_gear_user_id`.
      select 1
      from public.armor_set_slot_gear asg
        join public.armor_set_slot asl on asl.id = asg.armor_set_slot_id
        join public.armor_set parent_a on parent_a.id = asl.armor_set_id
        join public.gear_grid gg on gg.selected_armor_set_id = parent_a.id
        join public.survivor sv on sv.id = gg.survivor_id
      where asg.gear_id = ref_gear_id
        and parent_a.custom
        and (
          public.is_settlement_owner(sv.settlement_id)
          or public.is_settlement_collaborator(sv.settlement_id)
        )
        and public.is_settlement_member(sv.settlement_id, parent_a.user_id)
        and public.is_settlement_member(sv.settlement_id, ref_gear_user_id)
    )
  );
$$;
revoke all on function public.is_gear_visible_via_cost_reference(uuid, uuid)
from public;
revoke execute on function public.is_gear_visible_via_cost_reference(uuid, uuid)
from anon;
grant execute on function public.is_gear_visible_via_cost_reference(uuid, uuid) to authenticated;
--
-- 2. Helper: is_resource_visible_via_cost_reference(ref_resource_id,
--    ref_resource_user_id)
--
-- Same shape as the gear helper, but joins the resource-cost tables. No
-- self-reference exists here (`resource` is never joined to itself), but
-- the helper is kept SECURITY DEFINER for symmetry and to ensure the
-- intermediate parent joins (`gear`, `pattern`, `seed_pattern`) cannot
-- accidentally trigger their own transitive policies recursively. Both
-- the parent recipe's author and the referenced resource's author must
-- still be members of the parent's attached settlement.
--
create or replace function is_resource_visible_via_cost_reference(
ref_resource_id uuid,
ref_resource_user_id uuid
) returns boolean language sql stable security definer
set search_path = '' as $$
select ref_resource_user_id is not null
  and (
    exists (
      select 1
      from public.gear_resource_cost grc
        join public.gear parent_g on parent_g.id = grc.gear_id
        join public.settlement_gear sj on sj.gear_id = parent_g.id
      where grc.resource_id = ref_resource_id
        and parent_g.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_g.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_resource_user_id)
    )
    or exists (
      select 1
      from public.pattern_resource_cost prc
        join public.pattern parent_p on parent_p.id = prc.pattern_id
        join public.settlement_pattern sj on sj.pattern_id = parent_p.id
      where prc.resource_id = ref_resource_id
        and parent_p.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_p.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_resource_user_id)
    )
    or exists (
      select 1
      from public.seed_pattern_resource_cost sprc
        join public.seed_pattern parent_sp on parent_sp.id = sprc.seed_pattern_id
        join public.settlement_seed_pattern sj on sj.seed_pattern_id = parent_sp.id
      where sprc.resource_id = ref_resource_id
        and parent_sp.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_sp.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_resource_user_id)
    )
  );
$$;
revoke all on function public.is_resource_visible_via_cost_reference(uuid, uuid)
from public;
revoke execute on function public.is_resource_visible_via_cost_reference(uuid, uuid)
from anon;
grant execute on function public.is_resource_visible_via_cost_reference(uuid, uuid) to authenticated;
--
-- 3. Helper: is_innovation_visible_via_cost_reference(ref_innovation_id,
--    ref_innovation_user_id)
--
-- Only two paths (no gear→innovation requirement table). Same SECURITY
-- DEFINER rationale as the helpers above; both the parent pattern /
-- seed_pattern author and the referenced innovation author must still be
-- settlement members.
--
create or replace function is_innovation_visible_via_cost_reference(
ref_innovation_id uuid,
ref_innovation_user_id uuid
) returns boolean language sql stable security definer
set search_path = '' as $$
select ref_innovation_user_id is not null
  and (
    exists (
      select 1
      from public.pattern_innovation_requirement pir
        join public.pattern parent_p on parent_p.id = pir.pattern_id
        join public.settlement_pattern sj on sj.pattern_id = parent_p.id
      where pir.innovation_id = ref_innovation_id
        and parent_p.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_p.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_innovation_user_id)
    )
    or exists (
      select 1
      from public.seed_pattern_innovation_requirement spir
        join public.seed_pattern parent_sp on parent_sp.id = spir.seed_pattern_id
        join public.settlement_seed_pattern sj on sj.seed_pattern_id = parent_sp.id
      where spir.innovation_id = ref_innovation_id
        and parent_sp.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_sp.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_innovation_user_id)
    )
  );
$$;
revoke all on function public.is_innovation_visible_via_cost_reference(uuid, uuid)
from public;
revoke execute on function public.is_innovation_visible_via_cost_reference(uuid, uuid)
from anon;
grant execute on function public.is_innovation_visible_via_cost_reference(uuid, uuid) to authenticated;
--
-- 4. Helper: is_location_visible_via_quarry_nemesis_reference(ref_location_id,
--    ref_location_user_id)
--
-- `quarry_location.location_id` / `nemesis_location.location_id` reference
-- catalog `location` rows the same way `gear_gear_cost.cost_gear_id`
-- references a referenced gear. A custom quarry / nemesis attached to a
-- settlement can cite a custom location that is NOT attached to any
-- `settlement_location` of its own; without this path the location renders
-- as "Unknown location" in the quarry / nemesis detail view even though
-- the parent is visible.
--
-- Same parent-author membership guard as the cost-reference helpers above:
-- both the parent quarry / nemesis author and the referenced location's
-- author must still be members of the parent's attached settlement.
--
create or replace function is_location_visible_via_quarry_nemesis_reference(
ref_location_id uuid,
ref_location_user_id uuid
) returns boolean language sql stable security definer
set search_path = '' as $$
select ref_location_user_id is not null
  and (
    exists (
      select 1
      from public.quarry_location ql
        join public.quarry parent_q on parent_q.id = ql.quarry_id
        join public.settlement_quarry sj on sj.quarry_id = parent_q.id
      where ql.location_id = ref_location_id
        and parent_q.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_q.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_location_user_id)
    )
    or exists (
      select 1
      from public.nemesis_location nl
        join public.nemesis parent_n on parent_n.id = nl.nemesis_id
        join public.settlement_nemesis sj on sj.nemesis_id = parent_n.id
      where nl.location_id = ref_location_id
        and parent_n.custom
        and (
          public.is_settlement_owner(sj.settlement_id)
          or public.is_settlement_collaborator(sj.settlement_id)
        )
        and public.is_settlement_member(sj.settlement_id, parent_n.user_id)
        and public.is_settlement_member(sj.settlement_id, ref_location_user_id)
    )
  );
$$;
revoke all on function public.is_location_visible_via_quarry_nemesis_reference(uuid, uuid)
from public;
revoke execute on function public.is_location_visible_via_quarry_nemesis_reference(uuid, uuid)
from anon;
grant execute on function public.is_location_visible_via_quarry_nemesis_reference(uuid, uuid) to authenticated;
--
-- 5. Helper: is_collective_cognition_reward_visible_via_quarry_reference(
--    ref_ccr_id, ref_ccr_user_id)
--
-- Only one path (`quarry_collective_cognition_reward.collective_cognition_
-- reward_id` → `collective_cognition_reward`). Mirrors the location helper
-- with the same parent-author + referenced-author guard.
--
create or replace function is_collective_cognition_reward_visible_via_quarry_reference(
ref_ccr_id uuid,
ref_ccr_user_id uuid
) returns boolean language sql stable security definer
set search_path = '' as $$
select ref_ccr_user_id is not null
  and exists (
    select 1
    from public.quarry_collective_cognition_reward qccr
      join public.quarry parent_q on parent_q.id = qccr.quarry_id
      join public.settlement_quarry sj on sj.quarry_id = parent_q.id
    where qccr.collective_cognition_reward_id = ref_ccr_id
      and parent_q.custom
      and (
        public.is_settlement_owner(sj.settlement_id)
        or public.is_settlement_collaborator(sj.settlement_id)
      )
      and public.is_settlement_member(sj.settlement_id, parent_q.user_id)
      and public.is_settlement_member(sj.settlement_id, ref_ccr_user_id)
  );
$$;
revoke all on function public.is_collective_cognition_reward_visible_via_quarry_reference(uuid, uuid)
from public;
revoke execute on function public.is_collective_cognition_reward_visible_via_quarry_reference(uuid, uuid)
from anon;
grant execute on function public.is_collective_cognition_reward_visible_via_quarry_reference(uuid, uuid) to authenticated;
--
-- 6. SELECT policies: delegate to the helpers above.
--
create policy "Allow select via referenced cost" on gear for
select to authenticated using (
    custom
    and is_gear_visible_via_cost_reference(gear.id, gear.user_id)
  );
create policy "Allow select via referenced cost" on resource for
select to authenticated using (
    custom
    and is_resource_visible_via_cost_reference(resource.id, resource.user_id)
  );
create policy "Allow select via referenced cost" on innovation for
select to authenticated using (
    custom
    and is_innovation_visible_via_cost_reference(innovation.id, innovation.user_id)
  );
create policy "Allow select via referenced quarry/nemesis" on location for
select to authenticated using (
    custom
    and is_location_visible_via_quarry_nemesis_reference(location.id, location.user_id)
  );
create policy "Allow select via referenced quarry" on collective_cognition_reward for
select to authenticated using (
    custom
    and is_collective_cognition_reward_visible_via_quarry_reference(
      collective_cognition_reward.id,
      collective_cognition_reward.user_id
    )
  );