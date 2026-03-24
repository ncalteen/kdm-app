--------------------------------------------------------------------------------
-- Settlement Phase Table
-- Tracks data for the settlement phase after a showdown or hunt ends.
--------------------------------------------------------------------------------
create table settlement_phase (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  endeavors int not null default 0 check (endeavors >= 0),
  returning_scout_id uuid references survivor(id) on delete cascade,
  settlement_id uuid not null unique references settlement(id) on delete cascade,
  step settlement_phase_step not null default 'SET_UP_SETTLEMENT'
);
--------------------------------------------------------------------------------
-- Junction Table: Returning Survivors
--------------------------------------------------------------------------------
create table settlement_phase_returning_survivor (
  settlement_id uuid not null references settlement(id) on delete cascade,
  settlement_phase_id uuid not null references settlement_phase(id) on delete cascade,
  survivor_id uuid not null references survivor(id) on delete cascade,
  primary key (settlement_phase_id, survivor_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_phase enable row level security;
create policy "Allow select for owner" on settlement_phase for
select to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner" on settlement_phase for
insert to authenticated with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on settlement_phase for
update to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on settlement_phase for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on settlement_phase for
select to authenticated using (
    exists (
      select 1
      from settlement_shared_user su
      where settlement_id = su.settlement_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on settlement_phase for all using (is_admin()) with check (is_admin());
alter table settlement_phase_returning_survivor enable row level security;
create policy "Allow insert for owner" on settlement_phase_returning_survivor for
insert to authenticated with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for owner" on settlement_phase_returning_survivor for
select to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on settlement_phase_returning_survivor for
update to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on settlement_phase_returning_survivor for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on settlement_phase_returning_survivor for
select to authenticated using (
    exists (
      select 1
      from settlement_shared_user su
      where settlement_id = su.settlement_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on settlement_phase_returning_survivor for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_phase_settlement on settlement_phase(settlement_id);
create index idx_settlement_phase_returning_survivor_phase on settlement_phase_returning_survivor(settlement_phase_id);
create index idx_settlement_phase_returning_survivor_survivor on settlement_phase_returning_survivor(survivor_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_phase for each row execute function update_updated_at();