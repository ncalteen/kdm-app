--------------------------------------------------------------------------------
-- Scope Gameplay Junction Realtime By Settlement
--
-- Realtime can only filter on columns present on the changed table. These
-- junctions previously carried only their parent FK, so the hook subscribed
-- without a settlement filter and relied on RLS delivery. Add denormalized
-- `settlement_id`, keep it synchronized with the parent row, and simplify RLS
-- to direct settlement membership checks.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- 1. Add and backfill settlement_id on every affected junction.
--------------------------------------------------------------------------------
do $$
declare spec record;
mismatch_count integer;
begin for spec in
select *
from (
    values (
        'survivor_ability_impairment',
        'survivor',
        'survivor_id'
      ),
      (
        'survivor_cursed_gear',
        'survivor',
        'survivor_id'
      ),
      ('survivor_disorder', 'survivor', 'survivor_id'),
      (
        'survivor_fighting_art',
        'survivor',
        'survivor_id'
      ),
      (
        'survivor_secret_fighting_art',
        'survivor',
        'survivor_id'
      ),
      ('gear_grid', 'survivor', 'survivor_id'),
      (
        'hunt_monster_mood',
        'hunt_monster',
        'hunt_monster_id'
      ),
      (
        'hunt_monster_survivor_status',
        'hunt_monster',
        'hunt_monster_id'
      ),
      (
        'hunt_monster_trait',
        'hunt_monster',
        'hunt_monster_id'
      ),
      (
        'showdown_monster_mood',
        'showdown_monster',
        'showdown_monster_id'
      ),
      (
        'showdown_monster_survivor_status',
        'showdown_monster',
        'showdown_monster_id'
      ),
      (
        'showdown_monster_trait',
        'showdown_monster',
        'showdown_monster_id'
      )
  ) as t (child_table, parent_table, parent_fk) loop execute format(
    'alter table public.%I add column if not exists settlement_id uuid',
    spec.child_table
  );
execute format(
  $sql$
  update public.%1$I child
  set settlement_id = parent.settlement_id
  from public.%2$I parent
  where parent.id = child.%3$I
    and child.settlement_id is distinct
  from parent.settlement_id $sql$,
    spec.child_table,
    spec.parent_table,
    spec.parent_fk
);
execute format(
  $sql$
  select count(*)
  from public.%1$I child
    join public.%2$I parent on parent.id = child.%3$I
  where child.settlement_id is distinct
  from parent.settlement_id $sql$,
    spec.child_table,
    spec.parent_table,
    spec.parent_fk
) into mismatch_count;
if mismatch_count > 0 then raise exception 'settlement_id backfill mismatch on %: % row(s)',
spec.child_table,
mismatch_count;
end if;
execute format(
  'alter table public.%I alter column settlement_id set not null',
  spec.child_table
);
-- The trigger overwrites this sentinel before constraints/RLS checks run.
-- Keeping a default makes generated Insert types optional for callers that
-- still rely on schema-side derivation from the parent FK.
execute format(
  'alter table public.%I alter column settlement_id set default %L::uuid',
  spec.child_table,
  '00000000-0000-0000-0000-000000000000'
);
if not exists (
  select 1
  from pg_constraint
  where conrelid = format('public.%I', spec.child_table)::regclass
    and conname = format('%s_settlement_id_fkey', spec.child_table)
) then execute format(
  'alter table public.%I add constraint %I foreign key (settlement_id) references public.settlement(id) on delete cascade',
  spec.child_table,
  format('%s_settlement_id_fkey', spec.child_table)
);
end if;
execute format(
  'create index if not exists %I on public.%I(settlement_id)',
  format('idx_%s_settlement', spec.child_table),
  spec.child_table
);
execute format(
  'comment on column public.%I.settlement_id is %L',
  spec.child_table,
  format(
    'Denormalized settlement scope derived from %s.settlement_id for realtime filtering and direct RLS checks.',
    spec.parent_table
  )
);
end loop;
end $$;
--------------------------------------------------------------------------------
-- 2. Child-side triggers derive settlement_id from the parent FK on insert and
--    on any update that tries to move the row or settlement scope.
--------------------------------------------------------------------------------
create or replace function public.set_survivor_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$
declare parent_settlement_id uuid;
begin
select sv.settlement_id into parent_settlement_id
from public.survivor sv
where sv.id = new.survivor_id;
if parent_settlement_id is null then raise exception 'Survivor % does not exist',
new.survivor_id using errcode = '23503';
end if;
new.settlement_id := parent_settlement_id;
return new;
end;
$$;
create or replace function public.set_hunt_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$
declare parent_settlement_id uuid;
begin
select hm.settlement_id into parent_settlement_id
from public.hunt_monster hm
where hm.id = new.hunt_monster_id;
if parent_settlement_id is null then raise exception 'Hunt monster % does not exist',
new.hunt_monster_id using errcode = '23503';
end if;
new.settlement_id := parent_settlement_id;
return new;
end;
$$;
create or replace function public.set_showdown_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$
declare parent_settlement_id uuid;
begin
select sm.settlement_id into parent_settlement_id
from public.showdown_monster sm
where sm.id = new.showdown_monster_id;
if parent_settlement_id is null then raise exception 'Showdown monster % does not exist',
new.showdown_monster_id using errcode = '23503';
end if;
new.settlement_id := parent_settlement_id;
return new;
end;
$$;
revoke all on function public.set_survivor_child_settlement_id()
from public;
revoke all on function public.set_hunt_monster_child_settlement_id()
from public;
revoke all on function public.set_showdown_monster_child_settlement_id()
from public;
do $$
declare child_table text;
begin foreach child_table in array array [
    'survivor_ability_impairment',
    'survivor_cursed_gear',
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_secret_fighting_art',
    'gear_grid'
  ] loop execute format(
  'drop trigger if exists set_settlement_id on public.%I',
  child_table
);
execute format(
  'create trigger set_settlement_id before insert or update of survivor_id, settlement_id on public.%I for each row execute function public.set_survivor_child_settlement_id()',
  child_table
);
end loop;
foreach child_table in array array [
    'hunt_monster_mood',
    'hunt_monster_survivor_status',
    'hunt_monster_trait'
  ] loop execute format(
  'drop trigger if exists set_settlement_id on public.%I',
  child_table
);
execute format(
  'create trigger set_settlement_id before insert or update of hunt_monster_id, settlement_id on public.%I for each row execute function public.set_hunt_monster_child_settlement_id()',
  child_table
);
end loop;
foreach child_table in array array [
    'showdown_monster_mood',
    'showdown_monster_survivor_status',
    'showdown_monster_trait'
  ] loop execute format(
  'drop trigger if exists set_settlement_id on public.%I',
  child_table
);
execute format(
  'create trigger set_settlement_id before insert or update of showdown_monster_id, settlement_id on public.%I for each row execute function public.set_showdown_monster_child_settlement_id()',
  child_table
);
end loop;
end $$;
--------------------------------------------------------------------------------
-- 3. Parent-side triggers keep denormalized rows synchronized if a parent row
--    is moved to another settlement.
--------------------------------------------------------------------------------
create or replace function public.propagate_survivor_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$ begin
update public.survivor_ability_impairment
set settlement_id = new.settlement_id
where survivor_id = new.id;
update public.survivor_cursed_gear
set settlement_id = new.settlement_id
where survivor_id = new.id;
update public.survivor_disorder
set settlement_id = new.settlement_id
where survivor_id = new.id;
update public.survivor_fighting_art
set settlement_id = new.settlement_id
where survivor_id = new.id;
update public.survivor_secret_fighting_art
set settlement_id = new.settlement_id
where survivor_id = new.id;
update public.gear_grid
set settlement_id = new.settlement_id
where survivor_id = new.id;
return new;
end;
$$;
create or replace function public.propagate_hunt_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$ begin
update public.hunt_monster_mood
set settlement_id = new.settlement_id
where hunt_monster_id = new.id;
update public.hunt_monster_survivor_status
set settlement_id = new.settlement_id
where hunt_monster_id = new.id;
update public.hunt_monster_trait
set settlement_id = new.settlement_id
where hunt_monster_id = new.id;
return new;
end;
$$;
create or replace function public.propagate_showdown_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$ begin
update public.showdown_monster_mood
set settlement_id = new.settlement_id
where showdown_monster_id = new.id;
update public.showdown_monster_survivor_status
set settlement_id = new.settlement_id
where showdown_monster_id = new.id;
update public.showdown_monster_trait
set settlement_id = new.settlement_id
where showdown_monster_id = new.id;
return new;
end;
$$;
revoke all on function public.propagate_survivor_child_settlement_id()
from public;
revoke all on function public.propagate_hunt_monster_child_settlement_id()
from public;
revoke all on function public.propagate_showdown_monster_child_settlement_id()
from public;
drop trigger if exists propagate_child_settlement_id on public.survivor;
create trigger propagate_child_settlement_id
after
update of settlement_id on public.survivor for each row
  when (
    old.settlement_id is distinct
    from new.settlement_id
  ) execute function public.propagate_survivor_child_settlement_id();
drop trigger if exists propagate_child_settlement_id on public.hunt_monster;
create trigger propagate_child_settlement_id
after
update of settlement_id on public.hunt_monster for each row
  when (
    old.settlement_id is distinct
    from new.settlement_id
  ) execute function public.propagate_hunt_monster_child_settlement_id();
drop trigger if exists propagate_child_settlement_id on public.showdown_monster;
create trigger propagate_child_settlement_id
after
update of settlement_id on public.showdown_monster for each row
  when (
    old.settlement_id is distinct
    from new.settlement_id
  ) execute function public.propagate_showdown_monster_child_settlement_id();
--------------------------------------------------------------------------------
-- 4. RLS now uses the denormalized settlement_id directly.
--------------------------------------------------------------------------------
do $$
declare child_table text;
begin foreach child_table in array array [
    'survivor_ability_impairment',
    'survivor_cursed_gear',
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_secret_fighting_art',
    'gear_grid',
    'hunt_monster_mood',
    'hunt_monster_survivor_status',
    'hunt_monster_trait',
    'showdown_monster_mood',
    'showdown_monster_survivor_status',
    'showdown_monster_trait'
  ] loop execute format(
  'drop policy if exists "Allow select for owner" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow select for shared" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow insert for owner" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow update for owner" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow delete for owner" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow select for member" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow insert for member" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow update for member" on public.%I',
  child_table
);
execute format(
  'drop policy if exists "Allow delete for member" on public.%I',
  child_table
);
execute format(
  $sql$create policy "Allow select for member" on public.%1$I for
  select to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $sql$,
    child_table
);
execute format(
  $sql$create policy "Allow insert for member" on public.%1$I for
  insert to authenticated with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $sql$,
    child_table
);
execute format(
  $sql$create policy "Allow update for member" on public.%1$I for
  update to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $sql$,
    child_table
);
execute format(
  $sql$create policy "Allow delete for member" on public.%1$I for delete to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) $sql$,
  child_table
);
end loop;
end $$;