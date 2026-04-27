--------------------------------------------------------------------------------
-- Seed Pattern Table
--------------------------------------------------------------------------------
ALTER TABLE seed_pattern
ADD COLUMN crafting_limit INT CHECK (crafting_limit >= 0),
  ADD COLUMN crafting_steps TEXT,
  ADD COLUMN endeavor_cost INT CHECK (endeavor_cost >= 0),
  ADD COLUMN era INT CHECK (
    era >= 1
    AND era <= 4
  ),
  ADD COLUMN keywords VARCHAR [] DEFAULT '{}',
  ADD COLUMN requirements TEXT,
  ADD COLUMN crafted_gear_id UUID REFERENCES gear(id),
  ADD COLUMN number INT;