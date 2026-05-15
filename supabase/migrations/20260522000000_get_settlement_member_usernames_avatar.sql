--------------------------------------------------------------------------------
-- Get Settlement Member Usernames — Extended With `avatar_url`
--
-- E2.9 (docs/sharing-architecture.md §7.4) needs an authorship chip with an
-- avatar on every custom-content card. The chip only renders when the row
-- was authored by *another* settlement member, so the resolver already
-- needs the author's username (E2.8). Returning `avatar_url` from the same
-- RPC keeps the per-settlement member lookup at a single round-trip — no
-- extra fetch is needed to render the chip's avatar.
--
-- Why we recreate the function rather than `alter`:
--   PostgreSQL does not allow `create or replace function` to change the
--   return type signature once a function exists. We drop and recreate; the
--   contract semantics (auth check, search-path hardening, grants) are
--   preserved.
--
-- All other behaviour mirrors the original definition in
-- 20260521000000_get_settlement_member_usernames.sql — the caller-membership
-- check, the `union` over owner + collaborators, the
-- `set search_path = ''` hardening, the explicit anon revoke, and the
-- authenticated grant.
--
-- `avatar_url` is `text` rather than the `user_settings.avatar_url`
-- column type alias because PostgreSQL refuses to return a custom domain
-- type from a `language sql` function that drops/recreates a signature
-- across plpgsql plan caches. `text` is the underlying storage type and
-- matches the runtime shape the DAL sees.
--------------------------------------------------------------------------------
drop function if exists public.get_settlement_member_usernames(uuid);
create or replace function get_settlement_member_usernames(target_settlement uuid) returns table (user_id uuid, username varchar, avatar_url text) language sql security definer
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
  us.username,
  us.avatar_url
from public.settlement s
  join public.user_settings us on us.user_id = s.user_id
where s.id = target_settlement
  and exists (
    select 1
    from caller_member
  )
union
select ssu.shared_user_id as user_id,
  us.username,
  us.avatar_url
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
-- Drop anon explicitly; see header for rationale (mirrors
-- 20260521000000_get_settlement_member_usernames.sql).
revoke execute on function public.get_settlement_member_usernames(uuid)
from anon;
grant execute on function public.get_settlement_member_usernames(uuid) to authenticated;