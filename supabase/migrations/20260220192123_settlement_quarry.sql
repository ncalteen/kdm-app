--------------------------------------------------------------------------------
-- Settlement Quarry Table
-- Represents the relationship between settlements and quarries.
--------------------------------------------------------------------------------
create table settlement_quarry (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  collective_cognition_level_1 boolean not null default false,
  collective_cognition_level_2 boolean [] not null default '{false, false}',
  collective_cognition_level_3 boolean [] not null default '{false, false, false}',
  collective_cognition_prologue boolean not null default false,
  quarry_id uuid not null references quarry(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false,
  -- Constraints
  unique (settlement_id, quarry_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_quarry enable row level security;
create policy "Allow all for owner/shared" on settlement_quarry for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_quarry for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_quarry_settlement on settlement_quarry(settlement_id);
create index idx_settlement_quarry_quarry on settlement_quarry(quarry_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_quarry for each row execute function update_updated_at();