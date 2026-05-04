--------------------------------------------------------------------------------
-- Cascade settlement_gear deletes into gear_grid slots
--
-- Removing a gear row from settlement_gear means the settlement no longer
-- carries that piece in storage. Survivor gear_grid slots that still reference
-- the removed gear become invalid: the existing validate_gear_grid_positions
-- trigger will reject any future edit to those grids because the gear is
-- missing from settlement storage. They also distort affinity totals, armor-set
-- qualification, and embark validation.
--
-- This trigger transparently nulls every gear_grid position that points at
-- the deleted gear within the affected settlement after the `settlement_gear`
-- row is removed. Reducing the quantity (UPDATE) is left alone — embark
-- validation continues to surface that case at hunt/showdown creation time.
--------------------------------------------------------------------------------
create or replace function clear_gear_grid_on_settlement_gear_delete() returns trigger language plpgsql
set search_path = '' security definer as $$ begin
update public.gear_grid gg
set pos_top_left = case
    when gg.pos_top_left = old.gear_id then null
    else gg.pos_top_left
  end,
  pos_top_center = case
    when gg.pos_top_center = old.gear_id then null
    else gg.pos_top_center
  end,
  pos_top_right = case
    when gg.pos_top_right = old.gear_id then null
    else gg.pos_top_right
  end,
  pos_mid_left = case
    when gg.pos_mid_left = old.gear_id then null
    else gg.pos_mid_left
  end,
  pos_mid_center = case
    when gg.pos_mid_center = old.gear_id then null
    else gg.pos_mid_center
  end,
  pos_mid_right = case
    when gg.pos_mid_right = old.gear_id then null
    else gg.pos_mid_right
  end,
  pos_bottom_left = case
    when gg.pos_bottom_left = old.gear_id then null
    else gg.pos_bottom_left
  end,
  pos_bottom_center = case
    when gg.pos_bottom_center = old.gear_id then null
    else gg.pos_bottom_center
  end,
  pos_bottom_right = case
    when gg.pos_bottom_right = old.gear_id then null
    else gg.pos_bottom_right
  end
from public.survivor sv
where sv.id = gg.survivor_id
  and sv.settlement_id = old.settlement_id
  and (
    gg.pos_top_left = old.gear_id
    or gg.pos_top_center = old.gear_id
    or gg.pos_top_right = old.gear_id
    or gg.pos_mid_left = old.gear_id
    or gg.pos_mid_center = old.gear_id
    or gg.pos_mid_right = old.gear_id
    or gg.pos_bottom_left = old.gear_id
    or gg.pos_bottom_center = old.gear_id
    or gg.pos_bottom_right = old.gear_id
  );
return old;
end;
$$;
create trigger clear_gear_grid_on_settlement_gear_delete
after delete on settlement_gear for each row execute function clear_gear_grid_on_settlement_gear_delete();