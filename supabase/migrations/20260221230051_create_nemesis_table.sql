-- Nemesis
create table nemesis (
  id uuid primary key default gen_random_uuid(),
  alternate_id uuid references alternate_nemesis(id) on delete cascade,
  monster_name varchar not null,
  multi_monster boolean not null default false,
  node monster_node not null,
  vignette_id uuid references vignette_nemesis(id) on delete cascade
);
alter table nemesis enable row level security;
create policy "Allow read access to all users" on nemesis for
select using (true);
-- Junction table: links nemeses to nemesis level data by level
create table nemesis_level (
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  nemesis_level_data_id uuid not null references nemesis_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (nemesis_id, nemesis_level_data_id, level)
);
alter table nemesis_level enable row level security;
create policy "Allow read access to all users" on nemesis_level for
select using (true);
-- Junction table: links nemeses to nemesis timeline data
create table nemesis_timeline (
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  nemesis_timeline_data_id uuid not null references nemesis_timeline_data(id) on delete cascade,
  primary key (nemesis_id, nemesis_timeline_data_id)
);
alter table nemesis_timeline enable row level security;
create policy "Allow read access to all users" on nemesis_timeline for
select using (true);
-- Indexes
create index idx_nemesis_level_nemesis_id on nemesis_level (nemesis_id);
create index idx_nemesis_level_data_id on nemesis_level (nemesis_level_data_id);
create index idx_nemesis_timeline_nemesis_id on nemesis_timeline (nemesis_id);
create index idx_nemesis_timeline_data_id on nemesis_timeline (nemesis_timeline_data_id);