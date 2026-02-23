-- Nemesis Alternate
create table nemesis_alternate (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Nemesis Alternate Data
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table nemesis_alternate enable row level security;
create policy "Allow read access to all users" on nemesis_alternate for
select using (true);
-- Junction table: links alternate nemeses to nemesis level data by level
create table nemesis_alternate_level (
  nemesis_alternate_id uuid not null references nemesis_alternate(id) on delete cascade,
  nemesis_level_data_id uuid not null references nemesis_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (
    nemesis_alternate_id,
    nemesis_level_data_id,
    level
  )
);
alter table nemesis_alternate_level enable row level security;
create policy "Allow read access to all users" on nemesis_alternate_level for
select using (true);
-- Indexes
create index idx_nemesis_alternate_level_nemesis_id on nemesis_alternate_level (nemesis_alternate_id);
create index idx_nemesis_alternate_level_level_data_id on nemesis_alternate_level (nemesis_level_data_id);