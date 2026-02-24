--------------------------------------------------------------------------------
-- Hunt AI Deck Table
--------------------------------------------------------------------------------
create table hunt_ai_deck (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hunt AI Deck Data
  basic_cards int not null default 0,
  advanced_cards int not null default 0,
  legendary_cards int not null default 0,
  overtone_cards int not null default 0,
  hunt_id uuid not null references hunt(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_ai_deck enable row level security;
create policy "Allow all for owner/shared" on hunt_ai_deck for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = hunt_ai_deck.settlement_id
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
    where su.settlement_id = hunt_ai_deck.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_ai_deck_hunt on hunt_ai_deck(hunt_id);
create index idx_hunt_ai_deck_settlement on hunt_ai_deck(settlement_id);