--------------------------------------------------------------------------------
-- Gear
--------------------------------------------------------------------------------
insert into gear (
    gear_name,
    location_id,
    armor_location,
    weapon_type_id
  )
values -------------------------------------------------------------------------
  -- Other Gear
  ------------------------------------------------------------------------------
  ('Imitation Butcher Helm', null, 'HEAD', null),
  ('Tabard', null, 'WAIST', null),
  ('White Dragon Gauntlets', null, 'ARMS', null),
  ------------------------------------------------------------------------------
  -- Beta Gear
  ------------------------------------------------------------------------------
  ('Acanthus Underwear', null, 'CHEST', null),
  ('Belt of Gender Swap', null, null, null),
  ('Bitter Beastcloak', null, 'CHEST', null),
  ('Cloth Leggings', null, null, null),
  ('Detective Cap', null, 'HEAD', null),
  (
    'Fetorsaurus',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  ('Furnace Lantern', null, null, null),
  (
    'Gilded Greatcleaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Gloom Cowl', null, 'HEAD', null),
  ('Green Boots', null, 'FEET', null),
  ('Green Faulds', null, 'WAIST', null),
  ('Green Gloves', null, 'ARMS', null),
  ('Green Helm', null, 'HEAD', null),
  ('Green Plate', null, 'CHEST', null),
  (
    'Griswaldo',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Hard Breastplate', null, 'CHEST', null),
  ('Hysteria Powder', null, null, null),
  ('Lagabond Hoppers', null, 'FEET', null),
  (
    'Lagabond Nails',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Obligate Gallant Blade',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Obligate Gallant Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Osseous Scrap Blade',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Pain Eater',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Serrated Greatcleaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Sighing Acanthus Hat', null, 'HEAD', null),
  ('Sighing Sarong', null, 'WAIST', null),
  ('Speaker Cult Pipe', null, null, null),
  (
    'Stonesmasher',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ('Thermal Wrappings', null, 'FEET', null),
  (
    'Twilight Revolver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Ranged'
    )
  ),
  ('White Sunlion Mask', null, 'HEAD', null),
  ('Woe Hachigane', null, 'HEAD', null),
  (
    'Woe Kusarigama',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  ------------------------------------------------------------------------------
  -- Dark Armory
  ------------------------------------------------------------------------------
  -- ('', (select id from location where location_name = 'Dark Armory' and not custom)),
  ------------------------------------------------------------------------------
  -- Barber Surgeon
  ------------------------------------------------------------------------------
  (
    'Almanac',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'Blue Charm',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'Bug Trap',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'First Aid Kit',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'Green Charm',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'Musk Bomb',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'Red Charm',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  (
    'Scavenger Kit',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Blacksmith
  ------------------------------------------------------------------------------
  (
    'Beacon Shield',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Dragon Slayer',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Lantern Cuirass',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Lantern Dagger',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Lantern Gauntlets',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Lantern Glaive',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Lantern Greaves',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Lantern Helm',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Lantern Mail',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Lantern Sword',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Perfect Slayer',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Polishing Lantern',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    null
  ),
  (
    'Ring Whip',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  (
    'Scrap Shield',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Wrought Greatshield',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Wrought Lantern Mantle',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Wrought Longbow',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Wrought Sledge',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Wrought Tachi',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  (
    'Wrought Twinspear',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  ------------------------------------------------------------------------------
  -- Bone Smith
  ------------------------------------------------------------------------------
  (
    'Bone Axe',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Bone Blade',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Bone Club',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Bone Dagger',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Bone Darts',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  (
    'Bone Pickaxe',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Pickaxe'
    )
  ),
  (
    'Bone Sickle',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sickle'
    )
  ),
  (
    'Skull Helm',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    ),
    'HEAD',
    null
  ),
  ------------------------------------------------------------------------------
  -- Catarium
  ------------------------------------------------------------------------------
  (
    'Cat Eye Circlet',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    null
  ),
  (
    'Cat Fang Knife',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Cat Gut Bow',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Claw Head Arrow',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  (
    'Dense Bone Arrows',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  (
    'Frenzy Drink',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    null
  ),
  (
    'Hooked Claw Knife',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'King Spear',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Lion Beast Katar',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Lion Headdress',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Lion Skin Cloak',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Oxidized Beast Katar',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'White Lion Boots',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'White Lion Coat',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'White Lion Gauntlet',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'White Lion Helm',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'White Lion Skirt',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Whisker Harp',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Lion Slayer Cape',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    ),
    'CHEST',
    null
  ),
  ------------------------------------------------------------------------------
  -- Chorusseum
  ------------------------------------------------------------------------------
  (
    'Energy Drum',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Hamflutter',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Harpy Harp',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Peace Dagger',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Pipa',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Razor Cymbals',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Singing Cap',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Singing Boots',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Singing Breastplate',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Singing Gloves',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Singing Heart',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    null
  ),
  (
    'Singing Pantaloons',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    'WAIST',
    NULL
  ),
  (
    'Spear of Life',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    NULL,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Spinning Sword',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ------------------------------------------------------------------------------
  -- Crimson Crockery
  ------------------------------------------------------------------------------
  (
    'Blood Compass Lantern',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Bloodglass Cleaver',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Bloodglass Dagger',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Bloodglass Katar',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Bloodglass Longsword',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Bloodglass Saw',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Saw'
    )
  ),
  (
    'Crimson Bow',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Crimson Dress',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Crimson Faulds',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Crimson Guard',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Crimson Helm',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Crimson Pearls',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Crimson Slippers',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Crocbone Hammer',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Crocodileyes',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Finger Darts',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  (
    'Giggling Scythe',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  ------------------------------------------------------------------------------
  -- Dragon Armory
  ------------------------------------------------------------------------------
  (
    'Blast Shield',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Blast Sword',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Blue Power Core',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    null
  ),
  (
    'Dragon Belt',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Dragon Bite Bolt',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  (
    'Dragon Boots',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Dragon Chakram',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  (
    'Dragon Gloves',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Dragon Mantle',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Dragonskull Helm',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Nuclear Knife',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Nuclear Scythe',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  (
    'Red Power Core',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    null
  ),
  (
    'Shielded Quiver',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    null
  ),
  (
    'Talon Knife',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  ------------------------------------------------------------------------------
  -- Exhausted Lantern Hoard
  ------------------------------------------------------------------------------
  (
    'Final Lantern',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    null
  ),
  (
    'Oxidized Beacon Shield',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Oxidized Lantern Dagger',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Oxidized Lantern Glaive',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Oxidized Lantern Helm',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Oxidized Lantern Sword',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Oxidized Ring Whip',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  (
    'Survivors'' Lantern',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Froskrafter
  ------------------------------------------------------------------------------
  (
    'Acid Bombs',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  (
    'Crest Axe',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Frogdog Boots',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Frogdog Mask',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Frogdog Sleeves',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Frogdog Suit',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Frogdog Vest',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Frogdoggles',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Frogwhistle',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Grappleclaw',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  (
    'Long Club',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Lure Lantern',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Spiked Buckler',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Turbo Tonic',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Vertabrayonet',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Vigor Capsule',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Gaming Gazebo
  ------------------------------------------------------------------------------
  (
    'Fortune Lantern Cuirass',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Fortune Lantern Dagger',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Fortune Lantern Helm',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Fortune Lantern Sword',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Gambler''s Lantern',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Gormery
  ------------------------------------------------------------------------------
  (
    'Acid-Tooth Dagger',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Armor Spikes',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Black Sword',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Gaxe',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Gorment Boots',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Gorment Mask',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Gorment Sleeves',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Gorment Suit',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Gorn',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Greater Gaxe',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Knuckle Shield',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Pulse Lantern',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Regeneration Suit',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Rib Blade',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Riot Mace',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ------------------------------------------------------------------------------
  -- Gormchymist
  ------------------------------------------------------------------------------
  (
    'Healing Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    ),
    null,
    null
  ),
  (
    'Life Elixir',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    ),
    null,
    null
  ),
  (
    'Power Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    ),
    null,
    null
  ),
  (
    'Steadfast Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    ),
    null,
    null
  ),
  (
    'Wisdom Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Kingsmith
  ------------------------------------------------------------------------------
  (
    'Adjudicator',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Assassinator',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Deathking Boots',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Deathking Gauntlets',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Deathking Greaves',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Deathking Helm',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Deathking Platemail',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Grand Kingslayer',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Kingslayer',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Royal Lantern',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    null
  ),
  (
    'Royal Medallion',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    null
  ),
  (
    'Royal Shield',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Usurper',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ------------------------------------------------------------------------------
  -- Leather Worker
  ------------------------------------------------------------------------------
  (
    'Hunter Whip',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  (
    'Leather Boots',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Leather Bracers',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Leather Cuirass',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Leather Mask',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Leather Skirt',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Round Leather Shield',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  ------------------------------------------------------------------------------
  -- Manhunter Gear
  ------------------------------------------------------------------------------
  ('Deathpact', null, null, null),
  ('Hunter''s Heart', null, null, null),
  ('Manhunter''s Hat', null, 'HEAD', null),
  (
    'Reverberating Lantern',
    null,
    null,
    null
  ),
  ('Tool Belt', null, null, null),
  ------------------------------------------------------------------------------
  -- Mask Maker
  ------------------------------------------------------------------------------
  (
    'Antelope Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Death Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'God Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Man Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Phoenix Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'White Lion Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    ),
    'HEAD',
    null
  ),
  ------------------------------------------------------------------------------
  -- Meal Gear
  ------------------------------------------------------------------------------
  (
    'Fatty Crimson Goulash',
    null,
    null,
    null
  ),
  ('Fetid Frog Tea', null, null, null),
  ('King Lantern Sausage', null, null, null),
  ('Smog Soup', null, null, null),
  ('Supreme Stew', null, null, null),
  ('Time Milk', null, null, null),
  ('White Lion Bread Box', null, null, null),
  ------------------------------------------------------------------------------
  -- Organ Grinder
  ------------------------------------------------------------------------------
  (
    'Dried Acanthus',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    ),
    null,
    null
  ),
  (
    'Fecal Salve',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    ),
    null,
    null
  ),
  (
    'Lucky Charm',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    ),
    null,
    null
  ),
  (
    'Monster Grease',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    ),
    null,
    null
  ),
  (
    'Monster Tooth Necklace',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    ),
    null,
    null
  ),
  (
    'Stone Noses',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Outskirts
  ------------------------------------------------------------------------------
  (
    'Blood Pack',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Crimson Crocodile Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Disguise Kit',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Frogdog Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Grimjaw',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Hunting Salve',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'King Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Phoenix Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Scout Whistle',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Scout''s Lantern',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Screaming Antelope Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Smog Singers Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  (
    'Stone Face Cloak',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Vermin Bellyboots',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'White Lion Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Pattern Gear
  ------------------------------------------------------------------------------
  ('Big Bite Costume', null, null, null),
  ('Binding Chain', null, null, null),
  (
    'Black Ghost Dagger',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Blood Drinker',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Bone Chibouk', null, null, null),
  (
    'Bow Scab',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Brazen Bat',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Bully Hammer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Colossal Chef''s Carver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Count Sandals', null, 'FEET', null),
  ('Count Tabard', null, 'WAIST', null),
  ('Count Treukh', null, 'HEAD', null),
  ('Count Vest', null, 'CHEST', null),
  ('Count Wrappings', null, 'ARMS', null),
  (
    'Cruel Cleaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Cleaver'
    )
  ),
  (
    'Curse Hammer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Dashing Reaper',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Diamond Scab Katar',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Discordian',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Dissecting Celurit',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  (
    'Dome Buster',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Drum of Hope',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  ('Earl Boots', null, 'FEET', null),
  ('Earl Jaw Guard', null, 'HEAD', null),
  ('Earl Raiment', null, 'CHEST', null),
  ('Earl Sleeves', null, 'ARMS', null),
  ('Earl Tassets', null, 'WAIST', null),
  (
    'Fated Dagger',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Fear Spear',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'First Tree Cudgel',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ('Gold Cat Costume', null, null, null),
  (
    'Greatest Gaxe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Grimacing Guillotine', null, null, null),
  ('Grim Muffler', null, 'CHEST', null),
  (
    'Gusk Knife',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Halberd Scab',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Heartleech Baselard',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Holy Sword Whip',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Horokubiya Dagger',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Immortal Arm',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Inquisitorial Saw',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  (
    'Jaw Saw',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Knife Scab',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Longclaw',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Lordsruin',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  ('Mage''s Hood', null, 'HEAD', null),
  ('Marchioness Blouse', null, 'CHEST', null),
  ('Marchioness Gloves', null, 'ARMS', null),
  ('Marchioness Gorget', null, 'HEAD', null),
  ('Marchioness Sollerets', null, 'FEET', null),
  ('Marchioness Trousers', null, 'WAIST', null),
  (
    'Maul Scab',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Oblouk Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Poison Partisan',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  ('Regal Plume', null, 'HEAD', null),
  (
    'Regicider',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Retching Costume', null, null, null),
  (
    'Roaring Harmonica',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Saxe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Screaming Costume', null, null, null),
  ('Screaming Sun Mask', null, 'HEAD', null),
  (
    'Screaming Tanto',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Seditioner',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Shield of Courage',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  ('Sprial Mask', null, null, null),
  (
    'Stampede Glaive',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Sunlantern Mask', null, 'HEAD', null),
  (
    'Sword Scab',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Syncretic Vestments', null, null, null),
  (
    'Tachyon Nodachi',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  (
    'Thumping Timpani',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Toxicimitar',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scimitar'
    )
  ),
  (
    'Tyrant Slayer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Unbreakable Zanbato',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Veteran Lantern Cuirass', null, 'CHEST', null),
  ('Violet Armor Charm', null, null, null),
  ('Violet Phoenix Faulds', null, 'WAIST', null),
  ('Violet Phoenix Gauntlets', null, 'ARMS', null),
  ('Vixen Tail', null, null, null),
  ('Voluptuous Bodysuit', null, null, null),
  ------------------------------------------------------------------------------
  -- Plumery
  ------------------------------------------------------------------------------
  (
    'Arc Bow',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Bird Bread',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Blood Sheath',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Bloom Sphere',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Crest Crown',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Feather Mantle',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Feather Shield',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Finger of God',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Hollowpoint Arrow',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  (
    'Hollow Sword',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Hours Ring',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Phoenix Faulds',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Phoenix Gauntlet',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Phoenix Greaves',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Phoenix Helm',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Phoenix Plackart',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Rainbow Katana',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  (
    'Sonic Tomahawk',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ------------------------------------------------------------------------------
  -- Rare Gear
  ------------------------------------------------------------------------------
  (
    'Adventure Sword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Amethyst Splash', null, null, null),
  ('Ancient Lion Claws', null, 'ARMS', null),
  (
    'Belching Bagpipe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  ('Black Gauntlet', null, 'ARMS', null),
  ('Black Knight Badge', null, null, null),
  ('Bloodskin', null, null, null),
  ('Blue Lantern', null, null, null),
  ('Bone Charm', null, null, null),
  ('Bone Witch Mehndi', null, null, null),
  ('Brave''s Light', null, null, null),
  (
    'Butcher Cleaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Butcher''s Blood', null, null, null),
  ('Camping Bag', null, null, null),
  (
    'Celestial Spear',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  ('Chaos Elf Hat', null, 'HEAD', null),
  ('Child of Lightning', null, null, null),
  ('Citrine Brew', null, null, null),
  (
    'Common Katana',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  ('Dark Water Pearl', null, null, null),
  ('Death Crown', null, null, null),
  ('Death Drifter Cloak', null, null, null),
  ('Death Mehndi', null, null, null),
  (
    'Deathmas Lantern Dagger',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  ('Deathmas Shearling Boots', null, 'FEET', null),
  ('Deprivation Skinsuit', null, null, null),
  ('Dormant Twilight Cloak', null, 'HEAD', null),
  ('Dragon Vestments', null, null, null),
  ('Emerald Dewdrop', null, null, null),
  (
    'Excalibur',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Everburn', null, null, null),
  ('Eye Patch', null, null, null),
  (
    'Fellbrandt',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Fish of Abundance', null, null, null),
  ('Flower Knight Helm', null, 'HEAD', null),
  ('Forgot''s Light', null, null, null),
  ('Forsaker Mask', null, 'HEAD', null),
  ('Gladiator Garb', null, null, null),
  ('Glyph of Solitude', null, null, null),
  ('God''s String', null, null, null),
  ('Golden Plate', null, null, null),
  (
    'Great Game Crossbow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Crossbow'
    )
  ),
  (
    'Grinning Visage',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Hand',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Hammer of Judgement',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Hazmat Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  ('Hidden Crimson Jewel', null, null, null),
  ('Hideous Disguise', null, 'HEAD', null),
  ('Hollow''s Light', null, null, null),
  ('Holy Lantern', null, null, null),
  (
    'Hope Stealer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Hostox the Gloaming',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Husk of Destiny', null, null, null),
  (
    'Illuminated Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Iron',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Killennium Cleaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Cleaver'
    )
  ),
  ('Lantern Brassiere', null, 'CHEST', null),
  ('Lantern Festival Horn', null, null, null),
  ('Lantern Festival Mask', null, 'HEAD', null),
  ('Lantern Festival Midi', null, 'WAIST', null),
  ('Lantern Festival Top', null, 'CHEST', null),
  (
    'Lantern Halberd',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  ('Lantern Mehndi', null, null, null),
  ('Leather Bodysuit', null, 'CHEST', null),
  ('Lion God Statue', null, null, null),
  ('Lion Knight Badge', null, null, null),
  (
    'Lion Knight''s Left Claw',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Lion Knight''s Right Claw',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  ('Lovelorn Rock', null, null, null),
  ('Luck''s Cloak', null, 'CHEST', null),
  (
    'Magnum Knives',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Monstrous Fizz', null, null, null),
  ('Moonwolf Charm', null, null, null),
  (
    'Muramasa',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  (
    'Natural Cardinal Staff',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ('Necromancer''s Eye', null, 'HEAD', null),
  ('Newborn', null, null, null),
  (
    'Obsession',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Ornate Bone Blade',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Portable Waterphone', null, null, null),
  ('Preserved Dogpole', null, null, null),
  (
    'Prism Mace',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ('Rapture Bracelet', null, 'HEAD', null),
  ('Rawhide Corset', null, 'CHEST', null),
  ('Red''s Light', null, null, null),
  (
    'Regal Edge',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Regal Faulds', null, 'WAIST', null),
  ('Regal Gauntlet', null, 'ARMS', null),
  ('Regal Greaves', null, 'FEET', null),
  ('Regal Helm', null, 'HEAD', null),
  ('Regal Plackart', null, 'CHEST', null),
  ('Regal Signet Ring', null, null, null),
  (
    'Replica Flower Sword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Ring of Adoration', null, null, null),
  ('Ring of Devotion', null, null, null),
  ('Royal Decorations', null, null, null),
  (
    'Royal Scalpel',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  ('Ruby Cola', null, null, null),
  ('Sanctified Rosary', null, null, null),
  (
    'Sanctuary Longsword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Sapphire Syrup', null, null, null),
  ('Severing Twilight', null, null, null),
  ('Shawl of Determination', null, null, null),
  (
    'Sharpened Heel',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Shrieking Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Sleeping Virus Flower',
    null,
    null,
    null
  ),
  ('Smog Lantern', null, null, null),
  (
    'Speaker Cult Knife',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  ('Staff of Honed Ideals', null, null, null),
  ('Staff of Nascent Hope', null, null, null),
  ('Staff of Resolute Vision', null, null, null),
  ('Staff of Sage Reverie', null, null, null),
  (
    'Steel Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Steel Sword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Stone Column',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Sunring Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  ('Sun Vestments', null, null, null),
  (
    'Sword of Silence',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Teary Tonic', null, null, null),
  ('Teeth Bikini', null, 'CHEST', null),
  (
    'The Weaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Thunder Maul',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ('Trash Crown', null, 'HEAD', null),
  (
    'Twilight Knives',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Twilight Sword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Twilight Sword'
    )
  ),
  ('Violet Drifter Cloak', null, null, null),
  ('Visionary''s Circlet', null, null, null),
  (
    'Visionary''s Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Visionary''s Sword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Worn Brawling Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Worn Seeking Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Worn Strafing Bow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Wrath',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ------------------------------------------------------------------------------
  -- Sanguine Extrusion
  ------------------------------------------------------------------------------
  (
    'Black & Red Armet',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Black & Red Cuirass',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Black & Red Gauntlets',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Black & Red Greaves',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Black & Red Tonlet',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Hyperelastic Bow',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Hyperelastic Shield',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Hyperelastic Sword',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Red Cloak',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    ),
    'CHEST',
    null
  ),
  ------------------------------------------------------------------------------
  -- Seed Pattern Gear
  ------------------------------------------------------------------------------
  ('Armorsmith''s Tongs', null, null, null),
  ('Backstabbing Stone', null, null, null),
  ('Beast Hunter Helm', null, 'HEAD', null),
  ('Bloomlink Pumpkin', null, null, null),
  ('Bravelink Pumpkin', null, null, null),
  (
    'Clasping Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  ('Cyclops Ledger', null, null, null),
  (
    'Dextral Crabaxe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Dream Keeper Cowl', null, 'HEAD', null),
  (
    'Dream Keeper Knife',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Elder''s Aegis',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Feral Zanbato',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Fingernail Whip',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  ('Ghostlink Pumpkin', null, null, null),
  (
    'Guidon Lance of Doom',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Heartseeker',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  ('Hollowlink Pumpkin', null, null, null),
  (
    'Hushing Harmonium',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  ('Hypersight Visor', null, null, null),
  ('Imitation Butcher Mask', null, 'HEAD', null),
  ('Itemsmith''s Lense', null, 'HEAD', null),
  ('Jack O'' Lantern', null, null, null),
  ('Jarngreipr', null, 'HEAD', null),
  (
    'Lucky Cat Fang Knife',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Masamune',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  (
    'Master Bone Dagger',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Mighty Bone Axe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Monster Trophy', null, null, null),
  ('Neko Twilight Armor', null, null, null),
  (
    'Ornate Rapier',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Piercing Claws',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Plasma Cutter',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Plated Shield',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  ('Rawhide Bandana', null, 'HEAD', null),
  (
    'Reaperjaw',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Refined Lantern Axe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Refined Lantern Sword',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Robes of Deadheim', null, 'CHEST', null),
  (
    'Scythe of Doom',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scythe'
    )
  ),
  (
    'Shadow Skleaver',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Sinistral Crabaxe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  ('Soldier Lantern Cuirass', null, 'CHEST', null),
  (
    'Spinal Sickle',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  ('Spite Balm', null, null, null),
  ('Sprinter Helm', null, 'HEAD', null),
  (
    'Sundering Crossbow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Crossbow'
    )
  ),
  (
    'Sword of Doom',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ('Telcric Eye Tac', null, null, null),
  (
    'Tempered Axe',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Tempered Dagger',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Tempered Spear',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  ('Tithe Box', null, null, null),
  (
    'True Lantern Halberd',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  ('Vault Key Earrings', null, null, null),
  (
    'Weaponsmith''s Hammer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ------------------------------------------------------------------------------
  -- Sense Memory
  ------------------------------------------------------------------------------
  (
    'Flower Knight Badge',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    ),
    null,
    null
  ),
  (
    'Satchel',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    ),
    null,
    null
  ),
  (
    'Vespertine Arrow',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  (
    'Vespertine Bow',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Vespertine Cello',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Vespertine Foil',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  ------------------------------------------------------------------------------
  -- Silk Mill
  ------------------------------------------------------------------------------
  (
    'Amber Edge',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scimitar'
    )
  ),
  (
    'Amber Poleaxe',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Blue Ring',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    null
  ),
  (
    'Green Ring',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    null
  ),
  (
    'Hooded Scrap Katar',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Red Ring',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    null
  ),
  (
    'Silk Body Suit',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    null
  ),
  (
    'Silk Bomb',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    null
  ),
  (
    'Silk Boots',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Silk Robes',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Silk Sash',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Silk Turban',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Silk Whip',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  (
    'Silk Wraps',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Throwing Knife',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  ------------------------------------------------------------------------------
  -- Skinnery
  ------------------------------------------------------------------------------
  (
    'Bandages',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    null,
    null
  ),
  (
    'Rawhide Boots',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Rawhide Drum',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Instrument'
    )
  ),
  (
    'Rawhide Gloves',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Rawhide Headband',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Rawhide Pants',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Rawhide Vest',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Rawhide Whip',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  ------------------------------------------------------------------------------
  -- Sky Reef Sanctuary
  ------------------------------------------------------------------------------
  (
    'Cycloid Scale Hood',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Cycloid Scale Jacket',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Cycloid Scale Shoes',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Cycloid Scale Skirt',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Cycloid Scale Sleeves',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Denticle Axe',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Ink Blood Bow',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Ink Sword',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Quiver & Sun String',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    null
  ),
  (
    'Shadow Sliva Shawl',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    null
  ),
  (
    'Skleaver',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Sky Harpoon',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Sun Lure & Hook',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    null
  ),
  (
    'Sunshark Arrows',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  (
    'Sunshark Bow',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Bow'
    )
  ),
  (
    'Sunspot Dart',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Thrown'
    )
  ),
  (
    'Sunspot Lantern',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Slenderman Gear
  ------------------------------------------------------------------------------
  ('Dark Water Vial', null, null, null),
  (
    'Gloom-Coated Arrow',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Arrow'
    )
  ),
  ('Gloom Bracelets', null, 'ARMS', null),
  ('Gloom Cream', null, null, null),
  (
    'Gloom Hammer',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Gloom Katana',
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katana'
    )
  ),
  ('Gloom Mehndi', null, null, null),
  ('Gloom Sheath', null, null, null),
  ('Raptor Worm Collar', null, null, null),
  ('Slender Ovule', null, null, null),
  ------------------------------------------------------------------------------
  -- Starting Gear
  ------------------------------------------------------------------------------
  ('Beating Heartstave', null, null, null),
  ('Bloody Cloth', null, null, null),
  ('Cloth', null, null, null),
  ('Founding Stone', null, null, null),
  ------------------------------------------------------------------------------
  -- Stone Circle
  ------------------------------------------------------------------------------
  (
    'Beast Knuckle',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Blood Paint',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    null
  ),
  (
    'Bone Earrings',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    null
  ),
  (
    'Boss Mehndi',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    null
  ),
  (
    'Brain Mint',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    null
  ),
  (
    'Elder Earrings',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    null
  ),
  (
    'Lance of Longinus',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Screaming Bracers',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Screaming Coat',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Screaming Horns',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Screaming Leg Warmers',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Screaming Skirt',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Speed Powder',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Stone Circle Hot Zone
  ------------------------------------------------------------------------------
  (
    'Atomic Lance',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Green Power Core',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    ),
    null,
    null
  ),
  (
    'Nuclear Knuckle',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Nuclear Whip',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Whip'
    )
  ),
  ------------------------------------------------------------------------------
  -- Tuskworks
  ------------------------------------------------------------------------------
  (
    'Bullcharge Shield',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Shield'
    )
  ),
  (
    'Bullfrog Bauble',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    null,
    null
  ),
  (
    'Bullfrog Boots',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    'FEET',
    null
  ),
  (
    'Bullfrog Bracers',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    'ARMS',
    null
  ),
  (
    'Bullfrog Cuirass',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    'CHEST',
    null
  ),
  (
    'Bullfrog Dress',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    'WAIST',
    null
  ),
  (
    'Bullfrog Halberd',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Bullfrog Helm',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    'HEAD',
    null
  ),
  (
    'Bullfrog Mace',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Bullfrog Scimitar',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Scimitar'
    )
  ),
  (
    'Heavyfrog Lantern',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    ),
    null,
    null
  ),
  ------------------------------------------------------------------------------
  -- Weapon Crafter
  ------------------------------------------------------------------------------
  (
    'Counterweighted Axe',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Axe'
    )
  ),
  (
    'Scrap Bone Spear',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Spear'
    )
  ),
  (
    'Scrap Dagger',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Scrap Lantern',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Scrap Rebar',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Scrap Sword',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Sword'
    )
  ),
  (
    'Skullcap Hammer',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  (
    'Whistling Mace',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  ),
  ------------------------------------------------------------------------------
  -- Wet Resin Crafter
  ------------------------------------------------------------------------------
  (
    'Calcified Digging Claw',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Calcified Greaves',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Calcified Juggernaut Blade',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Calcified Shoulder Pads',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Calcified Zanbato',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  ),
  (
    'Century Greaves',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Century Shoulder Pads',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'DBK Errant Badge',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Digging Claw',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Katar'
    )
  ),
  (
    'Rainbow Wing Belt',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Regenerating Blade',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Rubber Bone Harness',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Scarab Circlet',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Seasoned Monster Meat',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'The Beetle Bomb',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    null
  ),
  (
    'Zanbato',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    ),
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Grand'
    )
  );