--------------------------------------------------------------------------------
-- Junction Table: Settlement Innovation
-- Represents the many-to-many relationship between settlements and
-- innovations.
--------------------------------------------------------------------------------
create table settlement_innovation (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  innovation_id uuid not null references innovation(id) on delete cascade,
  -- Constraints
  unique (settlement_id, innovation_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_innovation enable row level security;
create policy "Allow all for owner/shared" on settlement_innovation for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_innovation for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_innovation_settlement on settlement_innovation(settlement_id);
create index idx_settlement_innovation_innovation on settlement_innovation(innovation_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_innovation for each row execute function update_updated_at();