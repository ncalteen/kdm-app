--------------------------------------------------------------------------------
-- Rename Username
--
-- SECURITY DEFINER function that lets an authenticated user rename their own
-- handle. Required so OAuth-derived placeholders (e.g. `u_abc12345`) can be
-- replaced with something a friend can actually invite by name.
--
-- Behaviour:
--   - Returns true when the rename succeeds.
--   - Returns false when `new_username` collides with another user's handle.
--   - Raises `rate-limited` when the caller renamed within the last 10 minutes.
--   - Raises `invalid-format` when `new_username` violates the sign-up regex.
--   - Raises `not-authenticated` when called without a session.
--
-- The 10-minute throttle is persisted on `user_settings.username_renamed_at`
-- so it spans connections; `pg_advisory_xact_lock` is used to serialise
-- concurrent rename attempts for the same user within the same window.
--------------------------------------------------------------------------------
alter table user_settings
add column if not exists username_renamed_at timestamptz;
create or replace function rename_username(new_username varchar) returns boolean language plpgsql security definer
set search_path = public as $$
declare uid uuid := auth.uid();
current_renamed_at timestamptz;
rate_limit_window constant interval := interval '10 minutes';
begin if uid is null then raise exception 'not-authenticated' using errcode = '42501';
end if;
if new_username !~ '^[a-zA-Z0-9_]{3,20}$' then raise exception 'invalid-format' using errcode = '22023';
end if;
-- Serialise concurrent rename attempts for this user. The lock key is
-- derived from the user UUID so different users do not contend.
perform pg_advisory_xact_lock(
  hashtext('rename_username'),
  hashtext(uid::text)
);
-- Lock the user_settings row and read the last rename timestamp.
select username_renamed_at into current_renamed_at
from user_settings
where user_id = uid for
update;
if current_renamed_at is not null
and current_renamed_at > now() - rate_limit_window then raise exception 'rate-limited' using errcode = 'P0001';
end if;
-- Collision check. Excludes the caller's own row so renaming to the same
-- value is treated as success rather than collision.
if exists (
  select 1
  from user_settings
  where username = new_username
    and user_id <> uid
) then return false;
end if;
update user_settings
set username = new_username,
  username_renamed_at = now()
where user_id = uid;
return true;
end;
$$;
revoke all on function public.rename_username(varchar)
from public;
grant execute on function public.rename_username(varchar) to authenticated;