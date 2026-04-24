--------------------------------------------------------------------------------
-- Junction Table: Hunt Monster / Survivor Status
-- Associates a hunt monster with survivor statuses from the normalized
-- `survivor_status` catalog.
--------------------------------------------------------------------------------
create table hunt_monster_survivor_status (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  hunt_monster_id uuid not null references hunt_monster(id) on delete cascade,
  survivor_status_id uuid not null references survivor_status(id) on delete cascade,
  -- Constraints
  unique (hunt_monster_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Mirrors `hunt_monster` itself: owner of the settlement can CRUD, shared
-- settlement users can SELECT, admins bypass.
--------------------------------------------------------------------------------
alter table hunt_monster_survivor_status enable row level security;
create policy "Allow select for owner" on hunt_monster_survivor_status for
select to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner" on hunt_monster_survivor_status for
insert to authenticated with check (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on hunt_monster_survivor_status for
update to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on hunt_monster_survivor_status for delete to authenticated using (
  exists (
    select 1
    from hunt_monster hm
      join settlement s on s.id = hm.settlement_id
    where hm.id = hunt_monster_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_monster_survivor_status for
select to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement_shared_user su on su.settlement_id = hm.settlement_id
      where hm.id = hunt_monster_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on hunt_monster_survivor_status for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_monster_survivor_status_hunt_monster on hunt_monster_survivor_status(hunt_monster_id);
create index idx_hunt_monster_survivor_status_survivor_status on hunt_monster_survivor_status(survivor_status_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_monster_survivor_status for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Junction Table: Showdown Monster / Survivor Status
-- Associates a showdown monster with survivor statuses from the normalized
-- `survivor_status` catalog.
--------------------------------------------------------------------------------
create table showdown_monster_survivor_status (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  showdown_monster_id uuid not null references showdown_monster(id) on delete cascade,
  survivor_status_id uuid not null references survivor_status(id) on delete cascade,
  -- Constraints
  unique (showdown_monster_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown_monster_survivor_status enable row level security;
create policy "Allow select for owner" on showdown_monster_survivor_status for
select to authenticated using (
    exists (
      select 1
      from showdown_monster sm
        join settlement s on s.id = sm.settlement_id
      where sm.id = showdown_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner" on showdown_monster_survivor_status for
insert to authenticated with check (
    exists (
      select 1
      from showdown_monster sm
        join settlement s on s.id = sm.settlement_id
      where sm.id = showdown_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on showdown_monster_survivor_status for
update to authenticated using (
    exists (
      select 1
      from showdown_monster sm
        join settlement s on s.id = sm.settlement_id
      where sm.id = showdown_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from showdown_monster sm
        join settlement s on s.id = sm.settlement_id
      where sm.id = showdown_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on showdown_monster_survivor_status for delete to authenticated using (
  exists (
    select 1
    from showdown_monster sm
      join settlement s on s.id = sm.settlement_id
    where sm.id = showdown_monster_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on showdown_monster_survivor_status for
select to authenticated using (
    exists (
      select 1
      from showdown_monster sm
        join settlement_shared_user su on su.settlement_id = sm.settlement_id
      where sm.id = showdown_monster_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on showdown_monster_survivor_status for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_monster_survivor_status_showdown_monster on showdown_monster_survivor_status(showdown_monster_id);
create index idx_showdown_monster_survivor_status_survivor_status on showdown_monster_survivor_status(survivor_status_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on showdown_monster_survivor_status for each row execute function update_updated_at();