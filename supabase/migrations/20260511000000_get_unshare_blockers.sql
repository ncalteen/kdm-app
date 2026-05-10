--------------------------------------------------------------------------------
-- Get Unshare Blockers
--
-- SECURITY DEFINER RPC consulted by the "Light another lantern" panel
-- before it revokes a collaborator's settlement share. Returns the list
-- of custom catalog rows authored by the soon-to-be-revoked collaborator
-- that are still attached to the settlement, so the owner can be told
-- "they have left their light here — gather it before they walk in
-- darkness" instead of silently producing dead attachments.
--
-- Source of truth:
--   - Plan decision **D8** (Unsharing a collaborator who has authored
--     attached custom catalog rows is *blocked* with a hard error
--     listing the attached items the owner must remove first).
--   - `local/sharing-architecture.md` Appendix B EC-7 motivates the UX
--     gap this guard closes — without it, a survivor would still
--     reference a custom disorder by name but the rules text would
--     vanish on revoke.
--   - Tracking issue: #147.
--
-- Why an RPC is required:
--   - Pre-Phase-2, RLS on each catalog table exposes only rows the
--     caller authored or has been explicitly granted via the
--     per-catalog `*_shared_user` triad. The settlement owner can
--     therefore *not* directly read the collaborator's custom rows to
--     enumerate them — the join lives on the database side under the
--     definer's privileges.
--   - Phase 2 (E2.13) will rewrite this function against the new
--     transitive-visibility predicate; the surface area (parameters
--     and return shape) is intentionally stable so the callers don't
--     need to change.
--
-- Scope:
--   - Walks every `settlement_*` junction that points at a catalog row
--     carrying `custom boolean` + `user_id uuid` (the standard "owner
--     data" pattern). For each row attached to the target settlement,
--     emits a blocker entry when the catalog row is custom AND
--     authored by the target collaborator.
--   - Pre-Phase-2 *intentionally* ignores survivor-side attachments
--     (`survivor.weapon_type_id`, `survivor.knowledge_*_id`,
--     `survivor_disorder`, etc.). The plan calls those out as part of
--     a comprehensive walk, but the issue body's example query and
--     acceptance criterion limit this iteration to settlement
--     junctions. Closing the survivor-side gap is a known follow-up
--     and is naturally absorbed by E2.13's rewrite.
--
-- Authorization:
--   - Returns rows only when `auth.uid()` is the owner of the target
--     settlement. Collaborators (including the target collaborator)
--     and unrelated callers receive an empty result set, mirroring
--     `get_settlement_collaborators` and the SELECT-only contract on
--     `settlement_shared_user`. No early-exit `raise` is needed: the
--     join on `s.user_id = auth.uid()` keeps non-owners from leaking
--     anything.
--
-- Auth surface:
--   - `revoke execute … from anon` because Supabase's `ALTER DEFAULT
--     PRIVILEGES` on `public` grants EXECUTE to anon independently of
--     PUBLIC. Mirrors `get_settlement_collaborators` and
--     `lookup_user_by_username`.
--
-- Hardening: `set search_path = ''` + fully-qualified table references
-- prevent `pg_temp` / schema-shadowing attacks against this SECURITY
-- DEFINER function. Mirrors the pattern used by
-- `lookup_user_by_username` (20260510000000) and
-- `get_settlement_collaborators` (20260510120000).
--------------------------------------------------------------------------------
create or replace function get_unshare_blockers(
    p_settlement_id uuid,
    p_shared_user_id uuid
  ) returns table (kind text, item_name text, item_id uuid) language sql security definer
set search_path = '' stable as $$ -- Each branch follows the same shape:
  --   1. Constrain to the target settlement *owned by the caller*.
  --   2. Constrain to the catalog row authored by the target
  --      collaborator AND marked `custom`.
  -- Order matches the seed/migration order of the catalog tables to
  -- keep the result deterministic without an explicit `order by` per
  -- kind.
select 'knowledge'::text as kind,
  k.knowledge_name as item_name,
  k.id as item_id
from public.settlement_knowledge sj
  join public.knowledge k on k.id = sj.knowledge_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and k.custom
  and k.user_id = p_shared_user_id
union all
select 'philosophy'::text,
  c.philosophy_name,
  c.id
from public.settlement_philosophy sj
  join public.philosophy c on c.id = sj.philosophy_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'gear'::text,
  c.gear_name,
  c.id
from public.settlement_gear sj
  join public.gear c on c.id = sj.gear_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'innovation'::text,
  c.innovation_name,
  c.id
from public.settlement_innovation sj
  join public.innovation c on c.id = sj.innovation_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'pattern'::text,
  c.pattern_name,
  c.id
from public.settlement_pattern sj
  join public.pattern c on c.id = sj.pattern_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'seed_pattern'::text,
  c.seed_pattern_name,
  c.id
from public.settlement_seed_pattern sj
  join public.seed_pattern c on c.id = sj.seed_pattern_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'collective_cognition_reward'::text,
  c.reward_name,
  c.id
from public.settlement_collective_cognition_reward sj
  join public.collective_cognition_reward c on c.id = sj.collective_cognition_reward_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'location'::text,
  c.location_name,
  c.id
from public.settlement_location sj
  join public.location c on c.id = sj.location_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'milestone'::text,
  c.milestone_name,
  c.id
from public.settlement_milestone sj
  join public.milestone c on c.id = sj.milestone_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'principle'::text,
  c.principle_name,
  c.id
from public.settlement_principle sj
  join public.principle c on c.id = sj.principle_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'resource'::text,
  c.resource_name,
  c.id
from public.settlement_resource sj
  join public.resource c on c.id = sj.resource_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'quarry'::text,
  c.monster_name,
  c.id
from public.settlement_quarry sj
  join public.quarry c on c.id = sj.quarry_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
union all
select 'nemesis'::text,
  c.monster_name,
  c.id
from public.settlement_nemesis sj
  join public.nemesis c on c.id = sj.nemesis_id
  join public.settlement s on s.id = sj.settlement_id
where sj.settlement_id = p_settlement_id
  and s.user_id = auth.uid()
  and c.custom
  and c.user_id = p_shared_user_id
order by kind asc,
  item_name asc;
$$;
revoke all on function public.get_unshare_blockers(uuid, uuid)
from public;
-- Drop anon explicitly; see header for rationale.
revoke execute on function public.get_unshare_blockers(uuid, uuid)
from anon;
grant execute on function public.get_unshare_blockers(uuid, uuid) to authenticated;