--------------------------------------------------------------------------------
-- Milestone Table
-- Built-in and custom milestones.
--------------------------------------------------------------------------------
create table milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  campaign_types campaign_type [] not null default '{}',
  event_name varchar not null,
  milestone_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table milestone_shared_user (
  milestone_id uuid not null references milestone(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (milestone_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table milestone enable row level security;
create policy "Allow authenticated read for non-custom" on milestone for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on milestone for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from milestone_shared_user su
      where su.milestone_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from milestone_shared_user su
      where su.milestone_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
create policy "Allow admin to manage all" on milestone for all using (is_admin()) with check (is_admin());
alter table milestone_shared_user enable row level security;
create policy "Allow all for owner" on milestone_shared_user for all using (
  auth.uid() = (
    select user_id
    from milestone
    where id = milestone_id
  )
);
create policy "Allow admin to manage all" on milestone_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_milestone_shared_user_milestone on milestone_shared_user(milestone_id);
create index idx_milestone_shared_user_user on milestone_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on milestone for each row execute function update_updated_at();