--------------------------------------------------------------------------------
-- Junction Table: Survivor Fighting Art
-- Represents the many-to-many relationship between survivors and fighting arts.
--------------------------------------------------------------------------------
create table survivor_fighting_art (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  survivor_id uuid not null references survivor(id) on delete cascade,
  fighting_art_id uuid not null references fighting_art(id) on delete cascade,
  -- Constraints
  unique (survivor_id, fighting_art_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table survivor_fighting_art enable row level security;
create policy "Allow select for owner" on survivor_fighting_art for
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
create policy "Allow insert for owner" on survivor_fighting_art for
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
create policy "Allow update for owner" on survivor_fighting_art for
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
create policy "Allow delete for owner" on survivor_fighting_art for delete to authenticated using (
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
create policy "Allow select for shared" on survivor_fighting_art for
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
create policy "Allow all for admin" on survivor_fighting_art for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_survivor_fighting_art_survivor on survivor_fighting_art(survivor_id);
create index idx_survivor_fighting_art_fighting_art on survivor_fighting_art(fighting_art_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on survivor_fighting_art for each row execute function update_updated_at();
