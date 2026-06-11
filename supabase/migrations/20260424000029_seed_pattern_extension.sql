--------------------------------------------------------------------------------
-- Seed Pattern Table
--------------------------------------------------------------------------------
ALTER TABLE seed_pattern
ADD COLUMN IF NOT EXISTS crafting_limit INT CHECK (crafting_limit >= 0),
  ADD COLUMN IF NOT EXISTS crafting_steps TEXT,
  ADD COLUMN IF NOT EXISTS endeavor_cost INT CHECK (endeavor_cost >= 0),
  ADD COLUMN IF NOT EXISTS era INT CHECK (
    era >= 1
    AND era <= 4
  ),
  ADD COLUMN IF NOT EXISTS keywords VARCHAR [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements TEXT,
  ADD COLUMN IF NOT EXISTS crafted_gear_id UUID REFERENCES gear(id),
  ADD COLUMN IF NOT EXISTS number INT;