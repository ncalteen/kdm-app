--------------------------------------------------------------------------------
-- Settlement Phase Table
--------------------------------------------------------------------------------
create table settlement_phase (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Phase Data
  endeavors int not null default 0,
  returning_scout_id uuid references survivor(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  step settlement_phase_step not null default 'SET_UP_SETTLEMENT'
);
--------------------------------------------------------------------------------
-- Junction Table: Settlement Phase Returning Survivors
--------------------------------------------------------------------------------
create table settlement_phase_returning_survivor (
  settlement_phase_id uuid not null references settlement_phase(id) on delete cascade,
  survivor_id uuid not null references survivor(id) on delete cascade,
  primary key (settlement_phase_id, survivor_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_phase enable row level security;
create policy "Allow all for owner/shared" on settlement_phase for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_phase.settlement_id
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
    where su.settlement_id = settlement_phase.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
alter table settlement_phase_returning_survivor enable row level security;
create policy "Allow all for owner/shared" on settlement_phase_returning_survivor for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from settlement_phase
        where id = settlement_phase_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from settlement_phase
        where id = settlement_phase_id
      )
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from settlement_phase
        where id = settlement_phase_id
      )
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = (
        select settlement_id
        from settlement_phase
        where id = settlement_phase_id
      )
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_phase_settlement on settlement_phase(settlement_id);
create index idx_settlement_phase_returning_survivor_phase on settlement_phase_returning_survivor(settlement_phase_id);
create index idx_settlement_phase_returning_survivor_survivor on settlement_phase_returning_survivor(survivor_id);