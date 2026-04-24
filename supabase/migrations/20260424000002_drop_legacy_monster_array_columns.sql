--------------------------------------------------------------------------------
-- Drop Legacy Monster Array Columns
--
-- The `traits`, `moods`, and `survivor_statuses` varchar[] columns on the
-- monster and monster-level tables are now fully superseded by their
-- respective junction tables:
--
--   - hunt_monster.traits            -> hunt_monster_trait
--   - hunt_monster.moods             -> hunt_monster_mood
--   - showdown_monster.traits        -> showdown_monster_trait
--   - showdown_monster.moods         -> showdown_monster_mood
--   - quarry_level.traits            -> quarry_level_trait
--   - quarry_level.moods             -> quarry_level_mood
--   - quarry_level.survivor_statuses -> quarry_level_survivor_status
--   - nemesis_level.traits           -> nemesis_level_trait
--   - nemesis_level.moods            -> nemesis_level_mood
--   - nemesis_level.survivor_statuses -> nemesis_level_survivor_status
--
-- Existing data was migrated by 20260422000009 (traits/moods) and
-- 20260424000001 (survivor_statuses). This migration retires the original
-- columns.
--------------------------------------------------------------------------------
alter table hunt_monster drop column traits;
alter table hunt_monster drop column moods;
alter table showdown_monster drop column traits;
alter table showdown_monster drop column moods;
alter table quarry_level drop column traits;
alter table quarry_level drop column moods;
alter table quarry_level drop column survivor_statuses;
alter table nemesis_level drop column traits;
alter table nemesis_level drop column moods;
alter table nemesis_level drop column survivor_statuses;