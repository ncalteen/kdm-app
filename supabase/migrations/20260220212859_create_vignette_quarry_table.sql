-- Vignette Quarry
create table vignette_quarry (
  id uuid primary key default gen_random_uuid(),
  hunt_board_id uuid references quarry_hunt_board(id) on delete cascade,
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table vignette_quarry enable row level security;
create policy "Allow read access to all users" on vignette_quarry for
select using (true);
-- Junction table: links vignette quarries to quarry timeline data
create table vignette_quarry_timeline (
  vignette_quarry_id uuid not null references vignette_quarry(id) on delete cascade,
  quarry_timeline_data_id uuid not null references quarry_timeline_data(id) on delete cascade,
  primary key (vignette_quarry_id, quarry_timeline_data_id)
);
alter table vignette_quarry_timeline enable row level security;
create policy "Allow read access to all users" on vignette_quarry_timeline for
select using (true);
-- Junction table: links vignette quarries to quarry level data by level
create table vignette_quarry_level (
  vignette_quarry_id uuid not null references vignette_quarry(id) on delete cascade,
  quarry_level_data_id uuid not null references quarry_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (vignette_quarry_id, quarry_level_data_id, level)
);
alter table vignette_quarry_level enable row level security;
create policy "Allow read access to all users" on vignette_quarry_level for
select using (true);
-- Indexes
create index idx_vignette_quarry_level_quarry_id on vignette_quarry_level (vignette_quarry_id);
create index idx_vignette_quarry_level_level_data_id on vignette_quarry_level (quarry_level_data_id);