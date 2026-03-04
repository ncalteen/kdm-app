--------------------------------------------------------------------------------
-- Quarry Table
-- Represents a quarry that can be added to a settlement. This includes both
-- custom quarries created by users and those available by default in the app.
--------------------------------------------------------------------------------
create table quarry (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  alternate_id uuid references quarry(id) on delete
  set null,
    monster_name varchar not null,
    multi_monster boolean not null default false,
    node monster_node not null,
    prologue boolean not null default false,
    vignette_id uuid references quarry(id) on delete
  set null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table quarry_shared_user (
  owner_id uuid not null references auth.users(id) on delete cascade,
  quarry_id uuid not null references quarry(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (quarry_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry enable row level security;
create policy "Allow insert for authenticated and custom" on quarry for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on quarry for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on quarry for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on quarry for
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
create policy "Allow delete for owner and custom" on quarry for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on quarry for
select to authenticated using (
    custom
    and exists (
      select 1
      from quarry_shared_user su
      where su.quarry_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on quarry for
update to authenticated using (
    custom
    and exists (
      select 1
      from quarry_shared_user su
      where su.quarry_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from quarry_shared_user su
      where su.quarry_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on quarry for all using (is_admin()) with check (is_admin());
alter table quarry_shared_user enable row level security;
create policy "Allow insert for authenticated" on quarry_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and user_id = (
          select auth.uid()
        )
    )
    and owner_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on quarry_shared_user for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on quarry_shared_user for
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  ) with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on quarry_shared_user for delete to authenticated using (
  owner_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on quarry_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on quarry_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_node on quarry(node);
create index idx_quarry_shared_user_quarry on quarry_shared_user(quarry_id);
create index idx_quarry_shared_user_user on quarry_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry for each row execute function update_updated_at();