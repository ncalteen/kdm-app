--------------------------------------------------------------------------------
-- Resource Table
--------------------------------------------------------------------------------
create table resource (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  category resource_category not null,
  quarry_id uuid references quarry(id) on delete cascade,
  resource_name varchar not null,
  resource_types resource_type [] not null default '{}'
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table resource_shared_user (
  resource_id uuid not null references resource(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (resource_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_resource_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from resource
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from resource_shared_user
    where resource_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table resource enable row level security;
create policy "Allow authenticated read for non-custom" on resource for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on resource for all using (
  custom
  and is_resource_member(id)
) with check (
  custom
  and is_resource_member(id)
);
create policy "Allow admin to manage all" on resource for all using (is_admin()) with check (is_admin());
alter table resource_shared_user enable row level security;
create policy "Allow all for owner" on resource_shared_user for all using (is_resource_member(resource_id));
create policy "Allow admin to manage all" on resource_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_resource_shared_user_resource on resource_shared_user(resource_id);
create index idx_resource_shared_user_user on resource_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on resource for each row execute function update_updated_at();