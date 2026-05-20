-- Revoke all active Auth sessions for a target user from service-role flows.
-- This mirrors Supabase Auth's global sign-out effect by deleting sessions,
-- which cascades to refresh tokens.
create or replace function public.invalidate_auth_sessions_for_user(target_user_id uuid) returns integer language plpgsql security definer
set search_path = '' as $$
declare deleted_sessions integer;
begin
delete from auth.sessions
where user_id = target_user_id;
get diagnostics deleted_sessions = row_count;
return deleted_sessions;
end;
$$;
revoke all on function public.invalidate_auth_sessions_for_user(uuid)
from public,
  anon,
  authenticated;
grant execute on function public.invalidate_auth_sessions_for_user(uuid) to service_role;