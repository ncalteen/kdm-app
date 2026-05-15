--------------------------------------------------------------------------------
-- Helper: is_settlement_collaborator(uuid)
--
-- SECURITY DEFINER predicate that returns true when `auth.uid()` is listed as
-- a collaborator on the given settlement via `settlement_shared_user`.
--
-- Required to break circular RLS evaluation in collaborator policies:
-- a `settlement_*` junction table policy that calls
-- `exists (select 1 from settlement_shared_user ...)` would re-enter the
-- shared-user table's RLS, which itself references the parent table — the
-- planner detects this as infinite recursion. By bypassing RLS via SECURITY
-- DEFINER (and a locked-down search_path), the helper short-circuits the
-- cycle without leaking access.
--
-- Mirrors the structure of `is_settlement_owner` introduced in
-- `20260324185335_fix_shared_user_rls_recursion.sql`.
--
-- Reference: `docs/sharing-architecture.md` §5.2 Decision 3 / §10 Phase 1.1.
--------------------------------------------------------------------------------
create or replace function is_settlement_collaborator(target_settlement uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
    select 1
    from public.settlement_shared_user
    where settlement_id = target_settlement
      and shared_user_id = auth.uid()
  );
$$;
revoke all on function public.is_settlement_collaborator(uuid)
from public;
-- Supabase's `ALTER DEFAULT PRIVILEGES` on the `public` schema grants
-- EXECUTE to `anon`, `authenticated`, and `service_role` independently of
-- PUBLIC, so the revoke above is not sufficient to deny anonymous callers.
-- Drop anon explicitly to enforce the "authenticated only" contract from
-- Epic E1 — Phase 1.1.
revoke execute on function public.is_settlement_collaborator(uuid)
from anon;
grant execute on function public.is_settlement_collaborator(uuid) to authenticated;