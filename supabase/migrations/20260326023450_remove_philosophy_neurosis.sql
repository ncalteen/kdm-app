--------------------------------------------------------------------------------
-- Remove neurosis_id from philosophy table
--------------------------------------------------------------------------------
ALTER TABLE philosophy DROP COLUMN IF EXISTS neurosis_id;