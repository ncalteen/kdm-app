--------------------------------------------------------------------------------
-- Killenium Butcher
--------------------------------------------------------------------------------
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Killenium Butcher'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Scorn', 'Self-Aware');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Killenium Butcher'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Berzerker',
    'Invincible',
    'Scorn',
    'Self-Aware',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Atnas the Child Eater
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Atnas the Child Eater'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Old Battle Scars',
    'Master''s Presence',
    'Mad Master',
    'Spark of Joy'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Atnas the Child Eater'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Curb Stomp',
    'Mad Master',
    'Master''s Presence',
    'Old Battle Scars',
    'Spark of Joy'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Atnas the Child Eater'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Curb Stomp',
    'Keen Eyes',
    'Mad Master',
    'Master''s Presence',
    'Old Battle Scars',
    'Spark of Joy',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Black Knight
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Black Knight'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Red Preference',
    'Sheer Cliffs',
    'Smash',
    'Spry'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Black Knight'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Red Preference',
    'Sheer Cliffs',
    'Smash',
    'Spry',
    'Unsteady'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Black Knight'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Red Preference',
    'Seasoned Duelist',
    'Sheer Cliffs',
    'Smash',
    'Spry',
    'Unsteady',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Butcher
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Butcher'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Berserker',
    'Dreaded Trophies',
    'Fast Target'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Butcher'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Dreaded Trophies',
    'Fast Target',
    'Frenzied Berserker'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Butcher'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Dreaded Trophies',
    'Fast Target',
    'Frenzied Berserker',
    'Invincible',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Dying God (Dragon King)
--------------------------------------------------------------------------------
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Dying God (Dragon King)'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Irradiate',
    'Smolder',
    'Trample',
    'Unseen Agony'
  );
--------------------------------------------------------------------------------
-- Gambler
--------------------------------------------------------------------------------
-- Level 4
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Gambler'
    and nl.level_number = 4
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Critical Failure',
    'Dice Bag',
    'Double or Death',
    'Gambler''s Dice',
    'Magister Ludi'
  );
--------------------------------------------------------------------------------
-- Godhand
--------------------------------------------------------------------------------
-- Level 4
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Godhand'
    and nl.level_number = 4
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Old Blood',
    'Reinforcements',
    'True Ghost Step',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Gold Smoke Knight
--------------------------------------------------------------------------------
-- Level 4
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Gold Smoke Knight'
    and nl.level_number = 4
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Blacken',
    'Frustration',
    'Mauler',
    'Secondary Forge',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- The Hand
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Hand'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Applause',
    'Blue Lens - Closed',
    'Ghost Step',
    'Green Lens - Closed',
    'Impossible Eyes',
    'Red Lens - Closed'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Hand'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Applause',
    'Blue Lens - Closed',
    'Ghost Step',
    'Green Lens - Closed',
    'Impossible Eyes',
    'Red Lens - Closed'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Hand'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Applause',
    'Blue Lens - Closed',
    'Ghost Step',
    'Green Lens - Closed',
    'Impossible Eyes',
    'Red Lens - Closed',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- King's Man
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'King''s Man'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'King''s Aura',
    'King''s Combat',
    'Out-Fighting',
    'Weak Spot'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'King''s Man'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'King''s Aura',
    'King''s Combat',
    'Out-Fighting',
    'Silent Hymn',
    'Weak Spot'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'King''s Man'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'King''s Aura',
    'King''s Combat',
    'Out-Fighting',
    'Silent Hymn',
    'Weak Spot',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Lion Knight
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Lion Knight'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Outburst', 'Zeal');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Lion Knight'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Drama Lessons', 'Outburst', 'Zeal');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Lion Knight'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Drama Lessons',
    'Last Act',
    'Outburst',
    'Zeal',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Lonely Tree
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Lonely Tree'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Bear Fruit',
    'Impenetrable Trunk',
    'Nightmare Fruit'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Lonely Tree'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Bear Fruit',
    'Impenetrable Trunk',
    'Moving Ground',
    'Nightmare Fruit'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Lonely Tree'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Bear Fruit',
    'Impenetrable Trunk',
    'Moving Ground',
    'Nightmare Fruit'
  );
--------------------------------------------------------------------------------
-- Manhunter
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Manhunter'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Gritty Armament',
    'Gun Action',
    'Short Stride',
    'Tombstone'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Manhunter'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Full Stride',
    'Gritty Armament',
    'Gun Action',
    'Tombstone'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Manhunter'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Full Stride',
    'Gritty Armament',
    'Gun Action',
    'Tombstone',
    'Indomitable'
  );
-- Level 4
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Manhunter'
    and nl.level_number = 4
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Full Stride',
    'Gritty Armament',
    'Gun Action',
    'Tombstone',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Pariah
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Pariah'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Somatic Empathy');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Pariah'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Cyclopean Cruelty', 'Somatic Empathy');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Pariah'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Cyclopean Cruelty',
    'Inverted',
    'Jagged Grotto',
    'Somatic Empathy',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Red Witches
--------------------------------------------------------------------------------
-- Level 1
-- Braal
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Red Witches'
    and nl.level_number = 1
    and nl.sub_monster_name = 'Braal'
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Boiling Blood', 'Discouraging Presence');
-- Level 2
-- Braal
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Red Witches'
    and nl.level_number = 2
    and nl.sub_monster_name = 'Braal'
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Discouraging Presence');
-- Nico
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Red Witches'
    and nl.level_number = 2
    and nl.sub_monster_name = 'Nico'
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Red Initiate', 'Witching Cloak');
-- Level 3
-- Braal
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Red Witches'
    and nl.level_number = 3
    and nl.sub_monster_name = 'Braal'
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Discouraging Presence', 'Indomitable');
-- Nico
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Red Witches'
    and nl.level_number = 3
    and nl.sub_monster_name = 'Nico'
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Red Initiate', 'Witching Cloak', 'Indomitable');
-- Seer
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Red Witches'
    and nl.level_number = 3
    and nl.sub_monster_name = 'Seer'
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Red Secret', 'Indomitable');
--------------------------------------------------------------------------------
-- Slenderman
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Slenderman'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Ensnare', 'Gloom');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Slenderman'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Ensnare', 'Gloom');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Slenderman'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Ensnare', 'Gloom', 'Hounds', 'Indomitable');
--------------------------------------------------------------------------------
-- The Great Devourer (Sunstalker)
--------------------------------------------------------------------------------
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Great Devourer (Sunstalker)'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Light & Shadow',
    'Living Shadows',
    'Monochrome',
    'Shade',
    'Shadows of Darkness',
    'Solar Energy',
    'Sun Dial',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- The Tyrant
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Tyrant'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Crooked Step',
    'Destiny''s Marrow',
    'Spectral Blast'
  );
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Tyrant'
    and nl.level_number = 2
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Crooked Step',
    'Destiny''s Marrow',
    'Quickened',
    'Spectral Blast'
  );
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Tyrant'
    and nl.level_number = 3
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Crooked Step',
    'Destiny''s Marrow',
    'Quickened',
    'Spectral Blast',
    'Indomitable'
  );
--------------------------------------------------------------------------------
-- Watcher
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Watcher'
    and nl.level_number = 1
)
insert into nemesis_level_trait (nemesis_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in (
    'Audience',
    'Lantern Vortex',
    'Vapor of Nothingness',
    'Indomitable'
  );