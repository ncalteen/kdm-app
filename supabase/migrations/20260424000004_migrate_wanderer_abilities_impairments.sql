--------------------------------------------------------------------------------
-- Migrate Legacy Wanderer Abilities/Impairments
--
-- Previously, wanderer abilities and impairments were stored as an array of
-- strings in wanderer.abilities_impairments. They now live in the shared
-- `ability_impairment` catalog joined to wanderers via the new
-- `wanderer_ability_impairment` junction table.
--
-- This migration:
--   1. For custom wanderers, promotes every legacy string into a custom
--      ability_impairment row owned by the same user (deduplicated per
--      (user_id, name)).
--   2. For non-custom (built-in) wanderers, promotes every legacy string
--      into a non-custom ability_impairment row (deduplicated per name),
--      so the global catalog picks up anything that was hard-coded into
--      seeded wanderer data.
--   3. Links each wanderer to its matching ability_impairment via the
--      junction table.
--
-- The legacy `wanderer.abilities_impairments` column is intentionally left
-- in place; a separate migration drops it once all readers have been
-- updated.
--------------------------------------------------------------------------------
-- Step 1: Custom wanderers → custom ability_impairment rows per owner.
--------------------------------------------------------------------------------
insert into ability_impairment (user_id, custom, ability_impairment_name)
select distinct w.user_id,
  true,
  trim(name) as ability_impairment_name
from wanderer w
  cross join lateral unnest(w.abilities_impairments) as name
where w.custom
  and w.user_id is not null
  and w.abilities_impairments is not null
  and array_length(w.abilities_impairments, 1) > 0
  and trim(name) <> ''
  and not exists (
    select 1
    from ability_impairment ai
    where ai.user_id = w.user_id
      and ai.custom = true
      and ai.ability_impairment_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 2: Non-custom wanderers → non-custom ability_impairment rows.
--------------------------------------------------------------------------------
insert into ability_impairment (user_id, custom, ability_impairment_name)
select distinct null::uuid,
  false,
  trim(name) as ability_impairment_name
from wanderer w
  cross join lateral unnest(w.abilities_impairments) as name
where not w.custom
  and w.abilities_impairments is not null
  and array_length(w.abilities_impairments, 1) > 0
  and trim(name) <> ''
  and not exists (
    select 1
    from ability_impairment ai
    where ai.custom = false
      and ai.ability_impairment_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 3: Link each wanderer to its abilities/impairments via the junction
-- table. `on conflict do nothing` protects against the unique
-- (wanderer_id, ability_impairment_id) constraint if the migration is
-- re-run or a wanderer had duplicate entries in the legacy array.
--------------------------------------------------------------------------------
-- Custom wanderers.
insert into wanderer_ability_impairment (wanderer_id, ability_impairment_id)
select distinct w.id,
  ai.id
from wanderer w
  cross join lateral unnest(w.abilities_impairments) as name
  join ability_impairment ai on ai.user_id = w.user_id
  and ai.custom = true
  and ai.ability_impairment_name = trim(name)
where w.custom
  and w.abilities_impairments is not null
  and array_length(w.abilities_impairments, 1) > 0
  and trim(name) <> '' on conflict (wanderer_id, ability_impairment_id) do nothing;
-- Non-custom wanderers.
insert into wanderer_ability_impairment (wanderer_id, ability_impairment_id)
select distinct w.id,
  ai.id
from wanderer w
  cross join lateral unnest(w.abilities_impairments) as name
  join ability_impairment ai on ai.custom = false
  and ai.ability_impairment_name = trim(name)
where not w.custom
  and w.abilities_impairments is not null
  and array_length(w.abilities_impairments, 1) > 0
  and trim(name) <> '' on conflict (wanderer_id, ability_impairment_id) do nothing;