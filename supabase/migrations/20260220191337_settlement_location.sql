--------------------------------------------------------------------------------
-- Settlement Location Table
--------------------------------------------------------------------------------
create table settlement_location (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Location Data
  location_name varchar not null,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false,
  unique (settlement_id, location_name)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_location enable row level security;
create policy "Allow all for owner/shared" on settlement_location for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_location_settlement on settlement_location(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_location for each row execute function update_updated_at();