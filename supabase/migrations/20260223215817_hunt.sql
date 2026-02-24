--------------------------------------------------------------------------------
-- Hunt Table
--------------------------------------------------------------------------------
create table hunt (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hunt Data
  monster_level int not null,
  monster_position int not null default 12,
  scout_id uuid references survivor(id) on delete
  set null,
    settlement_id uuid references settlement(id) on delete cascade,
    survivor_position int not null default 0
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt enable row level security;
create policy "Allow all for owner/shared" on hunt for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_settlement on hunt(settlement_id);
create index idx_hunt_scout on hunt(scout_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt for each row execute function update_updated_at();