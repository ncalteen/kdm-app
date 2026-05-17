--------------------------------------------------------------------------------
-- Gate `settlement_shared_user` INSERT on `user_can_share()` (Epic E3, Phase
-- 3.3 — GitHub issue #165).
--
-- Replaces the prior `"Allow insert for authenticated"` INSERT policy (last
-- minted by 20260324185335_fix_shared_user_rls_recursion.sql) with a tighter
-- predicate that additionally requires the caller to be on a subscription
-- plan whose `may_share = true` and whose status is `active` or `trialing`.
-- The new predicate composes three independent checks:
--
--   1. `user_can_share()` — paid-tier entitlement (E3.2 helper added by
--      20260530000000_user_can_share.sql).
--   2. `is_settlement_owner(settlement_id)` — only the settlement owner may
--      grant access to it.
--   3. `user_id = (select auth.uid())` — the grantor column must match the
--      authenticated user so a forged `user_id` cannot launder the share
--      through someone else's identity. The `(select auth.uid())` form is
--      Supabase's recommended initplan idiom (see
--      https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select).
--
-- Scope
-- -----
-- This migration intentionally touches ONLY the INSERT policy. The
-- "Allow select for owner", "Allow update for owner", "Allow delete for
-- owner", "Allow select for shared", and "Allow all for admin" policies
-- minted in 20260220190650_settlement.sql remain unchanged so existing
-- shares persist for an owner who later downgrades. This is the EC-12
-- semantic from `docs/settlement-sharing-architecture.md` §9.3:
--
--   * Existing collaborator rows stay visible to the original grantor and
--     to the shared user.
--   * The grantor can still UPDATE / DELETE rows they already created (i.e.
--     revoke a share manually).
--   * Only the creation of new shares is paused while the grantor's
--     subscription is not in an entitling state.
--
-- The admin bypass ("Allow all for admin") is also untouched, so
-- service-role traffic and the `is_admin()` short-circuit continue to
-- bypass the new paid gate — required for support tooling and the
-- integration-test fixture path (`admin.from('settlement_shared_user')...`).
--
-- Reference: `docs/settlement-sharing-architecture.md` §9.2 / §9.3 /
-- Appendix B EC-11, EC-12. Plan: §10 Phase 3 item 3.3. GitHub issue #165.
--------------------------------------------------------------------------------
drop policy if exists "Allow insert for authenticated" on settlement_shared_user;
create policy "Allow insert by paying owner" on settlement_shared_user for
insert to authenticated with check (
    user_can_share()
    and is_settlement_owner(settlement_id)
    and user_id = (
      select auth.uid()
    )
  );