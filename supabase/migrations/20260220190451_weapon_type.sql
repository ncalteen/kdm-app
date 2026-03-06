--------------------------------------------------------------------------------
-- Weapon Type Table
-- Built-in and custom weapon types.
--------------------------------------------------------------------------------
create table weapon_type (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  weapon_type_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table weapon_type_shared_user (
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  weapon_type_id uuid not null references weapon_type(id) on delete cascade,
  primary key (shared_user_id, user_id, weapon_type_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table weapon_type enable row level security;
create policy "Allow insert for authenticated and custom" on weapon_type for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on weapon_type for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on weapon_type for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on weapon_type for
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
create policy "Allow delete for owner and custom" on weapon_type for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on weapon_type for
select to authenticated using (
    custom
    and exists (
      select 1
      from weapon_type_shared_user su
      where su.weapon_type_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on weapon_type for
update to authenticated using (
    custom
    and exists (
      select 1
      from weapon_type_shared_user su
      where su.weapon_type_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from weapon_type_shared_user su
      where su.weapon_type_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on weapon_type for all using (is_admin()) with check (is_admin());
alter table weapon_type_shared_user enable row level security;
create policy "Allow insert for authenticated" on weapon_type_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from weapon_type w
      where w.id = weapon_type_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on weapon_type_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on weapon_type_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on weapon_type_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on weapon_type_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on weapon_type_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_weapon_type_shared_user_weapon_type on weapon_type_shared_user(weapon_type_id);
create index idx_weapon_type_shared_user_user on weapon_type_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on weapon_type for each row execute function update_updated_at();