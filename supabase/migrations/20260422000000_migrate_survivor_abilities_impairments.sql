--------------------------------------------------------------------------------
-- Migrate Legacy Survivor Abilities/Impairments
--
-- Previously, survivor abilities and impairments were stored as an array of
-- strings in survivor.abilities_impairments. They now live in a dedicated
-- `ability_impairment` table, joined to survivors via the
-- `survivor_ability_impairment` junction table.
--
-- This migration:
--   1. Promotes every legacy string value into a custom ability_impairment
--      row owned by the user who owns the survivor's settlement.
--   2. Deduplicates by (user_id, ability_impairment_name) so each user gets
--      at most one custom row per unique name, regardless of how many of
--      their survivors referenced it.
--   3. Links each survivor to the matching ability_impairment via the
--      junction table.
--
-- The legacy `survivor.abilities_impairments` column is intentionally left
-- in place; a separate migration can drop it once all readers have been
-- updated.
--------------------------------------------------------------------------------
-- Step 1: Create custom ability_impairment rows for every (owner, name) pair
-- that doesn't already have one. `distinct` handles duplicates across
-- survivors owned by the same user.
--------------------------------------------------------------------------------
insert into ability_impairment (user_id, custom, ability_impairment_name)
select distinct s.user_id,
  true,
  trim(name) as ability_impairment_name
from survivor sv
  join settlement s on s.id = sv.settlement_id
  cross join lateral unnest(sv.abilities_impairments) as name
where sv.abilities_impairments is not null
  and array_length(sv.abilities_impairments, 1) > 0
  and trim(name) <> ''
  and not exists (
    select 1
    from ability_impairment ai
    where ai.user_id = s.user_id
      and ai.custom = true
      and ai.ability_impairment_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 2: Link each survivor to its abilities/impairments via the junction
-- table. `on conflict do nothing` protects against the unique
-- (survivor_id, ability_impairment_id) constraint if the migration is
-- re-run or a survivor had duplicate entries in the legacy array.
--------------------------------------------------------------------------------
insert into survivor_ability_impairment (survivor_id, ability_impairment_id)
select distinct sv.id,
  ai.id
from survivor sv
  join settlement s on s.id = sv.settlement_id
  cross join lateral unnest(sv.abilities_impairments) as name
  join ability_impairment ai on ai.user_id = s.user_id
  and ai.custom = true
  and ai.ability_impairment_name = trim(name)
where sv.abilities_impairments is not null
  and array_length(sv.abilities_impairments, 1) > 0
  and trim(name) <> '' on conflict (survivor_id, ability_impairment_id) do nothing;