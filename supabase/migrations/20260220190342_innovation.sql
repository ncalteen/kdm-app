--------------------------------------------------------------------------------
-- Innovation Table
-- Built-in and custom innovations.
--------------------------------------------------------------------------------
create table innovation (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  innovation_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table innovation_shared_user (
  innovation_id uuid not null references innovation(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (innovation_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_innovation_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from innovation
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from innovation_shared_user
    where innovation_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table innovation enable row level security;
create policy "Allow authenticated read for non-custom" on innovation for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on innovation for all using (
  custom
  and is_innovation_member(id)
) with check (
  custom
  and is_innovation_member(id)
);
create policy "Allow admin to manage all" on innovation for all using (is_admin()) with check (is_admin());
alter table innovation_shared_user enable row level security;
create policy "Allow all for owner" on innovation_shared_user for all using (is_innovation_member(innovation_id));
create policy "Allow admin to manage all" on innovation_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_innovation_shared_user_innovation on innovation_shared_user(innovation_id);
create index idx_innovation_shared_user_user on innovation_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on innovation for each row execute function update_updated_at();