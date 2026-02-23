-- Quarry Vignette
create table quarry_vignette (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Quarry Vignette
  hunt_board_id uuid references quarry_hunt_board(id) on delete cascade,
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table quarry_vignette enable row level security;
create policy "Allow read access to all users" on quarry_vignette for
select using (true);
-- Junction table: links vignette quarries to quarry timeline data
create table quarry_vignette_timeline (
  quarry_vignette_id uuid not null references quarry_vignette(id) on delete cascade,
  quarry_timeline_data_id uuid not null references quarry_timeline_data(id) on delete cascade,
  primary key (quarry_vignette_id, quarry_timeline_data_id)
);
alter table quarry_vignette_timeline enable row level security;
create policy "Allow read access to all users" on quarry_vignette_timeline for
select using (true);
-- Junction table: links vignette quarries to quarry level data by level
create table quarry_vignette_level (
  quarry_vignette_id uuid not null references quarry_vignette(id) on delete cascade,
  quarry_level_data_id uuid not null references quarry_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (quarry_vignette_id, quarry_level_data_id, level)
);
alter table quarry_vignette_level enable row level security;
create policy "Allow read access to all users" on quarry_vignette_level for
select using (true);
-- Indexes
create index idx_quarry_vignette_level_quarry_id on quarry_vignette_level (quarry_vignette_id);
create index idx_quarry_vignette_level_level_data_id on quarry_vignette_level (quarry_level_data_id);