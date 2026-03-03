--------------------------------------------------------------------------------
-- Strain Milestone Table
-- Built-in and custom strain milestones.
--------------------------------------------------------------------------------
create table strain_milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  strain_milestone_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table strain_milestone_shared_user (
  strain_milestone_id uuid not null references strain_milestone(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (strain_milestone_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_strain_milestone_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from strain_milestone
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from strain_milestone_shared_user
    where strain_milestone_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table strain_milestone enable row level security;
create policy "Allow authenticated read for non-custom" on strain_milestone for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on strain_milestone for all using (
  custom
  and is_strain_milestone_member(id)
) with check (
  custom
  and is_strain_milestone_member(id)
);
create policy "Allow admin to manage all" on strain_milestone for all using (is_admin()) with check (is_admin());
alter table strain_milestone_shared_user enable row level security;
create policy "Allow all for owner" on strain_milestone_shared_user for all using (is_strain_milestone_member(strain_milestone_id));
create policy "Allow admin to manage all" on strain_milestone_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_strain_milestone_shared_user_strain_milestone on strain_milestone_shared_user(strain_milestone_id);
create index idx_strain_milestone_shared_user_user on strain_milestone_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on strain_milestone for each row execute function update_updated_at();