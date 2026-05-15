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
-- cost` to `gear`, `resource`, and `innovation`. The policy fires when the
-- row is custom AND there is a cost / requirement row referencing it from
-- a settlement-visible custom recipe AND the referenced row's own author
-- is still a member of that settlement.
--
-- Implementation notes:
--
--   * The visibility walk is delegated to three SECURITY DEFINER helper
--     functions (one per referenced catalog). Inlining the joins directly
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
--   * The author-membership clause (`is_settlement_member(sj.settlement_id,
--     <ref>.user_id)`) mirrors
--     `20260523000000_catalog_author_membership_select.sql`. The cost
--     junction INSERT policy on `gear_gear_cost` / `pattern_gear_cost` /
--     `seed_pattern_gear_cost` only requires the PARENT recipe to be owned
--     by the inserter (see `20260424000039_gear_extension.sql` line 126),
--     so nothing stops a collaborator-authored recipe from referencing a
--     stranger-authored cost item. Without the author-membership clause,
--     the new SELECT path would silently expose stranger-authored rows
--     whenever a settlement collaborator happened to cite them. The clause
--     keeps the visibility envelope identical to "settlement member can
--     read settlement member's content".
--
-- Reference graph covered:
--
--   gear (referenced as cost_gear_id):
--     gear_gear_cost.cost_gear_id          parent: gear         (settlement_gear)
--     pattern_gear_cost.cost_gear_id       parent: pattern      (settlement_pattern)
--     seed_pattern_gear_cost.cost_gear_id  parent: seed_pattern (settlement_seed_pattern)
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
-- settlement-attached custom recipe AND `ref_gear_user_id` is a member of
-- that settlement AND the caller is the settlement owner or a collaborator.
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
        and public.is_settlement_member(sj.settlement_id, ref_gear_user_id)
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
-- accidentally trigger their own transitive policies recursively.
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
-- DEFINER rationale as the helpers above.
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
-- 4. SELECT policies: delegate to the helpers above.
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