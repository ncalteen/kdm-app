-- AI Deck Data
create table nemesis_ai_deck (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Deck Data
  basic_cards int not null default 0,
  advanced_cards int not null default 0,
  legendary_cards int not null default 0,
  overtone_cards int not null default 0
);
alter table nemesis_ai_deck enable row level security;
create policy "Allow read access to all users" on nemesis_ai_deck for
select using (true);
-- Nemesis Level Data
create table nemesis_level_data (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Nemesis Level Data
  accuracy int not null default 0,
  accuracy_tokens int not null default 0,
  ai_deck_id uuid references nemesis_ai_deck(id) on delete cascade,
  ai_deck_remaining int not null default 0,
  damage int not null default 0,
  damage_tokens int not null default 0,
  evasion int not null default 0,
  evasion_tokens int not null default 0,
  hunt_pos int not null default 12,
  life int not null default 0,
  luck int not null default 0,
  luck_tokens int not null default 0,
  moods varchar [] not null default '{}',
  movement int not null default 1,
  movement_tokens int not null default 0,
  sub_monster_name varchar,
  speed int not null default 0,
  speed_tokens int not null default 0,
  strength int not null default 0,
  strength_tokens int not null default 0,
  survivor_statuses varchar [] not null default '{}',
  toughness int not null default 0,
  toughness_tokens int not null default 0,
  traits varchar [] not null default '{}'
);
alter table nemesis_level_data enable row level security;
create policy "Allow read access to all users" on nemesis_level_data for
select using (true);