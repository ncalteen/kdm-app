--------------------------------------------------------------------------------
-- Weapon Type Table
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
-- Junction Table: Weapon Type Shared Users
--------------------------------------------------------------------------------
create table weapon_type_shared_user (
  weapon_type_id uuid not null references weapon_type(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (weapon_type_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table weapon_type enable row level security;
create policy "Allow authenticated read for non-custom" on weapon_type for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on weapon_type for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from weapon_type_shared_user su
      where su.weapon_type_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from weapon_type_shared_user su
      where su.weapon_type_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
alter table weapon_type_shared_user enable row level security;
create policy "Allow all for owner" on weapon_type_shared_user for all using (
  auth.uid() = (
    select user_id
    from weapon_type
    where id = weapon_type_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_weapon_type_shared_user_weapon_type on weapon_type_shared_user(weapon_type_id);
create index idx_weapon_type_shared_user_user on weapon_type_shared_user(shared_user_id);