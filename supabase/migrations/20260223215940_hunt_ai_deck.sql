--------------------------------------------------------------------------------
-- Hunt AI Deck Table
-- This table stores the AI deck composition for each hunt, allowing for user
-- adjustment without affecting base monster data.
--------------------------------------------------------------------------------
create table hunt_ai_deck (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
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
create policy "Allow all for owner/shared" on hunt_ai_deck for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on hunt_ai_deck for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_ai_deck_hunt on hunt_ai_deck(hunt_id);
create index idx_hunt_ai_deck_settlement on hunt_ai_deck(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_ai_deck for each row execute function update_updated_at();