--------------------------------------------------------------------------------
-- User Subscription Table
--
-- One row per `auth.users` user pointing at the user's currently-active
-- `subscription_plan`. The default for every new sign-up is the `free`
-- plan; the row is upgraded to `lantern` or `lantern_hoard` by the Stripe
-- webhook handler (planned in Epic E3.7 — not part of this migration).
--
-- Writes are reserved for:
--   * service-role contexts (the future webhook handler)
--   * admin operators (manual recovery / impersonation testing)
--   * the auto-provisioning paths below, which always seed `plan_id = 'free'`
--
-- Reads are restricted to the owner. RLS gating (E3.3) reads this table via
-- a SECURITY DEFINER helper, so it bypasses RLS and is safe to consult from
-- predicates on other tables.
--
-- See `docs/settlement-sharing-architecture.md` §9.1 and GitHub issue #168.
--------------------------------------------------------------------------------
create table user_subscription (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null references subscription_plan(id),
  status varchar not null default 'active',
  -- 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default now()
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table user_subscription enable row level security;
create policy "Allow select own" on user_subscription for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on user_subscription for all using (is_admin()) with check (is_admin());
-- INSERT/UPDATE/DELETE only via service_role (Stripe webhook) or admin.
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_user_subscription_plan_id on user_subscription(plan_id);
create index idx_user_subscription_status on user_subscription(status);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on user_subscription for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Default-Row Provisioning — Email Sign-Up Path
--
-- The email/password sign-up form calls `initialize_user_settings(...)` from
-- the client immediately after `signUp()` resolves, before the user has
-- confirmed their email. Extend it to also seed the matching `free`
-- subscription row so paid-feature gating predicates always find a plan
-- for an authenticated user.
--
-- Idempotent on both inserts (`on conflict do nothing`) so re-invocations
-- of the RPC and races with the OAuth path are harmless.
--------------------------------------------------------------------------------
create or replace function initialize_user_settings(p_user_id uuid, p_username varchar) returns void language plpgsql security definer
set search_path = public as $$ begin
insert into user_settings (user_id, username)
values (p_user_id, p_username) on conflict (user_id) do nothing;
insert into user_subscription (user_id, plan_id)
values (p_user_id, 'free') on conflict (user_id) do nothing;
end;
$$;
--------------------------------------------------------------------------------
-- Default-Row Provisioning — OAuth Sign-Up Path
--
-- `provision_user_settings_for_oauth(p_user_id)` (introduced by
-- 20260508000000_user_settings_avatar_url.sql) is the helper invoked by the
-- AFTER INSERT trigger on auth.users for non-email providers. Extend it to
-- seed the user's `free` subscription row alongside their `user_settings`
-- row. The insert is unconditional (gated only by `on conflict do nothing`)
-- so it runs even when a user_settings row already exists — this matters
-- for users created by GoTrue's admin endpoint, where the test path is
-- forced through the email short-circuit and then `provision_user_settings_for_oauth`
-- is called manually.
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
begin -- Seed the user's subscription row first so it's present even if the
-- caller already has a user_settings row and the function returns early
-- below. Free plan; upgrades flow through the Stripe webhook later.
insert into user_subscription (user_id, plan_id)
values (p_user_id, 'free') on conflict (user_id) do nothing;
if exists (
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
--------------------------------------------------------------------------------
-- Backfill Existing Users
--
-- Every pre-existing user predates the entitlement layer, so they are
-- entitled to the free plan. The insert is guarded by a NOT EXISTS subquery
-- against `user_subscription` so re-running the migration (during local
-- development, `npx supabase db reset`) is a no-op for users that already
-- have a row.
--------------------------------------------------------------------------------
insert into user_subscription (user_id, plan_id)
select au.id,
  'free'
from auth.users au
where not exists (
    select 1
    from user_subscription us
    where us.user_id = au.id
  );