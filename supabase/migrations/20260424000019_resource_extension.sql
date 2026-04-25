--------------------------------------------------------------------------------
-- Resource Table
--------------------------------------------------------------------------------
ALTER TABLE resource -- some resources can unlock a pattern when obtained
ADD COLUMN pattern_id UUID references pattern(id) on delete
set null,
  ADD COLUMN rules TEXT;