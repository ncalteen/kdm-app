--------------------------------------------------------------------------------
-- Bullfrogdog
--------------------------------------------------------------------------------
-- Level 3 Moods
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Bullfrogdog'
    and nl.level_number = 3
)
insert into quarry_level_mood (quarry_level_id, mood_id)
select lvl.id,
  c.id
from lvl,
  mood c
where c.mood_name in ('Indigestion');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Bullfrogdog'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Bullish Charge', 'Double Sphincter', 'Foul Stench', 'Gaseous Bloat', 'Mature', 'Indomitable');
--------------------------------------------------------------------------------
-- Screaming Nukalope
--------------------------------------------------------------------------------
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Screaming Nukalope'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Atomic Vigor - Inert', 'Critical Mass - Inert', 'Prehensile Tail - Inert');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Screaming Nukalope'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Atomic Vigor - Inert', 'Critical Mass - Inert', 'Exponential Yield', 'Legendary Horns', 'Prehensile Tail - Inert', 'Indomitable');
--------------------------------------------------------------------------------
-- White Gigalion
--------------------------------------------------------------------------------
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'White Gigalion'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Giga Claws', 'Smart Cat', 'Vicious');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'White Gigalion'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Giga Claws', 'Golden Eyes', 'Merciless', 'Smart Cat', 'Vicious', 'Indomitable');
--------------------------------------------------------------------------------
-- Crimson Crocodile
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Crimson Crocodile'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Adrenal Adept', 'Enchanted Flesh', 'Immortal Presence');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Crimson Crocodile'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Adrenal Adept', 'Blood Soaked', 'Enchanted Flesh', 'Immortal Presence');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Crimson Crocodile'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Adrenal Adept', 'Blood Secret', 'Blood Soaked', 'Enchanted Flesh', 'Immortal Presence', 'Indomitable');
--------------------------------------------------------------------------------
-- Dragon King
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Dragon King'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Irradiate', 'Unseen Agony');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Dragon King'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Irradiate', 'Unseen Agony');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Dragon King'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Irradiate', 'Smolder', 'Unseen Agony', 'Indomitable');
--------------------------------------------------------------------------------
-- Dung Beetle Knight
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Dung Beetle Knight'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Baller', 'Power Forward', 'Prepared Tunnels', 'Separation Anxiety');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Dung Beetle Knight'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Baller', 'Heavy Load', 'Power Forward', 'Prepared Tunnels', 'Separation Anxiety');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Dung Beetle Knight'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Burrow', 'Baller', 'Heavy Load', 'Power Forward', 'Prepared Tunnels', 'Separation Anxiety', 'Indomitable');
--------------------------------------------------------------------------------
-- Flower Knight
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Flower Knight'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Bloom', 'Set Roots');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Flower Knight'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Bloom', 'Razor Bulbs', 'Set Roots');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Flower Knight'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Bloom', 'Heart of the Woods', 'Perfect Aim', 'Razor Bulbs', 'Set Roots', 'Indomitable');
--------------------------------------------------------------------------------
-- Frogdog
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Frogdog'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Double Sphincter', 'Foul Stench', 'Gaseous Bloat', 'Leap');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Frogdog'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Double Sphincter', 'Foul Stench', 'Gaseous Bloat', 'Leap', 'Mature');
-- Level 3 Moods
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Frogdog'
    and nl.level_number = 3
)
insert into quarry_level_mood (quarry_level_id, mood_id)
select lvl.id,
  c.id
from lvl,
  mood c
where c.mood_name in ('Indigestion');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Frogdog'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Double Sphincter', 'Foul Stench', 'Gaseous Bloat', 'Leap', 'Mature', 'Indomitable');
--------------------------------------------------------------------------------
-- Gorm
--------------------------------------------------------------------------------
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Gorm'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Gorm''s Den', 'Musth');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Gorm'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Ancient Tusks', 'Gormyard', 'Indomitable');
--------------------------------------------------------------------------------
-- King
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'King'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Audio Synthesis', 'Current', 'Ghost Geometry', 'King''s New Clothes');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'King'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Audio Synthesis', 'Current', 'Ghost Geometry', 'Half Power', 'King''s New Clothes');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'King'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Audio Synthesis', 'Current', 'Full Power', 'Ghost Geometry', 'King''s New Clothes', 'King''s Presence', 'Indomitable');
--------------------------------------------------------------------------------
-- Lion God
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Lion God'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Heft', 'Hollow Earth', 'Whiplash');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Lion God'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Divine Prowess', 'Heft', 'Hollow Earth', 'Whiplash');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Lion God'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Divine Prowess', 'Heft', 'Hollow Earth', 'Immaculate Intuition', 'Whiplash', 'Indomitable');
--------------------------------------------------------------------------------
-- Phoenix
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Phoenix'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Materialize', 'Spiral Age', 'Zeal');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Phoenix'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Materialize', 'Spiral Age', 'Top of the Food Chain', 'Zeal');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Phoenix'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Materialize', 'Spiral Age', 'Top of the Food Chain', 'Zeal', 'Indomitable');
--------------------------------------------------------------------------------
-- Screaming Antelope
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Screaming Antelope'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Trample');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Screaming Antelope'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Diabolical', 'Trample');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Screaming Antelope'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Diabolical', 'Hypermetabolism', 'Legendary Horns', 'Trample', 'Indomitable');
--------------------------------------------------------------------------------
-- Smog Singers
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Smog Singers'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Performing Artists', 'Song Cards', 'Vibration Damage');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Smog Singers'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Overtone Singing', 'Performing Artists', 'Song Cards', 'Vibration Damage');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Smog Singers'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Overtone Singing', 'Performing Artists', 'Singing Whale', 'Song Cards', 'Vibration Damage', 'Indomitable');
--------------------------------------------------------------------------------
-- Spidicules
--------------------------------------------------------------------------------
-- Level 1 Moods
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Spidicules'
    and nl.level_number = 1
)
insert into quarry_level_mood (quarry_level_id, mood_id)
select lvl.id,
  c.id
from lvl,
  mood c
where c.mood_name in ('Frantic Spinning');
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Spidicules'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Spawn', 'Spiderling Action', 'Twitching Leg Pile');
-- Level 2 Moods
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Spidicules'
    and nl.level_number = 2
)
insert into quarry_level_mood (quarry_level_id, mood_id)
select lvl.id,
  c.id
from lvl,
  mood c
where c.mood_name in ('Feeding Time');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Spidicules'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Hivemind', 'Spiderling Action', 'Spawn', 'Twitching Leg Pile');
-- Level 3 Moods
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Spidicules'
    and nl.level_number = 3
)
insert into quarry_level_mood (quarry_level_id, mood_id)
select lvl.id,
  c.id
from lvl,
  mood c
where c.mood_name in ('Necrotoxins');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Spidicules'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('10,000 Teeth', 'Hivemind', 'Spawn', 'Spiderling Action', 'Twitching Leg Pile', 'Indomitable');
--------------------------------------------------------------------------------
-- Sunstalker
--------------------------------------------------------------------------------
-- Level 1 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Sunstalker'
    and nl.level_number = 1
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Light & Shadow', 'Shade', 'Shadows of Darkness', 'Solar Energy', 'Sun Dial');
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Sunstalker'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Light & Shadow', 'Living Shadows', 'Shade', 'Shadows of Darkness', 'Solar Energy', 'Sun Dial');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'Sunstalker'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Light & Shadow', 'Living Shadows', 'Monochrome', 'Shade', 'Shadows of Darkness', 'Solar Energy', 'Sun Dial', 'Indomitable');
--------------------------------------------------------------------------------
-- White Lion
--------------------------------------------------------------------------------
-- Level 2 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'White Lion'
    and nl.level_number = 2
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Cunning');
-- Level 3 Traits
with lvl as (
  select nl.id
  from quarry_level nl
    join quarry p on p.id = nl.quarry_id
  where p.monster_name = 'White Lion'
    and nl.level_number = 3
)
insert into quarry_level_trait (quarry_level_id, trait_id)
select lvl.id,
  c.id
from lvl,
  trait c
where c.trait_name in ('Cunning', 'Merciless', 'Indomitable');
