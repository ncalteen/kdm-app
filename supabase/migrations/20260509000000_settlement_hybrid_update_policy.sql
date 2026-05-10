--------------------------------------------------------------------------------
-- Phase 1.3 — Hybrid `settlement` UPDATE Policy (Decision 4 / OVERRIDE)
--
-- Replace the previous "owner-only OR shared-full" pair of UPDATE policies on
-- `settlement` with a hybrid model: collaborators may update gameplay-relevant
-- columns, while owner-only metadata is enforced by a row-level trigger that
-- raises `feature_not_supported` when a non-owner tries to mutate it.
--
-- RLS layer
-- ---------
--   * Drop "Allow update for shared" (full-row update for any collaborator).
--   * Drop "Allow update for owner".
--   * Add "Allow update for member" — both `is_settlement_owner(id)` and
--     `is_settlement_collaborator(id)` satisfy USING/WITH CHECK. Column-level
--     enforcement happens in the trigger below.
--
-- Trigger
-- -------
--   * `enforce_settlement_owner_only_columns()` — BEFORE UPDATE row trigger,
--     SECURITY INVOKER (default) so `auth.uid()` resolves to the calling
--     user. Decision flow:
--       1. Service role / direct-DB callers (`auth.uid() is null`) and
--          admins return NEW unchanged. They may need to fix data via
--          migrations.
--       2. All other authenticated callers — owner included — are blocked
--          from changing the immutable `id` / `created_at` columns.
--       3. The owner returns NEW unchanged for everything else.
--       4. Collaborators are blocked from mutating any of the owner-only
--          columns.
--     All blocking branches raise SQLSTATE `feature_not_supported`
--     (`0A000`).
--
-- Owner-only columns (collaborators denied):
--   `settlement_name`, `campaign_type`, `survivor_type`, `uses_scouts`,
--   `user_id`.
--
-- Immutable columns (every non-owner caller denied; owner is also blocked
-- because mutating the row's primary key or audit timestamp is never the
-- intended UI flow):
--   `id`, `created_at`.
--
-- `updated_at` is intentionally left unguarded; it is rewritten in place by
-- the `set_updated_at` trigger that runs immediately after this one.
--
-- Collaborator-editable columns (allowed by RLS, no trigger guard):
--   `arrival_bonuses`, `current_year`, `departing_bonuses`, `notes`,
--   `survival_limit`, `lantern_research`, `monster_volumes`.
--
-- Reference:
--   * `local/sharing-architecture.md` §5.2 Decision 4 (with OVERRIDE) /
--     §10 Phase 1.3.
--   * supabase/migrations/20260220190650_settlement.sql — original RLS.
--
-- Closes [E1.3] (issue #133).
--------------------------------------------------------------------------------
--
-- 1. Replace the UPDATE policies with a single helper-based "member" policy.
--
drop policy if exists "Allow update for shared" on settlement;
drop policy if exists "Allow update for owner" on settlement;
create policy "Allow update for member" on settlement for
update to authenticated using (
    is_settlement_owner(id)
    or is_settlement_collaborator(id)
  ) with check (
    is_settlement_owner(id)
    or is_settlement_collaborator(id)
  );
--
-- 2. Trigger function — guard owner-only columns.
--
create or replace function enforce_settlement_owner_only_columns()
returns trigger language plpgsql security invoker
set search_path = '' as $$
declare caller uuid := auth.uid();
begin -- Bypass for service role / direct DB connections (no auth context) and
-- admins. They may need to fix or backfill data via migrations.
if caller is null
or public.is_admin() then return new;
end if;
-- Authenticated callers (owner OR collaborator) must not change the
-- immutable identity / audit columns. There is no UI flow that mutates
-- these.
if new.id is distinct
from old.id
  or new.created_at is distinct
from old.created_at then raise exception 'settlement.id and settlement.created_at are immutable' using errcode = 'feature_not_supported';
end if;
-- Owner has full authority over the remaining columns.
if caller = old.user_id then return new;
end if;
-- Non-owner caller (collaborator): every owner-only column must remain
-- unchanged.
if new.settlement_name is distinct
from old.settlement_name
  or new.campaign_type is distinct
from old.campaign_type
  or new.survivor_type is distinct
from old.survivor_type
  or new.uses_scouts is distinct
from old.uses_scouts
  or new.user_id is distinct
from old.user_id then raise exception 'Only the settlement owner can change settlement_name, campaign_type, survivor_type, uses_scouts, or user_id' using errcode = 'feature_not_supported';
end if;
return new;
end;
$$;
--
-- 3. Attach the trigger.
--
drop trigger if exists enforce_settlement_owner_only_columns on settlement;
create trigger enforce_settlement_owner_only_columns before
update on settlement for each row execute function enforce_settlement_owner_only_columns();