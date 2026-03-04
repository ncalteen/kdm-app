--------------------------------------------------------------------------------
-- Hunt Survivor Table
-- Data related to a survivor during a hunt.
--------------------------------------------------------------------------------
create table hunt_survivor (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  accuracy_tokens integer not null default 0,
  evasion_tokens integer not null default 0,
  hunt_id uuid not null references hunt(id) on delete cascade,
  insanity_tokens integer not null default 0,
  luck_tokens integer not null default 0,
  movement_tokens integer not null default 0,
  notes text not null default '',
  scout boolean not null default false,
  settlement_id uuid not null references settlement(id) on delete cascade,
  speed_tokens integer not null default 0,
  strength_tokens integer not null default 0,
  survival_tokens integer not null default 0,
  survivor_id uuid not null references survivor(id) on delete cascade,
  -- Constraints
  unique (hunt_id, survivor_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_survivor enable row level security;
create policy "Allow select for owner" on hunt_survivor for
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
create policy "Allow insert for owner" on hunt_survivor for
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
create policy "Allow update for owner" on hunt_survivor for
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
create policy "Allow delete for owner" on hunt_survivor for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_survivor for
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
create policy "Allow all for admin" on hunt_survivor for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_survivor_hunt on hunt_survivor(hunt_id);
create index idx_hunt_survivor_settlement on hunt_survivor(settlement_id);
create index idx_hunt_survivor_survivor on hunt_survivor(survivor_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_survivor for each row execute function update_updated_at();