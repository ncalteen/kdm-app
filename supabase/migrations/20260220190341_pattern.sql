--------------------------------------------------------------------------------
-- Pattern Table
-- Built-in and custom patterns/seed patterns.
--------------------------------------------------------------------------------
create table pattern (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  pattern_name varchar not null,
  seed_pattern boolean not null default false
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table pattern_shared_user (
  pattern_id uuid not null references pattern(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (pattern_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_pattern_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from pattern
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from pattern_shared_user
    where pattern_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table pattern enable row level security;
create policy "Allow authenticated read for non-custom" on pattern for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on pattern for all using (
  custom
  and is_pattern_member(id)
) with check (
  custom
  and is_pattern_member(id)
);
create policy "Allow admin to manage all" on pattern for all using (is_admin()) with check (is_admin());
alter table pattern_shared_user enable row level security;
create policy "Allow all for owner" on pattern_shared_user for all using (is_pattern_member(pattern_id));
create policy "Allow admin to manage all" on pattern_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_pattern_shared_user_pattern on pattern_shared_user(pattern_id);
create index idx_pattern_shared_user_user on pattern_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on pattern for each row execute function update_updated_at();