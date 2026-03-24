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
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (resource_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table resource enable row level security;
create policy "Allow insert for authenticated and custom" on resource for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on resource for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on resource for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on resource for
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
create policy "Allow delete for owner and custom" on resource for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on resource for
select to authenticated using (
    custom
    and exists (
      select 1
      from resource_shared_user su
      where su.resource_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on resource for
update to authenticated using (
    custom
    and exists (
      select 1
      from resource_shared_user su
      where su.resource_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from resource_shared_user su
      where su.resource_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on resource for all using (is_admin()) with check (is_admin());
alter table resource_shared_user enable row level security;
create policy "Allow insert for authenticated" on resource_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from resource r
      where r.id = resource_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on resource_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on resource_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on resource_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on resource_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on resource_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_resource_custom_user on resource(custom, user_id);
create index idx_resource_shared_user_resource on resource_shared_user(resource_id);
create index idx_resource_shared_user_user on resource_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on resource for each row execute function update_updated_at();