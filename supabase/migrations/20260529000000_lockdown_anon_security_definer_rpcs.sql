--------------------------------------------------------------------------------
-- Revoke anon-reachable EXECUTE on SECURITY DEFINER functions in `public`.
--
-- Background
-- ----------
-- `CREATE FUNCTION` in Postgres grants EXECUTE to the pseudo-role
-- `PUBLIC` by default. Every concrete role — including Supabase's
-- `anon` — inherits that privilege. A direct `revoke execute … from
-- anon` is a no-op while PUBLIC still holds EXECUTE, because the
-- privilege check falls back to PUBLIC. The functions touched below
-- were created without an explicit `revoke … from public`, so they
-- remained anon-callable despite the appearance of role-specific
-- grants on `authenticated` / `service_role`.
--
-- A separate Supabase-specific gotcha (`ALTER DEFAULT PRIVILEGES IN
-- SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated,
-- service_role`) can also leak anon EXECUTE independent of PUBLIC. It
-- does not currently apply to these functions — their ACLs contain
-- no explicit `anon=X/postgres` entry — but the `revoke … from anon`
-- below is retained as defense in depth.
--
-- Scope
-- -----
-- 13 SECURITY DEFINER functions in `public` for which there is no
-- legitimate anon caller (verified by code search and prior privilege
-- audit).
--
-- Intentionally left anon-callable:
--   * check_username_available(varchar) — sign-up form probes it
--     before a session exists.
--   * initialize_user_settings(uuid, varchar) — invoked from the
--     sign-up form before email confirmation, still under anon.
--
-- Intentionally deferred:
--   * is_settlement_owner(uuid) / is_armor_set_owner(uuid) — embedded
--     in RLS policy expressions on owner-scoped tables. Tightening
--     these requires a separate pass to confirm no policy evaluation
--     path needs them under anon.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Tier 1 — Trigger functions
--
-- Invoked exclusively by Postgres's trigger system. Per the
-- documentation, trigger functions fire regardless of the firing
-- user's EXECUTE privilege on the function (the EXECUTE check is
-- enforced only at CREATE TRIGGER time). Revoking from PUBLIC removes
-- the unintended anon RPC surface without affecting trigger
-- semantics. The explicit `authenticated` / `service_role` grants
-- minted by Supabase's default privileges are deliberately left in
-- place to avoid coupling this lockdown to default-privilege drift.
--------------------------------------------------------------------------------
revoke execute on function public.clear_gear_grid_on_settlement_gear_delete()
from public;
revoke execute on function public.clear_gear_grid_on_settlement_gear_delete()
from anon;
revoke execute on function public.clear_selected_armor_set_if_unqualified()
from public;
revoke execute on function public.clear_selected_armor_set_if_unqualified()
from anon;
revoke execute on function public.enforce_catalog_delete_guard()
from public;
revoke execute on function public.enforce_catalog_delete_guard()
from anon;
revoke execute on function public.handle_new_oauth_user()
from public;
revoke execute on function public.handle_new_oauth_user()
from anon;
revoke execute on function public.validate_gear_grid_positions()
from public;
revoke execute on function public.validate_gear_grid_positions()
from anon;
revoke execute on function public.validate_survivor_parents()
from public;
revoke execute on function public.validate_survivor_parents()
from anon;
--------------------------------------------------------------------------------
-- Tier 2 — RLS helper `is_admin()`
--
-- After 20260528000001_drop_admin_all_policies.sql no RLS policy
-- references `is_admin()`. Remaining call sites:
--   * `enforce_catalog_delete_guard()` — SECURITY DEFINER, so the
--     inner call runs under the function owner's privileges and is
--     unaffected by anon EXECUTE on `is_admin()`.
--   * `enforce_settlement_owner_only_columns()` — SECURITY INVOKER,
--     fires only on `settlement` UPDATE, which has no anon-targeting
--     policy. Authenticated callers continue to need EXECUTE; the
--     explicit `authenticated=X/postgres` ACL entry is preserved.
--------------------------------------------------------------------------------
revoke execute on function public.is_admin()
from public;
revoke execute on function public.is_admin()
from anon;
--------------------------------------------------------------------------------
-- Tier 3 — RPCs with no legitimate anon caller
--
-- `armor_set_qualifies` / `survivor_qualifies_for_armor_set` are
-- called from the `clear_selected_armor_set_if_unqualified` trigger
-- and from authenticated client code; authenticated EXECUTE is
-- preserved.
--
-- `get_shared_settlement_owners`, `realtime_publication_tables`, and
-- `rename_username` already revoked EXECUTE from PUBLIC in their
-- creation scripts. The revokes below are idempotent for them and
-- documented here so the lockdown surface is reviewable in one
-- place.
--
-- `provision_user_settings_for_oauth(uuid)` was created with an
-- explicit `grant execute … to service_role` only; its anon
-- reachability was the implicit PUBLIC grant. Callers: the
-- `handle_new_oauth_user` trigger on `auth.users` (runs as the
-- inserting role, not anon) and integration tests that authenticate
-- as `service_role`.
--------------------------------------------------------------------------------
revoke execute on function public.armor_set_qualifies(uuid, uuid [])
from public;
revoke execute on function public.armor_set_qualifies(uuid, uuid [])
from anon;
revoke execute on function public.get_shared_settlement_owners()
from public;
revoke execute on function public.get_shared_settlement_owners()
from anon;
revoke execute on function public.provision_user_settings_for_oauth(uuid)
from public;
revoke execute on function public.provision_user_settings_for_oauth(uuid)
from anon;
revoke execute on function public.realtime_publication_tables()
from public;
revoke execute on function public.realtime_publication_tables()
from anon;
revoke execute on function public.rename_username(varchar)
from public;
revoke execute on function public.rename_username(varchar)
from anon;
revoke execute on function public.survivor_qualifies_for_armor_set(uuid, uuid)
from public;
revoke execute on function public.survivor_qualifies_for_armor_set(uuid, uuid)
from anon;