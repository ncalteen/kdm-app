--------------------------------------------------------------------------------
-- User Subscription — Realtime Publication
--
-- Add `user_subscription` to the `supabase_realtime` publication so the SPA
-- can refresh its cached entitlement state as soon as the Stripe webhook
-- commits, without waiting for the user to round-trip through the Customer
-- Portal and re-mount the React tree on return.
--
-- Without publication membership, the SubscriptionCard converges via the
-- initial-mount fetch in `LocalContext` — which races the webhook delivery.
-- Subscribers who cancel via the Portal and return to the SPA in <1s can
-- briefly see "Next renewal: …" before the cache rebuilds with the
-- pending-cancellation treatment. Publication membership closes that window
-- and also enables cross-device sync (e.g. cancel on phone, see the Ending
-- badge appear on the laptop without a manual reload).
--
-- The existing "Allow select own" RLS policy on `user_subscription`
-- (20260527000001) restricts SELECT to `user_id = auth.uid()`. Supabase
-- Realtime honors RLS via the secure broadcast channel, so subscribers only
-- ever receive events for their own row. No additional policy is required.
--
-- Idempotent via `pg_publication_tables` so the migration replays cleanly
-- against environments where the table was added piecemeal.
--
-- See GitHub issue #170 (subscription page) and the §9 cancellation surface
-- discussion in `docs/settlement-sharing-architecture.md`.
--------------------------------------------------------------------------------
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'user_subscription'
) then alter publication supabase_realtime
add table user_subscription;
end if;
end $$;