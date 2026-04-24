--------------------------------------------------------------------------------
-- Migrate Legacy Survivor Statuses Arrays
--
-- Previously, each monster level row stored survivor status names as a
-- varchar[] array on two tables:
--
--   - quarry_level.survivor_statuses
--   - nemesis_level.survivor_statuses
--
-- These now live in the normalized `survivor_status` table, linked to
-- monster levels via the two junction tables created in migration
-- 20260424000000.
--
-- Ownership rules for the generated catalog rows:
--
--   - Custom quarry_level / nemesis_level rows (parent.custom = true)
--     become *custom* survivor_status rows owned by the parent's owner.
--   - Catalog quarry_level / nemesis_level rows (parent.custom = false)
--     have no owner; their strings become *non-custom* (catalog)
--     survivor_status rows readable by any authenticated user.
--
-- The legacy varchar[] columns are dropped in the follow-up migration
-- 20260424000002 once all links are in place.
--
-- All inserts are deduplicated so re-running the migration is a no-op.
--------------------------------------------------------------------------------
-- Step 1: Promote strings to catalog `survivor_status` rows.
--
-- Catalog (non-custom) rows first, from catalog quarry_level / nemesis_level
-- parents. Each distinct trimmed name becomes exactly one non-custom row.
--------------------------------------------------------------------------------
insert into survivor_status (custom, user_id, survivor_status_name)
select distinct false,
  null::uuid,
  trim(name) as survivor_status_name
from (
    select unnest(ql.survivor_statuses) as name
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where not q.custom
      and ql.survivor_statuses is not null
      and array_length(ql.survivor_statuses, 1) > 0
    union
    select unnest(nl.survivor_statuses) as name
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where not n.custom
      and nl.survivor_statuses is not null
      and array_length(nl.survivor_statuses, 1) > 0
  ) as legacy
where trim(name) <> ''
  and not exists (
    select 1
    from survivor_status s
    where s.custom = false
      and s.survivor_status_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 2: Promote strings to per-user *custom* survivor_status rows for
-- owner-scoped data (custom quarry_level / nemesis_level). Deduplicates per
-- (user_id, name) so each owner gets at most one custom row per unique name.
--------------------------------------------------------------------------------
insert into survivor_status (custom, user_id, survivor_status_name)
select distinct true,
  owner_id,
  trim(name) as survivor_status_name
from (
    select q.user_id as owner_id,
      unnest(ql.survivor_statuses) as name
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where q.custom
      and q.user_id is not null
      and ql.survivor_statuses is not null
      and array_length(ql.survivor_statuses, 1) > 0
    union
    select n.user_id as owner_id,
      unnest(nl.survivor_statuses) as name
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where n.custom
      and n.user_id is not null
      and nl.survivor_statuses is not null
      and array_length(nl.survivor_statuses, 1) > 0
  ) as legacy
where owner_id is not null
  and trim(name) <> ''
  and not exists (
    select 1
    from survivor_status s
    where s.custom = true
      and s.user_id = owner_id
      and s.survivor_status_name = trim(name)
  );
--------------------------------------------------------------------------------
-- Step 3: Populate junction tables by joining legacy arrays to the
-- survivor_status rows produced above. `on conflict do nothing` protects
-- against duplicate array entries and repeat runs.
--------------------------------------------------------------------------------
-- Quarry Level -> Survivor Status. Custom parents resolve against custom
-- rows owned by the parent's owner; catalog parents resolve against catalog
-- rows.
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select distinct ql.id,
  s.id
from quarry_level ql
  join quarry q on q.id = ql.quarry_id
  cross join lateral unnest(ql.survivor_statuses) as name
  join survivor_status s on (
    q.custom
    and s.custom = true
    and s.user_id = q.user_id
    and s.survivor_status_name = trim(name)
  )
  or (
    not q.custom
    and s.custom = false
    and s.survivor_status_name = trim(name)
  )
where ql.survivor_statuses is not null
  and array_length(ql.survivor_statuses, 1) > 0
  and trim(name) <> '' on conflict (quarry_level_id, survivor_status_id) do nothing;
-- Nemesis Level -> Survivor Status.
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select distinct nl.id,
  s.id
from nemesis_level nl
  join nemesis n on n.id = nl.nemesis_id
  cross join lateral unnest(nl.survivor_statuses) as name
  join survivor_status s on (
    n.custom
    and s.custom = true
    and s.user_id = n.user_id
    and s.survivor_status_name = trim(name)
  )
  or (
    not n.custom
    and s.custom = false
    and s.survivor_status_name = trim(name)
  )
where nl.survivor_statuses is not null
  and array_length(nl.survivor_statuses, 1) > 0
  and trim(name) <> '' on conflict (nemesis_level_id, survivor_status_id) do nothing;