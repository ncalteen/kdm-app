--------------------------------------------------------------------------------
-- Lookup User By Username
--
-- SECURITY DEFINER RPC that resolves an exact username to its `auth.users.id`
-- so an authenticated caller can issue a settlement-share invite by handle
-- without ever pulling the full `user_settings` table.
--
-- Source of truth: `local/sharing-architecture.md` §4 P9 (no enumeration) /
-- §11 Q9 (REQUIRE EXACT MATCH) / §10 Phase 1 item 1.5. Tracking issue: #146.
--
-- Anti-enumeration guarantees:
--   1. Exact match only. No prefix, no substring, no `ilike`.
--   2. Per-user rate limit of 30 lookups per rolling 60-second window.
--      Implemented via a dedicated `lookup_user_audit(user_id, attempted_at)`
--      table, serialised under `pg_advisory_xact_lock` so concurrent calls
--      from the same caller cannot both observe `count = 29` and both insert.
--   3. No-leak surface. Both "rate-limited" and "not-found" return NULL so
--      the caller cannot distinguish a missed username from an over-budget
--      probe — closing the timing/error side channel that would otherwise
--      let an attacker enumerate handles by burst-probing past the limit.
--      This intentionally diverges from `rename_username`, which raises on
--      throttle, because rename collisions are not an enumeration vector.
--
-- Rate-limit choice (per the issue body's "choose the simpler option"):
--   - Picked `lookup_user_audit` over a token-bucket on `user_settings`
--     because a sliding window (the spec's "30 per rolling 60s") cannot be
--     emulated by a single last-call timestamp. The audit table also keeps
--     `user_settings` writes scoped to actual settings changes, avoiding
--     write amplification on a hot, narrow table.
--   - The function prunes the caller's own rows older than the window on
--     each call, so the table is bounded above by 30 rows per *currently
--     active* caller — naturally tiny.
--
-- Auth surface:
--   - Anon callers are double-blocked: (a) explicit `revoke execute … from
--     anon` because Supabase's `ALTER DEFAULT PRIVILEGES` grants EXECUTE to
--     anon independently of PUBLIC, and (b) the in-function `auth.uid() is
--     null` guard, which still fails closed if the GRANT model ever drifts.
--------------------------------------------------------------------------------
create table if not exists public.lookup_user_audit (
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
-- Index sized to the only query that hits this table: "give me this caller's
-- attempts inside the rolling window". `user_id` first lets the planner seek
-- to the caller's slice; `attempted_at desc` lets the prune-and-count pair
-- stop scanning as soon as the row falls outside the window.
create index if not exists lookup_user_audit_user_attempted_at_idx on public.lookup_user_audit (user_id, attempted_at desc);
-- RLS is enabled with no policies. Only the SECURITY DEFINER function below
-- ever touches the table, so any direct PostgREST query (owner or not) must
-- come back empty. Defence-in-depth against accidental EXECUTE drift on the
-- function itself.
alter table public.lookup_user_audit enable row level security;
create or replace function lookup_user_by_username(p_username varchar) returns uuid language plpgsql security definer
set search_path = '' as $$
declare caller_uid uuid := auth.uid();
result_id uuid;
request_count int;
rate_window constant interval := interval '60 seconds';
rate_limit constant int := 30;
begin if caller_uid is null then raise exception 'not-authenticated' using errcode = '42501';
end if;
-- Serialise concurrent lookups for this caller. The lock key is derived
-- from the caller UUID so different users never contend, and the lock is
-- automatically released at transaction end.
perform pg_advisory_xact_lock(
  hashtext('lookup_user_by_username'),
  hashtext(caller_uid::text)
);
-- Prune the caller's expired audit rows so the table size stays bounded
-- by the number of *currently rate-limited* callers rather than growing
-- linearly with total lookups across all time.
delete from public.lookup_user_audit
where user_id = caller_uid
  and attempted_at <= now() - rate_window;
-- After pruning, every remaining row is inside the active window, so a
-- bare count is sufficient — no time predicate needed.
select count(*) into request_count
from public.lookup_user_audit
where user_id = caller_uid;
if request_count >= rate_limit then -- Same shape as the not-found path. The caller cannot tell whether they
-- typed an unknown handle or burned through their lookup budget, which
-- is what closes the enumeration side channel.
return null;
end if;
insert into public.lookup_user_audit (user_id)
values (caller_uid);
select user_id into result_id
from public.user_settings
where username = p_username;
return result_id;
end;
$$;
revoke all on function public.lookup_user_by_username(varchar)
from public;
-- Supabase's `ALTER DEFAULT PRIVILEGES` on the `public` schema grants
-- EXECUTE to `anon`, `authenticated`, and `service_role` independently of
-- PUBLIC, so the revoke above is not sufficient to deny anonymous callers.
-- Drop anon explicitly to enforce the "authenticated only" contract.
revoke execute on function public.lookup_user_by_username(varchar)
from anon;
grant execute on function public.lookup_user_by_username(varchar) to authenticated;