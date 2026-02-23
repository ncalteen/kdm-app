-- Alternate Quarry
create table alternate_quarry (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Alternate Quarry Data
  hunt_board_id uuid references quarry_hunt_board(id) on delete cascade,
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table alternate_quarry enable row level security;
create policy "Allow read access to all users" on alternate_quarry for
select using (true);
-- Junction table: links alternate quarries to quarry level data by level
create table alternate_quarry_level (
  alternate_quarry_id uuid not null references alternate_quarry(id) on delete cascade,
  quarry_level_data_id uuid not null references quarry_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (alternate_quarry_id, quarry_level_data_id, level)
);
alter table alternate_quarry_level enable row level security;
create policy "Allow read access to all users" on alternate_quarry_level for
select using (true);
-- Indexes
create index idx_alternate_quarry_level_quarry_id on alternate_quarry_level (alternate_quarry_id);
create index idx_alternate_quarry_level_level_data_id on alternate_quarry_level (quarry_level_data_id);