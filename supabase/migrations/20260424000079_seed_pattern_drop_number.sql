-- Seed Pattern: drop legacy `number` column.
--
-- The `number` column on the `seed_pattern` table was previously used as a
-- display-only ordering value, but it is no longer surfaced or required by
-- the application. Drop it to simplify the schema.
alter table public.seed_pattern drop column if exists number;