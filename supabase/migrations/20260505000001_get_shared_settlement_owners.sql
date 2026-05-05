--------------------------------------------------------------------------------
-- Get Shared Settlement Owners
--
-- SECURITY DEFINER function returning the owner's username for every settlement
-- that has been shared with the calling user. RLS on `user_settings` restricts
-- SELECT to the owning user, which would otherwise prevent a collaborator from
-- learning who shared a settlement with them.
--
-- Returns one row per shared settlement: the settlement_id and the owner's
-- username. Settlements the caller owns directly are not included; callers
-- should fetch their own settlements via the existing client-side query.
--
-- The function is keyed off `auth.uid()` so it cannot be abused to enumerate
-- usernames for arbitrary users.
--------------------------------------------------------------------------------
create or replace function get_shared_settlement_owners() returns table (settlement_id uuid, username varchar) language sql security definer
set search_path = public stable as $$
select s.id as settlement_id,
  us.username
from settlement_shared_user ssu
  join settlement s on s.id = ssu.settlement_id
  join user_settings us on us.user_id = s.user_id
where ssu.shared_user_id = auth.uid();
$$;
revoke all on function public.get_shared_settlement_owners()
from public;
grant execute on function public.get_shared_settlement_owners() to authenticated;