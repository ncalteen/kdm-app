--------------------------------------------------------------------------------
-- Junction Table: Nemesis Location
-- Represents the many-to-many relationship between nemeses and locations.
--------------------------------------------------------------------------------
create table nemesis_location (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  location_id uuid not null references location(id) on delete cascade,
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  -- Constraints
  unique (nemesis_id, location_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis_location enable row level security;
create policy "Allow insert for authenticated and custom" on nemesis_location for
insert to authenticated with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on nemesis_location for
select to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and not n.custom
    )
  );
create policy "Allow select for owner and custom" on nemesis_location for
select to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on nemesis_location for
update to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on nemesis_location for delete to authenticated using (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and n.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on nemesis_location for
select to authenticated using (
    exists (
      select 1
      from nemesis_shared_user su
      where nemesis_id = su.nemesis_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on nemesis_location for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_location_location on nemesis_location(location_id);
create index idx_nemesis_location_nemesis on nemesis_location(nemesis_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_location for each row execute function update_updated_at();