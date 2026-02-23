-- Quarry
create table quarry (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Quarry Data
  alternate_id uuid references quarry_alternate(id) on delete cascade,
  hunt_board_id uuid references quarry_hunt_board(id) on delete cascade,
  locations varchar [] not null default '{}',
  monster_name varchar not null,
  multi_monster boolean not null default false,
  node monster_node not null,
  prologue boolean not null default false,
  vignette_id uuid references quarry_vignette(id) on delete cascade
);
alter table quarry enable row level security;
create policy "Allow read access to all users" on quarry for
select using (true);
-- Junction table: links quarries to collective cognition rewards
create table quarry_cc_reward (
  quarry_id uuid not null references quarry(id) on delete cascade,
  cc_reward_id uuid not null references quarry_collective_cognition_reward(id) on delete cascade,
  primary key (quarry_id, cc_reward_id)
);
alter table quarry_cc_reward enable row level security;
create policy "Allow read access to all users" on quarry_cc_reward for
select using (true);
-- Junction table: links quarries to quarry level data by level
create table quarry_level (
  quarry_id uuid not null references quarry(id) on delete cascade,
  quarry_level_data_id uuid not null references quarry_level_data(id) on delete cascade,
  level int not null check (
    level between 1 and 4
  ),
  primary key (quarry_id, quarry_level_data_id, level)
);
alter table quarry_level enable row level security;
create policy "Allow read access to all users" on quarry_level for
select using (true);
-- Junction table: links quarries to quarry timeline data
create table quarry_timeline (
  quarry_id uuid not null references quarry(id) on delete cascade,
  quarry_timeline_data_id uuid not null references quarry_timeline_data(id) on delete cascade,
  primary key (quarry_id, quarry_timeline_data_id)
);
alter table quarry_timeline enable row level security;
create policy "Allow read access to all users" on quarry_timeline for
select using (true);
-- Indexes
create index idx_quarry_cc_reward_quarry_id on quarry_cc_reward (quarry_id);
create index idx_quarry_cc_reward_cc_reward_id on quarry_cc_reward (cc_reward_id);
create index idx_quarry_level_quarry_id on quarry_level (quarry_id);
create index idx_quarry_level_data_id on quarry_level (quarry_level_data_id);
create index idx_quarry_timeline_quarry_id on quarry_timeline (quarry_id);
create index idx_quarry_timeline_data_id on quarry_timeline (quarry_timeline_data_id);