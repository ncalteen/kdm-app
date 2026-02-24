--------------------------------------------------------------------------------
-- Junction Table: Settlement Philosophy
--------------------------------------------------------------------------------
create table settlement_philosophy (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Philosophy Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  philosophy_id uuid not null references philosophy(id) on delete cascade,
  unique (settlement_id, philosophy_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_philosophy enable row level security;
create policy "Allow all for owner/shared" on settlement_philosophy for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_philosophy_settlement on settlement_philosophy(settlement_id);
create index idx_settlement_philosophy_philosophy on settlement_philosophy(philosophy_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_philosophy for each row execute function update_updated_at();