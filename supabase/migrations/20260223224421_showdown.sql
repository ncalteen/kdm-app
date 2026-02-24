--------------------------------------------------------------------------------
-- Showdown Table
--------------------------------------------------------------------------------
create table showdown (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Showdown Data
  ambush boolean not null default false,
  current_turn showdown_turn not null default 'MONSTER',
  monster_level int not null,
  scout_id uuid references survivor(id) on delete
  set null,
    settlement_id uuid references settlement(id) on delete cascade,
    showdown_type showdown_type not null default 'REGULAR'
);
--------------------------------------------------------------------------------
-- Junction Table: Showdown Monster Data
--------------------------------------------------------------------------------
create table showdown_showdown_monster_data (
  showdown_id uuid not null references showdown(id) on delete cascade,
  showdown_monster_data_id uuid not null references showdown_monster_data(id) on delete cascade,
  primary key (showdown_id, showdown_monster_data_id)
);
--------------------------------------------------------------------------------
-- Junction Table: Showdown Survivor Data
--------------------------------------------------------------------------------
create table showdown_showdown_survivor_data (
  showdown_id uuid not null references showdown(id) on delete cascade,
  showdown_survivor_data_id uuid not null references showdown_survivor_data(id) on delete cascade,
  primary key (showdown_id, showdown_survivor_data_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown enable row level security;
create policy "Allow all for owner/shared" on showdown for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = showdown.settlement_id
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = showdown.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
alter table showdown_showdown_monster_data enable row level security;
create policy "Allow all for owner/shared" on showdown_showdown_monster_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
      and su.shared_user_id = auth.uid()
  )
);
alter table showdown_showdown_survivor_data enable row level security;
create policy "Allow all for owner/shared" on showdown_showdown_survivor_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from showdown
        where id = showdown_id
      )
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_settlement on showdown(settlement_id);
create index idx_showdown_scout on showdown(scout_id);
create index idx_showdown_showdown_monster_data_showdown on showdown_showdown_monster_data(showdown_id);
create index idx_showdown_showdown_monster_data_monster_data on showdown_showdown_monster_data(showdown_monster_data_id);
create index idx_showdown_showdown_survivor_data_showdown on showdown_showdown_survivor_data(showdown_id);
create index idx_showdown_showdown_survivor_data_survivor_data on showdown_showdown_survivor_data(showdown_survivor_data_id);