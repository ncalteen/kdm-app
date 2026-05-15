--------------------------------------------------------------------------------
-- Subscription Plan Table
--
-- Source of truth for paid-feature gating. Three canonical tiers ship with
-- the table:
--
--   free          (Wanderer)        $0 / mo  — capped at 5 owned settlements,
--                                              cannot create new shares.
--   lantern       (Lantern)         $1 / mo  — unlimited owned settlements,
--                                              cannot create new shares.
--   lantern_hoard (Lantern Hoard)   $5 / mo  — unlimited owned settlements,
--                                              unlimited sharing.
--
-- Every tier can be invited into someone else's settlement (`may_be_invited`)
-- and can author custom catalog content (`may_create_custom`); the
-- collaborator role and custom-content authoring are intentionally not behind
-- a paywall. See `docs/settlement-sharing-architecture.md` §9 (entitlements)
-- and Epic E3.1 / GitHub issues #168 and #232.
--
-- `max_owned_settlements` and `max_collaborators_per_settlement` use NULL to
-- mean "unlimited". RLS gating that consults this table will treat NULL as
-- the absence of a cap.
--------------------------------------------------------------------------------
create table subscription_plan (
  id text primary key,
  display_name varchar not null,
  monthly_price_cents int not null,
  max_owned_settlements int,
  max_collaborators_per_settlement int,
  may_share boolean not null default false,
  may_be_invited boolean not null default true,
  may_create_custom boolean not null default true
);
--------------------------------------------------------------------------------
-- Canonical Plans
--
-- IDs are stable string keys; never re-use or rename them once Stripe price
-- IDs reference them. Display copy and pricing can move freely.
--------------------------------------------------------------------------------
insert into subscription_plan (
    id,
    display_name,
    monthly_price_cents,
    max_owned_settlements,
    max_collaborators_per_settlement,
    may_share,
    may_be_invited,
    may_create_custom
  )
values (
    'free',
    'Wanderer',
    0,
    5,
    null,
    false,
    true,
    true
  ),
  (
    'lantern',
    'Lantern',
    100,
    null,
    null,
    false,
    true,
    true
  ),
  (
    'lantern_hoard',
    'Lantern Hoard',
    500,
    null,
    null,
    true,
    true,
    true
  );
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Plans are public reference data for any authenticated user (the subscription
-- page surfaces price and benefits to logged-in shoppers). Mutations are
-- restricted to admin operators and the service-role migrations themselves.
--------------------------------------------------------------------------------
alter table subscription_plan enable row level security;
create policy "Allow select for authenticated" on subscription_plan for
select to authenticated using (true);
create policy "Allow all for admin" on subscription_plan for all using (is_admin()) with check (is_admin());