--------------------------------------------------------------------------------
-- Gear Grid → Selected Armor Set
--
-- A survivor's loadout can simultaneously qualify for more than one armor set
-- (for example, when overlapping required gear across two sets is satisfied by
-- the equipped pieces). The armor set bonuses themselves are still mutually
-- exclusive at the table — the player picks which bonus is active.
--
-- This migration adds `selected_armor_set_id` to `gear_grid` so that choice
-- persists alongside the loadout. The column is nullable: a null value means
-- "no explicit selection" and the application is free to pick a sensible
-- default (e.g. the only qualifying set, or the first alphabetically) when
-- displaying or evaluating bonuses.
--
-- A trigger keeps the column honest: if the equipped pieces no longer qualify
-- for the selected set (because the user emptied a required slot or because the
-- cascade-on-storage-delete trigger nulled cells), the column is automatically
-- reset to null on the same write.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Add selected_armor_set_id column
--------------------------------------------------------------------------------
alter table gear_grid
add column selected_armor_set_id uuid references armor_set(id) on delete
set null;
create index idx_gear_grid_selected_armor_set on gear_grid(selected_armor_set_id);
--------------------------------------------------------------------------------
-- Trigger: clear_selected_armor_set_if_unqualified
--
-- Runs BEFORE INSERT/UPDATE on gear_grid, after the user has supplied a new set
-- of grid positions and (optionally) a selected armor set. When the supplied
-- selection no longer qualifies under `armor_set_qualifies(uuid, uuid[])`, the
-- selection is cleared so the row never persists an inconsistent state.
--
-- The new positions are passed directly into `armor_set_qualifies` rather than
-- the wrapper `survivor_qualifies_for_armor_set` because the latter reads from
-- the (still-old) gear_grid row and would not see the incoming changes during a
-- BEFORE trigger.
--------------------------------------------------------------------------------
create or replace function clear_selected_armor_set_if_unqualified() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if new.selected_armor_set_id is not null
  and not public.armor_set_qualifies(
    new.selected_armor_set_id,
    array [
      new.pos_top_left, new.pos_top_center, new.pos_top_right,
      new.pos_mid_left, new.pos_mid_center, new.pos_mid_right,
      new.pos_bottom_left, new.pos_bottom_center, new.pos_bottom_right
    ]::uuid []
  ) then new.selected_armor_set_id := null;
end if;
return new;
end;
$$;
create trigger clear_selected_armor_set_if_unqualified before
insert
  or
update on gear_grid for each row execute function clear_selected_armor_set_if_unqualified();