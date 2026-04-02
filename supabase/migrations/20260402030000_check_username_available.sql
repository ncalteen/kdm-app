--------------------------------------------------------------------------------
-- Check Username Availability
--
-- SECURITY DEFINER function callable by anonymous/unauthenticated users so
-- the sign-up form can verify username uniqueness before creating an account.
-- RLS on user_settings restricts SELECT to authenticated users, so a direct
-- query from the client would silently return zero rows.
--------------------------------------------------------------------------------
create or replace function check_username_available(desired_username varchar) returns boolean language sql security definer
set search_path = public as $$
select not exists (
    select 1
    from user_settings
    where username = desired_username
  );
$$;