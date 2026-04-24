--------------------------------------------------------------------------------
-- Drop Legacy Wanderer Abilities/Impairments Column
--
-- The `wanderer.abilities_impairments` string array is now fully superseded
-- by the `wanderer_ability_impairment` junction table. Existing data was
-- migrated to the junction by 20260424000004; this migration retires the
-- original column.
--------------------------------------------------------------------------------
alter table wanderer drop column abilities_impairments;