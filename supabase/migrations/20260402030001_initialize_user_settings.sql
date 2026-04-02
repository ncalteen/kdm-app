--------------------------------------------------------------------------------
-- Initialize User Settings
--
-- SECURITY DEFINER function callable after sign-up, before email confirmation.
-- At that point the user is not yet authenticated, so direct inserts into
-- user_settings would be blocked by RLS. This function creates the settings
-- row only if one does not already exist for the given user_id.
--------------------------------------------------------------------------------
create or replace function initialize_user_settings(p_user_id uuid, p_username varchar) returns void language plpgsql security definer
set search_path = public as $$ begin
insert into user_settings (user_id, username)
values (p_user_id, p_username) on conflict (user_id) do nothing;
end;
$$;