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
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (gear_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table gear enable row level security;
create policy "Allow insert for authenticated and custom" on gear for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on gear for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on gear for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on gear for
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
create policy "Allow delete for owner and custom" on gear for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on gear for
select to authenticated using (
    custom
    and exists (
      select 1
      from gear_shared_user su
      where su.gear_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on gear for
update to authenticated using (
    custom
    and exists (
      select 1
      from gear_shared_user su
      where su.gear_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from gear_shared_user su
      where su.gear_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on gear for all using (is_admin()) with check (is_admin());
alter table gear_shared_user enable row level security;
create policy "Allow insert for authenticated" on gear_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on gear_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on gear_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on gear_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on gear_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on gear_shared_user for all using (is_admin()) with check (is_admin());
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