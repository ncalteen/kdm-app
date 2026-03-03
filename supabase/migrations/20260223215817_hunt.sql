--------------------------------------------------------------------------------
-- Hunt Table
-- Tracks active hunts for settlements.
--------------------------------------------------------------------------------
create table hunt (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  monster_level int not null,
  monster_position int not null default 12,
  settlement_id uuid references settlement(id) on delete cascade,
  survivor_position int not null default 0
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt enable row level security;
create policy "Allow all for owner/shared" on hunt for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on hunt for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_settlement on hunt(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt for each row execute function update_updated_at();