--------------------------------------------------------------------------------
-- Move Philosophy <-> Neurosis Relationship
--
-- Previously a neurosis pointed at a philosophy via `neurosis.philosophy_id`.
-- That made it possible to end up with multiple neuroses per philosophy and
-- required reverse lookups on every read. The relationship is inherently
-- one-to-one (a philosophy can have zero or one neurosis, and a neurosis has
-- exactly one philosophy), so flip the ownership: store the neurosis
-- reference on the philosophy row instead.
--
-- Steps:
--   1. Add `philosophy.neurosis_id` (nullable, on delete set null).
--   2. Backfill each philosophy with the matching neurosis (if any). When
--      multiple neuroses somehow point at the same philosophy, we pick the
--      oldest row; custom user data may contain duplicates we don't want to
--      silently delete.
--   3. Drop the obsolete index and column on `neurosis`.
--   4. Index the new FK column on `philosophy`.
--
-- This replaces the short-lived `20260326023450_remove_philosophy_neurosis.sql`
-- revert; the column is back for good now that the seeds and DAL treat
-- philosophy as the owner of the relationship.
--------------------------------------------------------------------------------
-- 1. Re-introduce philosophy.neurosis_id.
alter table philosophy
add column if not exists neurosis_id uuid references neurosis(id) on delete
set null;
-- 2. Backfill. For any philosophy without a neurosis yet, adopt the oldest
--    neurosis that still carries a philosophy_id pointing at it.
update philosophy p
set neurosis_id = n.id
from (
    select distinct on (philosophy_id) id,
      philosophy_id
    from neurosis
    where philosophy_id is not null
    order by philosophy_id,
      created_at asc,
      id asc
  ) n
where n.philosophy_id = p.id
  and p.neurosis_id is null;
-- 3. Drop the legacy index + column on neurosis.
drop index if exists idx_neurosis_philosophy;
alter table neurosis drop column if exists philosophy_id;
-- 4. Index the new FK for reverse lookups (neurosis -> philosophy).
create index if not exists idx_philosophy_neurosis on philosophy(neurosis_id);