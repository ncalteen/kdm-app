--------------------------------------------------------------------------------
-- Showdown Monster Table
--------------------------------------------------------------------------------
create table showdown_monster (
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
  showdown_id uuid not null references showdown(id) on delete cascade,
  speed int not null default 0,
  speed_tokens int not null default 0,
  strength int not null default 0,
  strength_tokens int not null default 0,
  toughness int not null default 0,
  traits varchar [] not null default '{}',
  wounds int not null default 0
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown_monster enable row level security;
create policy "Allow all for owner/shared" on showdown_monster for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = showdown_monster.settlement_id
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
    where su.settlement_id = showdown_monster.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_monster_settlement on showdown_monster(settlement_id);
create index idx_showdown_monster_showdown on showdown_monster(showdown_id);