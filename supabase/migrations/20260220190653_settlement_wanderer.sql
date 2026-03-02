--------------------------------------------------------------------------------
-- Junction Table: Settlement Wanderer
-- Represents the many-to-many relationship between Settlements and Wanderers.
--------------------------------------------------------------------------------
create table settlement_wanderer (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  -- Constraints
  unique (settlement_id, wanderer_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_wanderer enable row level security;
create policy "Allow all for owner/shared" on settlement_wanderer for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_wanderer for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_wanderer_settlement on settlement_wanderer(settlement_id);
create index idx_settlement_wanderer_wanderer on settlement_wanderer(wanderer_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_wanderer for each row execute function update_updated_at();