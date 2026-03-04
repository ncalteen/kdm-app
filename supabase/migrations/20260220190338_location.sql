--------------------------------------------------------------------------------
-- Location Table
-- Built-in and custom locations.
--------------------------------------------------------------------------------
create table location (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Location Data
  location_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table location_shared_user (
  location_id uuid not null references location(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (location_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table location enable row level security;
create policy "Allow insert for authenticated and custom" on location for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on location for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on location for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on location for
update to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  ) with check (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner and custom" on location for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on location for
select to authenticated using (
    custom
    and exists (
      select 1
      from location_shared_user su
      where su.location_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on location for
update to authenticated using (
    custom
    and exists (
      select 1
      from location_shared_user su
      where su.location_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from location_shared_user su
      where su.location_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on location for all using (is_admin()) with check (is_admin());
alter table location_shared_user enable row level security;
create policy "Allow insert for authenticated" on location_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from location l
      where l.id = location_id
        and user_id = (
          select auth.uid()
        )
    )
    and owner_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on location_shared_user for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on location_shared_user for
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  ) with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on location_shared_user for delete to authenticated using (
  owner_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on location_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on location_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_location_shared_user_location on location_shared_user(location_id);
create index idx_location_shared_user_user on location_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on location for each row execute function update_updated_at();