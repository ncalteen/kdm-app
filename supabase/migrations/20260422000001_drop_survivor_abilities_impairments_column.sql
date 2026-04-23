--------------------------------------------------------------------------------
-- Drop Legacy Survivor Abilities/Impairments Column
--
-- The `survivor.abilities_impairments` string array is now fully superseded
-- by the `survivor_ability_impairment` junction table. Existing data was
-- migrated to the junction by 20260422000000; this migration retires the
-- original column.
--------------------------------------------------------------------------------
alter table survivor drop column abilities_impairments;