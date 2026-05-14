--------------------------------------------------------------------------------
-- Candidate Option B: `get_unshare_blockers_v2`
--
-- Sibling of `public.get_unshare_blockers` (introduced in
-- `supabase/migrations/20260511000000_get_unshare_blockers.sql`). Same
-- inputs, same return shape, same `security definer` / search_path
-- hardening, same authorization contract — but the per-table UNION ALL
-- hoists the `s.user_id = auth.uid()` authorization gate into a single
-- CTE evaluated once rather than re-joined to `public.settlement` in
-- every branch.
--
-- This file exists only to support the issue #154 benchmark (see
-- `scripts/benchmark-unshare-blockers.sh`). It is NOT a real migration:
-- the benchmark installs it in a savepoint, measures both functions
-- against the same fixture, and rolls it back. Promote into a real
-- migration only after the numbers + maintenance trade-off make the
-- case for it.
--
-- Notes:
--   - The per-table UNION ALL is preserved because each catalog table
--     uses a different display-name column (`knowledge_name`,
--     `philosophy_name`, …, `monster_name` for quarry/nemesis). A
--     literal single-SELECT-no-union form would require a unified
--     view that picks the canonical display name per kind — beyond
--     scope here.
--   - `auth.uid()` is evaluated once inside the CTE; the planner does
--     not have to push it through 13 separate predicates.
--   - The settlement table is touched exactly once per call (in the
--     CTE) rather than 13 times.
--   - Output ordering matches A exactly so the benchmark's
--     correctness diff is a byte-wise compare.
--------------------------------------------------------------------------------
create or replace function get_unshare_blockers_v2(
    p_settlement_id uuid,
    p_shared_user_id uuid
  ) returns table (kind text, item_name text, item_id uuid) language sql security definer
set search_path = '' stable as $$ -- Authorization gate, evaluated once. Returns the settlement row only
  -- when the caller is its owner; otherwise empty and the rest of the
  -- query yields no rows, matching the V1 contract for non-owner
  -- callers.
  with owned as (
    select id
    from public.settlement
    where id = p_settlement_id
      and user_id = auth.uid()
  )
select kind,
  item_name,
  item_id
from (
    select 'knowledge'::text as kind,
      k.knowledge_name as item_name,
      k.id as item_id
    from owned o
      join public.settlement_knowledge sj on sj.settlement_id = o.id
      join public.knowledge k on k.id = sj.knowledge_id
    where k.custom
      and k.user_id = p_shared_user_id
    union all
    select 'philosophy'::text,
      c.philosophy_name,
      c.id
    from owned o
      join public.settlement_philosophy sj on sj.settlement_id = o.id
      join public.philosophy c on c.id = sj.philosophy_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'gear'::text,
      c.gear_name,
      c.id
    from owned o
      join public.settlement_gear sj on sj.settlement_id = o.id
      join public.gear c on c.id = sj.gear_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'innovation'::text,
      c.innovation_name,
      c.id
    from owned o
      join public.settlement_innovation sj on sj.settlement_id = o.id
      join public.innovation c on c.id = sj.innovation_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'pattern'::text,
      c.pattern_name,
      c.id
    from owned o
      join public.settlement_pattern sj on sj.settlement_id = o.id
      join public.pattern c on c.id = sj.pattern_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'seed_pattern'::text,
      c.seed_pattern_name,
      c.id
    from owned o
      join public.settlement_seed_pattern sj on sj.settlement_id = o.id
      join public.seed_pattern c on c.id = sj.seed_pattern_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'collective_cognition_reward'::text,
      c.reward_name,
      c.id
    from owned o
      join public.settlement_collective_cognition_reward sj on sj.settlement_id = o.id
      join public.collective_cognition_reward c on c.id = sj.collective_cognition_reward_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'location'::text,
      c.location_name,
      c.id
    from owned o
      join public.settlement_location sj on sj.settlement_id = o.id
      join public.location c on c.id = sj.location_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'milestone'::text,
      c.milestone_name,
      c.id
    from owned o
      join public.settlement_milestone sj on sj.settlement_id = o.id
      join public.milestone c on c.id = sj.milestone_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'principle'::text,
      c.principle_name,
      c.id
    from owned o
      join public.settlement_principle sj on sj.settlement_id = o.id
      join public.principle c on c.id = sj.principle_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'resource'::text,
      c.resource_name,
      c.id
    from owned o
      join public.settlement_resource sj on sj.settlement_id = o.id
      join public.resource c on c.id = sj.resource_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'quarry'::text,
      c.monster_name,
      c.id
    from owned o
      join public.settlement_quarry sj on sj.settlement_id = o.id
      join public.quarry c on c.id = sj.quarry_id
    where c.custom
      and c.user_id = p_shared_user_id
    union all
    select 'nemesis'::text,
      c.monster_name,
      c.id
    from owned o
      join public.settlement_nemesis sj on sj.settlement_id = o.id
      join public.nemesis c on c.id = sj.nemesis_id
    where c.custom
      and c.user_id = p_shared_user_id
  ) all_blockers
order by kind asc,
  item_name asc;
$$;
revoke all on function public.get_unshare_blockers_v2(uuid, uuid)
from public;
revoke execute on function public.get_unshare_blockers_v2(uuid, uuid)
from anon;
grant execute on function public.get_unshare_blockers_v2(uuid, uuid) to authenticated;