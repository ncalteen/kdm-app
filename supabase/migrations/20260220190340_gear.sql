--------------------------------------------------------------------------------
-- Gear Table
-- Built-in and custom gear. May be associated with a settlement location.
--------------------------------------------------------------------------------
create table gear (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  gear_name varchar not null,
  location_id uuid references location(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table gear_shared_user (
  gear_id uuid not null references gear(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (gear_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_gear_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from gear
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from gear_shared_user
    where gear_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table gear enable row level security;
create policy "Allow authenticated read for non-custom" on gear for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on gear for all using (
  custom
  and is_gear_member(id)
) with check (
  custom
  and is_gear_member(id)
);
create policy "Allow admin to manage all" on gear for all using (is_admin()) with check (is_admin());
alter table gear_shared_user enable row level security;
create policy "Allow all for owner" on gear_shared_user for all using (is_gear_member(gear_id));
create policy "Allow admin to manage all" on gear_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_gear_shared_user_gear on gear_shared_user(gear_id);
create index idx_gear_shared_user_user on gear_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on gear for each row execute function update_updated_at();