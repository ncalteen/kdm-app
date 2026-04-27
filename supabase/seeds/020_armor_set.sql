--------------------------------------------------------------------------------
-- Armor Sets
--
-- Built-in (non-custom) armor sets and their constituent gear pieces. Linkage
-- uses an explicit (set_name, gear_name) lookup because piece names do not
-- always follow a predictable "<Set> <Slot>" convention. Names not present
-- in `gear` are silently skipped via the inner join; a verification block at
-- the end of this script raises a WARNING for any set whose seeded piece
-- count is below the mapping's expected count.
--
-- Idempotency: the `armor_set_unique_non_custom_name` partial index lets the
-- `on conflict` clauses below short-circuit re-runs of this seed.
--------------------------------------------------------------------------------
insert into armor_set (armor_set_name)
values ---
  ('Beast Hunter Armor'),
  ('Black & Red Armor'),
  ('Brawler Armor'),
  ('Bullfrogdog Armor'),
  ('Count Armor'),
  ('Crimson Armor'),
  ('Cycloid Scale Armor'),
  ('Dancer Armor'),
  ('Deathking Armor'),
  ('Dragon Armor'),
  ('Earl Armor'),
  ('Frogdog Armor'),
  ('Gloomleather Armor'),
  ('Gorment Armor'),
  ('Green Armor'),
  ('Imitation Butcher Armor'),
  ('Lantern Armor'),
  ('Leather Armor'),
  ('Marchioness Armor'),
  ('Phoenix Armor'),
  ('Rawhide Armor'),
  ('Screaming Armor'),
  ('Screaming Sun Armor'),
  ('Silk Armor'),
  ('Singing Armor'),
  ('Sprinter Armor'),
  ('Sunlantern Armor'),
  ('Warlord Armor'),
  ('White Lion Armor') on conflict (armor_set_name)
where not custom do nothing;
--------------------------------------------------------------------------------
-- The Supabase CLI's seed runner sends statements in separate pgx batches,
-- so a session-level temp table created via `SELECT INTO TEMP` is not visible
-- to subsequent statements. Wrap every step that depends on the mappings in a
-- single `DO` block so the temp table lives within one statement.
--------------------------------------------------------------------------------
do $$
declare r record;
begin create temp table _armor_set_seed_mappings (set_name text, gear_name text) on commit drop;
insert into _armor_set_seed_mappings (set_name, gear_name)
values ---
  ('Beast Hunter Armor', 'Beast Hunter Helm'),
  ('Beast Hunter Armor', 'Screaming Bracers'),
  ('Beast Hunter Armor', 'Phoenix Plackart'),
  ('Beast Hunter Armor', 'Phoenix Faulds'),
  ('Beast Hunter Armor', 'Screaming Leg Warmers'),
  ('Black & Red Armor', 'Black & Red Armet'),
  ('Black & Red Armor', 'Black & Red Cuirass'),
  ('Black & Red Armor', 'Black & Red Gauntlets'),
  ('Black & Red Armor', 'Black & Red Greaves'),
  ('Black & Red Armor', 'Black & Red Tonlet'),
  ('Brawler Armor', 'Skull Helm'),
  ('Brawler Armor', 'White Lion Gauntlet'),
  ('Brawler Armor', 'Lion Skin Cloak'),
  ('Brawler Armor', 'Phoenix Faulds'),
  ('Brawler Armor', 'Phoenix Greaves'),
  ('Bullfrogdog Armor', 'Bullfrog Boots'),
  ('Bullfrogdog Armor', 'Bullfrog Bracers'),
  ('Bullfrogdog Armor', 'Bullfrog Cuirass'),
  ('Bullfrogdog Armor', 'Bullfrog Dress'),
  ('Bullfrogdog Armor', 'Bullfrog Helm'),
  ('Count Armor', 'Count Sandals'),
  ('Count Armor', 'Count Tabard'),
  ('Count Armor', 'Count Treukh'),
  ('Count Armor', 'Count Vest'),
  ('Count Armor', 'Count Wrappings'),
  ('Crimson Armor', 'Crimson Dress'),
  ('Crimson Armor', 'Crimson Faulds'),
  ('Crimson Armor', 'Crimson Guard'),
  ('Crimson Armor', 'Crimson Pearls'),
  ('Crimson Armor', 'Crimson Slippers'),
  ('Cycloid Scale Armor', 'Cycloid Scale Hood'),
  ('Cycloid Scale Armor', 'Cycloid Scale Jacket'),
  ('Cycloid Scale Armor', 'Cycloid Scale Shoes'),
  ('Cycloid Scale Armor', 'Cycloid Scale Skirt'),
  ('Cycloid Scale Armor', 'Cycloid Scale Sleeves'),
  ('Dancer Armor', 'Phoenix Helm'),
  ('Dancer Armor', 'Screaming Bracers'),
  ('Dancer Armor', 'Rawhide Vest'),
  ('Dancer Armor', 'Leather Skirt'),
  ('Dancer Armor', 'Leather Boots'),
  ('Deathking Armor', 'Deathking Boots'),
  ('Deathking Armor', 'Deathking Gauntlets'),
  ('Deathking Armor', 'Deathking Greaves'),
  ('Deathking Armor', 'Deathking Helm'),
  ('Deathking Armor', 'Deathking Platemail'),
  ('Dragon Armor', 'Dragon Belt'),
  ('Dragon Armor', 'Dragon Boots'),
  ('Dragon Armor', 'Dragon Gloves'),
  ('Dragon Armor', 'Dragon Mantle'),
  ('Dragon Armor', 'Dragonskull Helm'),
  ('Earl Armor', 'Earl Boots'),
  ('Earl Armor', 'Earl Jaw Guard'),
  ('Earl Armor', 'Earl Raiment'),
  ('Earl Armor', 'Earl Sleeves'),
  ('Earl Armor', 'Earl Tassets'),
  ('Frogdog Armor', 'Frogdog Boots'),
  ('Frogdog Armor', 'Frogdog Mask'),
  ('Frogdog Armor', 'Frogdog Sleeves'),
  ('Frogdog Armor', 'Frogdog Suit'),
  ('Frogdog Armor', 'Frogdog Vest'),
  ('Gloomleather Armor', 'Gloom Cowl'),
  ('Gloomleather Armor', 'Leather Bracers'),
  ('Gloomleather Armor', 'Leather Cuirass'),
  ('Gloomleather Armor', 'Leather Skirt'),
  ('Gloomleather Armor', 'Leather Boots'),
  ('Gorment Armor', 'Gorment Boots'),
  ('Gorment Armor', 'Gorment Mask'),
  ('Gorment Armor', 'Gorment Sleeves'),
  ('Gorment Armor', 'Gorment Suit'),
  ('Green Armor', 'Green Boots'),
  ('Green Armor', 'Green Faulds'),
  ('Green Armor', 'Green Gloves'),
  ('Green Armor', 'Green Helm'),
  ('Green Armor', 'Green Plate'),
  (
    'Imitation Butcher Armor',
    'Imitation Butcher Helm'
  ),
  ('Imitation Butcher Armor', 'Leather Bracers'),
  ('Imitation Butcher Armor', 'Leather Cuirass'),
  ('Imitation Butcher Armor', 'Leather Skirt'),
  ('Imitation Butcher Armor', 'Leather Boots'),
  ('Lantern Armor', 'Lantern Cuirass'),
  ('Lantern Armor', 'Lantern Gauntlets'),
  ('Lantern Armor', 'Lantern Greaves'),
  ('Lantern Armor', 'Lantern Helm'),
  ('Lantern Armor', 'Lantern Mail'),
  ('Leather Armor', 'Leather Boots'),
  ('Leather Armor', 'Leather Bracers'),
  ('Leather Armor', 'Leather Cuirass'),
  ('Leather Armor', 'Leather Skirt'),
  ('Leather Armor', 'Leather Mask'),
  ('Marchioness Armor', 'Marchioness Blouse'),
  ('Marchioness Armor', 'Marchioness Gloves'),
  ('Marchioness Armor', 'Marchioness Gorget'),
  ('Marchioness Armor', 'Marchioness Sollerets'),
  ('Marchioness Armor', 'Marchioness Trousers'),
  ('Phoenix Armor', 'Phoenix Faulds'),
  ('Phoenix Armor', 'Phoenix Gauntlet'),
  ('Phoenix Armor', 'Phoenix Greaves'),
  ('Phoenix Armor', 'Phoenix Helm'),
  ('Phoenix Armor', 'Phoenix Plackart'),
  ('Rawhide Armor', 'Rawhide Boots'),
  ('Rawhide Armor', 'Rawhide Gloves'),
  ('Rawhide Armor', 'Rawhide Headband'),
  ('Rawhide Armor', 'Rawhide Pants'),
  ('Rawhide Armor', 'Rawhide Vest'),
  ('Screaming Armor', 'Screaming Bracers'),
  ('Screaming Armor', 'Screaming Coat'),
  ('Screaming Armor', 'Screaming Horns'),
  ('Screaming Armor', 'Screaming Leg Warmers'),
  ('Screaming Armor', 'Screaming Skirt'),
  ('Screaming Sun Armor', 'Screaming Sun Mask'),
  ('Screaming Sun Armor', 'Screaming Bracers'),
  ('Screaming Sun Armor', 'Screaming Coat'),
  ('Screaming Sun Armor', 'Screaming Skirt'),
  ('Screaming Sun Armor', 'Screaming Leg Warmers'),
  ('Silk Armor', 'Silk Boots'),
  ('Silk Armor', 'Silk Robes'),
  ('Silk Armor', 'Silk Sash'),
  ('Silk Armor', 'Silk Turban'),
  ('Silk Armor', 'Silk Wraps'),
  ('Singing Armor', 'Singing Cap'),
  ('Singing Armor', 'Singing Boots'),
  ('Singing Armor', 'Singing Breastplate'),
  ('Singing Armor', 'Singing Gloves'),
  ('Singing Armor', 'Singing Pantaloons'),
  ('Sprinter Armor', 'Sprinter Helm'),
  ('Sprinter Armor', 'White Lion Gauntlet'),
  ('Sprinter Armor', 'White Lion Coat'),
  ('Sprinter Armor', 'Screaming Skirt'),
  ('Sprinter Armor', 'Screaming Leg Warmers'),
  ('Sunlantern Armor', 'Sunlantern Mask'),
  ('Sunlantern Armor', 'Lantern Gauntlets'),
  ('Sunlantern Armor', 'Lantern Cuirass'),
  ('Sunlantern Armor', 'Lantern Mail'),
  ('Sunlantern Armor', 'Lantern Greaves'),
  ('Warlord Armor', 'Screaming Horns'),
  ('Warlord Armor', 'Leather Bracers'),
  ('Warlord Armor', 'Phoenix Plackart'),
  ('Warlord Armor', 'Lantern Mail'),
  ('Warlord Armor', 'Lantern Greaves'),
  ('White Lion Armor', 'White Lion Boots'),
  ('White Lion Armor', 'White Lion Coat'),
  ('White Lion Armor', 'White Lion Gauntlet'),
  ('White Lion Armor', 'White Lion Helm'),
  ('White Lion Armor', 'White Lion Skirt');
--------------------------------------------------------------------------------
-- Insert one slot per (set, slot_name). Slot identity is derived from
-- gear.armor_location (HEAD/CHEST/ARMS/WAIST/FEET) so multiple gear pieces in
-- the same set sharing an armor location automatically collapse into a single
-- slot whose entries become alternates. Gear with a null armor_location
-- falls back to gear_name so each piece still occupies a distinct slot.
--------------------------------------------------------------------------------
insert into armor_set_slot (armor_set_id, slot_name, slot_order)
select distinct a.id,
  coalesce(g.armor_location::text, g.gear_name) as slot_name,
  case
    g.armor_location::text
    when 'HEAD' then 1
    when 'CHEST' then 2
    when 'ARMS' then 3
    when 'WAIST' then 4
    when 'FEET' then 5
    else 99
  end as slot_order
from _armor_set_seed_mappings m
  join armor_set a on a.armor_set_name = m.set_name
  and a.custom = false
  join gear g on g.gear_name = m.gear_name
  and g.custom = false on conflict do nothing;
--------------------------------------------------------------------------------
-- Link each gear piece into its newly-created slot.
--------------------------------------------------------------------------------
insert into armor_set_slot_gear (armor_set_slot_id, gear_id)
select s.id,
  g.id
from _armor_set_seed_mappings m
  join armor_set a on a.armor_set_name = m.set_name
  and a.custom = false
  join gear g on g.gear_name = m.gear_name
  and g.custom = false
  join armor_set_slot s on s.armor_set_id = a.id
  and s.slot_name = coalesce(g.armor_location::text, g.gear_name) on conflict do nothing;
--------------------------------------------------------------------------------
-- Verification: warn about any (set, gear) mapping whose `gear_name` does
-- not match a built-in `gear` row. The inner joins above silently drop such
-- rows, so this is the only signal that the seed has a typo or references a
-- piece that has not been added to the catalog yet.
--------------------------------------------------------------------------------
for r in
select m.set_name,
  m.gear_name
from _armor_set_seed_mappings m
where not exists (
    select 1
    from gear g
    where g.gear_name = m.gear_name
      and not g.custom
  ) loop raise warning 'Armor set "%" references unknown gear "%" (skipped during seed).',
  r.set_name,
  r.gear_name;
end loop;
end $$;
--------------------------------------------------------------------------------
-- Slot-based armor sets with alternates.
--
-- These sets define one or more candidate gear pieces per slot. A survivor
-- qualifies when every required slot has at least one matching piece in their
-- gear grid (see `armor_set_qualifies` / `survivor_qualifies_for_armor_set`).
--
-- The mappings drive three statements: register the parent armor_set, create
-- one slot per (set, slot_name), and link every candidate gear into its slot.
-- Gear lookups are inner joins so missing catalog names are silently skipped.
--
-- As above, the entire flow is wrapped in a single `DO` block so the temp
-- table survives across the dependent statements when seeded by the Supabase
-- CLI's batched runner.
--------------------------------------------------------------------------------
do $$
declare r record;
begin create temp table _armor_set_slot_seed (
  set_name text,
  slot_name text,
  slot_order integer,
  gear_name text
) on commit drop;
insert into _armor_set_slot_seed (set_name, slot_name, slot_order, gear_name)
values -- Vagabond Armor
  ('Vagabond Armor', 'Tabard', 1, 'Count Tabard'),
  (
    'Vagabond Armor',
    'CHEST',
    2,
    'Leather Cuirass'
  ),
  (
    'Vagabond Armor',
    'CHEST',
    2,
    'Hard Breastplate'
  ),
  ('Vagabond Armor', 'WAIST', 3, 'Leather Skirt'),
  (
    'Vagabond Armor',
    'ARMS',
    4,
    'Leather Bracers'
  ),
  (
    'Vagabond Armor',
    'ARMS',
    4,
    'White Dragon Gauntlets'
  ),
  ('Vagabond Armor', 'FEET', 5, 'Leather Boots'),
  ('Vagabond Armor', 'FEET', 5, 'Cloth Leggings'),
  -- White Sunlion Armor
  (
    'White Sunlion Armor',
    'HEAD',
    1,
    'White Sunlion Mask'
  ),
  (
    'White Sunlion Armor',
    'CHEST',
    2,
    'White Lion Coat'
  ),
  (
    'White Sunlion Armor',
    'WAIST',
    3,
    'White Lion Skirt'
  ),
  ('White Sunlion Armor', 'WAIST', 3, 'Cloth'),
  (
    'White Sunlion Armor',
    'ARMS',
    4,
    'White Lion Gauntlet'
  ),
  (
    'White Sunlion Armor',
    'FEET',
    5,
    'White Lion Boots'
  ),
  -- Refined Lantern Armor
  (
    'Refined Lantern Armor',
    'ARMS',
    1,
    'Lantern Gauntlets'
  ),
  (
    'Refined Lantern Armor',
    'CHEST',
    2,
    'Soldier Lantern Cuirass'
  ),
  (
    'Refined Lantern Armor',
    'CHEST',
    2,
    'Veteran Lantern Cuirass'
  ),
  (
    'Refined Lantern Armor',
    'CHEST',
    3,
    'Lantern Mail'
  ),
  (
    'Refined Lantern Armor',
    'FEET',
    4,
    'Lantern Greaves'
  ),
  -- Rolling Armor
  ('Rolling Armor', 'HEAD', 1, 'Scarab Circlet'),
  (
    'Rolling Armor',
    'Harness',
    2,
    'Rubber Bone Harness'
  ),
  (
    'Rolling Armor',
    'ARMS',
    3,
    'Century Shoulder Pads'
  ),
  (
    'Rolling Armor',
    'ARMS',
    3,
    'Calcified Shoulder Pads'
  ),
  ('Rolling Armor', 'WAIST', 4, 'Rainbow Wing Belt'),
  ('Rolling Armor', 'FEET', 5, 'Century Greaves'),
  (
    'Rolling Armor',
    'FEET',
    5,
    'Calcified Greaves'
  );
-- Register parent armor sets.
insert into armor_set (armor_set_name)
select distinct set_name
from _armor_set_slot_seed on conflict (armor_set_name)
where not custom do nothing;
-- Create one slot per (set, slot_name).
insert into armor_set_slot (armor_set_id, slot_name, slot_order)
select distinct a.id,
  s.slot_name,
  s.slot_order
from _armor_set_slot_seed s
  join armor_set a on a.armor_set_name = s.set_name
  and a.custom = false on conflict do nothing;
-- Link each candidate gear into its slot.
insert into armor_set_slot_gear (armor_set_slot_id, gear_id)
select asl.id,
  g.id
from _armor_set_slot_seed s
  join armor_set a on a.armor_set_name = s.set_name
  and a.custom = false
  join armor_set_slot asl on asl.armor_set_id = a.id
  and asl.slot_name = s.slot_name
  join gear g on g.gear_name = s.gear_name
  and g.custom = false on conflict do nothing;
--------------------------------------------------------------------------------
-- Verification: warn about any slot candidate whose `gear_name` does not
-- match a built-in `gear` row.
--------------------------------------------------------------------------------
for r in
select s.set_name,
  s.slot_name,
  s.gear_name
from _armor_set_slot_seed s
where not exists (
    select 1
    from gear g
    where g.gear_name = s.gear_name
      and not g.custom
  ) loop raise warning 'Armor set "%" slot "%" references unknown gear "%" (skipped during seed).',
  r.set_name,
  r.slot_name,
  r.gear_name;
end loop;
end $$;