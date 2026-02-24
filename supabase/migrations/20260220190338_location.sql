--------------------------------------------------------------------------------
-- Location Table
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
-- Junction Table: Location Shared Users
--------------------------------------------------------------------------------
create table location_shared_user (
  location_id uuid not null references location(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (location_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table location enable row level security;
create policy "Allow authenticated read for non-custom" on location for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on location for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from location_shared_user su
      where su.location_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from location_shared_user su
      where su.location_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
alter table location_shared_user enable row level security;
create policy "Allow all for owner" on location_shared_user for all using (
  auth.uid() = (
    select user_id
    from location
    where id = location_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_location_shared_user_location on location_shared_user(location_id);
create index idx_location_shared_user_user on location_shared_user(shared_user_id);