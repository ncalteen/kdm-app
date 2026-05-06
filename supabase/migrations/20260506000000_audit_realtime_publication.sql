--------------------------------------------------------------------------------
-- Audit `supabase_realtime` Publication
--
-- Earlier migrations (20260413223402, 20260422000005, 20260422000006,
-- 20260424000006) introduced settlement-scoped junction tables AFTER the
-- bulk realtime enablement in 20260327000000_enable_realtime_gameplay_tables.
-- Without inclusion in the `supabase_realtime` publication, collaborators
-- subscribed to a settlement do not receive INSERT / UPDATE / DELETE events
-- for these tables, leading to stale UI until a manual reload.
--
-- Tables added here are settlement-scoped (each row reaches `settlement.id`
-- via a foreign-key chain through `hunt_monster`, `showdown_monster`, or
-- `survivor`). Catalog tables (`survivor_status`, `armor_set`, `armor_set_*`,
-- `wanderer_*`, etc.) are intentionally excluded — they are tracked under
-- E2.4 and require a different subscription model (§8.2.2 of the sharing
-- architecture document).
--
-- `settlement_shared_user` is also excluded — it is added under E1.4 alongside
-- the user-level subscription that powers "shared with me" updates.
--
-- Each `alter publication ... add table` is wrapped in a `do $$ ... $$` block
-- that checks `pg_publication_tables` first so the migration is idempotent;
-- replaying it (or running it against an environment where a table was
-- previously added piecemeal) is a no-op for the already-present tables.
--------------------------------------------------------------------------------
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'hunt_monster_mood'
) then alter publication supabase_realtime
add table hunt_monster_mood;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'hunt_monster_survivor_status'
) then alter publication supabase_realtime
add table hunt_monster_survivor_status;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'hunt_monster_trait'
) then alter publication supabase_realtime
add table hunt_monster_trait;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'showdown_monster_mood'
) then alter publication supabase_realtime
add table showdown_monster_mood;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'showdown_monster_survivor_status'
) then alter publication supabase_realtime
add table showdown_monster_survivor_status;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'showdown_monster_trait'
) then alter publication supabase_realtime
add table showdown_monster_trait;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and tablename = 'survivor_ability_impairment'
) then alter publication supabase_realtime
add table survivor_ability_impairment;
end if;
end $$;
--------------------------------------------------------------------------------
-- Helper: realtime_publication_tables()
--
-- SECURITY DEFINER function returning the names of tables in the
-- `supabase_realtime` publication. `pg_publication_tables` is in `pg_catalog`
-- and is not exposed via PostgREST, so without this helper the integration
-- suite (and any other tooling that wants to verify publication state) would
-- need a direct Postgres connection. Returning only table names is safe — it
-- exposes nothing that an authenticated client couldn't already infer by
-- attempting a subscription.
--------------------------------------------------------------------------------
create or replace function realtime_publication_tables() returns table (tablename name) language sql security definer
set search_path = public stable as $$
select tablename
from pg_publication_tables
where pubname = 'supabase_realtime';
$$;
revoke all on function public.realtime_publication_tables()
from public;
grant execute on function public.realtime_publication_tables() to authenticated;