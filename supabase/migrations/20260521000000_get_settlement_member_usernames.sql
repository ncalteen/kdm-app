--------------------------------------------------------------------------------
-- Get Settlement Member Usernames
--
-- SECURITY DEFINER function returning the username of every user connected
-- to a settlement (the owner plus every collaborator listed in
-- `settlement_shared_user`). Powers the "By @username" authorship chip on
-- custom catalog rows materialized into `SettlementDetail`'s collections
-- (E2.8 in docs/sharing-architecture.md §7.4 / §10 Phase 2 item 2.6).
--
-- Why an RPC is required:
--   - RLS on `user_settings` restricts SELECT to the row owner. A direct
--     embedded query (e.g. `settlement_knowledge → knowledge →
--     user_settings`) would silently return `null` for the username because
--     the calling user is rarely the `user_settings` row owner of every
--     author whose custom rows are attached to the settlement.
--   - Mirrors `get_settlement_collaborators` (20260510120000) and
--     `get_shared_settlement_owners` (20260505000001), which solve adjacent
--     username lookups for the same reason.
--
-- Authorization:
--   - The function only returns rows when `auth.uid()` is the owner of the
--     target settlement OR is listed in `settlement_shared_user` for it.
--     Unrelated callers receive an empty result set — they cannot
--     enumerate usernames by guessing settlement IDs.
--
-- Why the result is settlement-scoped rather than per-author:
--   - Every catalog row visible to the caller on this settlement was
--     authored by either the owner or a collaborator (custom catalog rows
--     are exposed via transitive settlement membership; see
--     20260512000000_catalog_visibility_via_settlement.sql). Returning the
--     small `(user_id, username)` map for the settlement lets each DAL
--     resolve `author_username` with a single lookup instead of issuing
--     one RPC per catalog kind.
--
-- Auth surface:
--   - `revoke execute … from anon` because Supabase's
--     `ALTER DEFAULT PRIVILEGES` on `public` grants EXECUTE to anon
--     independently of PUBLIC. The implicit `auth.uid()` filter would
--     return an empty result for anon callers anyway, but the explicit
--     revoke keeps the contract obvious.
--
-- Hardening: `set search_path = ''` + fully-qualified table references
-- prevent `pg_temp` / schema-shadowing attacks against this SECURITY
-- DEFINER function. Mirrors the pattern used by
-- `get_settlement_collaborators` (20260510120000) and
-- `lookup_user_by_username` (20260510000000).
--------------------------------------------------------------------------------
create or replace function get_settlement_member_usernames(target_settlement uuid) returns table (user_id uuid, username varchar) language sql security definer
set search_path = '' stable as $$ with caller_member as (
    select 1
    where (
        exists (
          select 1
          from public.settlement s
          where s.id = target_settlement
            and s.user_id = auth.uid()
        )
        or exists (
          select 1
          from public.settlement_shared_user ssu
          where ssu.settlement_id = target_settlement
            and ssu.shared_user_id = auth.uid()
        )
      )
  )
select s.user_id,
  us.username
from public.settlement s
  join public.user_settings us on us.user_id = s.user_id
where s.id = target_settlement
  and exists (
    select 1
    from caller_member
  )
union
select ssu.shared_user_id as user_id,
  us.username
from public.settlement_shared_user ssu
  join public.user_settings us on us.user_id = ssu.shared_user_id
where ssu.settlement_id = target_settlement
  and exists (
    select 1
    from caller_member
  );
$$;
revoke all on function public.get_settlement_member_usernames(uuid)
from public;
-- Drop anon explicitly; see header for rationale.
revoke execute on function public.get_settlement_member_usernames(uuid)
from anon;
grant execute on function public.get_settlement_member_usernames(uuid) to authenticated;