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
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
create policy "Allow admin to manage all" on pattern for all using (is_admin()) with check (is_admin());
alter table pattern_shared_user enable row level security;
create policy "Allow all for owner" on pattern_shared_user for all using (
  auth.uid() = (
    select user_id
    from pattern
    where id = pattern_id
  )
);
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