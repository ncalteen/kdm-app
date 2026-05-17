--------------------------------------------------------------------------------
-- Drop Legacy "Allow All For Admin" RLS Policies
--
-- Every public table historically carried an `Allow all for admin` policy of
-- the form
--
--     create policy "Allow all for admin" on <table>
--       for all using (is_admin()) with check (is_admin());
--
-- where `is_admin()` resolves to `auth.role() = 'admin'`. Supabase does not
-- issue tokens with the `admin` role — admin/maintenance traffic uses the
-- `service_role` JWT, which bypasses RLS unconditionally. The policy is
-- therefore unreachable in practice:
--
--   * `anon` / `authenticated` requests never satisfy `is_admin()`.
--   * `service_role` requests skip RLS entirely.
--
-- Keeping these policies has real cost: every `(table, command)` pair carries
-- an extra permissive policy that the planner must evaluate, which the
-- database advisor flags as a `multiple_permissive_policies` warning. They
-- also obscure the real authorization story when auditing RLS.
--
-- The integration test suite documents that these policies are excluded from
-- the coverage matrix (see `docs/integration-tests.md`), so nothing in CI
-- depends on them.
--
-- The `is_admin()` helper function itself is intentionally NOT dropped — it
-- may still be useful for future server-side checks — but no RLS policy in
-- the schema references it after this migration runs.
--------------------------------------------------------------------------------
drop policy if exists "Allow all for admin" on public.ability_impairment;
drop policy if exists "Allow all for admin" on public.armor_set;
drop policy if exists "Allow all for admin" on public.armor_set_slot;
drop policy if exists "Allow all for admin" on public.armor_set_slot_gear;
drop policy if exists "Allow all for admin" on public."character";
drop policy if exists "Allow all for admin" on public.collective_cognition_reward;
drop policy if exists "Allow all for admin" on public.constellation;
drop policy if exists "Allow all for admin" on public.disorder;
drop policy if exists "Allow all for admin" on public.fighting_art;
drop policy if exists "Allow all for admin" on public.gear;
drop policy if exists "Allow all for admin" on public.gear_gear_cost;
drop policy if exists "Allow all for admin" on public.gear_grid;
drop policy if exists "Allow all for admin" on public.gear_other_cost;
drop policy if exists "Allow all for admin" on public.gear_resource_cost;
drop policy if exists "Allow all for admin" on public.gear_resource_type_cost;
drop policy if exists "Allow all for admin" on public.hunt;
drop policy if exists "Allow all for admin" on public.hunt_ai_deck;
drop policy if exists "Allow all for admin" on public.hunt_hunt_board;
drop policy if exists "Allow all for admin" on public.hunt_monster;
drop policy if exists "Allow all for admin" on public.hunt_monster_mood;
drop policy if exists "Allow all for admin" on public.hunt_monster_survivor_status;
drop policy if exists "Allow all for admin" on public.hunt_monster_trait;
drop policy if exists "Allow all for admin" on public.hunt_survivor;
drop policy if exists "Allow all for admin" on public.innovation;
drop policy if exists "Allow all for admin" on public.knowledge;
drop policy if exists "Allow all for admin" on public.location;
drop policy if exists "Allow all for admin" on public.milestone;
drop policy if exists "Allow all for admin" on public.mood;
drop policy if exists "Allow all for admin" on public.nemesis;
drop policy if exists "Allow all for admin" on public.nemesis_level;
drop policy if exists "Allow all for admin" on public.nemesis_level_mood;
drop policy if exists "Allow all for admin" on public.nemesis_level_survivor_status;
drop policy if exists "Allow all for admin" on public.nemesis_level_trait;
drop policy if exists "Allow all for admin" on public.nemesis_location;
drop policy if exists "Allow all for admin" on public.nemesis_timeline_year;
drop policy if exists "Allow all for admin" on public.neurosis;
drop policy if exists "Allow all for admin" on public.pattern;
drop policy if exists "Allow all for admin" on public.pattern_gear_cost;
drop policy if exists "Allow all for admin" on public.pattern_innovation_requirement;
drop policy if exists "Allow all for admin" on public.pattern_resource_cost;
drop policy if exists "Allow all for admin" on public.pattern_resource_type_cost;
drop policy if exists "Allow all for admin" on public.philosophy;
drop policy if exists "Allow all for admin" on public.philosophy_rank;
drop policy if exists "Allow all for admin" on public.principle;
drop policy if exists "Allow all for admin" on public.quarry;
drop policy if exists "Allow all for admin" on public.quarry_collective_cognition_reward;
drop policy if exists "Allow all for admin" on public.quarry_hunt_board;
drop policy if exists "Allow all for admin" on public.quarry_hunt_board_position;
drop policy if exists "Allow all for admin" on public.quarry_level;
drop policy if exists "Allow all for admin" on public.quarry_level_mood;
drop policy if exists "Allow all for admin" on public.quarry_level_survivor_status;
drop policy if exists "Allow all for admin" on public.quarry_level_trait;
drop policy if exists "Allow all for admin" on public.quarry_location;
drop policy if exists "Allow all for admin" on public.quarry_timeline_year;
drop policy if exists "Allow all for admin" on public.resource;
drop policy if exists "Allow all for admin" on public.secret_fighting_art;
drop policy if exists "Allow all for admin" on public.seed_pattern;
drop policy if exists "Allow all for admin" on public.seed_pattern_gear_cost;
drop policy if exists "Allow all for admin" on public.seed_pattern_innovation_requirement;
drop policy if exists "Allow all for admin" on public.seed_pattern_resource_cost;
drop policy if exists "Allow all for admin" on public.seed_pattern_resource_type_cost;
drop policy if exists "Allow all for admin" on public.settlement;
drop policy if exists "Allow all for admin" on public.settlement_collective_cognition_reward;
drop policy if exists "Allow all for admin" on public.settlement_gear;
drop policy if exists "Allow all for admin" on public.settlement_innovation;
drop policy if exists "Allow all for admin" on public.settlement_knowledge;
drop policy if exists "Allow all for admin" on public.settlement_location;
drop policy if exists "Allow all for admin" on public.settlement_milestone;
drop policy if exists "Allow all for admin" on public.settlement_nemesis;
drop policy if exists "Allow all for admin" on public.settlement_pattern;
drop policy if exists "Allow all for admin" on public.settlement_phase;
drop policy if exists "Allow all for admin" on public.settlement_phase_returning_survivor;
drop policy if exists "Allow all for admin" on public.settlement_philosophy;
drop policy if exists "Allow all for admin" on public.settlement_principle;
drop policy if exists "Allow all for admin" on public.settlement_quarry;
drop policy if exists "Allow all for admin" on public.settlement_resource;
drop policy if exists "Allow all for admin" on public.settlement_seed_pattern;
drop policy if exists "Allow all for admin" on public.settlement_shared_user;
drop policy if exists "Allow all for admin" on public.settlement_timeline_year;
drop policy if exists "Allow all for admin" on public.showdown;
drop policy if exists "Allow all for admin" on public.showdown_ai_deck;
drop policy if exists "Allow all for admin" on public.showdown_monster;
drop policy if exists "Allow all for admin" on public.showdown_monster_mood;
drop policy if exists "Allow all for admin" on public.showdown_monster_survivor_status;
drop policy if exists "Allow all for admin" on public.showdown_monster_trait;
drop policy if exists "Allow all for admin" on public.showdown_survivor;
drop policy if exists "Allow all for admin" on public.strain_milestone;
drop policy if exists "Allow all for admin" on public.subscription_plan;
drop policy if exists "Allow all for admin" on public.survivor;
drop policy if exists "Allow all for admin" on public.survivor_ability_impairment;
drop policy if exists "Allow all for admin" on public.survivor_cursed_gear;
drop policy if exists "Allow all for admin" on public.survivor_disorder;
drop policy if exists "Allow all for admin" on public.survivor_fighting_art;
drop policy if exists "Allow all for admin" on public.survivor_secret_fighting_art;
drop policy if exists "Allow all for admin" on public.survivor_status;
drop policy if exists "Allow all for admin" on public.trait;
drop policy if exists "Allow all for admin" on public.user_settings;
drop policy if exists "Allow all for admin" on public.user_subscription;
drop policy if exists "Allow all for admin" on public.wanderer;
drop policy if exists "Allow all for admin" on public.wanderer_ability_impairment;
drop policy if exists "Allow all for admin" on public.wanderer_timeline_year;
drop policy if exists "Allow all for admin" on public.weapon_type;