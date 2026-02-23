-- Alternate Nemesis
create table alternate_nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Alternate Nemesis Data
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false
);
alter table alternate_nemesis enable row level security;
create policy "Allow read access to all users" on alternate_nemesis for
select using (true);
-- Junction table: links alternate quarries to quarry level data by level
create table alternate_nemesis_level (
  alternate_nemesis_id uuid not null references alternate_nemesis(id) on delete cascade,
  nemesis_level_data_id uuid not null references nemesis_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (
    alternate_nemesis_id,
    nemesis_level_data_id,
    level
  )
);
alter table alternate_nemesis_level enable row level security;
create policy "Allow read access to all users" on alternate_nemesis_level for
select using (true);
-- Indexes
create index idx_alternate_nemesis_level_nemesis_id on alternate_nemesis_level (alternate_nemesis_id);
create index idx_alternate_nemesis_level_level_data_id on alternate_nemesis_level (nemesis_level_data_id);