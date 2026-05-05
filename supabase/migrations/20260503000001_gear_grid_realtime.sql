--------------------------------------------------------------------------------
-- Gear Grid Realtime
-- Adds the `gear_grid` table to the `supabase_realtime` publication so shared
-- settlement collaborators receive grid changes via the existing realtime
-- subscription channel used by other survivor-owned tables.
--------------------------------------------------------------------------------
alter publication supabase_realtime
add table gear_grid;
