-- Quarry Alternate
create table quarry_alternate (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Quarry Alternate Data
  hunt_board_id uuid references quarry_hunt_board(id) on delete cascade,
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table quarry_alternate enable row level security;
create policy "Allow read access to all users" on quarry_alternate for
select using (true);
-- Junction table: links alternate quarries to quarry level data by level
create table quarry_alternate_level (
  quarry_alternate_id uuid not null references quarry_alternate(id) on delete cascade,
  quarry_level_data_id uuid not null references quarry_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (quarry_alternate_id, quarry_level_data_id, level)
);
alter table quarry_alternate_level enable row level security;
create policy "Allow read access to all users" on quarry_alternate_level for
select using (true);
-- Indexes
create index idx_quarry_alternate_level_quarry_id on quarry_alternate_level (quarry_alternate_id);
create index idx_quarry_alternate_level_level_data_id on quarry_alternate_level (quarry_level_data_id);