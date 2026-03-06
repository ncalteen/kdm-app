--------------------------------------------------------------------------------
-- Nemesis Table
-- Represents a nemesis that can be added to a settlement. This includes both
-- custom nemeses created by users and those available by default in the app.
--------------------------------------------------------------------------------
create table nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  alternate_id uuid references nemesis(id) on delete
  set null,
    monster_name varchar not null,
    multi_monster boolean not null default false,
    node monster_node not null,
    vignette_id uuid references nemesis(id) on delete
  set null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table nemesis_shared_user (
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (nemesis_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis enable row level security;
create policy "Allow insert for authenticated and custom" on nemesis for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on nemesis for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on nemesis for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on nemesis for
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
create policy "Allow delete for owner and custom" on nemesis for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on nemesis for
select to authenticated using (
    custom
    and exists (
      select 1
      from nemesis_shared_user su
      where su.nemesis_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on nemesis for
update to authenticated using (
    custom
    and exists (
      select 1
      from nemesis_shared_user su
      where su.nemesis_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from nemesis_shared_user su
      where su.nemesis_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on nemesis for all using (is_admin()) with check (is_admin());
alter table nemesis_shared_user enable row level security;
create policy "Allow insert for authenticated" on nemesis_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on nemesis_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on nemesis_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on nemesis_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on nemesis_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on nemesis_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_node on nemesis(node);
create index idx_nemesis_shared_user_nemesis on nemesis_shared_user(nemesis_id);
create index idx_nemesis_shared_user_user on nemesis_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis for each row execute function update_updated_at();