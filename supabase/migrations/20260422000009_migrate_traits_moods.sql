--------------------------------------------------------------------------------
-- Migrate Legacy Traits / Moods Arrays
--
-- Previously, each monster row stored trait and mood names as varchar[]
-- arrays on four tables:
--
--   - hunt_monster.traits / hunt_monster.moods
--   - showdown_monster.traits / showdown_monster.moods
--   - quarry_level.traits / quarry_level.moods
--   - nemesis_level.traits / nemesis_level.moods
--
-- These now live in the normalized `trait` / `mood` tables, linked to
-- monsters via the four pairs of junction tables created in migrations
-- 20260422000005..000008.
--
-- Ownership rules for the generated catalog rows:
--
--   - hunt_monster / showdown_monster rows are always settlement-scoped;
--     their strings become *custom* trait/mood rows owned by the settlement
--     owner.
--   - Custom quarry_level / nemesis_level rows (parent.custom = true)
--     become *custom* trait/mood rows owned by the parent's owner.
--   - Catalog quarry_level / nemesis_level rows (parent.custom = false) have
--     no owner; their strings become *non-custom* (catalog) trait/mood rows
--     readable by any authenticated user.
--
-- The legacy varchar[] columns are dropped in the follow-up migration
-- 20260422000010 once all links are in place.
--
-- All inserts are deduplicated so re-running the migration is a no-op.
--------------------------------------------------------------------------------
-- Step 1: Promote strings to catalog `trait` / `mood` rows.
--
-- Catalog (non-custom) rows first, from catalog quarry_level / nemesis_level
-- parents. Each distinct trimmed name becomes exactly one non-custom row.
--------------------------------------------------------------------------------
insert into trait (custom, user_id, trait_name)
select distinct false,
  null::uuid,
  trim(name) as trait_name
from (
    select unnest(ql.traits) as name
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where not q.custom
      and ql.traits is not null
      and array_length(ql.traits, 1) > 0
    union
    select unnest(nl.traits) as name
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where not n.custom
      and nl.traits is not null
      and array_length(nl.traits, 1) > 0
  ) as legacy
where trim(name) <> ''
  and not exists (
    select 1
    from trait t
    where t.custom = false
      and t.trait_name = trim(name)
  );
insert into mood (custom, user_id, mood_name)
select distinct false,
  null::uuid,
  trim(name) as mood_name
from (
    select unnest(ql.moods) as name
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where not q.custom
      and ql.moods is not null
      and array_length(ql.moods, 1) > 0
    union
    select unnest(nl.moods) as name
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where not n.custom
      and nl.moods is not null
      and array_length(nl.moods, 1) > 0
  ) as legacy
where trim(name) <> ''
  and not exists (
    select 1
    from mood m
    where m.custom = false
      and m.mood_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 2: Promote strings to per-user *custom* trait / mood rows for
-- owner-scoped data (hunt_monster, showdown_monster, and custom
-- quarry_level / nemesis_level). Deduplicates per (user_id, name) so each
-- owner gets at most one custom row per unique name.
--------------------------------------------------------------------------------
insert into trait (custom, user_id, trait_name)
select distinct true,
  owner_id,
  trim(name) as trait_name
from (
    select s.user_id as owner_id,
      unnest(hm.traits) as name
    from hunt_monster hm
      join settlement s on s.id = hm.settlement_id
    where hm.traits is not null
      and array_length(hm.traits, 1) > 0
    union
    select s.user_id as owner_id,
      unnest(sm.traits) as name
    from showdown_monster sm
      join settlement s on s.id = sm.settlement_id
    where sm.traits is not null
      and array_length(sm.traits, 1) > 0
    union
    select q.user_id as owner_id,
      unnest(ql.traits) as name
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where q.custom
      and q.user_id is not null
      and ql.traits is not null
      and array_length(ql.traits, 1) > 0
    union
    select n.user_id as owner_id,
      unnest(nl.traits) as name
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where n.custom
      and n.user_id is not null
      and nl.traits is not null
      and array_length(nl.traits, 1) > 0
  ) as legacy
where owner_id is not null
  and trim(name) <> ''
  and not exists (
    select 1
    from trait t
    where t.custom = true
      and t.user_id = owner_id
      and t.trait_name = trim(name)
  );
insert into mood (custom, user_id, mood_name)
select distinct true,
  owner_id,
  trim(name) as mood_name
from (
    select s.user_id as owner_id,
      unnest(hm.moods) as name
    from hunt_monster hm
      join settlement s on s.id = hm.settlement_id
    where hm.moods is not null
      and array_length(hm.moods, 1) > 0
    union
    select s.user_id as owner_id,
      unnest(sm.moods) as name
    from showdown_monster sm
      join settlement s on s.id = sm.settlement_id
    where sm.moods is not null
      and array_length(sm.moods, 1) > 0
    union
    select q.user_id as owner_id,
      unnest(ql.moods) as name
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where q.custom
      and q.user_id is not null
      and ql.moods is not null
      and array_length(ql.moods, 1) > 0
    union
    select n.user_id as owner_id,
      unnest(nl.moods) as name
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where n.custom
      and n.user_id is not null
      and nl.moods is not null
      and array_length(nl.moods, 1) > 0
  ) as legacy
where owner_id is not null
  and trim(name) <> ''
  and not exists (
    select 1
    from mood m
    where m.custom = true
      and m.user_id = owner_id
      and m.mood_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 3: Populate junction tables by joining legacy arrays to the
-- trait/mood rows produced above. `on conflict do nothing` protects against
-- duplicate array entries and repeat runs.
--------------------------------------------------------------------------------
-- Hunt Monster -> Trait (custom rows owned by settlement owner).
insert into hunt_monster_trait (hunt_monster_id, trait_id)
select distinct hm.id,
  t.id
from hunt_monster hm
  join settlement s on s.id = hm.settlement_id
  cross join lateral unnest(hm.traits) as name
  join trait t on t.custom = true
  and t.user_id = s.user_id
  and t.trait_name = trim(name)
where hm.traits is not null
  and array_length(hm.traits, 1) > 0
  and trim(name) <> '' on conflict (hunt_monster_id, trait_id) do nothing;
-- Hunt Monster -> Mood.
insert into hunt_monster_mood (hunt_monster_id, mood_id)
select distinct hm.id,
  m.id
from hunt_monster hm
  join settlement s on s.id = hm.settlement_id
  cross join lateral unnest(hm.moods) as name
  join mood m on m.custom = true
  and m.user_id = s.user_id
  and m.mood_name = trim(name)
where hm.moods is not null
  and array_length(hm.moods, 1) > 0
  and trim(name) <> '' on conflict (hunt_monster_id, mood_id) do nothing;
-- Showdown Monster -> Trait.
insert into showdown_monster_trait (showdown_monster_id, trait_id)
select distinct sm.id,
  t.id
from showdown_monster sm
  join settlement s on s.id = sm.settlement_id
  cross join lateral unnest(sm.traits) as name
  join trait t on t.custom = true
  and t.user_id = s.user_id
  and t.trait_name = trim(name)
where sm.traits is not null
  and array_length(sm.traits, 1) > 0
  and trim(name) <> '' on conflict (showdown_monster_id, trait_id) do nothing;
-- Showdown Monster -> Mood.
insert into showdown_monster_mood (showdown_monster_id, mood_id)
select distinct sm.id,
  m.id
from showdown_monster sm
  join settlement s on s.id = sm.settlement_id
  cross join lateral unnest(sm.moods) as name
  join mood m on m.custom = true
  and m.user_id = s.user_id
  and m.mood_name = trim(name)
where sm.moods is not null
  and array_length(sm.moods, 1) > 0
  and trim(name) <> '' on conflict (showdown_monster_id, mood_id) do nothing;
-- Quarry Level -> Trait. Custom parents resolve against custom rows owned
-- by the parent's owner; catalog parents resolve against catalog rows.
insert into quarry_level_trait (quarry_level_id, trait_id)
select distinct ql.id,
  t.id
from quarry_level ql
  join quarry q on q.id = ql.quarry_id
  cross join lateral unnest(ql.traits) as name
  join trait t on (
    q.custom
    and t.custom = true
    and t.user_id = q.user_id
    and t.trait_name = trim(name)
  )
  or (
    not q.custom
    and t.custom = false
    and t.trait_name = trim(name)
  )
where ql.traits is not null
  and array_length(ql.traits, 1) > 0
  and trim(name) <> '' on conflict (quarry_level_id, trait_id) do nothing;
-- Quarry Level -> Mood.
insert into quarry_level_mood (quarry_level_id, mood_id)
select distinct ql.id,
  m.id
from quarry_level ql
  join quarry q on q.id = ql.quarry_id
  cross join lateral unnest(ql.moods) as name
  join mood m on (
    q.custom
    and m.custom = true
    and m.user_id = q.user_id
    and m.mood_name = trim(name)
  )
  or (
    not q.custom
    and m.custom = false
    and m.mood_name = trim(name)
  )
where ql.moods is not null
  and array_length(ql.moods, 1) > 0
  and trim(name) <> '' on conflict (quarry_level_id, mood_id) do nothing;
-- Nemesis Level -> Trait.
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select distinct nl.id,
  t.id
from nemesis_level nl
  join nemesis n on n.id = nl.nemesis_id
  cross join lateral unnest(nl.traits) as name
  join trait t on (
    n.custom
    and t.custom = true
    and t.user_id = n.user_id
    and t.trait_name = trim(name)
  )
  or (
    not n.custom
    and t.custom = false
    and t.trait_name = trim(name)
  )
where nl.traits is not null
  and array_length(nl.traits, 1) > 0
  and trim(name) <> '' on conflict (nemesis_level_id, trait_id) do nothing;
-- Nemesis Level -> Mood.
insert into nemesis_level_mood (nemesis_level_id, mood_id)
select distinct nl.id,
  m.id
from nemesis_level nl
  join nemesis n on n.id = nl.nemesis_id
  cross join lateral unnest(nl.moods) as name
  join mood m on (
    n.custom
    and m.custom = true
    and m.user_id = n.user_id
    and m.mood_name = trim(name)
  )
  or (
    not n.custom
    and m.custom = false
    and m.mood_name = trim(name)
  )
where nl.moods is not null
  and array_length(nl.moods, 1) > 0
  and trim(name) <> '' on conflict (nemesis_level_id, mood_id) do nothing;