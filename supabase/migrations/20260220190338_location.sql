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
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (location_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_location_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from location
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from location_shared_user
    where location_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
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
  and is_location_member(id)
) with check (
  custom
  and is_location_member(id)
);
create policy "Allow admin to manage all" on location for all using (is_admin()) with check (is_admin());
alter table location_shared_user enable row level security;
create policy "Allow all for owner" on location_shared_user for all using (is_location_member(location_id));
create policy "Allow admin to manage all" on location_shared_user for all using (is_admin()) with check (is_admin());
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