-- Settlement Phase
create table settlement_phase (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  endeavors int not null default 0,
  returning_scout_id uuid references survivor (id) on delete
  set null,
    step settlement_phase_step not null default 'SET_UP_SETTLEMENT'
);
alter table settlement_phase enable row level security;
create policy "Allow all for owner" on settlement_phase for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_phase for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Settlement Phase Returning Survivors (junction table)
create table settlement_phase_returning_survivor (
  settlement_phase_id uuid not null references settlement_phase (id) on delete cascade,
  survivor_id uuid not null references survivor (id) on delete cascade,
  primary key (settlement_phase_id, survivor_id)
);
alter table settlement_phase_returning_survivor enable row level security;
create policy "Allow all for owner" on settlement_phase_returning_survivor for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = (
        select settlement_id
        from settlement_phase
        where id = settlement_phase_id
      )
  )
);
create policy "Allow all for shared users" on settlement_phase_returning_survivor for all using (
  exists (
    select 1
    from settlement s
    where s.id = (
        select settlement_id
        from settlement_phase
        where id = settlement_phase_id
      )
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_phase_settlement on settlement_phase (settlement_id);
create index idx_settlement_phase_returning_survivor_phase on settlement_phase_returning_survivor (settlement_phase_id);
create index idx_settlement_phase_returning_survivor_survivor on settlement_phase_returning_survivor (survivor_id);