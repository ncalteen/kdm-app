-- Ambush Types
create type ambush_type as enum (
  'SURVIVORS',
  'MONSTER'
);

-- Campaign Types
create type campaign_type as enum (
  'PEOPLE_OF_THE_DREAM_KEEPER',
  'PEOPLE_OF_THE_LANTERN',
  'PEOPLE_OF_THE_STARS',
  'PEOPLE_OF_THE_SUN',
  'SQUIRES_OF_THE_CITADEL',
  'CUSTOM'
);

-- Color Choices
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
create type gender as enum (
  'FEMALE',
  'MALE'
);

-- Hunt Event Types
create type hunt_event_type as enum (
  'ARC',
  'BASIC',
  'MONSTER',
  'SCOUT'
);

-- Monster Nodes
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

-- Monster Versions
create type monster_version as enum (
  'ORIGINAL',
  'ALTERNATE',
  'VIGNETTE'
);

-- Resource Categories
create type resource_category as enum (
  'BASIC',
  'MONSTER',
  'STRANGE',
  'VERMIN'
);

-- Resource Types
create type resource_type as enum (
  'BONE',
  'HIDE',
  'ORGAN',
  'SCRAP',
  'HERB',
  'VERMIN'
);

-- Settlement Phase Steps
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

-- Showdown Types
create type showdown_type as enum (
  'REGULAR',
  'SPECIAL'
);

-- Survivor Types
create type survivor_type as enum (
  'CORE',
  'ARC'
);
