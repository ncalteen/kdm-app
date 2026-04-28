--------------------------------------------------------------------------------
-- Auto-Provision user_settings for OAuth Sign-Ups
--
-- The email/password sign-up flow asks the user to choose a username and
-- calls initialize_user_settings(...) from the client. OAuth sign-ups (e.g.
-- Discord) bypass that form, so a user_settings row would otherwise never
-- be created.
--
-- This migration adds an AFTER INSERT trigger on auth.users that provisions
-- a user_settings row when the inserting provider is NOT 'email'. The
-- username is derived from provider metadata (Discord exposes user_name,
-- global_name, etc.) and falls back to the email local-part or a generic
-- `survivor_<short-id>` value. Collisions are resolved by appending a 4-
-- digit suffix; up to 25 attempts are made before giving up and using a
-- guaranteed-unique value built from the user's UUID.
--
-- Email sign-ups are intentionally skipped: their user_settings row is
-- created by initialize_user_settings(p_user_id, p_username) using the
-- username the user typed into the form. Auto-provisioning here would race
-- with that RPC and cause the chosen username to be silently dropped (the
-- RPC uses ON CONFLICT DO NOTHING).
--------------------------------------------------------------------------------
-- Sanitize a candidate username down to allowed characters and length.
-- Returns NULL if the result is shorter than the 3-character minimum.
create or replace function sanitize_username_candidate(raw text) returns varchar language plpgsql immutable
set search_path = public as $$
declare cleaned text;
begin if raw is null then return null;
end if;
cleaned := substring(
  regexp_replace(raw, '[^a-zA-Z0-9_]', '', 'g')
  from 1 for 20
);
if char_length(cleaned) < 3 then return null;
end if;
return cleaned::varchar;
end;
$$;
--------------------------------------------------------------------------------
-- Trigger function
--------------------------------------------------------------------------------
create or replace function handle_new_oauth_user() returns trigger language plpgsql security definer
set search_path = public as $$
declare provider text;
meta jsonb;
base_candidate varchar;
candidate varchar;
suffix text;
attempt int := 0;
max_attempts constant int := 25;
begin provider := coalesce(new.raw_app_meta_data->>'provider', '');
-- Email sign-ups handle their own user_settings row via the
-- initialize_user_settings RPC, using the username the user typed in.
-- Auto-provisioning here would race with that RPC.
if provider = ''
or provider = 'email' then return new;
end if;
meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
-- Try provider-supplied identifiers in priority order.
base_candidate := coalesce(
  sanitize_username_candidate(meta->>'user_name'),
  sanitize_username_candidate(meta->>'preferred_username'),
  sanitize_username_candidate(meta->>'username'),
  sanitize_username_candidate(meta->>'global_name'),
  sanitize_username_candidate(meta->>'name'),
  sanitize_username_candidate(meta->>'full_name'),
  sanitize_username_candidate(split_part(coalesce(new.email, ''), '@', 1)),
  sanitize_username_candidate(
    'survivor_' || substring(
      new.id::text
      from 1 for 8
    )
  )
);
-- The final fallback is guaranteed to satisfy the length check, so this
-- should never be null in practice.
if base_candidate is null then base_candidate := ('u_' || replace(new.id::text, '-', ''))::varchar;
base_candidate := substring(
  base_candidate
  from 1 for 20
);
end if;
candidate := base_candidate;
-- Try the unsuffixed candidate first, then up to max_attempts variants
-- with a 4-digit numeric suffix. The unique constraint on
-- user_settings.username surfaces collisions via unique_violation.
loop begin
insert into user_settings (user_id, username)
values (new.id, candidate);
return new;
exception
when unique_violation then attempt := attempt + 1;
exit
when attempt > max_attempts;
suffix := lpad((floor(random() * 10000))::int::text, 4, '0');
-- Reserve room for the suffix while staying within the 20-char cap.
candidate := (
  substring(
    base_candidate
    from 1 for greatest(1, 20 - char_length(suffix) - 1)
  ) || '_' || suffix
)::varchar;
end;
end loop;
-- Last-resort fallback: derive directly from the user UUID. This is
-- effectively unique and bounded to 20 chars.
candidate := substring(
  ('u_' || replace(new.id::text, '-', ''))
  from 1 for 20
)::varchar;
insert into user_settings (user_id, username)
values (new.id, candidate) on conflict (user_id) do nothing;
return new;
end;
$$;
--------------------------------------------------------------------------------
-- Trigger
--------------------------------------------------------------------------------
drop trigger if exists on_auth_user_created_oauth on auth.users;
create trigger on_auth_user_created_oauth
after
insert on auth.users for each row execute function handle_new_oauth_user();