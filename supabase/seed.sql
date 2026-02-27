--------------------------------------------------------------------------------
-- Locations
--------------------------------------------------------------------------------
insert into location (custom, location_name)
values (false, 'Catarium'),
  (false, 'Chorusseum'),
  (false, 'Crimson Crockery'),
  (false, 'Dragon Armory'),
  (false, 'Froskrafter'),
  (false, 'Giga Catarium'),
  (false, 'Gormchymist'),
  (false, 'Gormery'),
  (false, 'Kingsmith'),
  (false, 'Plumery'),
  (false, 'Skyreef Sanctuary'),
  (false, 'Stone Circle'),
  (false, 'Stone Circle Hot Zone'),
  (false, 'Tuskworks');
--------------------------------------------------------------------------------
-- Collective Cognition Rewards
--------------------------------------------------------------------------------
insert into collective_cognition_reward (
    collective_cognition,
    custom,
    reward_name
  )
values (6, false, 'Crimson Crocodile Cuisine'),
  (36, false, 'King Cuisine'),
  (26, false, 'Phoenix Cuisine'),
  (16, false, 'Screaming Antelope Cuisine'),
  (16, false, 'Smog Singer Cuisine'),
  (6, false, 'White Lion Cuisine');
--------------------------------------------------------------------------------
-- Philosophies
--------------------------------------------------------------------------------
insert into philosophy (philosophy_name)
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
--------------------------------------------------------------------------------
-- Wanderers
--------------------------------------------------------------------------------
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
values -------------------------------------------------------------------------
  -- Aenas
  ------------------------------------------------------------------------------
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
  ------------------------------------------------------------------------------
  -- Candy & Cola
  ------------------------------------------------------------------------------
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
  ------------------------------------------------------------------------------
  -- Death Drifter
  ------------------------------------------------------------------------------
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
  ------------------------------------------------------------------------------
  -- Goth
  ------------------------------------------------------------------------------
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
  ------------------------------------------------------------------------------
  -- Luck
  ------------------------------------------------------------------------------
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
  ),
  ------------------------------------------------------------------------------
  -- Preacher
  ------------------------------------------------------------------------------
  (
    '{ "Object of Devotion", "Veteran"}',
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
    '{"Hammer of Judgement", "Holy Lantern", "Sanctified Rosary"}',
    1,
    0,
    5,
    0,
    0,
    5
  );
--------------------------------------------------------------------------------
-- Wanderer Timeline Year Entries
--------------------------------------------------------------------------------
insert into wanderer_timeline_year (wanderer_id, year_number, entries)
values -------------------------------------------------------------------------
  -- Aenas
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Aenas'
        and not custom
    ),
    7,
    '{"Wanderer - Aenas"}'
  ),
  ------------------------------------------------------------------------------
  -- Candy & Cola
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Candy & Cola'
        and not custom
    ),
    2,
    '{"Wanderer - Candy & Cola"}'
  ),
  ------------------------------------------------------------------------------
  -- Death Drifter
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Death Drifter'
        and not custom
    ),
    6,
    '{"Wanderer - Death Drifter"}'
  ),
  ------------------------------------------------------------------------------
  -- Goth
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Goth'
        and not custom
    ),
    4,
    '{"Wanderer - Goth"}'
  ),
  ------------------------------------------------------------------------------
  -- Luck
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Luck'
        and not custom
    ),
    23,
    '{"Wanderer - Luck"}'
  ),
  ------------------------------------------------------------------------------
  -- Preacher
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Preacher'
        and not custom
    ),
    8,
    '{"Wanderer - Preacher"}'
  );
--------------------------------------------------------------------------------
-- Weapon Types
--------------------------------------------------------------------------------
insert into weapon_type (weapon_type_name, custom)
values ('Axe', false),
  ('Bow', false),
  ('Cleaver', false),
  ('Club', false),
  ('Dagger', false),
  ('Fan', false),
  ('Fist and Tooth', false),
  ('Grand', false),
  ('Katana', false),
  ('Katar', false),
  ('Lantern Armor', false),
  ('Scythe', false),
  ('Shield', false),
  ('Spear', false),
  ('Sword', false),
  ('Whip', false);
--------------------------------------------------------------------------------
-- Killenium Butcher
--------------------------------------------------------------------------------
insert into nemesis (custom, monster_name, multi_monster, node)
values (false, 'Killenium Butcher', false, 'NN1');
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    15,
    9,
    6,
    0,
    0,
    0,
    1,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Killenium Butcher'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    13,
    0,
    '{"Scorn", "Self-Aware"}'
  ),
  (
    21,
    11,
    10,
    0,
    0,
    0,
    2,
    2,
    0,
    0,
    1,
    3,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Killenium Butcher'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{"Infectious Lunacy"}',
    16,
    0,
    '{"Berzerker", "Invincible", "Scorn", "Self-Aware", "Indomitable"}'
  );
--------------------------------------------------------------------------------
-- Atnas the Child Eater
--------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Atnas the Child Eater',
    false,
    'NN2',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    8,
    3,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Old Battle Scars", "Master''s Presence", "Mad Master", "Spark of Joy"}'
  ),
  (
    16,
    10,
    4,
    2,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    14,
    0,
    '{"Curb Stomp", "Mad Master", "Master''s Presence", "Old Battle Scars", "Spark of Joy"}'
  ),
  (
    21,
    13,
    5,
    3,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    null,
    0,
    1,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{}',
    19,
    0,
    '{"Curb Stomp", "Keen Eyes", "Mad Master", "Master''s Presence", "Old Battle Scars", "Spark of Joy", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{"PEOPLE_OF_THE_DREAM_KEEPER"}',
    '{"Unwanted Gifts"}',
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    6
  ),
  (
    '{}',
    '{"Nemesis Encounter - Atnas the Child Eater Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    9
  ),
  (
    '{}',
    '{"Nemesis Encounter - Atnas the Child Eater Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    18
  ),
  (
    '{}',
    '{"Nemesis Encounter - Atnas the Child Eater Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'Atnas the Child Eater'
        and not custom
    ),
    28
  );
------------------------------------------------------------------------------
-- Black Knight
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (false, 'Black Knight', false, 'NN3', null);
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    8,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Black Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    10,
    4,
    '{"Red Preference", "Sheer Cliffs", "Smash", "Spry"}'
  ),
  (
    16,
    9,
    6,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Black Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    10,
    6,
    '{"Red Preference", "Sheer Cliffs", "Smash", "Spry", "Unsteady"}'
  ),
  (
    22,
    11,
    8,
    3,
    0,
    0,
    1,
    1,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Black Knight'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    10,
    8,
    '{"Red Preference", "Seasoned Duelist", "Sheer Cliffs", "Smash", "Spry", "Unsteady", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Waiting Bell"}',
    (
      select id
      from nemesis
      where monster_name = 'Black Knight'
        and not custom
    ),
    13
  );
------------------------------------------------------------------------------
-- Butcher
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Butcher',
    false,
    'NN1',
    (
      select id
      from nemesis
      where monster_name = 'Killenium Butcher'
        and not custom
    )
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    7,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{"Infectious Lunacy"}',
    9,
    0,
    '{"Berserker", "Dreaded Trophies", "Fast Target"}'
  ),
  (
    15,
    10,
    5,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{"Infectious Lunacy"}',
    12,
    0,
    '{"Dreaded Trophies", "Fast Target", "Frenzied Berserker"}'
  ),
  (
    21,
    11,
    10,
    0,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{"Infectious Lunacy"}',
    15,
    0,
    '{"Dreaded Trophies", "Fast Target", "Frenzied Berserker", "Invincible", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN"}',
    '{"Nemesis Encounter - Butcher Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    4
  ),
  (
    '{"PEOPLE_OF_THE_STARS"}',
    '{"Nemesis Encounter - Butcher Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    13
  ),
  (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN"}',
    '{"Nemesis Encounter - Butcher Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    16
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - Butcher Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    22
  ),
  (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN"}',
    '{"Nemesis Encounter - Butcher Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'Butcher'
        and not custom
    ),
    23
  );
------------------------------------------------------------------------------
-- Dying God (Dragon King)
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Dying God (Dragon King)',
    false,
    'FI',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    11,
    5,
    5,
    1,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    3,
    20,
    0,
    0,
    '{}',
    10,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Dying God (Dragon King)'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{}',
    17,
    0,
    '{"Irradiate", "Smolder", "Trample", "Unseen Agony"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Nemesis Encounter - Death of the Dragon King"}',
    (
      select id
      from nemesis
      where monster_name = 'Dying God (Dragon King)'
        and not custom
    ),
    24
  );
------------------------------------------------------------------------------
-- Gambler
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (false, 'Gambler', false, 'CO', null);
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    21,
    9,
    9,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    null,
    0,
    10000,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Gambler'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    20,
    0,
    '{"Critical Failure", "Dice Bag", "Double or Death", "Gambler''s Dice", "Magister Ludi"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Nemesis Encounter - The Gambler"}',
    (
      select id
      from nemesis
      where monster_name = 'Gambler'
        and not custom
    ),
    20
  );
------------------------------------------------------------------------------
-- Godhand
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (false, 'Godhand', false, 'FI', null);
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    6,
    5,
    1,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    4,
    30,
    0,
    0,
    '{}',
    -1,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Godhand'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    30,
    0,
    '{"Old Blood", "Reinforcements", "True Ghost Step", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Nemesis Encounter - Godhand"}',
    (
      select id
      from nemesis
      where monster_name = 'Godhand'
        and not custom
    ),
    30
  );
------------------------------------------------------------------------------
-- Gold Smoke Knight
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Gold Smoke Knight',
    false,
    'FI',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    18,
    9,
    7,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    null,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Gold Smoke Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    27,
    0,
    '{"Blacken", "Frustration", "Mauler", "Secondary Forge", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Nemesis Encounter - Gold Smoke Knight"}',
    (
      select id
      from nemesis
      where monster_name = 'Gold Smoke Knight'
        and not custom
    ),
    30
  );
------------------------------------------------------------------------------
-- The Hand
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'The Hand',
    false,
    'NN3',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Hand'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{"Polarized Aura"}',
    14,
    0,
    '{"Applause", "Blue Lens - Closed", "Ghost Step", "Green Lens - Closed", "Impossible Eyes", "Red Lens - Closed"}'
  ),
  (
    11,
    10,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Hand'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{"Polarized Aura"}',
    15,
    0,
    '{"Applause", "Blue Lens - Closed", "Ghost Step", "Green Lens - Closed", "Impossible Eyes", "Red Lens - Closed"}'
  ),
  (
    12,
    10,
    2,
    0,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Hand'
        and not custom
    ),
    null,
    3,
    0,
    0,
    0,
    '{"Polarized Aura"}',
    30,
    0,
    '{"Applause", "Blue Lens - Closed", "Ghost Step", "Green Lens - Closed", "Impossible Eyes", "Red Lens - Closed", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{"PEOPLE_OF_THE_LANTERN"}',
    '{"Regal Visit"}',
    (
      select id
      from nemesis
      where monster_name = 'The Hand'
        and not custom
    ),
    11
  ),
  (
    '{"PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_DREAM_KEEPER"}',
    '{"Nemesis Encounter - The Hand Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'The Hand'
        and not custom
    ),
    13
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - The Hand Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'The Hand'
        and not custom
    ),
    24
  );
------------------------------------------------------------------------------
-- King's Man
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'King''s Man',
    false,
    'NN2',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    10,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    5,
    0,
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{"Battle Tempo"}',
    12,
    0,
    '{"King''s Aura", "King''s Combat", "Out-Fighting", "Weak Spot"}'
  ),
  (
    16,
    11,
    4,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{"Battle Tempo"}',
    15,
    0,
    '{"King''s Aura", "King''s Combat", "Out-Fighting", "Silent Hymn", "Weak Spot"}'
  ),
  (
    19,
    12,
    6,
    1,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{"Battle Tempo"}',
    18,
    0,
    '{"King''s Aura", "King''s Combat", "Out-Fighting", "Silent Hymn", "Weak Spot", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_STARS"}',
    '{"Armored Strangers"}',
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    6
  ),
  (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_STARS"}',
    '{"Nemesis Encounter - King''s Man Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    9
  ),
  (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_STARS"}',
    '{"Nemesis Encounter - King''s Man Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    19
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - King''s Man Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    21
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - King''s Man Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    23
  ),
  (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_STARS"}',
    '{"Nemesis Encounter - King''s Man Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'King''s Man'
        and not custom
    ),
    28
  );
------------------------------------------------------------------------------
-- Lion Knight
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Lion Knight',
    false,
    'NN2',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    10,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Outburst", "Zeal"}'
  ),
  (
    15,
    10,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    12,
    0,
    '{"Drama Lessons", "Outburst", "Zeal"}'
  ),
  (
    21,
    12,
    9,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    15,
    0,
    '{"Drama Lessons", "Last Act", "Outburst", "Zeal", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"An Uninvited Guest"}',
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    6
  ),
  (
    '{}',
    '{"Places Everyone", "Nemesis Encounter - Lion Knight Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    8
  ),
  (
    '{}',
    '{"Places Everyone", "Nemesis Encounter - Lion Knight Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    12
  ),
  (
    '{}',
    '{"Places Everyone", "Nemesis Encounter - Lion Knight Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'Lion Knight'
        and not custom
    ),
    16
  );
------------------------------------------------------------------------------
-- Lonely Tree
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Lonely Tree',
    false,
    'NN1',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    6,
    3,
    1,
    0,
    0,
    0,
    -1,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    0,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Lonely Tree'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Bear Fruit", "Impenetrable Trunk", "Nightmare Fruit"}'
  ),
  (
    14,
    8,
    5,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    0,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Lonely Tree'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    13,
    0,
    '{"Bear Fruit", "Impenetrable Trunk", "Moving Ground", "Nightmare Fruit"}'
  ),
  (
    15,
    8,
    5,
    2,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    3,
    20,
    0,
    0,
    '{}',
    0,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Lonely Tree'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    17,
    0,
    '{"Bear Fruit", "Impenetrable Trunk", "Moving Ground", "Nightmare Fruit"}'
  );
------------------------------------------------------------------------------
-- Manhunter
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Manhunter',
    false,
    'NN1',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    7,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{"Gritty Armament", "Gun Action", "Short Stride", "Tombstone"}'
  ),
  (
    13,
    7,
    6,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Full Stride", "Gritty Armament", "Gun Action", "Tombstone"}'
  ),
  (
    16,
    8,
    7,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Full Stride", "Gritty Armament", "Gun Action", "Tombstone", "Indomitable"}'
  ),
  (
    18,
    8,
    8,
    2,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    4,
    null,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{}',
    13,
    0,
    '{"Full Stride", "Gritty Armament", "Gun Action", "Tombstone", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"The Hanged Man"}',
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    5
  ),
  (
    '{}',
    '{"Nemesis Encounter - Manhunter Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    10
  ),
  (
    '{}',
    '{"Nemesis Encounter - Manhunter Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    16
  ),
  (
    '{}',
    '{"Nemesis Encounter - Manhunter Lvl 4"}',
    (
      select id
      from nemesis
      where monster_name = 'Manhunter'
        and not custom
    ),
    22
  );
------------------------------------------------------------------------------
-- Pariah
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (false, 'Pariah', false, 'NN1', null);
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    7,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Pariah'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{"Somatic Static"}',
    10,
    0,
    '{"Somatic Empathy"}'
  ),
  (
    16,
    8,
    7,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Pariah'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{"Somatic Static"}',
    13,
    0,
    '{"Cyclopean Cruelty", "Somatic Empathy"}'
  ),
  (
    18,
    6,
    10,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    1,
    3,
    null,
    0,
    1,
    '{}',
    8,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Pariah'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{"Somatic Static"}',
    17,
    0,
    '{"Cyclopean Cruelty", "Inverted", "Jagged Grotto", "Somatic Empathy", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{"PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_DREAM_KEEPER"}',
    '{"The Fiend"}',
    (
      select id
      from nemesis
      where monster_name = 'Pariah'
        and not custom
    ),
    3
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - Pariah Lvl 22"}',
    (
      select id
      from nemesis
      where monster_name = 'Pariah'
        and not custom
    ),
    22
  );
------------------------------------------------------------------------------
-- Red Witches
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Red Witches',
    true,
    'NN2',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    7,
    3,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    10,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    'Braal',
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Boiling Blood", "Discouraging Presence"}'
  ),
  (
    12,
    7,
    3,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    10,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    'Braal',
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Discouraging Presence"}'
  ),
  (
    12,
    6,
    4,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    8,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    'Nico',
    0,
    0,
    0,
    0,
    '{}',
    13,
    0,
    '{"Red Initiate", "Witching Cloak"}'
  ),
  (
    12,
    7,
    3,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    10,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    'Braal',
    2,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Discouraging Presence", "Indomitable"}'
  ),
  (
    12,
    6,
    4,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    8,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    'Nico',
    2,
    0,
    0,
    0,
    '{}',
    13,
    0,
    '{"Red Initiate", "Witching Cloak", "Indomitable"}'
  ),
  (
    12,
    6,
    2,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    3,
    6,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    'Seer',
    0,
    0,
    0,
    0,
    '{}',
    17,
    0,
    '{"Red Secret", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{"PEOPLE_OF_THE_DREAM_KEEPER", "PEOPLE_OF_THE_LANTERN", "PEOPLE_OF_THE_STARS"}',
    '{"Challenger At the Gates"}',
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    9
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - Braal & Nico"}',
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    21
  ),
  (
    '{"PEOPLE_OF_THE_SUN"}',
    '{"Nemesis Encounter - Braal, Nico & Seer"}',
    (
      select id
      from nemesis
      where monster_name = 'Red Witches'
        and not custom
    ),
    23
  );
------------------------------------------------------------------------------
-- Slenderman
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'Slenderman',
    false,
    'NN2',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    8,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{"Madness Inversion"}',
    11,
    0,
    '{"Ensnare", "Gloom"}'
  ),
  (
    15,
    8,
    6,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{"Madness Inversion"}',
    13,
    0,
    '{"Ensnare", "Gloom"}'
  ),
  (
    20,
    10,
    8,
    2,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    3,
    null,
    0,
    1,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{"Madness Inversion"}',
    17,
    0,
    '{"Ensnare", "Gloom", "Hounds", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"It''s Already Here"}',
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    6
  ),
  (
    '{}',
    '{"Nemesis Encounter - Slenderman Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    9
  ),
  (
    '{}',
    '{"Nemesis Encounter - Slenderman Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    19
  ),
  (
    '{}',
    '{"Nemesis Encounter - Slenderman Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'Slenderman'
        and not custom
    ),
    28
  );
------------------------------------------------------------------------------
-- The Great Devourer (Sunstalker)
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'The Great Devourer (Sunstalker)',
    false,
    'CO',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    20,
    12,
    6,
    2,
    0,
    0,
    1,
    2,
    0,
    0,
    0,
    3,
    null,
    0,
    2,
    '{}',
    16,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Great Devourer (Sunstalker)'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{}',
    18,
    0,
    '{"Light & Shadow", "Living Shadows", "Monochrome", "Shade", "Shadows of Darkness", "Solar Energy", "Sun Dial", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Nemesis Encounter - The Great Devourer"}',
    (
      select id
      from nemesis
      where monster_name = 'The Great Devourer (Sunstalker)'
        and not custom
    ),
    25
  );
------------------------------------------------------------------------------
-- The Tyrant
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (
    false,
    'The Tyrant',
    false,
    'CO',
    null
  );
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    11,
    6,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    null,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Tyrant'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{"Crooked Step", "Destiny''s Marrow", "Spectral Blast"}'
  ),
  (
    14,
    8,
    6,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Tyrant'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Crooked Step", "Destiny''s Marrow", "Quickened", "Spectral Blast"}'
  ),
  (
    22,
    12,
    8,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    null,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from nemesis
      where monster_name = 'The Tyrant'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    '{}',
    14,
    0,
    '{"Crooked Step", "Destiny''s Marrow", "Quickened", "Spectral Blast", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Nemesis Encounter - Tyrant Lvl 1"}',
    (
      select id
      from nemesis
      where monster_name = 'The Tyrant'
        and not custom
    ),
    4
  ),
  (
    '{}',
    '{"Nemesis Encounter - Tyrant Lvl 2"}',
    (
      select id
      from nemesis
      where monster_name = 'The Tyrant'
        and not custom
    ),
    9
  ),
  (
    '{}',
    '{"Nemesis Encounter - Tyrant Lvl 3"}',
    (
      select id
      from nemesis
      where monster_name = 'The Tyrant'
        and not custom
    ),
    19
  );
------------------------------------------------------------------------------
-- Watcher
------------------------------------------------------------------------------
insert into nemesis (
    custom,
    monster_name,
    multi_monster,
    node,
    vignette_id
  )
values (false, 'Watcher', false, 'CO', null);
insert into nemesis_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    level_number,
    life,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    15,
    0,
    0,
    '{}',
    -1,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Watcher'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    '{"Retinue"}',
    0,
    0,
    '{"Audience", "Lantern Vortex", "Vapor of Nothingness", "Indomitable"}'
  );
insert into nemesis_timeline_year (campaigns, entries, nemesis_id, year_number)
values (
    '{}',
    '{"Watched"}',
    (
      select id
      from nemesis
      where monster_name = 'Watcher'
        and not custom
    ),
    20
  ),
  (
    '{}',
    '{"Nemesis Encounter - Watcher"}',
    (
      select id
      from nemesis
      where monster_name = 'Watcher'
        and not custom
    ),
    25
  );
------------------------------------------------------------------------------
-- Bullfrogdog
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Bullfrogdog', false, 'NQ1', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Bullfrogdog'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    23,
    9,
    7,
    2,
    5,
    0,
    2,
    2,
    0,
    0,
    0,
    11,
    3,
    0,
    1,
    '{"Indigestion"}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Bullfrogdog'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    17,
    0,
    '{"Bullish Charge", "Double Sphincter", "Foul Stench", "Gaseous Bloat", "Mature", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    (
      select id
      from quarry
      where monster_name = 'Bullfrogdog'
        and not custom
    )
  );
------------------------------------------------------------------------------
-- Screaming Nukalope
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Screaming Nukalope', false, 'NQ2', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Screaming Nukalope'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    16,
    9,
    7,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    9,
    2,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming Nukalope'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Atomic Vigor - Inert", "Critical Mass - Inert", "Prehensile Tail - Inert"}'
  ),
  (
    22,
    12,
    8,
    2,
    0,
    0,
    1,
    1,
    0,
    0,
    2,
    11,
    3,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming Nukalope'
        and not custom
    ),
    null,
    3,
    0,
    0,
    0,
    0,
    '{}',
    12,
    0,
    '{"Atomic Vigor - Inert", "Critical Mass - Inert", "Exponential Yield", "Legendary Horns", "Prehensile Tail - Inert", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    ),
    (
      select id
      from quarry
      where monster_name = 'Screaming Nukalope'
        and not custom
    )
  );
------------------------------------------------------------------------------
-- White Gigalion
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'White Gigalion', false, 'NQ1', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'BASIC',
    'BASIC',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'White Gigalion'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    15,
    10,
    5,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'White Gigalion'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Giga Claws", "Smart Cat", "Vicious"}'
  ),
  (
    20,
    11,
    8,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    8,
    3,
    0,
    1,
    '{}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'White Gigalion'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    16,
    0,
    '{"Giga Claws", "Golden Eyes", "Merciless", "Smart Cat", "Vicious", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Giga Catarium'
        and not custom
    ),
    (
      select id
      from quarry
      where monster_name = 'White Gigalion'
        and not custom
    )
  );
------------------------------------------------------------------------------
-- Crimson Crocodile
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Crimson Crocodile', false, 'NQ1', true);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    7,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    1,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    7,
    0,
    '{"Adrenal Adept", "Enchanted Flesh", "Immortal Presence"}'
  ),
  (
    15,
    9,
    5,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    9,
    0,
    '{"Adrenal Adept", "Blood Soaked", "Enchanted Flesh", "Immortal Presence"}'
  ),
  (
    20,
    12,
    6,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    11,
    3,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    15,
    0,
    '{"Adrenal Adept", "Blood Secret", "Blood Soaked", "Enchanted Flesh", "Immortal Presence", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    )
  );
insert into quarry_collective_cognition_reward (
    collective_cognition_reward_id,
    quarry_id
  )
values (
    (
      select id
      from collective_cognition_reward
      where reward_name = 'Crimson Crocodile Cuisine'
        and not custom
    ),
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Crimson Crocodile"}',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    0
  );
------------------------------------------------------------------------------
-- Dragon King
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Dragon King', false, 'NQ3', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'MONSTER',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    8,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    13,
    0,
    '{"Irradiate", "Unseen Agony"}'
  ),
  (
    16,
    8,
    7,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    15,
    0,
    '{"Irradiate", "Unseen Agony"}'
  ),
  (
    19,
    9,
    8,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    3,
    0,
    1,
    '{}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    17,
    0,
    '{"Irradiate", "Smolder", "Unseen Agony", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Dragon Armory'
    ),
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Glowing Crater"}',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    8
  );
------------------------------------------------------------------------------
-- Dung Beetle Knight
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Dung Beetle Knight', false, 'NQ4', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    7,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    12,
    0,
    '{"Baller", "Power Forward", "Prepared Tunnels", "Separation Anxiety"}'
  ),
  (
    14,
    7,
    6,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    14,
    0,
    '{"Baller", "Heavy Load", "Power Forward", "Prepared Tunnels", "Separation Anxiety"}'
  ),
  (
    19,
    8,
    9,
    2,
    0,
    0,
    1,
    2,
    0,
    0,
    1,
    0,
    3,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    18,
    0,
    '{"Burrow", "Baller", "Heavy Load", "Power Forward", "Prepared Tunnels", "Separation Anxiety", "Indomitable"}'
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Rumbling in the Dark"}',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    8
  );
------------------------------------------------------------------------------
-- Flower Knight
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Flower Knight', false, 'NQ2', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'BASIC',
    'BASIC',
    'BASIC',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'MONSTER',
    'MONSTER',
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    11,
    7,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    2,
    '{}',
    6,
    0,
    '{"Bloom", "Set Roots"}'
  ),
  (
    13,
    8,
    4,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    1,
    '{}',
    8,
    0,
    '{"Bloom", "Razor Bulbs", "Set Roots"}'
  ),
  (
    16,
    9,
    5,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    3,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Bloom", "Heart of the Woods", "Perfect Aim", "Razor Bulbs", "Set Roots", "Indomitable"}'
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"A Crone''s Tale"}',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    5
  );
------------------------------------------------------------------------------
-- Frogdog
------------------------------------------------------------------------------
insert into quarry (
    alternate_id,
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (
    (
      select id
      from quarry
      where monster_name = 'Bullfrogdog'
        and not custom
    ),
    false,
    'Frogdog',
    false,
    'NQ1',
    true
  );
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    8,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{"Double Sphincter", "Foul Stench", "Gaseous Bloat", "Leap"}'
  ),
  (
    14,
    8,
    6,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Double Sphincter", "Foul Stench", "Gaseous Bloat", "Leap", "Mature"}'
  ),
  (
    19,
    9,
    8,
    2,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    0,
    3,
    0,
    0,
    '{"Indigestion"}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    17,
    0,
    '{"Double Sphincter", "Foul Stench", "Gaseous Bloat", "Leap", "Mature", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Froskrafter'
    ),
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Devour the White Lion"}',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    0
  );
------------------------------------------------------------------------------
-- Gorm
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Gorm', false, 'NQ1', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    8,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{}'
  ),
  (
    14,
    9,
    5,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    11,
    0,
    '{"Gorm''s Den", "Musth"}'
  ),
  (
    20,
    10,
    8,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    3,
    0,
    1,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    15,
    0,
    '{"Ancient Tusks", "Gormyard", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Gormchymist'
    ),
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    )
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Gormery'
    ),
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"The Approaching Storm"}',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    1
  );
------------------------------------------------------------------------------
-- King
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'King', false, 'NQ4', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    19,
    8,
    8,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    7,
    1,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    19,
    0,
    '{"Audio Synthesis", "Current", "Ghost Geometry", "King''s New Clothes"}'
  ),
  (
    22,
    8,
    8,
    6,
    0,
    0,
    1,
    1,
    0,
    0,
    0,
    9,
    2,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    22,
    0,
    '{"Audio Synthesis", "Current", "Ghost Geometry", "Half Power", "King''s New Clothes"}'
  ),
  (
    27,
    8,
    12,
    7,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    11,
    3,
    0,
    0,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    25,
    0,
    '{"Audio Synthesis", "Current", "Full Power", "Ghost Geometry", "King''s New Clothes", "King''s Presence", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Kingsmith'
    ),
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    )
  );
insert into quarry_collective_cognition_reward (
    collective_cognition_reward_id,
    quarry_id
  )
values (
    (
      select id
      from collective_cognition_reward
      where reward_name = 'King Cuisine'
    ),
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"The Awaited"}',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    22
  );
------------------------------------------------------------------------------
-- Lion God
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Lion God', false, 'NQ4', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Lion God'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    15,
    7,
    7,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Lion God'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    14,
    0,
    '{"Heft", "Hollow Earth", "Whiplash"}'
  ),
  (
    20,
    11,
    8,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    1,
    '{}',
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Lion God'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    16,
    0,
    '{"Divine Prowess", "Heft", "Hollow Earth", "Whiplash"}'
  ),
  (
    25,
    14,
    9,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    1,
    0,
    3,
    0,
    2,
    '{}',
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Lion God'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    21,
    0,
    '{"Divine Prowess", "Heft", "Hollow Earth", "Immaculate Intuition", "Whiplash", "Indomitable"}'
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"The Silver City"}',
    (
      select id
      from quarry
      where monster_name = 'Lion God'
        and not custom
    ),
    13
  );
------------------------------------------------------------------------------
-- Phoenix
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Phoenix', false, 'NQ3', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    8,
    3,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    1,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{"Dreaded Decade"}',
    10,
    0,
    '{"Materialize", "Spiral Age", "Zeal"}'
  ),
  (
    17,
    10,
    6,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{"Dreaded Decade"}',
    12,
    0,
    '{"Materialize", "Spiral Age", "Top of the Food Chain", "Zeal"}'
  ),
  (
    22,
    13,
    7,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    11,
    3,
    0,
    2,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{"Dreaded Decade"}',
    17,
    0,
    '{"Materialize", "Spiral Age", "Top of the Food Chain", "Zeal", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Plumery'
    ),
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    )
  );
insert into quarry_collective_cognition_reward (
    collective_cognition_reward_id,
    quarry_id
  )
values (
    (
      select id
      from collective_cognition_reward
      where reward_name = 'Phoenix Cuisine'
    ),
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Phoenix Feather"}',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    7
  );
------------------------------------------------------------------------------
-- Screaming Antelope
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue,
    vignette_id
  )
values (
    false,
    'Screaming Antelope',
    false,
    'NQ2',
    false,
    (
      select id
      from quarry
      where monster_name = 'Screaming Nukalope'
        and not custom
    )
  );
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    7,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    1,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{"Trample"}'
  ),
  (
    15,
    10,
    5,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Diabolical", "Trample"}'
  ),
  (
    22,
    12,
    8,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    1,
    10,
    3,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    12,
    0,
    '{"Diabolical", "Hypermetabolism", "Legendary Horns", "Trample", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Stone Circle'
    ),
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    )
  );
insert into quarry_collective_cognition_reward (
    collective_cognition_reward_id,
    quarry_id
  )
values (
    (
      select id
      from collective_cognition_reward
      where reward_name = 'Screaming Antelope Cuisine'
    ),
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Endless Screams"}',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    2
  );
------------------------------------------------------------------------------
-- Smog Singers
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Smog Singers', false, 'NQ2', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    12,
    8,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    1,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{"Bloody Hands"}',
    7,
    0,
    '{"Performing Artists", "Song Cards", "Vibration Damage"}'
  ),
  (
    17,
    8,
    4,
    1,
    4,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{"Bloody Hands"}',
    9,
    0,
    '{"Overtone Singing", "Performing Artists", "Song Cards", "Vibration Damage"}'
  ),
  (
    25,
    9,
    6,
    2,
    8,
    0,
    0,
    2,
    0,
    0,
    0,
    10,
    3,
    0,
    0,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{"Bloody Hands"}',
    12,
    0,
    '{"Overtone Singing", "Performing Artists", "Singing Whale", "Song Cards", "Vibration Damage", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Chorusseum'
    ),
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    )
  );
insert into quarry_collective_cognition_reward (
    collective_cognition_reward_id,
    quarry_id
  )
values (
    (
      select id
      from collective_cognition_reward
      where reward_name = 'Smog Singer Cuisine'
    ),
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Death of Song"}',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    2
  );
------------------------------------------------------------------------------
-- Spidicules
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Spidicules', false, 'NQ2', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    9,
    5,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{"Frantic Spinning"}',
    11,
    0,
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{"Spawn", "Spiderling Action", "Twitching Leg Pile"}'
  ),
  (
    13,
    8,
    5,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{"Feeding Time"}',
    14,
    0,
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Hivemind", "Spiderling Action", "Spawn", "Twitching Leg Pile"}'
  ),
  (
    21,
    12,
    7,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    3,
    0,
    0,
    '{"Necrotoxins"}',
    16,
    0,
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    12,
    0,
    '{"10,000 Teeth", "Hivemind", "Spawn", "Spiderling Action", "Twitching Leg Pile", "Indomitable"}'
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Young Rivals"}',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    2
  );
------------------------------------------------------------------------------
-- Sunstalker
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue
  )
values (false, 'Sunstalker', false, 'NQ3', false);
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    7,
    2,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    '{}',
    16,
    0,
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Light & Shadow", "Shade", "Shadows of Darkness", "Solar Energy", "Sun Dial"}'
  ),
  (
    15,
    9,
    5,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    '{}',
    16,
    0,
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    12,
    0,
    '{"Light & Shadow", "Living Shadows", "Shade", "Shadows of Darkness", "Solar Energy", "Sun Dial"}'
  ),
  (
    20,
    12,
    6,
    2,
    0,
    0,
    1,
    2,
    0,
    0,
    0,
    0,
    3,
    0,
    1,
    '{}',
    16,
    0,
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    16,
    0,
    '{"Light & Shadow", "Living Shadows", "Monochrome", "Shade", "Shadows of Darkness", "Solar Energy", "Sun Dial", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
    ),
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"Promise Under the Sun"}',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    8
  );
------------------------------------------------------------------------------
-- White Lion
------------------------------------------------------------------------------
insert into quarry (
    custom,
    monster_name,
    multi_monster,
    node,
    prologue,
    vignette_id
  )
values (
    false,
    'White Lion',
    false,
    'NQ1',
    true,
    (
      select id
      from quarry
      where monster_name = 'White Gigalion'
        and not custom
    )
  );
insert into quarry_hunt_board (
    pos_1,
    pos_2,
    pos_3,
    pos_4,
    pos_5,
    pos_7,
    pos_8,
    pos_9,
    pos_10,
    pos_11,
    quarry_id
  )
values (
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    )
  );
insert into quarry_level (
    ai_deck_remaining,
    basic_cards,
    advanced_cards,
    legendary_cards,
    overtone_cards,
    accuracy,
    accuracy_tokens,
    damage,
    damage_tokens,
    evasion,
    evasion_tokens,
    hunt_pos,
    level_number,
    luck,
    luck_tokens,
    moods,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    survivor_hunt_pos,
    survivor_statuses,
    toughness,
    toughness_tokens,
    traits
  )
values (
    10,
    7,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    1,
    0,
    0,
    '{}',
    6,
    0,
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    '{}',
    8,
    0,
    '{}'
  ),
  (
    15,
    10,
    5,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    '{}',
    7,
    0,
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    '{}',
    10,
    0,
    '{"Cunning"}'
  ),
  (
    21,
    10,
    9,
    2,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    10,
    3,
    0,
    1,
    '{}',
    8,
    0,
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    null,
    2,
    0,
    0,
    0,
    0,
    '{}',
    14,
    0,
    '{"Cunning", "Merciless", "Indomitable"}'
  );
insert into quarry_location (location_id, quarry_id)
values (
    (
      select id
      from location
      where location_name = 'Catarium'
    ),
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    )
  );
insert into quarry_collective_cognition_reward (
    collective_cognition_reward_id,
    quarry_id
  )
values (
    (
      select id
      from collective_cognition_reward
      where reward_name = 'White Lion Cuisine'
    ),
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    )
  );
insert into quarry_timeline_year (campaigns, entries, quarry_id, year_number)
values (
    '{}',
    '{"White Lion"}',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    0
  );