--------------------------------------------------------------------------------
-- Notification Table
--
-- Backing store for the in-app bell ([E4.3], decision D4 from issue #180).
-- Each row is a single notification addressed to one recipient — the kind
-- discriminator and the open-ended `payload` jsonb let the UI render copy
-- and deep-links without a new schema per event type.
--
-- Initial event kinds the trigger layer ([E4.6]) will produce:
--   * 'settlement_shared_with_you'
--   * 'removed_from_settlement'
--   * 'milestone_reached'
--
-- Writes are reserved for service-role contexts and SECURITY DEFINER
-- triggers; the client never inserts directly. Recipients can flip
-- `read_at` themselves so the bell badge can clear without round-tripping
-- through the server, but they cannot fabricate rows or steal someone
-- else's inbox.
--
-- See `docs/settlement-sharing-architecture.md` §10 Phase 4 item 4.3 and
-- §11 open question #10 ("just a UI bell badge is enough"), and GitHub
-- issue #180. DAL lives in [E4.4]; UI in [E4.5]; trigger producers in
-- [E4.6] — all explicitly out of scope here.
--------------------------------------------------------------------------------
create table notification (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- INSERT/DELETE are intentionally not granted to `authenticated` — those
-- paths are reserved for service-role contexts and the SECURITY DEFINER
-- triggers landing in [E4.6]. UPDATE is scoped to the `read_at` workflow:
-- the policy guards both `using` (the row must belong to the caller) and
-- `with check` (the caller cannot reassign `recipient_user_id` to steal
-- another user's row). RLS UPDATE policies are row-scoped, not
-- column-scoped — the column-level grant below pins the writable surface
-- to `read_at` so a recipient cannot rewrite `kind`, `payload`, or
-- `created_at` on their own rows.
--------------------------------------------------------------------------------
alter table notification enable row level security;
create policy "Allow select own" on notification for
select to authenticated using (
    recipient_user_id = (
      select auth.uid()
    )
  );
create policy "Allow update own (mark read)" on notification for
update to authenticated using (
    recipient_user_id = (
      select auth.uid()
    )
  ) with check (
    recipient_user_id = (
      select auth.uid()
    )
  );
--------------------------------------------------------------------------------
-- Column-Level UPDATE Pin
--
-- Supabase's default privileges (`ALTER DEFAULT PRIVILEGES IN SCHEMA
-- public GRANT ALL ON TABLES TO authenticated`) hand the `authenticated`
-- role table-wide UPDATE on new tables. RLS gates rows but not columns,
-- so without an explicit revoke + column-scoped grant a recipient could
-- mutate `kind`, `payload`, or `created_at` on rows they own. Revoke the
-- broad UPDATE and re-grant only `read_at` — the bell's sole legitimate
-- write — to enforce the "mark read only" intent at the privilege layer
-- (defense in depth, independent of policy expressions).
--
-- INSERT/DELETE remain blocked by RLS alone (no policy exists to permit
-- them under `authenticated`); a future tightening pass can revoke those
-- table privileges too, but the surface is already closed.
--------------------------------------------------------------------------------
revoke
update on table notification
from authenticated;
grant update (read_at) on table notification to authenticated;
--------------------------------------------------------------------------------
-- Indexes
--
-- The bell's primary query is "give me my unread notifications, newest
-- first", so the partial index covers exactly that predicate and stays
-- small as historical rows accumulate.
--------------------------------------------------------------------------------
create index notification_recipient_unread_idx on notification(recipient_user_id, created_at desc)
where read_at is null;
--------------------------------------------------------------------------------
-- Realtime Publication
--
-- Add `notification` to `supabase_realtime` so the bell can push-update
-- without polling. The "Allow select own" policy above is honored by the
-- secure broadcast channel, so subscribers only ever see their own rows.
--
-- Idempotent via `pg_publication_tables` so the migration replays cleanly
-- against environments where the table was added piecemeal.
--------------------------------------------------------------------------------
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'notification'
) then alter publication supabase_realtime
add table notification;
end if;
end $$;