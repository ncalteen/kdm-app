-- AI Deck Data
create table hunt_ai_deck (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Deck Data
  basic_cards int not null default 0,
  advanced_cards int not null default 0,
  legendary_cards int not null default 0,
  overtone_cards int not null default 0,
  settlement_id uuid not null references settlement(id) on delete cascade
);
alter table hunt_ai_deck enable row level security;
create policy "Allow all for owner" on hunt_ai_deck for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on hunt_ai_deck for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Hunt Monster Data
create table hunt_monster_data (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hunt Monster Data
  accuracy integer not null default 0,
  accuracy_tokens integer not null default 0,
  ai_deck_id uuid not null references hunt_ai_deck(id) on delete cascade,
  ai_deck_remaining integer not null default 0,
  damage integer not null default 0,
  damage_tokens integer not null default 0,
  evasion integer not null default 0,
  evasion_tokens integer not null default 0,
  knocked_down boolean not null default false,
  luck integer not null default 0,
  luck_tokens integer not null default 0,
  moods varchar [] not null default '{}',
  movement integer not null default 0,
  movement_tokens integer not null default 0,
  notes text not null default '',
  speed integer not null default 0,
  speed_tokens integer not null default 0,
  strength integer not null default 0,
  strength_tokens integer not null default 0,
  toughness integer not null default 0,
  traits varchar [] not null default '{}',
  wounds integer not null default 0
);