-- Showdown
create table showdown (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Showdown Data
  ambush boolean not null default false,
  current_turn showdown_turn not null default 'MONSTER',
  monster_level int not null,
  scout_id uuid references survivor(id) on delete cascade,
  settlement_id uuid references settlement(id) on delete cascade,
  showdown_type showdown_type not null default 'REGULAR'
);
alter table showdown enable row level security;
create policy "Allow all for owner" on showdown for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on showdown for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Junction table: links showdowns to showdown monster data
create table showdown_showdown_monster_data (
  showdown_id uuid not null references showdown(id) on delete cascade,
  showdown_monster_data_id uuid not null references showdown_monster_data(id) on delete cascade,
  primary key (showdown_id, showdown_monster_data_id)
);
alter table showdown_showdown_monster_data enable row level security;
create policy "Allow all for owner" on showdown_showdown_monster_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
  )
);
create policy "Allow all for shared users" on showdown_showdown_monster_data for all using (
  exists (
    select 1
    from settlement s
    where s.id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Junction table: links showdowns to showdown survivor data
create table showdown_showdown_survivor_data (
  showdown_id uuid not null references showdown(id) on delete cascade,
  showdown_survivor_data_id uuid not null references showdown_survivor_data(id) on delete cascade,
  primary key (showdown_id, showdown_survivor_data_id)
);
alter table showdown_showdown_survivor_data enable row level security;
create policy "Allow all for owner" on showdown_showdown_survivor_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
  )
);
create policy "Allow all for shared users" on showdown_showdown_survivor_data for all using (
  exists (
    select 1
    from settlement s
    where s.id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_showdown_settlement on showdown (settlement_id);
create index idx_showdown_scout on showdown (scout_id);
create index idx_showdown_showdown_monster_data_showdown on showdown_showdown_monster_data (showdown_id);
create index idx_showdown_showdown_monster_data_monster_data on showdown_showdown_monster_data (showdown_monster_data_id);
create index idx_showdown_showdown_survivor_data_showdown on showdown_showdown_survivor_data (showdown_id);
create index idx_showdown_showdown_survivor_data_survivor_data on showdown_showdown_survivor_data (showdown_survivor_data_id);