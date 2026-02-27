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
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from resource_shared_user su
      where su.resource_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from resource_shared_user su
      where su.resource_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
create policy "Allow admin to manage all" on resource for all using (is_admin()) with check (is_admin());
alter table resource_shared_user enable row level security;
create policy "Allow all for owner" on resource_shared_user for all using (
  auth.uid() = (
    select user_id
    from resource
    where id = resource_id
  )
);
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