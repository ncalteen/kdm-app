--------------------------------------------------------------------------------
-- Settlement Nemesis Table
--------------------------------------------------------------------------------
create table settlement_nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Nemesis Data
  collective_cognition_level_1 boolean not null default false,
  collective_cognition_level_2 boolean not null default false,
  collective_cognition_level_3 boolean not null default false,
  level_1_defeated boolean not null default false,
  level_2_defeated boolean not null default false,
  level_3_defeated boolean not null default false,
  level_4_defeated boolean not null default false,
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false,
  unique (settlement_id, nemesis_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_nemesis enable row level security;
create policy "Allow all for owner/shared" on settlement_nemesis for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_nemesis_settlement on settlement_nemesis(settlement_id);
create index idx_settlement_nemesis_nemesis on settlement_nemesis(nemesis_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_nemesis for each row execute function update_updated_at();