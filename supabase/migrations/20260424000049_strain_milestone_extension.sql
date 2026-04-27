--------------------------------------------------------------------------------
-- Strain Milestone Table
--------------------------------------------------------------------------------
ALTER TABLE strain_milestone
ADD COLUMN milestone_condition TEXT,
  ADD COLUMN permanent_effect TEXT;