--------------------------------------------------------------------------------
-- Get Settlement Collaborators
--
-- Adds a `created_at` timestamp to `settlement_shared_user` and exposes a
-- SECURITY DEFINER function that returns the public profile fields
-- (username, avatar_url, created_at) of every user listed in
-- `settlement_shared_user` for a settlement owned by the calling user. The
-- collaborators panel needs this data so the owner can render each row with
-- `<UserAvatar>` plus a "Joined: 14 days ago" label.
--
-- Why a `created_at` column is needed:
--   - The original `settlement_shared_user` schema only carried the three
--     foreign-key columns and the composite PK. There was no temporal
--     anchor, so the share-management UI could not show "when was this
--     person invited?". Adding the column with `default now()` is a no-op
--     for existing shares (they get `now()`-at-migration-time as a
--     sensible best-effort) and keeps subsequent inserts trivially
--     accurate. The realtime publication picks up the new column
--     automatically since `settlement_shared_user` is already in
--     `supabase_realtime` and PostgREST regenerates its schema cache on
--     migration apply.
--
-- Why an RPC is required:
--   - RLS on `user_settings` restricts SELECT to the row owner. A direct
--     embedded query (`settlement_shared_user → user_settings`) would
--     silently return `null` for username and avatar_url because the
--     settlement owner is not the user_settings row owner.
--   - Mirrors `get_shared_settlement_owners` (added in
--     20260505000001_get_shared_settlement_owners.sql) which solves the
--     reverse direction: collaborators reading owner usernames.
--
-- Authorization:
--   - The function only returns rows when `auth.uid()` is the owner of
--     the target settlement. Collaborators on the same settlement —
--     including the collaborators of *this* settlement — receive an
--     empty result set, mirroring the SELECT-only contract those users
--     get on `settlement_shared_user` itself. A collaborator who somehow
--     reached the share-management UI gets no information about who
--     else is sharing the settlement.
--
-- Auth surface:
--   - `revoke execute … from anon` because Supabase's
--     `ALTER DEFAULT PRIVILEGES` on `public` grants EXECUTE to anon
--     independently of PUBLIC. The implicit `auth.uid()` filter would
--     return null/empty for anon callers anyway, but the explicit revoke
--     keeps the contract obvious.
--------------------------------------------------------------------------------
alter table settlement_shared_user
add column if not exists created_at timestamptz not null default now();

create or replace function get_settlement_collaborators(target_settlement uuid) returns table (
    shared_user_id uuid,
    username varchar,
    avatar_url text,
    created_at timestamptz
  ) language sql security definer
set search_path = public stable as $$
select ssu.shared_user_id,
  us.username,
  us.avatar_url,
  ssu.created_at
from settlement_shared_user ssu
  join user_settings us on us.user_id = ssu.shared_user_id
  join settlement s on s.id = ssu.settlement_id
where ssu.settlement_id = target_settlement
  and s.user_id = auth.uid()
order by ssu.created_at asc;
$$;
revoke all on function public.get_settlement_collaborators(uuid)
from public;
-- Drop anon explicitly; see header for rationale.
revoke execute on function public.get_settlement_collaborators(uuid)
from anon;
grant execute on function public.get_settlement_collaborators(uuid) to authenticated;