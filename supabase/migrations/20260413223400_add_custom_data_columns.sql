--------------------------------------------------------------------------------
-- Enums
--------------------------------------------------------------------------------
-- Affinities
create type affinity as enum ('BLUE', 'GREEN', 'RED');
-- Armor Locations
create type armor_location as enum (
  'ARMS',
  'CHEST',
  'FEET',
  'HEAD',
  'WAIST'
);
-- Gear Keywords
create type gear_keyword as enum (
  'AMBER',
  'AMMUNITION',
  'ARMOR',
  'ARROW',
  'AXE',
  'BALM',
  'BONE',
  'BOW',
  'CLEAVER',
  'CLUB',
  'DAGGER',
  'DEATHMETAL',
  'FAN',
  'FEATHER',
  'FINESSE',
  'FIST_AND_TOOTH',
  'FLAMMABLE',
  'FLESH',
  'FRAGILE',
  'FUR',
  'GLOOMY',
  'GORMSKIN',
  'GRAND',
  'HEAVY',
  'HERB',
  'INSTRUMENT',
  'ITEM',
  'JEWELRY',
  'KATANA',
  'KATAR',
  'KNIGHT',
  'LANTERN',
  'LEATHER',
  'MASK',
  'MELEE',
  'METAL',
  'MINERAL',
  'NOISY',
  'NUCLEAR',
  'OTHER',
  'PICKAXE',
  'RANGED',
  'RAWHIDE',
  'SAW',
  'SCALE',
  'SCIMITAR',
  'SCYTHE',
  'SEED',
  'SELFISH',
  'SHIELD',
  'SICKLE',
  'SILK',
  'SOLUBLE',
  'SPEAR',
  'STINKY',
  'SWORD',
  'SYMBOL',
  'THROWN',
  'TOOL',
  'TWO_HANDED',
  'WHIP'
);
--------------------------------------------------------------------------------
-- Character Table
--------------------------------------------------------------------------------
ALTER TABLE character
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Collective Cognition Reward Table
--------------------------------------------------------------------------------
ALTER TABLE collective_cognition_reward
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Disorder Table
--------------------------------------------------------------------------------
ALTER TABLE disorder
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Fighting Art Table
--------------------------------------------------------------------------------
ALTER TABLE fighting_art
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Innovation Table
--------------------------------------------------------------------------------
ALTER TABLE innovation
ADD COLUMN rules TEXT,
  ADD COLUMN consequences TEXT,
  ADD COLUMN benefits TEXT;
--------------------------------------------------------------------------------
-- Knowledge Table
--------------------------------------------------------------------------------
ALTER TABLE knowledge
ADD COLUMN rules TEXT,
  ADD COLUMN observation_conditions TEXT,
  ADD COLUMN observation_rank_up_milestone INTEGER;
--------------------------------------------------------------------------------
-- Location Table
--------------------------------------------------------------------------------
ALTER TABLE location
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Milestone Table
--------------------------------------------------------------------------------
ALTER TABLE milestone
ADD COLUMN requirements TEXT,
  ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Monster Tables
--------------------------------------------------------------------------------
ALTER TABLE quarry
ADD COLUMN instinct TEXT,
  ADD COLUMN basic_action TEXT,
  ADD COLUMN blind_spot TEXT,
  ADD COLUMN defeat_outcome TEXT,
  ADD COLUMN deployment_rules TEXT,
  ADD COLUMN victory_outcome TEXT;
ALTER TABLE nemesis
ADD COLUMN instinct TEXT,
  ADD COLUMN basic_action TEXT,
  ADD COLUMN blind_spot TEXT,
  ADD COLUMN defeat_outcome TEXT,
  ADD COLUMN deployment_rules TEXT,
  ADD COLUMN victory_outcome TEXT;
--------------------------------------------------------------------------------
-- Neurosis Table
--------------------------------------------------------------------------------
ALTER TABLE neurosis
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Philosophy Table
--------------------------------------------------------------------------------
ALTER TABLE philosophy
ADD COLUMN hunt_xp_milestones INTEGER [],
  ADD COLUMN tenet_knowledge_id UUID references knowledge(id) on delete
set null,
  ADD COLUMN tier INTEGER;
--------------------------------------------------------------------------------
-- Principle Table
--------------------------------------------------------------------------------
ALTER TABLE principle
ADD COLUMN option_1_rules TEXT,
  ADD COLUMN option_2_rules TEXT;
--------------------------------------------------------------------------------
-- Secret Fighting Art Table
--------------------------------------------------------------------------------
ALTER TABLE secret_fighting_art
ADD COLUMN rules TEXT;
--------------------------------------------------------------------------------
-- Weapon Type Table
--------------------------------------------------------------------------------
ALTER TABLE weapon_type
ADD COLUMN master_proficiency_rules TEXT,
  ADD COLUMN specialist_proficiency_rules TEXT;