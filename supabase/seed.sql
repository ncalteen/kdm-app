-- Wanderers
insert into wanderer (
    abilities_impairments,
    accuracy,
    arc,
    courage,
    disposition,
    evasion,
    fighting_arts,
    gender,
    hunt_xp,
    hunt_xp_rank_up,
    insanity,
    luck,
    lumi,
    movement,
    wanderer_name,
    permanent_injuries,
    rare_gear,
    speed,
    strength,
    survival,
    systemic_pressure,
    torment,
    understanding
  )
values -- Aenas
  (
    '{"Endless Appetite", "Veteran"}',
    1,
    true,
    1,
    0,
    2,
    '{}',
    'FEMALE',
    0,
    '{1, 5, 9, 13}',
    4,
    0,
    1,
    5,
    'Aenas',
    '{}',
    '{"Moonwolf Charm"}',
    0,
    2,
    3,
    0,
    1,
    0
  ),
  -- Candy & Cola
  (
    '{"Candypop", "Veteran"}',
    0,
    true,
    2,
    0,
    0,
    '{"Phantom Friend"}',
    'FEMALE',
    0,
    '{1, 3, 5, 12}',
    0,
    1,
    1,
    6,
    'Candy & Cola',
    '{}',
    '{"Gladiator Garb", "Sharpened Heel"}',
    0,
    0,
    3,
    1,
    1,
    1
  ),
  -- Death Drifter
  (
    '{"Lone Drifter", "Veteran"}',
    1,
    true,
    0,
    0,
    1,
    '{}',
    'MALE',
    0,
    '{1, 3, 7, 13}',
    4,
    0,
    4,
    5,
    'Death Drifter',
    '{}',
    '{"Death Drifter Cloak"}',
    0,
    0,
    4,
    1,
    0,
    0
  ),
  -- Goth
  (
    '{"Revenant", "Veteran"}',
    0,
    true,
    1,
    0,
    -1,
    '{}',
    'FEMALE',
    0,
    '{1, 4, 8}',
    4,
    0,
    2,
    5,
    'Goth',
    '{}',
    '{"Common Katana", "Rapture Bracelet"}',
    1,
    0,
    1,
    0,
    1,
    0
  ),
  -- Luck
  (
    '{ "Servant of Fate", "Veteran"}',
    -1,
    true,
    5,
    0,
    0,
    '{}',
    'MALE',
    0,
    '{1, 5, 9, 13}',
    7,
    1,
    2,
    5,
    'Luck',
    '{"headBlind"}',
    '{"Luck''s Cloak", "Natural Cardinal Staff"}',
    0,
    0,
    7,
    0,
    1,
    5
  );
-- Wanderer Timeline Entries
insert into wanderer_timeline_entries (wanderer, timeline_year, entries)
values -- Aenas
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Aenas'
    ),
    7,
    '{"Wanderer - Aenas"}'
  ),
  -- Candy & Cola
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Candy & Cola'
    ),
    2,
    '{"Wanderer - Candy & Cola"}'
  ),
  -- Death Drifter
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Death Drifter'
    ),
    6,
    '{"Wanderer - Death Drifter"}'
  ),
  -- Goth
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Goth'
    ),
    4,
    '{"Wanderer - Goth"}'
  ),
  -- Luck
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Luck'
    ),
    23,
    '{"Wanderer - Luck"}'
  );
-- Philosophies
insert into philosophies (philosophy_name)
values ('Ambitionism'),
  ('Champion'),
  ('Collectivism'),
  ('Deadism'),
  ('Dreamism'),
  ('Faceism'),
  ('Gourmandism'),
  ('Homicidalism'),
  ('Impermanism'),
  ('Lanternism'),
  ('Marrowism'),
  ('Monster'),
  ('Optimism'),
  ('Other'),
  ('Regalism'),
  ('Romanticism'),
  ('Survivalism'),
  ('Verminism'),
  ('Wanderer');
-- Weapon Types
insert into weapon_types (type_name)
values ('Axe'),
  ('Bow'),
  ('Cleaver'),
  ('Club'),
  ('Dagger'),
  ('Fan'),
  ('Fist and Tooth'),
  ('Grand'),
  ('Katana'),
  ('Katar'),
  ('Lantern Armor'),
  ('Scythe'),
  ('Shield'),
  ('Spear'),
  ('Sword'),
  ('Whip');