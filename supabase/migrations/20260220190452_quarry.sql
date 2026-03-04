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
  quarry_id uuid not null references quarry(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (quarry_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_quarry_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from quarry
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from quarry_shared_user
    where quarry_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry enable row level security;
create policy "Allow authenticated read for non-custom" on quarry for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on quarry for all using (
  custom
  and is_quarry_member(id)
) with check (
  custom
  and is_quarry_member(id)
);
create policy "Allow admin to manage all" on quarry for all using (is_admin()) with check (is_admin());
create policy "Allow insert of custom for self" on quarry for
insert with check (
    auth.role() = 'authenticated'
    and custom
    and user_id = auth.uid()
  );
alter table quarry_shared_user enable row level security;
create policy "Allow all for owner" on quarry_shared_user for all using (is_quarry_member(quarry_id));
create policy "Allow admin to manage all" on quarry_shared_user for all using (is_admin()) with check (is_admin());
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