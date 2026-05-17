--------------------------------------------------------------------------------
-- Helper: user_can_share()
--
-- SECURITY DEFINER predicate that returns true when the calling user is on a
-- subscription plan whose `may_share = true` AND whose subscription row is in
-- a usable status (`active` or `trialing`). Any other state — including
-- canceled, past_due, incomplete, or no subscription row at all — resolves to
-- false.
--
-- Consumed by paid-feature gating on `settlement_shared_user` (Epic E3 —
-- Phase 3, sub-task 3.3, GitHub issue #175). Putting the predicate in a
-- SECURITY DEFINER function lets RLS policies read `user_subscription` and
-- `subscription_plan` without re-entering their own RLS evaluation and
-- without granting the calling role direct SELECT on those tables across
-- arbitrary users.
--
-- Status whitelist
-- ----------------
-- The `user_subscription.status` column accepts `active`, `past_due`,
-- `canceled`, `trialing`, and `incomplete`. Only `active` and `trialing`
-- entitle the caller to create new shares:
--   * `past_due` — payment failed; existing shares persist (see
--     `docs/settlement-sharing-architecture.md` §9.3) but the feature is
--     paused while Stripe retries.
--   * `canceled` — user has explicitly downgraded; same persistence-only
--     semantics as past_due.
--   * `incomplete` — initial checkout never confirmed; treat as unpaid.
--
-- Search path
-- -----------
-- SET search_path = '' (empty) forces all references to be fully qualified
-- with `public.`, matching the repository-wide convention for SECURITY
-- DEFINER helpers introduced in 20260508000001_is_settlement_collaborator.sql.
-- This neutralizes search_path-based escalation attacks against the function
-- body.
--
-- Reference: `docs/settlement-sharing-architecture.md` §9.1 / §10 Phase 3
-- item 3.3.
--------------------------------------------------------------------------------
create or replace function user_can_share() returns boolean language sql stable security definer
set search_path = '' as $$
select coalesce(
    (
      select sp.may_share
      from public.user_subscription us
        join public.subscription_plan sp on sp.id = us.plan_id
      where us.user_id = auth.uid()
        and us.status in ('active', 'trialing')
    ),
    false
  );
$$;
--------------------------------------------------------------------------------
-- Privilege lockdown
--
-- `CREATE FUNCTION` defaults to granting EXECUTE to PUBLIC. A subsequent
-- Supabase-specific `ALTER DEFAULT PRIVILEGES` on the `public` schema also
-- grants EXECUTE to `anon`, `authenticated`, and `service_role` independently
-- of PUBLIC. Revoking from PUBLIC is therefore not sufficient to deny the
-- anon role — we must drop it explicitly. See
-- 20260529000000_lockdown_anon_security_definer_rpcs.sql for the broader
-- audit that established this pattern.
--
-- The function has no legitimate anon caller — paid-feature gating only
-- applies to authenticated users — so anon EXECUTE is revoked outright.
-- `authenticated` keeps EXECUTE; `service_role` retains its grant via
-- default privileges, which is intentional for future webhook handlers and
-- the integration-test fixture path.
--------------------------------------------------------------------------------
revoke all on function public.user_can_share()
from public;
revoke execute on function public.user_can_share()
from anon;
grant execute on function public.user_can_share() to authenticated;