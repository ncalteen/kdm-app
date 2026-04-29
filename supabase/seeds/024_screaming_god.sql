--------------------------------------------------------------------------------
-- Screaming God Content
--------------------------------------------------------------------------------
-- Location must be created first so subsequent gear/quarry_location lookups
-- can resolve 'Great Hall'.
insert into location (location_name)
values ('Great Hall');
--
insert into quarry (monster_name, node, prologue)
values ('Screaming God', 'NQ4', false);
insert into nemesis (monster_name, node)
values ('Parasite Queen', 'FI');
--
insert into quarry_hunt_board (quarry_id, pos_1, pos_2, pos_3, pos_4, pos_5, pos_7, pos_8, pos_9, pos_10, pos_11)
values (
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    'MONSTER',
    'BASIC',
    'MONSTER',
    'BASIC',
    'MONSTER',
    'MONSTER',
    'MONSTER',
    'BASIC',
    'BASIC',
    'BASIC'
  );
--
insert into quarry_hunt_board_position (level_number, monster_hunt_pos, survivor_hunt_pos, quarry_id)
values (
    1,
    9,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    )
  ),
  (
    2,
    10,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    )
  ),
  (
    3,
    11,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    )
  );
--
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
values (
    17,
    12,
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
    0,
    0,
    -1,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    0,
    0,
    0,
    0,
    0,
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
    1,
    0,
    0,
    0,
    2,
    0,
    1,
    -1,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    0,
    0,
    0,
    0,
    0,
    0
  ),
  (
    28,
    14,
    10,
    4,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    2,
    -1,
    0,
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    1,
    0,
    0,
    0,
    0,
    0
  );
--
insert into mood (mood_name)
values ('Weight of Numen'),
  ('Incendiary Breath'),
  ('Aleatoric Melody');
insert into trait (trait_name)
values ('Withering Blast'),
  ('Stampede'),
  ('Pressure Burst'),
  ('Grasping Undermaw'),
  ('Anabolic Resurrection'),
  ('Fatal Blaze'),
  ('Endless Horizon');
insert into survivor_status (survivor_status_name)
values ('Devoured');
--
insert into quarry_level_trait (quarry_level_id, trait_id)
values (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Endless Horizon'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Withering Blast'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Stampede'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Grasping Undermaw'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 2
    ),
    (
      select id
      from trait
      where trait_name = 'Endless Horizon'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 2
    ),
    (
      select id
      from trait
      where trait_name = 'Withering Blast'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 2
    ),
    (
      select id
      from trait
      where trait_name = 'Stampede'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 2
    ),
    (
      select id
      from trait
      where trait_name = 'Grasping Undermaw'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 2
    ),
    (
      select id
      from trait
      where trait_name = 'Pressure Burst'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Endless Horizon'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Withering Blast'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Stampede'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Grasping Undermaw'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Pressure Burst'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Fatal Blaze'
    )
  ),
  (
    (
      select id
      from quarry_level
      where quarry_id = (
          select id
          from quarry
          where monster_name = 'Screaming God'
        )
        and level_number = 3
    ),
    (
      select id
      from trait
      where trait_name = 'Indomitable'
    )
  );
insert into quarry_location (quarry_id, location_id)
values (
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    (
      select id
      from location
      where location_name = 'Great Hall'
    )
  );
--
insert into quarry_timeline_year (campaign_types, quarry_id, entries, year_number)
values (
    '{}',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    '{"The Outcast"}',
    3
  );
insert into nemesis_timeline_year (campaign_types, nemesis_id, entries, year_number)
values (
    '{}',
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    '{"Creeping Longing"}',
    15
  ),
  (
    '{}',
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    '{"The Beckoning"}',
    30
  );
--
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
    24,
    6,
    6,
    12,
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
    10,
    0,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    null,
    0,
    0,
    0,
    0,
    25,
    0
  );
--
insert into mood (mood_name)
values ('Behavioral Mandate'),
  ('Blastogenesis');
insert into trait (trait_name)
values ('Manifold Horrors'),
  ('Melody of Heroes'),
  ('Omnipresence'),
  ('Renegade Flesh');
insert into survivor_status (survivor_status_name)
values ('Flash of Rebellion');
--
insert into nemesis_level_trait (nemesis_level_id, trait_id)
values (
    (
      select id
      from nemesis_level
      where nemesis_id = (
          select id
          from nemesis
          where monster_name = 'Parasite Queen'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Omnipresence'
    )
  ),
  (
    (
      select id
      from nemesis_level
      where nemesis_id = (
          select id
          from nemesis
          where monster_name = 'Parasite Queen'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Renegade Flesh'
    )
  ),
  (
    (
      select id
      from nemesis_level
      where nemesis_id = (
          select id
          from nemesis
          where monster_name = 'Parasite Queen'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Manifold Horrors'
    )
  ),
  (
    (
      select id
      from nemesis_level
      where nemesis_id = (
          select id
          from nemesis
          where monster_name = 'Parasite Queen'
        )
        and level_number = 1
    ),
    (
      select id
      from trait
      where trait_name = 'Melody of Heroes'
    )
  );
--
insert into knowledge (knowledge_name)
values ('Packleader I'),
  ('Packleader II'),
  ('Packleader III');
--
insert into collective_cognition_reward (collective_cognition, reward_name)
values (36, 'Screaming God Cuisine');
insert into quarry_collective_cognition_reward (quarry_id, collective_cognition_reward_id)
values (
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    (
      select id
      from collective_cognition_reward
      where reward_name = 'Screaming God Cuisine'
    )
  );
-- Gear
insert into gear (
    gear_name,
    location_id,
    armor_location,
    weapon_type_id
  )
values ('Lemniscate Vestments', null, 'CHEST', null),
  ('Lemniscate Mitre', null, 'HEAD', null),
  (
    'Lemniscate Crozier',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Lantern'
    )
  ),
  (
    'Screaming God Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
    ),
    null,
    null
  ),
  (
    'Vein Needle',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  (
    'Vandal Spatha',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Vandal Sledge',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Vandal Pike',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Vandal Claymore',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Vandal Broadaxe',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Trophy Taker',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Musk Diadema',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    null
  ),
  (
    'Meteor Unguis',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Godspeed Lantern',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    null,
    null
  ),
  (
    'Alpha Greaves',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    'FEET',
    null
  ),
  (
    'Alpha Greatchest',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    'CHEST',
    null
  ),
  (
    'Alpha Gauntlets',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    'ARMS',
    null
  ),
  (
    'Alpha Gambeston',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    'WAIST',
    null
  ),
  (
    'Alpha Galea',
    (
      select id
      from location
      where location_name = 'Great Hall'
    ),
    'HEAD',
    null
  ),
  ------------------------------------------------------------------------------
  -- Meal Gear
  ------------------------------------------------------------------------------
  (
    'Ceaseless God Grog',
    null,
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Pattern Gear
  ------------------------------------------------------------------------------
  (
    'Vandal Recurve Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  );
--------------------------------------------------------------------------------
-- Pattern
--------------------------------------------------------------------------------
insert into pattern (pattern_name, crafted_gear_id)
values (
    'Vandal Recurve Bow',
    (
      select id
      from gear
      where gear_name = 'Vandal Recurve Bow'
    )
  );
--------------------------------------------------------------------------------
-- Armor Set
--------------------------------------------------------------------------------
insert into armor_set (armor_set_name)
values ('Alpha Armor');
insert into armor_set_slot (armor_set_id, slot_name, slot_order, required)
values (
    (
      select id
      from armor_set
      where armor_set_name = 'Alpha Armor'
    ),
    'HEAD',
    1,
    true
  ),
  (
    (
      select id
      from armor_set
      where armor_set_name = 'Alpha Armor'
    ),
    'CHEST',
    2,
    true
  ),
  (
    (
      select id
      from armor_set
      where armor_set_name = 'Alpha Armor'
    ),
    'ARMS',
    3,
    true
  ),
  (
    (
      select id
      from armor_set
      where armor_set_name = 'Alpha Armor'
    ),
    'WAIST',
    4,
    true
  ),
  (
    (
      select id
      from armor_set
      where armor_set_name = 'Alpha Armor'
    ),
    'FEET',
    5,
    true
  );
insert into armor_set_slot_gear (armor_set_slot_id, gear_id)
values (
    (
      select id
      from armor_set_slot
      where armor_set_slot.slot_name = 'HEAD'
        and armor_set_slot.armor_set_id = (
          select id
          from armor_set
          where armor_set_name = 'Alpha Armor'
        )
    ),
    (
      select id
      from gear
      where gear_name = 'Alpha Galea'
    )
  ),
  (
    (
      select id
      from armor_set_slot
      where armor_set_slot.slot_name = 'WAIST'
        and armor_set_slot.armor_set_id = (
          select id
          from armor_set
          where armor_set_name = 'Alpha Armor'
        )
    ),
    (
      select id
      from gear
      where gear_name = 'Alpha Gambeston'
    )
  ),
  (
    (
      select id
      from armor_set_slot
      where armor_set_slot.slot_name = 'ARMS'
        and armor_set_slot.armor_set_id = (
          select id
          from armor_set
          where armor_set_name = 'Alpha Armor'
        )
    ),
    (
      select id
      from gear
      where gear_name = 'Alpha Gauntlets'
    )
  ),
  (
    (
      select id
      from armor_set_slot
      where armor_set_slot.slot_name = 'FEET'
        and armor_set_slot.armor_set_id = (
          select id
          from armor_set
          where armor_set_name = 'Alpha Armor'
        )
    ),
    (
      select id
      from gear
      where gear_name = 'Alpha Greaves'
    )
  ),
  (
    (
      select id
      from armor_set_slot
      where armor_set_slot.slot_name = 'CHEST'
        and armor_set_slot.armor_set_id = (
          select id
          from armor_set
          where armor_set_name = 'Alpha Armor'
        )
    ),
    (
      select id
      from gear
      where gear_name = 'Alpha Greatchest'
    )
  );
--------------------------------------------------------------------------------
-- Secret Fighting Arts
--------------------------------------------------------------------------------
insert into secret_fighting_art (secret_fighting_art_name)
values ('Terminal Velocity');
--------------------------------------------------------------------------------
-- Fighting Arts
--------------------------------------------------------------------------------
insert into fighting_art (fighting_art_name)
values ('Thermoregulator'),
  ('Parkour'),
  ('Drifting Turn');
--------------------------------------------------------------------------------
-- Strain Milestones
--------------------------------------------------------------------------------
insert into strain_milestone (strain_milestone_name)
values ('Terminal Exertion');
--------------------------------------------------------------------------------
-- Innovations
--------------------------------------------------------------------------------
insert into innovation (innovation_name)
values ('Manus Infestation'),
  ('Taxidermy');
--------------------------------------------------------------------------------
-- Disorders
--------------------------------------------------------------------------------
insert into disorder (disorder_name)
values ('Runner''s Dystonia'),
  ('Gerascophobia'),
  ('Dystychiphobia'),
  ('Xenomelia');
--------------------------------------------------------------------------------
-- Resources
-- Note: the 'PARASITE' resource_type value and resource.nemesis_id column are
-- defined in migration 20260428000000_resource_nemesis_id_and_parasite_type.
--------------------------------------------------------------------------------
insert into resource (
    category,
    quarry_id,
    nemesis_id,
    resource_name,
    resource_types,
    pattern_id
  )
values (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Sympathetic Sternum',
    '{PARASITE, BONE}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Squirming Barnacle',
    '{PARASITE, HIDE}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Seizing Calcaneal',
    '{PARASITE, ORGAN}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Lingua Louse',
    '{PARASITE, HIDE}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Guilt Whipworm',
    '{PARASITE, ORGAN}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Fidgeting Oculus',
    '{PARASITE, ORGAN}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Excruciator Braincap',
    '{PARASITE, ORGAN}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Enteric Gigas',
    '{PARASITE, ORGAN}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Enraptured Crus',
    '{PARASITE, HIDE}',
    null
  ),
  (
    'MONSTER',
    null,
    (
      select id
      from nemesis
      where monster_name = 'Parasite Queen'
    ),
    'Duplicitous Manus',
    '{PARASITE, HIDE}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Spiral Ribteeth',
    '{INDOMITABLE, PERFECT, BONE}',
    (
      select id
      from pattern
      where pattern_name = 'Vandal Recurve Bow'
    )
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Ancient Beacon',
    '{IRON}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Calcified Cataract',
    '{BONE, ORGAN}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Eroded Hide',
    '{HIDE}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Glycol Coolant',
    '{ORGAN, CONSUMABLE}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Grandsire Antler',
    '{BONE, PERFECT}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Lantern Imago',
    '{PARASITE, CONSUMABLE}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Patchy Hide',
    '{HIDE}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Pyritized Splinters',
    '{BONE, IRON}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Sculpted Slab',
    '{STONE}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Smoldering Molars',
    '{BONE, IRON}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Tempered Hooves',
    '{IRON}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Ungulate Digits',
    '{BONE, SCRAP}',
    null
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming God'
    ),
    null,
    'Winding Stomach',
    '{ORGAN}',
    null
  ),
  (
    'STRANGE',
    null,
    null,
    'Wayward Whiskers',
    '{HIDE, CONSUMABLE}',
    null
  );
--------------------------------------------------------------------------------
-- Forge Priest Content
--------------------------------------------------------------------------------
insert into gear (
    gear_name,
    location_id,
    armor_location,
    weapon_type_id
  )
values (
    'Forge Priest Hammer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  );
--------------------------------------------------------------------------------
-- Lion Knight Scholar Content
--------------------------------------------------------------------------------
insert into gear (
    gear_name,
    location_id,
    armor_location,
    weapon_type_id
  )
values (
    'Thespian Scimitar',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scimitar'
    )
  );
insert into trait (trait_name)
values ('Lion Knight Scholar');