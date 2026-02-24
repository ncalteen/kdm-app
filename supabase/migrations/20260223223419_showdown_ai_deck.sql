--------------------------------------------------------------------------------
-- Showdown AI Deck Table
--------------------------------------------------------------------------------
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
  settlement_id uuid not null references settlement(id) on delete cascade,
  showdown_id uuid not null references showdown(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown_ai_deck enable row level security;
create policy "Allow all for owner/shared" on showdown_ai_deck for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_ai_deck_settlement on showdown_ai_deck(settlement_id);
create index idx_showdown_ai_deck_showdown on showdown_ai_deck(showdown_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on showdown_ai_deck for each row execute function update_updated_at();