--------------------------------------------------------------------------------
-- Index Foreign Key Columns
--
-- Adds btree indexes for every foreign-key column in the public schema that is
-- not already covered by a left-prefix index. Unindexed FK columns force
-- sequential scans on the referencing table whenever the referenced row is
-- updated or deleted, and also penalize any direct WHERE <fk_col> = ? lookup
-- — including the catalog visibility joins and the realtime change feeds that
-- key off these columns.
--
-- Generated from a `pg_constraint` / `pg_index` audit of the live schema; see
-- the PR description for the full diff. All statements use IF NOT EXISTS so
-- the migration is safe to re-run on environments where some indexes were
-- created manually.
--
-- Naming convention follows the existing migrations: `idx_<table>_<column>`
-- with the trailing `_id` stripped from single-column FK references.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Catalog tables: owner (user_id) lookups
--
-- These tables already carry a `(custom, user_id)` composite index used by the
-- catalog visibility RLS path, but that composite cannot serve plain
-- `user_id = ?` lookups (custom is the leading column) and so does not cover
-- the FK to auth.users. Each gets a dedicated single-column index.
--------------------------------------------------------------------------------
create index if not exists idx_ability_impairment_user on ability_impairment(user_id);
create index if not exists idx_armor_set_user on armor_set(user_id);
create index if not exists idx_character_user on character(user_id);
create index if not exists idx_collective_cognition_reward_user on collective_cognition_reward(user_id);
create index if not exists idx_constellation_user on constellation(user_id);
create index if not exists idx_disorder_user on disorder(user_id);
create index if not exists idx_fighting_art_user on fighting_art(user_id);
create index if not exists idx_gear_user on gear(user_id);
create index if not exists idx_innovation_user on innovation(user_id);
create index if not exists idx_knowledge_user on knowledge(user_id);
create index if not exists idx_location_user on location(user_id);
create index if not exists idx_milestone_user on milestone(user_id);
create index if not exists idx_mood_user on mood(user_id);
create index if not exists idx_nemesis_user on nemesis(user_id);
create index if not exists idx_neurosis_user on neurosis(user_id);
create index if not exists idx_pattern_user on pattern(user_id);
create index if not exists idx_philosophy_user on philosophy(user_id);
create index if not exists idx_principle_user on principle(user_id);
create index if not exists idx_quarry_user on quarry(user_id);
create index if not exists idx_resource_user on resource(user_id);
create index if not exists idx_secret_fighting_art_user on secret_fighting_art(user_id);
create index if not exists idx_seed_pattern_user on seed_pattern(user_id);
-- NOTE: `settlement_shared_user` already carries an `idx_settlement_shared_user_user`
-- index, but it covers `shared_user_id` (the invited collaborator) — not the
-- `user_id` column (the inviting owner). We add a separately-named index for
-- the owner column rather than renaming the legacy one.
create index if not exists idx_settlement_shared_user_owner on settlement_shared_user(user_id);
create index if not exists idx_strain_milestone_user on strain_milestone(user_id);
create index if not exists idx_survivor_status_user on survivor_status(user_id);
create index if not exists idx_trait_user on trait(user_id);
create index if not exists idx_weapon_type_user on weapon_type(user_id);
--------------------------------------------------------------------------------
-- Gear
--
-- `gear.location_id` and `gear.weapon_type_id` are dropdown lookups used
-- throughout the catalog UI and showdown loadout builders; both need indexes
-- so reference-row deletes don't trigger sequential scans of the gear table.
--------------------------------------------------------------------------------
create index if not exists idx_gear_location on gear(location_id);
create index if not exists idx_gear_weapon_type on gear(weapon_type_id);
--------------------------------------------------------------------------------
-- Gear Grid
--
-- Each of the nine slot columns is a FK to gear(id). Without indexes, deleting
-- or unselecting any gear row forces PG to seq-scan gear_grid to enforce the
-- FK. The table is small (one row per settlement), but the gear_grid rebuild
-- on `settlement_gear` deletion is a hot path so the indexes are still worth
-- having.
--------------------------------------------------------------------------------
create index if not exists idx_gear_grid_pos_top_left on gear_grid(pos_top_left);
create index if not exists idx_gear_grid_pos_top_center on gear_grid(pos_top_center);
create index if not exists idx_gear_grid_pos_top_right on gear_grid(pos_top_right);
create index if not exists idx_gear_grid_pos_mid_left on gear_grid(pos_mid_left);
create index if not exists idx_gear_grid_pos_mid_center on gear_grid(pos_mid_center);
create index if not exists idx_gear_grid_pos_mid_right on gear_grid(pos_mid_right);
create index if not exists idx_gear_grid_pos_bottom_left on gear_grid(pos_bottom_left);
create index if not exists idx_gear_grid_pos_bottom_center on gear_grid(pos_bottom_center);
create index if not exists idx_gear_grid_pos_bottom_right on gear_grid(pos_bottom_right);
--------------------------------------------------------------------------------
-- Knowledge → Philosophy
--------------------------------------------------------------------------------
create index if not exists idx_knowledge_philosophy on knowledge(philosophy_id);
--------------------------------------------------------------------------------
-- Nemesis and Quarry self-references (alternate, vignette)
--------------------------------------------------------------------------------
create index if not exists idx_nemesis_alternate on nemesis(alternate_id);
create index if not exists idx_nemesis_vignette on nemesis(vignette_id);
create index if not exists idx_quarry_alternate on quarry(alternate_id);
create index if not exists idx_quarry_vignette on quarry(vignette_id);
--------------------------------------------------------------------------------
-- Crafting graph
--
-- Joins from gear / resource / innovation back through their patterns and
-- seed_patterns drive the crafting UI; without these indexes the joins
-- degrade to seq scans as the catalog grows.
--------------------------------------------------------------------------------
create index if not exists idx_pattern_crafted_gear on pattern(crafted_gear_id);
create index if not exists idx_pattern_gear_cost_cost_gear on pattern_gear_cost(cost_gear_id);
create index if not exists idx_pattern_innovation_requirement_innovation on pattern_innovation_requirement(innovation_id);
create index if not exists idx_pattern_resource_cost_resource on pattern_resource_cost(resource_id);
create index if not exists idx_seed_pattern_crafted_gear on seed_pattern(crafted_gear_id);
create index if not exists idx_seed_pattern_gear_cost_cost_gear on seed_pattern_gear_cost(cost_gear_id);
create index if not exists idx_seed_pattern_innovation_requirement_innovation on seed_pattern_innovation_requirement(innovation_id);
create index if not exists idx_seed_pattern_resource_cost_resource on seed_pattern_resource_cost(resource_id);
--------------------------------------------------------------------------------
-- Philosophy → Knowledge (tenet)
--------------------------------------------------------------------------------
create index if not exists idx_philosophy_tenet_knowledge on philosophy(tenet_knowledge_id);
--------------------------------------------------------------------------------
-- Resource lineage (pattern + quarry origin)
--------------------------------------------------------------------------------
create index if not exists idx_resource_pattern on resource(pattern_id);
create index if not exists idx_resource_quarry on resource(quarry_id);
--------------------------------------------------------------------------------
-- Settlement junction lookups
--
-- These junction rows are deleted/reattached whenever the referenced lookup
-- row (location / milestone / principle / resource) is removed from the
-- catalog. Indexing the referencing column keeps those cascades constant-time.
--------------------------------------------------------------------------------
create index if not exists idx_settlement_location_location on settlement_location(location_id);
create index if not exists idx_settlement_milestone_milestone on settlement_milestone(milestone_id);
create index if not exists idx_settlement_principle_principle on settlement_principle(principle_id);
create index if not exists idx_settlement_resource_resource on settlement_resource(resource_id);
--------------------------------------------------------------------------------
-- Settlement Phase
--------------------------------------------------------------------------------
create index if not exists idx_settlement_phase_returning_scout on settlement_phase(returning_scout_id);
create index if not exists idx_settlement_phase_returning_survivor_settlement on settlement_phase_returning_survivor(settlement_id);
--------------------------------------------------------------------------------
-- Survivor
--
-- Knowledge / neurosis / philosophy / tenet / weapon-type are all dropdown FKs
-- on the survivor record. Without indexes, deleting a catalog row scans the
-- entire survivor table to validate the FK.
--------------------------------------------------------------------------------
create index if not exists idx_survivor_knowledge_1 on survivor(knowledge_1_id);
create index if not exists idx_survivor_knowledge_2 on survivor(knowledge_2_id);
create index if not exists idx_survivor_neurosis on survivor(neurosis_id);
create index if not exists idx_survivor_philosophy on survivor(philosophy_id);
create index if not exists idx_survivor_tenet_knowledge on survivor(tenet_knowledge_id);
create index if not exists idx_survivor_weapon_type on survivor(weapon_type_id);