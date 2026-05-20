--------------------------------------------------------------------------------
-- Move Admin Role To User Settings
--
-- Supabase's `auth.users.role` is the PostgREST database role claim, not an
-- application role. Archivist's app-level admin marker now lives on the
-- existing one-row-per-user `user_settings` record instead.
--
-- This migration moves broken legacy rows (`auth.users.role = 'admin'`) into
-- `user_settings.app_role`, then restores the Supabase Auth role to
-- `authenticated` so PostgREST keeps using a database role that exists.
--------------------------------------------------------------------------------
alter table public.user_settings
add column if not exists app_role text not null default 'user';
do $$ begin if not exists (
  select 1
  from pg_constraint
  where conrelid = 'public.user_settings'::regclass
    and conname = 'user_settings_app_role_check'
) then
alter table public.user_settings
add constraint user_settings_app_role_check check (app_role in ('user', 'admin'));
end if;
end $$;
update public.user_settings us
set app_role = 'admin'
from auth.users au
where au.id = us.user_id
  and au.role = 'admin';
update auth.users
set role = 'authenticated'
where role = 'admin';
--------------------------------------------------------------------------------
-- App Role Write Guard
--
-- `user_settings` remains owner-updatable for preferences. This trigger keeps
-- `app_role` server-managed even if an authenticated client attempts to insert
-- or update it directly through PostgREST.
--------------------------------------------------------------------------------
create or replace function public.enforce_user_settings_app_role_guard() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if auth.role() = 'authenticated' then if tg_op = 'INSERT'
  and new.app_role <> 'user' then raise exception 'app-role-managed-by-service' using errcode = '42501';
end if;
if tg_op = 'UPDATE'
and new.app_role is distinct
from old.app_role then raise exception 'app-role-managed-by-service' using errcode = '42501';
end if;
end if;
return new;
end;
$$;
drop trigger if exists enforce_user_settings_app_role_guard on public.user_settings;
create trigger enforce_user_settings_app_role_guard before
insert
  or
update on public.user_settings for each row execute function public.enforce_user_settings_app_role_guard();
create or replace function public.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
    select 1
    from public.user_settings
    where user_id = auth.uid()
      and app_role = 'admin'
  );
$$;