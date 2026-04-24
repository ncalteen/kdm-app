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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    13,
    0
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
    16,
    0
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    11,
    0
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
    14,
    0
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
    19,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    10,
    4
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
    10,
    6
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
    10,
    8
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    9,
    0
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
    12,
    0
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
    15,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    17,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    20,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    30,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    27,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    14,
    0
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
    15,
    0
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
    30,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    12,
    0
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
    15,
    0
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
    18,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    10,
    0
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
    12,
    0
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
    15,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    10,
    0
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
    13,
    0
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
    17,
    0
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    8,
    0
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
    11,
    0
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
    11,
    0
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
    13,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    10,
    0
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
    13,
    0
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
    17,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    11,
    0
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
    11,
    0
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
    13,
    0
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
    11,
    0
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
    13,
    0
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
    17,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    11,
    0
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
    13,
    0
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
    17,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    18,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    8,
    0
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
    10,
    0
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
    14,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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
    movement,
    movement_tokens,
    nemesis_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
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
    0,
    0
  );
insert into nemesis_timeline_year (campaign_types, entries, nemesis_id, year_number)
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