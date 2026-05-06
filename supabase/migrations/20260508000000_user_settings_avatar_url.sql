--------------------------------------------------------------------------------
-- User Avatar URL
--
-- Adds a nullable `avatar_url` column to `user_settings` so the app can
-- render a provider-supplied avatar (Discord, Google, etc.) for OAuth users.
-- Email-only sign-ups stay null and the `<UserAvatar>` component falls back
-- to colored initials.
--
-- The column is nullable (no default) because there is no meaningful default:
-- "no avatar" is a real, intended state.
--
-- See plan decision D5 (avatars from OAuth provider metadata + initials
-- fallback; no upload UI).
--------------------------------------------------------------------------------
alter table user_settings
add column if not exists avatar_url text;
--------------------------------------------------------------------------------
-- Provisioning helper used by both the trigger and integration tests.
--
-- Extracted from `handle_new_oauth_user()` so the avatar-capture path is
-- reachable without going through GoTrue's admin createUser flow. GoTrue's
-- admin endpoint inserts the auth.users row with `provider = 'email'`
-- first and only updates `raw_app_meta_data` afterwards, which means the
-- trigger always sees provider='email' and short-circuits — making
-- end-to-end testing of provider metadata otherwise impossible.
--
-- The function is idempotent: it inserts a user_settings row if one is
-- missing, otherwise leaves it alone (avoids racing with the email-flow
-- `initialize_user_settings` RPC).
--------------------------------------------------------------------------------
create or replace function provision_user_settings_for_oauth(p_user_id uuid) returns void language plpgsql security definer
set search_path = public as $$
declare meta jsonb;
user_email text;
provider_avatar_url text;
base_candidate varchar;
candidate varchar;
suffix text;
attempt int := 0;
max_attempts constant int := 25;
begin if exists (
  select 1
  from user_settings
  where user_id = p_user_id
) then return;
end if;
select coalesce(au.raw_user_meta_data, '{}'::jsonb),
  au.email into meta,
  user_email
from auth.users au
where au.id = p_user_id;
if meta is null then return;
end if;
provider_avatar_url := nullif(meta->>'avatar_url', '');
base_candidate := coalesce(
  sanitize_username_candidate(meta->>'user_name'),
  sanitize_username_candidate(meta->>'preferred_username'),
  sanitize_username_candidate(meta->>'username'),
  sanitize_username_candidate(meta->>'global_name'),
  sanitize_username_candidate(meta->>'name'),
  sanitize_username_candidate(meta->>'full_name'),
  sanitize_username_candidate(split_part(coalesce(user_email, ''), '@', 1)),
  sanitize_username_candidate(
    'survivor_' || substring(
      p_user_id::text
      from 1 for 8
    )
  )
);
if base_candidate is null then base_candidate := substring(
  ('u_' || replace(p_user_id::text, '-', ''))
  from 1 for 20
)::varchar;
end if;
candidate := base_candidate;
loop begin
insert into user_settings (user_id, username, avatar_url)
values (p_user_id, candidate, provider_avatar_url);
return;
exception
when unique_violation then attempt := attempt + 1;
exit
when attempt > max_attempts;
suffix := lpad((floor(random() * 10000))::int::text, 4, '0');
candidate := (
  substring(
    base_candidate
    from 1 for greatest(1, 20 - char_length(suffix) - 1)
  ) || '_' || suffix
)::varchar;
end;
end loop;
candidate := substring(
  ('u_' || replace(p_user_id::text, '-', ''))
  from 1 for 20
)::varchar;
insert into user_settings (user_id, username, avatar_url)
values (p_user_id, candidate, provider_avatar_url) on conflict (user_id) do nothing;
end;
$$;
revoke all on function provision_user_settings_for_oauth(uuid)
from public;
grant execute on function provision_user_settings_for_oauth(uuid) to service_role;
--------------------------------------------------------------------------------
-- Replace `handle_new_oauth_user` to delegate to the helper.
--
-- Functional behaviour is preserved (still skips email sign-ups, still
-- fires AFTER INSERT). The trigger is now a thin wrapper around the
-- shared helper, so the avatar-capture path can be exercised end-to-end
-- by integration tests without forging auth.users rows.
--------------------------------------------------------------------------------
create or replace function handle_new_oauth_user() returns trigger language plpgsql security definer
set search_path = public as $$
declare provider text;
begin provider := coalesce(new.raw_app_meta_data->>'provider', '');
-- Email sign-ups handle their own user_settings row via the
-- initialize_user_settings RPC, using the username the user typed in.
-- Auto-provisioning here would race with that RPC.
if provider = ''
or provider = 'email' then return new;
end if;
perform provision_user_settings_for_oauth(new.id);
return new;
end;
$$;
--------------------------------------------------------------------------------
-- Backfill existing OAuth users.
--
-- Captures `avatar_url` for users who already signed in via a provider
-- before this migration ran. Email-only users are skipped (they have no
-- provider metadata). Existing non-null `avatar_url` values are preserved
-- so a future user-supplied override would not be clobbered.
--------------------------------------------------------------------------------
update user_settings
set avatar_url = coalesce(
    user_settings.avatar_url,
    nullif(au.raw_user_meta_data->>'avatar_url', '')
  )
from auth.users au
where user_settings.user_id = au.id
  and coalesce(au.raw_app_meta_data->>'provider', '') not in ('', 'email')
  and user_settings.avatar_url is null
  and nullif(au.raw_user_meta_data->>'avatar_url', '') is not null;