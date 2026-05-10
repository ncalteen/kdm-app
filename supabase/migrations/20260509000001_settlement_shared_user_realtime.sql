--------------------------------------------------------------------------------
-- Phase 1.4 — Add `settlement_shared_user` to `supabase_realtime`
--
-- Allow user-level realtime subscriptions to receive INSERT/DELETE events
-- when an invite is granted or revoked, so the recipient's settlement
-- switcher updates without a full reload. Pairs with the per-user channel
-- introduced in [E1.5].
--
-- Idempotent guard via `pg_publication_tables`: if the table is already a
-- member of the publication (e.g. on a branch where someone added it
-- manually for testing), skip the ALTER so the migration stays safe to
-- re-run.
--
-- Reference:
--   * `local/sharing-architecture.md` §5.2 Decision 5 / §3.2 / §10 Phase 1.4.
--   * supabase/migrations/20260327000000_enable_realtime_gameplay_tables.sql
--   * supabase/migrations/20260503000001_gear_grid_realtime.sql
--   * supabase/migrations/20260506000000_audit_realtime_publication.sql
--
-- Closes [E1.4] (issue #136).
--------------------------------------------------------------------------------
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and schemaname = 'public'
    and tablename = 'settlement_shared_user'
) then alter publication supabase_realtime
add table settlement_shared_user;
end if;
end $$;