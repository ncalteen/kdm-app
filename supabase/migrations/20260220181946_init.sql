-- Aenas State
create type aenas_state as enum ('Content', 'Hungry');
-- Ambush Type
create type ambush_type as enum ('SURVIVORS', 'MONSTER', 'NONE');
-- Campaign Type
create type campaign_type as enum (
  'PEOPLE_OF_THE_DREAM_KEEPER',
  'PEOPLE_OF_THE_LANTERN',
  'PEOPLE_OF_THE_STARS',
  'PEOPLE_OF_THE_SUN',
  'SQUIRES_OF_THE_CITADEL',
  'CUSTOM'
);
-- Color Choice
create type color_choice as enum (
  'neutral',
  'stone',
  'zinc',
  'slate',
  'gray',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
);
-- Gender
create type gender as enum ('FEMALE', 'MALE');
-- Hunt Event Type
create type hunt_event_type as enum ('ARC', 'BASIC', 'MONSTER', 'SCOUT');
-- Monster Node
create type monster_node as enum (
  'NQ1',
  'NQ2',
  'NQ3',
  'NQ4',
  'NN1',
  'NN2',
  'NN3',
  'CO',
  'FI'
);
-- Monster Version
create type monster_version as enum ('ORIGINAL', 'ALTERNATE', 'VIGNETTE');
-- Resource Category
create type resource_category as enum ('BASIC', 'MONSTER', 'STRANGE', 'VERMIN');
-- Resource Type
create type resource_type as enum (
  'BONE',
  'CLOTH',
  'CONSUMABLE',
  'COPPER',
  'DEATHMETAL',
  'DIAMOND',
  'DUNG',
  'ELASTOMER',
  'EMOTION',
  'FISH',
  'FLOWER',
  'FRUIT',
  'GLASS',
  'HIDE',
  'INDOMITABLE',
  'IRON',
  'ORGAN',
  'OTHER',
  'PERFECT',
  'SCRAP',
  'SILK',
  'SKULL',
  'STONE',
  'HERB',
  'VEGETABLE',
  'VERMIN',
  'VIRID'
);
-- Settlement Phase Step
create type settlement_phase_step as enum (
  'SET_UP_SETTLEMENT',
  'SURVIVORS_RETURN',
  'GAIN_ENDEAVORS',
  'UPDATE_TIMELINE',
  'UPDATE_DEATH_COUNT',
  'CHECK_MILESTONES',
  'DEVELOP',
  'PREPARE_DEPARTING_SURVIVORS',
  'SPECIAL_SHOWDOWN',
  'RECORD_AND_ARCHIVE_RESOURCES',
  'END_SETTLEMENT_PHASE'
);
-- Showdown Turn
create type showdown_turn as enum ('MONSTER', 'SURVIVOR');
-- Showdown Type
create type showdown_type as enum ('REGULAR', 'SPECIAL');
-- Survivor Type
create type survivor_type as enum ('CORE', 'ARC');
--------------------------------------------------------------------------------
-- Helper Functions
--------------------------------------------------------------------------------
create or replace function update_updated_at() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
create or replace function is_admin() returns boolean language sql stable security definer as $$
select auth.role() = 'admin';
$$;