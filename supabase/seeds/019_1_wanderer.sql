--------------------------------------------------------------------------------
-- Wanderers
--------------------------------------------------------------------------------
insert into wanderer (
    accuracy,
    arc,
    courage,
    disposition,
    evasion,
    fighting_art_ids,
    gender,
    hunt_xp,
    hunt_xp_rank_up,
    insanity,
    luck,
    lumi,
    movement,
    wanderer_name,
    permanent_injuries,
    rare_gear_ids,
    speed,
    strength,
    survival,
    systemic_pressure,
    torment,
    understanding
  )
values -------------------------------------------------------------------------
  -- Aenas
  ------------------------------------------------------------------------------
  (
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
    (
      select array_agg(id)
      from gear
      where gear_name in ('Moonwolf Charm')
    ),
    0,
    2,
    3,
    0,
    1,
    0
  ),
  ------------------------------------------------------------------------------
  -- Candy & Cola
  ------------------------------------------------------------------------------
  (
    0,
    true,
    2,
    0,
    0,
    (
      select array_agg(id)
      from fighting_art
      where fighting_art_name = 'Phantom Friend'
    ),
    'FEMALE',
    0,
    '{1, 3, 5, 12}',
    0,
    1,
    1,
    6,
    'Candy & Cola',
    '{}',
    (
      select array_agg(id)
      from gear
      where gear_name in ('Gladiator Garb', 'Sharpened Heel')
    ),
    0,
    0,
    3,
    1,
    1,
    1
  ),
  ------------------------------------------------------------------------------
  -- Death Drifter
  ------------------------------------------------------------------------------
  (
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
    (
      select array_agg(id)
      from gear
      where gear_name in ('Death Drifter Cloak')
    ),
    0,
    0,
    4,
    1,
    0,
    0
  ),
  ------------------------------------------------------------------------------
  -- Goth
  ------------------------------------------------------------------------------
  (
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
    (
      select array_agg(id)
      from gear
      where gear_name in ('Common Katana', 'Rapture Bracelet')
    ),
    1,
    0,
    1,
    0,
    1,
    0
  ),
  ------------------------------------------------------------------------------
  -- Luck
  ------------------------------------------------------------------------------
  (
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
    (
      select array_agg(id)
      from gear
      where gear_name in ('Luck''s Cloak', 'Natural Cardinal Staff')
    ),
    0,
    0,
    7,
    0,
    1,
    5
  ),
  ------------------------------------------------------------------------------
  -- Preacher
  ------------------------------------------------------------------------------
  (
    0,
    true,
    5,
    0,
    0,
    '{}',
    'FEMALE',
    0,
    '{1, 3, 9, 14}',
    9,
    1,
    0,
    5,
    'Preacher',
    '{}',
    (
      select array_agg(id)
      from gear
      where gear_name in (
          'Hammer of Judgement',
          'Holy Lantern',
          'Sanctified Rosary'
        )
    ),
    1,
    0,
    5,
    0,
    0,
    5
  );