-- AI Deck Data
create table showdown_ai_deck (
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
alter table showdown_ai_deck enable row level security;
create policy "Allow all for owner" on showdown_ai_deck for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on showdown_ai_deck for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_showdown_ai_deck_settlement on showdown_ai_deck (settlement_id);
-- Showdown Monster
create table showdown_monster_data (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Showdown Monster Data
  ai_card_drawn boolean not null default false,
  ai_deck_id uuid not null references showdown_ai_deck(id) on delete cascade,
  ai_deck_remaining int not null default 0,
  damage int not null default 0,
  damage_tokens int not null default 0,
  evasion int not null default 0,
  evasion_tokens int not null default 0,
  knocked_down boolean not null default false,
  luck int not null default 0,
  luck_tokens int not null default 0,
  moods varchar [] not null default '{}',
  monster_name varchar,
  movement int not null default 0,
  movement_tokens int not null default 0,
  notes text not null default '',
  settlement_id uuid not null references settlement (id) on delete cascade,
  speed int not null default 0,
  speed_tokens int not null default 0,
  strength int not null default 0,
  strength_tokens int not null default 0,
  toughness int not null default 0,
  traits varchar [] not null default '{}',
  wounds int not null default 0
);
alter table showdown_monster_data enable row level security;
create policy "Allow all for owner" on showdown_monster_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on showdown_monster_data for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_showdown_monster_data_ai_deck on showdown_monster_data (ai_deck_id);
create index idx_showdown_monster_data_settlement on showdown_monster_data (settlement_id);