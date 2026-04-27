--------------------------------------------------------------------------------
-- Gear Grid → Survivor Linkage and Survivor-Aware Armor Set Qualification
--
-- The gear_grid table was created without the `survivor_id` column the
-- existing validate_gear_grid_positions() trigger expects, so the trigger
-- has never been able to fire. This migration:
--
-- 1. Adds `survivor_id` to gear_grid (one grid per survivor) so the trigger
--    can resolve the parent survivor and the application can locate a
--    survivor's loadout directly.
-- 2. Adds `survivor_qualifies_for_armor_set(survivor_id, armor_set_id)` —
--    a survivor-driven wrapper around the slot-based `armor_set_qualifies`
--    helper introduced in 20260425000000_armor_set_slots.sql. The function
--    reads every gear cell on the survivor's grid and verifies that each
--    required slot of the requested armor set has at least one matching
--    piece equipped.
--
-- The grid is empty in dev, so adding a non-null FK is safe.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Add survivor_id to gear_grid
--------------------------------------------------------------------------------
alter table gear_grid
add column survivor_id uuid not null references survivor(id) on delete cascade;
-- One grid per survivor.
create unique index idx_gear_grid_survivor on gear_grid(survivor_id);
--------------------------------------------------------------------------------
-- Helper: survivor_qualifies_for_armor_set
--
-- Returns true when the survivor's gear grid satisfies every required slot of
-- the supplied armor set. Falls back to false when the survivor has no grid.
-- Built on top of `armor_set_qualifies(uuid, uuid[])` so the per-slot rules
-- live in one place.
--------------------------------------------------------------------------------
create or replace function survivor_qualifies_for_armor_set(p_survivor_id uuid, p_armor_set_id uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select coalesce(
    (
      select public.armor_set_qualifies(
          p_armor_set_id,
          array [
          gg.pos_top_left, gg.pos_top_center, gg.pos_top_right,
          gg.pos_mid_left, gg.pos_mid_center, gg.pos_mid_right,
          gg.pos_bottom_left, gg.pos_bottom_center, gg.pos_bottom_right
        ]::uuid []
        )
      from public.gear_grid gg
      where gg.survivor_id = p_survivor_id
      limit 1
    ), false
  );
$$;
grant execute on function survivor_qualifies_for_armor_set(uuid, uuid) to authenticated;