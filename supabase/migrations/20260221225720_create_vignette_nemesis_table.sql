-- Vignette nemesis
create table vignette_nemesis (
  id uuid primary key default gen_random_uuid(),
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table vignette_nemesis enable row level security;
create policy "Allow read access to all users" on vignette_nemesis for
select using (true);
-- Junction table: links vignette nemeses to nemesis timeline data
create table vignette_nemesis_timeline (
  vignette_nemesis_id uuid not null references vignette_nemesis(id) on delete cascade,
  nemesis_timeline_data_id uuid not null references nemesis_timeline_data(id) on delete cascade,
  primary key (vignette_nemesis_id, nemesis_timeline_data_id)
);
alter table vignette_nemesis_timeline enable row level security;
create policy "Allow read access to all users" on vignette_nemesis_timeline for
select using (true);
-- Junction table: links vignette nemeses to nemesis level data by level
create table vignette_nemesis_level (
  vignette_nemesis_id uuid not null references vignette_nemesis(id) on delete cascade,
  nemesis_level_data_id uuid not null references nemesis_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (
    vignette_nemesis_id,
    nemesis_level_data_id,
    level
  )
);
alter table vignette_nemesis_level enable row level security;
create policy "Allow read access to all users" on vignette_nemesis_level for
select using (true);
-- Indexes
create index idx_vignette_nemesis_level_nemesis_id on vignette_nemesis_level (vignette_nemesis_id);
create index idx_vignette_nemesis_level_level_data_id on vignette_nemesis_level (nemesis_level_data_id);