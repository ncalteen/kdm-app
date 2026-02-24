--------------------------------------------------------------------------------
-- Hunt Table
--------------------------------------------------------------------------------
create table hunt (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hunt Data
  hunt_board_id uuid not null references hunt_hunt_board(id) on delete cascade,
  monster_level int not null,
  monster_position int not null default 12,
  scout_id uuid references survivor(id) on delete
  set null,
    settlement_id uuid references settlement(id) on delete cascade,
    survivor_position int not null default 0
);
--------------------------------------------------------------------------------
-- Junction Table: Hunt Monster Data
--------------------------------------------------------------------------------
create table hunt_hunt_monster_data (
  hunt_id uuid not null references hunt(id) on delete cascade,
  hunt_monster_data_id uuid not null references hunt_monster_data(id) on delete cascade,
  primary key (hunt_id, hunt_monster_data_id)
);
--------------------------------------------------------------------------------
-- Junction Table: Hunt Survivor Data
--------------------------------------------------------------------------------
create table hunt_hunt_survivor_data (
  hunt_id uuid not null references hunt(id) on delete cascade,
  hunt_survivor_data_id uuid not null references hunt_survivor_data(id) on delete cascade,
  primary key (hunt_id, hunt_survivor_data_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt enable row level security;
create policy "Allow all for owner/shared" on hunt for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = hunt.settlement_id
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
    where su.settlement_id = hunt.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
alter table hunt_hunt_monster_data enable row level security;
create policy "Allow all for owner/shared" on hunt_hunt_monster_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
      and su.shared_user_id = auth.uid()
  )
);
alter table hunt_hunt_survivor_data enable row level security;
create policy "Allow all for owner/shared" on hunt_hunt_survivor_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from hunt
        where id = hunt_id
      )
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_hunt_board on hunt(hunt_board_id);
create index idx_hunt_settlement on hunt(settlement_id);
create index idx_hunt_scout on hunt(scout_id);
create index idx_hunt_hunt_monster_data_hunt on hunt_hunt_monster_data(hunt_id);
create index idx_hunt_hunt_monster_data_monster_data on hunt_hunt_monster_data(hunt_monster_data_id);
create index idx_hunt_hunt_survivor_data_hunt on hunt_hunt_survivor_data(hunt_id);
create index idx_hunt_hunt_survivor_data_survivor_data on hunt_hunt_survivor_data(hunt_survivor_data_id);