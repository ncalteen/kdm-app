--------------------------------------------------------------------------------
-- Junction Table: Survivor Cursed Gear
-- Represents the many-to-many relationship between survivors and cursed gear.
--------------------------------------------------------------------------------
create table survivor_cursed_gear (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  survivor_id uuid not null references survivor(id) on delete cascade,
  gear_id uuid not null references gear(id) on delete cascade,
  -- Constraints
  unique (survivor_id, gear_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table survivor_cursed_gear enable row level security;
create policy "Allow select for owner" on survivor_cursed_gear for
select to authenticated using (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner" on survivor_cursed_gear for
insert to authenticated with check (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on survivor_cursed_gear for
update to authenticated using (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on survivor_cursed_gear for delete to authenticated using (
  exists (
    select 1
    from survivor sv
      join settlement s on s.id = sv.settlement_id
    where sv.id = survivor_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on survivor_cursed_gear for
select to authenticated using (
    exists (
      select 1
      from survivor sv
        join settlement_shared_user su on su.settlement_id = sv.settlement_id
      where sv.id = survivor_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on survivor_cursed_gear for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_survivor_cursed_gear_survivor on survivor_cursed_gear(survivor_id);
create index idx_survivor_cursed_gear_gear on survivor_cursed_gear(gear_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on survivor_cursed_gear for each row execute function update_updated_at();
