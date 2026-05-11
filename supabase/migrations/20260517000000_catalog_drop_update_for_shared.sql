--------------------------------------------------------------------------------
-- [E2.2] Drop `Allow update for shared and custom` on every catalog table.
--
-- Source of truth: local/sharing-architecture.md §5.2 Decision 2 and §6
-- Permission Matrix. Rules text on catalog rows is author-only:
-- collaborators may SELECT custom catalog rows (via the transitive-SELECT
-- work delivered in [E2.1.a], [E2.1.b], [E2.1.c]) but they must never
-- modify them.
--
-- Author UPDATE remains untouched via the existing
-- `Allow update for owner and custom` policy on each table.
-- INSERT / DELETE remain author-only (out of scope).
--
-- The drops are idempotent (`drop policy if exists`) so this migration is
-- safe to re-run and is independent of [E2.1] ordering.
--
-- Tables covered (every catalog table that currently has the policy):
--   ability_impairment, armor_set, character, collective_cognition_reward,
--   constellation, disorder, fighting_art, gear, innovation, knowledge,
--   location, milestone, mood, nemesis, neurosis, pattern, philosophy,
--   principle, quarry, resource, secret_fighting_art, seed_pattern,
--   strain_milestone, survivor_status, trait, wanderer, weapon_type.
--
-- Not included:
--   * gear_grid — its `Allow update for shared and custom` policy was
--     already dropped by
--     supabase/migrations/20260503000000_gear_grid_settlement_rls.sql when
--     gear_grid moved to settlement-scoped RLS.
--------------------------------------------------------------------------------
drop policy if exists "Allow update for shared and custom" on ability_impairment;
drop policy if exists "Allow update for shared and custom" on armor_set;
drop policy if exists "Allow update for shared and custom" on character;
drop policy if exists "Allow update for shared and custom" on collective_cognition_reward;
drop policy if exists "Allow update for shared and custom" on constellation;
drop policy if exists "Allow update for shared and custom" on disorder;
drop policy if exists "Allow update for shared and custom" on fighting_art;
drop policy if exists "Allow update for shared and custom" on gear;
drop policy if exists "Allow update for shared and custom" on innovation;
drop policy if exists "Allow update for shared and custom" on knowledge;
drop policy if exists "Allow update for shared and custom" on location;
drop policy if exists "Allow update for shared and custom" on milestone;
drop policy if exists "Allow update for shared and custom" on mood;
drop policy if exists "Allow update for shared and custom" on nemesis;
drop policy if exists "Allow update for shared and custom" on neurosis;
drop policy if exists "Allow update for shared and custom" on pattern;
drop policy if exists "Allow update for shared and custom" on philosophy;
drop policy if exists "Allow update for shared and custom" on principle;
drop policy if exists "Allow update for shared and custom" on quarry;
drop policy if exists "Allow update for shared and custom" on resource;
drop policy if exists "Allow update for shared and custom" on secret_fighting_art;
drop policy if exists "Allow update for shared and custom" on seed_pattern;
drop policy if exists "Allow update for shared and custom" on strain_milestone;
drop policy if exists "Allow update for shared and custom" on survivor_status;
drop policy if exists "Allow update for shared and custom" on trait;
drop policy if exists "Allow update for shared and custom" on wanderer;
drop policy if exists "Allow update for shared and custom" on weapon_type;