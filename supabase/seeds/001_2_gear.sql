--------------------------------------------------------------------------------
-- Gear
--------------------------------------------------------------------------------
insert into gear (gear_name, location_id)
values -------------------------------------------------------------------------
  -- Beta Gear
  ------------------------------------------------------------------------------
  ('Acanthus Underwear', null),
  ('Belt of Gender Swap', null),
  ('Bitter Beastcloak', null),
  ('Cloth Leggings', null),
  ('Detective Cap', null),
  ('Fetorsaurus', null),
  ('Furnace Lantern', null),
  ('Gilded Greatcleaver', null),
  ('Gloom Cowl', null),
  ('Green Boots', null),
  ('Green Faulds', null),
  ('Green Gloves', null),
  ('Green Helm', null),
  ('Green Plate', null),
  ('Griswaldo', null),
  ('Hard Breastplate', null),
  ('Hysteria Powder', null),
  ('Lagabond Hoppers', null),
  ('Lagabond Nails', null),
  ('Osseous Scrap Blade', null),
  ('Pain Eater', null),
  ('Serrated Greatcleaver', null),
  ('Sighing Acanthus Hat', null),
  ('Sighing Sarong', null),
  ('Speaker Cult Pipe', null),
  ('Stonesmasher', null),
  ('Thermal Wrappings', null),
  ('Twilight Revolver', null),
  ('White Sunlion Mask', null),
  ('Woe Hachigane', null),
  ('Woe Kusarigama', null),
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
    )
  ),
  (
    'Blue Charm',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
  ),
  (
    'Bug Trap',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
  ),
  (
    'First Aid Kit',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
  ),
  (
    'Green Charm',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
  ),
  (
    'Musk Bomb',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
  ),
  (
    'Red Charm',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
  ),
  (
    'Scavenger Kit',
    (
      select id
      from location
      where location_name = 'Barber Surgeon'
        and not custom
    )
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
    )
  ),
  (
    'Dragon Slayer',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Cuirass',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Dagger',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Gauntlets',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Glaive',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Greaves',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Helm',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Mail',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Lantern Sword',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Perfect Slayer',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Polishing Lantern',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Ring Whip',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Scrap Shield',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Wrought Greatshield',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Wrought Lantern Mantle',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Wrought Longbow',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Wrought Sledge',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Wrought Tachi',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
    )
  ),
  (
    'Wrought Twinspear',
    (
      select id
      from location
      where location_name = 'Blacksmith'
        and not custom
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
    )
  ),
  (
    'Bone Blade',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
  ),
  (
    'Bone Club',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
  ),
  (
    'Bone Dagger',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
  ),
  (
    'Bone Darts',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
  ),
  (
    'Bone Pickaxe',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
  ),
  (
    'Bone Sickle',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
  ),
  (
    'Skull Helm',
    (
      select id
      from location
      where location_name = 'Bone Smith'
        and not custom
    )
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
    )
  ),
  (
    'Cat Fang Knife',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Cat Gut Bow',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Claw Head Arrow',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Dense Bone Arrows',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Frenzy Drink',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Hooked Claw Knife',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'King Spear',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Lion Beast Katar',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Lion Headdress',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Lion Skin Cloak',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Oxidized Beast Katar',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'White Lion Boots',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'White Lion Coat',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'White Lion Gauntlets',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'White Lion Helm',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'White Lion Skirt',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
  ),
  (
    'Whisker Harp',
    (
      select id
      from location
      where location_name = 'Catarium'
        and not custom
    )
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
    )
  ),
  (
    'Hamflutter',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Harpy Harp',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Peace Dagger',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Pipa',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Razor Cymbals',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Singing Cap',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Singing Boots',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Singing Breastplate',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Singing Gloves',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Singing Heart',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Singing Pantaloons',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Spear of Life',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
    )
  ),
  (
    'Spinning Sword',
    (
      select id
      from location
      where location_name = 'Chorusseum'
        and not custom
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
    )
  ),
  (
    'Bloodglass Cleaver',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Bloodglass Dagger',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Bloodglass Katar',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Bloodglass Longsword',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Bloodglass Saw',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Bow',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Dress',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Faulds',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Guard',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Helm',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Pearls',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crimson Slippers',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crocbone Hammer',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Crocodileyes',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Finger Darts',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
    )
  ),
  (
    'Giggling Scythe',
    (
      select id
      from location
      where location_name = 'Crimson Crockery'
        and not custom
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
    )
  ),
  (
    'Blast Sword',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Blue Power Core',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragon Belt',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragon Bite Bolt',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragon Boots',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragon Chakram',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragon Gloves',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragon Mantle',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Dragonskull Helm',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Nuclear Knife',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Nuclear Scythe',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Red Power Core',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Shielded Quiver',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
    )
  ),
  (
    'Talon Knife',
    (
      select id
      from location
      where location_name = 'Dragon Armory'
        and not custom
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
    )
  ),
  (
    'Oxidized Beacon Shield',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
  ),
  (
    'Oxidized Lantern Dagger',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
  ),
  (
    'Oxidized Lantern Glaive',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
  ),
  (
    'Oxidized Lantern Helm',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
  ),
  (
    'Oxidized Lantern Sword',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
  ),
  (
    'Oxidized Ring Whip',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
  ),
  (
    'Survivors'' Lantern',
    (
      select id
      from location
      where location_name = 'Exhausted Lantern Hoard'
        and not custom
    )
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
    )
  ),
  (
    'Crest Axe',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogdog Boots',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogdog Mask',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogdog Sleeves',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogdog Suit',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogdog Vest',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogdoggles',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Frogwhistle',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Grappleclaw',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Long Club',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Lure Lantern',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Spiked Buckler',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Turbo Tonic',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Vertabrayonet',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
  ),
  (
    'Vigor Capsule',
    (
      select id
      from location
      where location_name = 'Froskrafter'
        and not custom
    )
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
    )
  ),
  (
    'Fortune Lantern Dagger',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    )
  ),
  (
    'Fortune Lantern Helm',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    )
  ),
  (
    'Fortune Lantern Sword',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    )
  ),
  (
    'Gambler''s Lantern',
    (
      select id
      from location
      where location_name = 'Gaming Gazebo'
        and not custom
    )
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
    )
  ),
  (
    'Armor Spikes',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Black Sword',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Gaxe',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Gorment Boots',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Gorment Mask',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Gorment Sleeves',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Gorment Suit',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Gorn',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Greater Gaxe',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Knuckle Shield',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Pulse Lantern',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Regeneration Suit',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Rib Blade',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
    )
  ),
  (
    'Riot Mace',
    (
      select id
      from location
      where location_name = 'Gormery'
        and not custom
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
    )
  ),
  (
    'Life Elixir',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    )
  ),
  (
    'Power Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    )
  ),
  (
    'Steadfast Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    )
  ),
  (
    'Wisdom Potion',
    (
      select id
      from location
      where location_name = 'Gormchymist'
        and not custom
    )
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
    )
  ),
  (
    'Assassinator',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Deathking Boots',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Deathking Gauntlets',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Deathking Greaves',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Deathking Helm',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Deathking Platemail',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Grand Kingslayer',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Kingslayer',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Royal Lantern',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Royal Medallion',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Royal Shield',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
    )
  ),
  (
    'Usurper',
    (
      select id
      from location
      where location_name = 'Kingsmith'
        and not custom
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
    )
  ),
  (
    'Leather Boots',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    )
  ),
  (
    'Leather Bracers',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    )
  ),
  (
    'Leather Cuirass',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    )
  ),
  (
    'Leather Mask',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    )
  ),
  (
    'Leather Skirt',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    )
  ),
  (
    'Round Leather Shield',
    (
      select id
      from location
      where location_name = 'Leather Worker'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Manhunter Gear
  ------------------------------------------------------------------------------
  ('Deathpact', null),
  ('Hunter''s Heart', null),
  ('Manhunter''s Hat', null),
  ('Reverberating Lantern', null),
  ('Tool Belt', null),
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
    )
  ),
  (
    'Death Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    )
  ),
  (
    'God Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    )
  ),
  (
    'Man Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    )
  ),
  (
    'Phoenix Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    )
  ),
  (
    'White Lion Mask',
    (
      select id
      from location
      where location_name = 'Mask Maker'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Meal Gear
  ------------------------------------------------------------------------------
  ('Fatty Crimson Goulash', null),
  ('Fetid Frog Tea', null),
  ('King Lantern Sausage', null),
  ('Smog Soup', null),
  ('Supreme Stew', null),
  ('Time Milk', null),
  ('White Lion Bread Box', null),
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
    )
  ),
  (
    'Fecal Salve',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    )
  ),
  (
    'Lucky Charm',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    )
  ),
  (
    'Monster Grease',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    )
  ),
  (
    'Monster Tooth Necklace',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    )
  ),
  (
    'Stone Noses',
    (
      select id
      from location
      where location_name = 'Organ Grinder'
        and not custom
    )
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
    )
  ),
  (
    'Crimson Crocodile Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Disguise Kit',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Frogdog Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Grimjaw',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Hunting Salve',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'King Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Phoenix Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Scout Whistle',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Scout''s Lantern',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Screaming Antelope Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Smog Singers Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Stone Face Cloak',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'Vermin Bellyboots',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  (
    'White Lion Tablet',
    (
      select id
      from location
      where location_name = 'Outskirts'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Pattern Gear
  ------------------------------------------------------------------------------
  ('Big Bite Costume', null),
  ('Binding Chain', null),
  ('Black Ghost Dagger', null),
  ('Blood Drinker', null),
  ('Bone Chibouk', null),
  ('Bow Scab', null),
  ('Brazen Bat', null),
  ('Bully Hammer', null),
  ('Colossal Chef''s Carver', null),
  ('Count Sandals', null),
  ('Count Tabard', null),
  ('Count Treukh', null),
  ('Count Vest', null),
  ('Count Wrappings', null),
  ('Cruel Cleaver', null),
  ('Curse Hammer', null),
  ('Dashing Reaper', null),
  ('Diamond Scab Katar', null),
  ('Discordian', null),
  ('Dissecting Celurit', null),
  ('Dome Buster', null),
  ('Drum of Hope', null),
  ('Earl Boots', null),
  ('Earl Jaw Guard', null),
  ('Earl Raiment', null),
  ('Earl Sleeves', null),
  ('Earl Tassets', null),
  ('Fated Dagger', null),
  ('Fear Spear', null),
  ('First Tree Cudgel', null),
  ('Gold Cat Costume', null),
  ('Greatest Gaxe', null),
  ('Grimacing Guillotine', null),
  ('Grim Muffler', null),
  ('Gusk Knife', null),
  ('Halberd Scab', null),
  ('Holy Sword Whip', null),
  ('Horokubiya Dagger', null),
  ('Immortal Arm', null),
  ('Inquisitorial Saw', null),
  ('Jaw Saw', null),
  ('Knife Scab', null),
  ('Longclaw', null),
  ('Lordsruin', null),
  ('Mage''s Hood', null),
  ('Marchioness Blouse', null),
  ('Marchioness Gloves', null),
  ('Marchioness Gorget', null),
  ('Marchioness Sollerets', null),
  ('Marchioness Trousers', null),
  ('Maul Scab', null),
  ('Oblouk Shield', null),
  ('Poison Partisan', null),
  ('Regal Plume', null),
  ('Regicider', null),
  ('Retching Costume', null),
  ('Roaring Harmonica', null),
  ('Saxe', null),
  ('Screaming Costume', null),
  ('Screaming Sun Mask', null),
  ('Screaming Tanto', null),
  ('Seditioner', null),
  ('Shield of Courage', null),
  ('Sprial Mask', null),
  ('Stampede Glaive', null),
  ('Sunlantern Mask', null),
  ('Sword Scab', null),
  ('Syncretic Vestments', null),
  ('Tachyon Nodachi', null),
  ('Thumping Timpani', null),
  ('Toxicimitar', null),
  ('Tyrant Slayer', null),
  ('Unbreakable Zanbato', null),
  ('Veteran Lantern Cuirass', null),
  ('Violet Armor Charm', null),
  ('Violet Phoenix Faulds', null),
  ('Violet Phoenix Gauntlets', null),
  ('Vixen Tail', null),
  ('Voluptuous Bodysuit', null),
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
    )
  ),
  (
    'Bird Bread',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Blood Sheath',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Bloom Sphere',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Crest Crown',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Feather Mantle',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Feather Shield',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Finger of God',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Hollowpoint Arrow',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Hollow Sword',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Hours Ring',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Phoenix Faulds',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Phoenix Gauntlet',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Phoenix Greaves',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Phoenix Helm',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Phoenix Plackart',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Rainbow Katana',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  (
    'Sonic Tomahawk',
    (
      select id
      from location
      where location_name = 'Plumery'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Rare Gear
  ------------------------------------------------------------------------------
  ('Adventure Sword', null),
  ('Amethyst Splash', null),
  ('Ancient Lion Claws', null),
  ('Belching Bagpipe', null),
  ('Black Gauntlet', null),
  ('Black Knight Badge', null),
  ('Bloodskin', null),
  ('Blue Lantern', null),
  ('Bone Charm', null),
  ('Bone Witch Mehndi', null),
  ('Brave''s Light', null),
  ('Butcher Cleaver', null),
  ('Butcher''s Blood', null),
  ('Camping Bag', null),
  ('Celestial Spear', null),
  ('Chaos Elf Hat', null),
  ('Child of Lightning', null),
  ('Citrine Brew', null),
  ('Common Katana', null),
  ('Dark Water Pearl', null),
  ('Death Crown', null),
  ('Death Drifter Cloak', null),
  ('Death Mehndi', null),
  ('Deathmas Lantern Dagger', null),
  ('Deathmas Shearling Boots', null),
  ('Deprivation Skinsuit', null),
  ('Dormant Twilight Cloak', null),
  ('Dragon Vestments', null),
  ('Emerald Dewdrop', null),
  ('Excalibur', null),
  ('Everburn', null),
  ('Eye Patch', null),
  ('Fellbrandt', null),
  ('Fish of Abundance', null),
  ('Flower Knight Helm', null),
  ('Forgot''s Light', null),
  ('Forsaker Mask', null),
  ('Gladiator Garb', null),
  ('Glyph of Solitude', null),
  ('God''s String', null),
  ('Golden Plate', null),
  ('Great Game Crossbow', null),
  ('Grinning Visage', null),
  ('Hand', null),
  ('Hammer of Judgement', null),
  ('Hazmat Shield', null),
  ('Hidden Crimson Jewel', null),
  ('Hideous Disguise', null),
  ('Hollow''s Light', null),
  ('Holy Lantern', null),
  ('Hope Stealer', null),
  ('Hostox the Gloaming', null),
  ('Husk of Destiny', null),
  ('Illuminated Bow', null),
  ('Iron', null),
  ('Killennium Cleaver', null),
  ('Lantern Brassiere', null),
  ('Lantern Festival Horn', null),
  ('Lantern Festival Mask', null),
  ('Lantern Festival Midi', null),
  ('Lantern Festival Top', null),
  ('Lantern Halberd', null),
  ('Lantern Mehndi', null),
  ('Leather Bodysuit', null),
  ('Lion God Statue', null),
  ('Lion Knight Badge', null),
  ('Lion Knight''s Left Claw', null),
  ('Lion Knight''s Right Claw', null),
  ('Lovelorn Rock', null),
  ('Luck''s Cloak', null),
  ('Magnum Knives', null),
  ('Monstrous Fizz', null),
  ('Moonwolf Charm', null),
  ('Muramasa', null),
  ('Natural Cardinal Staff', null),
  ('Necromancer''s Eye', null),
  ('Newborn', null),
  ('Obsession', null),
  ('Ornate Bone Blade', null),
  ('Portable Waterphone', null),
  ('Preserved Dogpole', null),
  ('Prism Mace', null),
  ('Rapture Bracelet', null),
  ('Rawhide Corset', null),
  ('Red''s Light', null),
  ('Regal Edge', null),
  ('Regal Faulds', null),
  ('Regal Gauntlet', null),
  ('Regal Greaves', null),
  ('Regal Helm', null),
  ('Regal Plackart', null),
  ('Regal Signet Ring', null),
  ('Replica Flower Sword', null),
  ('Ring of Adoration', null),
  ('Ring of Devotion', null),
  ('Royal Decorations', null),
  ('Royal Scalpel', null),
  ('Ruby Cola', null),
  ('Sanctified Rosary', null),
  ('Sanctuary Longsword', null),
  ('Sapphire Syrup', null),
  ('Severing Twilight', null),
  ('Shawl of Determination', null),
  ('Sharpened Heel', null),
  ('Shrieking Bow', null),
  ('Sleeping Virus Flower', null),
  ('Smog Lantern', null),
  ('Speaker Cult Knife', null),
  ('Staff of Honed Ideals', null),
  ('Staff of Nascent Hope', null),
  ('Staff of Resolute Vision', null),
  ('Staff of Sage Reverie', null),
  ('Steel Shield', null),
  ('Steel Sword', null),
  ('Stone Column', null),
  ('Sunring Bow', null),
  ('Sun Vestments', null),
  ('Sword of Silence', null),
  ('Teary Tonic', null),
  ('Teeth Bikini', null),
  ('The Weaver', null),
  ('Thunder Maul', null),
  ('Trash Crown', null),
  ('Twilight Knives', null),
  ('Twilight Sword', null),
  ('Violet Drifter Cloak', null),
  ('Visionary''s Circlet', null),
  ('Visionary''s Shield', null),
  ('Visionary''s Sword', null),
  ('Worn Brawling Bow', null),
  ('Worn Seeking Bow', null),
  ('Worn Strafing Bow', null),
  ('Wrath', null),
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
    )
  ),
  (
    'Black & Red Cuirass',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Black & Red Gauntlets',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Black & Red Greaves',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Black & Red Tonlet',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Hyperelastic Bow',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Hyperelastic Shield',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Hyperelastic Sword',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  (
    'Red Cloak',
    (
      select id
      from location
      where location_name = 'Sanguine Extrusion'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Seed Pattern Gear
  ------------------------------------------------------------------------------
  ('Armorsmith''s Tongs', null),
  ('Backstabbing Stone', null),
  ('Beast Hunter Helm', null),
  ('Bloomlink Pumpkin', null),
  ('Bravelink Pumpkin', null),
  ('Clasping Shield', null),
  ('Cyclops Ledger', null),
  ('Dextral Crabaxe', null),
  ('Dream Keeper Cowl', null),
  ('Dream Keeper Knife', null),
  ('Elder''s Aegis', null),
  ('Feral Zanbato', null),
  ('Fingernail Whip', null),
  ('Ghostlink Pumpkin', null),
  ('Guidon Lance of Doom', null),
  ('Heartseeker', null),
  ('Hollowlink Pumpkin', null),
  ('Hushing Harmonium', null),
  ('Hypersight Visor', null),
  ('Imitation Butcher Mask', null),
  ('Itemsmith''s Lense', null),
  ('Jack O'' Lantern', null),
  ('Jarngreipr', null),
  ('Lucky Cat Fang Knife', null),
  ('Masamune', null),
  ('Master Bone Dagger', null),
  ('Mighty Bone Axe', null),
  ('Monster Trophy', null),
  ('Neko Twilight Armor', null),
  ('Ornate Rapier', null),
  ('Piercing Claws', null),
  ('Plasma Cutter', null),
  ('Plated Shield', null),
  ('Rawhide Bandana', null),
  ('Reaperjaw', null),
  ('Refined Lantern Axe', null),
  ('Refined Lantern Sword', null),
  ('Robes of Deadheim', null),
  ('Scythe of Doom', null),
  ('Shadow Skleaver', null),
  ('Sinistral Crabaxe', null),
  ('Soldier Lantern Cuirass', null),
  ('Spinal Sickle', null),
  ('Spite Balm', null),
  ('Sprinter Helm', null),
  ('Sundering Crossbow', null),
  ('Sword of Doom', null),
  ('Telcric Eye Tac', null),
  ('Tempered Axe', null),
  ('Tempered Dagger', null),
  ('Tempered Spear', null),
  ('Tithe Box', null),
  ('True Lantern Halberd', null),
  ('Vault Key Earrings', null),
  ('Weaponsmith''s Hammer', null),
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
    )
  ),
  (
    'Satchel',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    )
  ),
  (
    'Vespertine Arrow',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    )
  ),
  (
    'Vespertine Bow',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    )
  ),
  (
    'Vespertine Cello',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
    )
  ),
  (
    'Vespertine Foil',
    (
      select id
      from location
      where location_name = 'Sense Memory'
        and not custom
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
    )
  ),
  (
    'Amber Poleaxe',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Blue Ring',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Green Ring',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Hooded Scrap Katar',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Red Ring',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Body Suit',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Bomb',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Boots',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Robes',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Sash',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Turban',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Whip',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Silk Wraps',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
    )
  ),
  (
    'Throwing Knife',
    (
      select id
      from location
      where location_name = 'Silk Mill'
        and not custom
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
    )
  ),
  (
    'Rawhide Boots',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  (
    'Rawhide Drum',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  (
    'Rawhide Gloves',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  (
    'Rawhide Headband',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  (
    'Rawhide Pants',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  (
    'Rawhide Vest',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  (
    'Rawhide Whip',
    (
      select id
      from location
      where location_name = 'Skinnery'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Skyreef Sanctuary
  ------------------------------------------------------------------------------
  (
    'Cycloid Scale Hood',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Cycloid Scale Jacket',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Cycloid Scale Shoes',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Cycloid Scale Skirt',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Cycloid Scale Sleeves',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Denticle Axe',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Ink Blood Bow',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Ink Sword',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Quiver & Sun String',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Shadow Sliva Shawl',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Skleaver',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Sky Harpoon',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Sun Lure & Hook',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Sunshark Arrows',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Sunshark Bow',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Sunspot Dart',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  (
    'Sunspot Lantern',
    (
      select id
      from location
      where location_name = 'Skyreef Sanctuary'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Slenderman Gear
  ------------------------------------------------------------------------------
  ('Dark Water Vial', null),
  ('Gloom-Coated Arrow', null),
  ('Gloom Bracelets', null),
  ('Gloom Cream', null),
  ('Gloom Hammer', null),
  ('Gloom Katana', null),
  ('Gloom Mehndi', null),
  ('Gloom Sheath', null),
  ('Raptor Worm Collar', null),
  ('Slender Ovule', null),
  ------------------------------------------------------------------------------
  -- Starting Gear
  ------------------------------------------------------------------------------
  ('Beating Heartstave', null),
  ('Bloody Cloth', null),
  ('Cloth', null),
  ('Founding Stone', null),
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
    )
  ),
  (
    'Blood Paint',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Bone Earrings',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Boss Mehndi',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Brain Mint',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Elder Earrings',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Lance of Longinus',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Screaming Bracers',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Screaming Coat',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Screaming Horns',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Screaming Leg Warmers',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Screaming Skirt',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
  ),
  (
    'Speed Powder',
    (
      select id
      from location
      where location_name = 'Stone Circle'
        and not custom
    )
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
    )
  ),
  (
    'Green Power Core',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    )
  ),
  (
    'Nuclear Knuckle',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
    )
  ),
  (
    'Nuclear Whip',
    (
      select id
      from location
      where location_name = 'Stone Circle Hot Zone'
        and not custom
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
    )
  ),
  (
    'Bullfrog Bauble',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Boots',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Bracers',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Cuirass',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Dress',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Halberd',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Helm',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Mace',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Bullfrog Scimitar',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
  ),
  (
    'Heavyfrog Lantern',
    (
      select id
      from location
      where location_name = 'Tuskworks'
        and not custom
    )
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
    )
  ),
  (
    'Scrap Bone Spear',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Scrap Dagger',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Scrap Lantern',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Scrap Rebar',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Scrap Sword',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Skullcap Hammer',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Whistling Mace',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
    )
  ),
  (
    'Zanbato',
    (
      select id
      from location
      where location_name = 'Weapon Crafter'
        and not custom
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
    )
  ),
  (
    'Calcified Greaves',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Calcified Juggernaut Blade',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Calcified Shoulder Pads',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Calcified Zanbato',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Century Greaves',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Century Shoulder Pads',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'DBK Errant Badge',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Digging Claw',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Rainbow Wing Belt',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Regenerating Blade',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Rubber Bone Harness',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Scarab Circlet',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Seasoned Monster Meat',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'The Beetle Bomb',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  ),
  (
    'Zanbato',
    (
      select id
      from location
      where location_name = 'Wet Resin Crafter'
        and not custom
    )
  );