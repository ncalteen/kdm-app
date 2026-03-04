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
  weapon_type_id uuid not null references weapon_type(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (weapon_type_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_weapon_type_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from weapon_type
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from weapon_type_shared_user
    where weapon_type_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
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
  and is_weapon_type_member(id)
) with check (
  custom
  and is_weapon_type_member(id)
);
create policy "Allow admin to manage all" on weapon_type for all using (is_admin()) with check (is_admin());
create policy "Allow insert of custom for self" on weapon_type for
insert with check (
    auth.role() = 'authenticated'
    and custom
    and user_id = auth.uid()
  );
alter table weapon_type_shared_user enable row level security;
create policy "Allow all for owner" on weapon_type_shared_user for all using (is_weapon_type_member(weapon_type_id));
create policy "Allow admin to manage all" on weapon_type_shared_user for all using (is_admin()) with check (is_admin());
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