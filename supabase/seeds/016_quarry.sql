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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      17,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      11,
      0
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
      12,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      10,
      0
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
      16,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      7,
      0
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
      9,
      0
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
      15,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      13,
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
      0,
      2,
      0,
      0,
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
      15,
      0
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
      17,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      12,
      0
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
      14,
      0
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
      18,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      6,
      0
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
      8,
      0
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
      11,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      0,
      2,
      0,
      0,
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
      11,
      0
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
      17,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      8,
      0
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
      11,
      0
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
      15,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      19,
      0
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
      22,
      0
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
      25,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      14,
      0
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
      16,
      0
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
      21,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      10,
      0
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
      12,
      0
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
      17,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      8,
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
      8,
      2,
      0,
      0,
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
      1,
      10,
      3,
      0,
      0,
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
      12,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      7,
      0
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
      9,
      0
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
      12,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
      where reward_name = 'Smog Singers Cuisine'
    ),
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    )
  );
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      8,
      0
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
      10,
      0
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
      12,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      10,
      0
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
      12,
      0
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
      16,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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
with quarry_level_source (
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
  movement,
  movement_tokens,
  quarry_id,
  sub_monster_name,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  survivor_hunt_pos,
  toughness,
  toughness_tokens
) as (
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
      8,
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
      8,
      2,
      0,
      0,
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
      10,
      0
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
      14,
      0
    )
),
inserted_quarry_levels as (
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
      level_number,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      quarry_id,
      sub_monster_name,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens
    )
  select ai_deck_remaining,
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
    luck,
    luck_tokens,
    movement,
    movement_tokens,
    quarry_id,
    sub_monster_name,
    speed,
    speed_tokens,
    strength,
    strength_tokens,
    toughness,
    toughness_tokens
  from quarry_level_source
)
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select distinct on (quarry_id, level_number) quarry_id,
  level_number,
  hunt_pos,
  survivor_hunt_pos
from quarry_level_source
order by quarry_id,
  level_number;
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
insert into quarry_timeline_year (campaign_types, entries, quarry_id, year_number)
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