--------------------------------------------------------------------------------
-- Hunt Monster Data Table
--------------------------------------------------------------------------------
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
  monster_name varchar,
  movement integer not null default 0,
  movement_tokens integer not null default 0,
  notes text not null default '',
  settlement_id uuid not null references settlement (id) on delete cascade,
  speed integer not null default 0,
  speed_tokens integer not null default 0,
  strength integer not null default 0,
  strength_tokens integer not null default 0,
  toughness integer not null default 0,
  traits varchar [] not null default '{}',
  wounds integer not null default 0
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_monster_data enable row level security;
create policy "Allow all for owner/shared" on hunt_monster_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = hunt_monster_data.settlement_id
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = hunt_monster_data.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_monster_data_settlement on hunt_monster_data(settlement_id);