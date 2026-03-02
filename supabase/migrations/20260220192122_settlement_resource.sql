--------------------------------------------------------------------------------
-- Settlement Resource Table
-- Represents the relationship between settlements and their resources.
--------------------------------------------------------------------------------
create table settlement_resource (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  resource_id uuid not null references resource(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_resource enable row level security;
create policy "Allow all for owner/shared" on settlement_resource for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_resource for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_resource_settlement on settlement_resource(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_resource for each row execute function update_updated_at();