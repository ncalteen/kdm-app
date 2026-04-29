--------------------------------------------------------------------------------
-- Survivor Parents
-- Adds two optional parent references to the survivor table so a survivor can
-- record up to two parents (e.g. for lineage tracking). Both parents must
-- belong to the same settlement as the child survivor and a survivor cannot be
-- their own parent. Deleting a parent survivor leaves the child in place but
-- clears the corresponding reference.
--------------------------------------------------------------------------------
alter table survivor
add column if not exists parent_1_id uuid references survivor(id) on delete
set null,
  add column if not exists parent_2_id uuid references survivor(id) on delete
set null;
--------------------------------------------------------------------------------
-- Prevent a survivor from being their own parent and prevent the same
-- survivor from being recorded as both parents. The Zod schema rejects
-- duplicate parent ids on the application side; this CHECK guarantees the
-- same invariant for any direct database update path.
--------------------------------------------------------------------------------
alter table survivor drop constraint if exists survivor_parent_not_self;
alter table survivor
add constraint survivor_parent_not_self check (
    (
      parent_1_id is null
      or parent_1_id <> id
    )
    and (
      parent_2_id is null
      or parent_2_id <> id
    )
    and (
      parent_1_id is null
      or parent_2_id is null
      or parent_1_id <> parent_2_id
    )
  );
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index if not exists idx_survivor_parent_1 on survivor(parent_1_id);
create index if not exists idx_survivor_parent_2 on survivor(parent_2_id);
--------------------------------------------------------------------------------
-- Trigger: validate_survivor_parents
--
-- CHECK constraints cannot reference other tables, so a row-level trigger
-- enforces that any referenced parent survivor belongs to the same
-- settlement as the child being inserted/updated.
--------------------------------------------------------------------------------
create or replace function validate_survivor_parents() returns trigger language plpgsql
set search_path = '' security definer as $$
declare v_parent_settlement_id uuid;
begin if new.parent_1_id is not null then
select settlement_id into v_parent_settlement_id
from public.survivor
where id = new.parent_1_id;
if v_parent_settlement_id is null then raise exception 'Parent Survivor % Not Found',
new.parent_1_id;
end if;
if v_parent_settlement_id <> new.settlement_id then raise exception 'Parent Survivor % Not in Settlement %',
new.parent_1_id,
new.settlement_id;
end if;
end if;
if new.parent_2_id is not null then
select settlement_id into v_parent_settlement_id
from public.survivor
where id = new.parent_2_id;
if v_parent_settlement_id is null then raise exception 'Parent Survivor % Not Found',
new.parent_2_id;
end if;
if v_parent_settlement_id <> new.settlement_id then raise exception 'Parent Survivor % Not in Settlement %',
new.parent_2_id,
new.settlement_id;
end if;
end if;
return new;
end;
$$;
drop trigger if exists validate_survivor_parents on survivor;
create trigger validate_survivor_parents before
insert
  or
update of parent_1_id,
  parent_2_id,
  settlement_id on survivor for each row execute function validate_survivor_parents();