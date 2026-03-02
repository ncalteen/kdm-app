--------------------------------------------------------------------------------
-- Disorder Table
-- Built-in and custom disorders.
--------------------------------------------------------------------------------
create table disorder (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  disorder_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table disorder_shared_user (
  disorder_id uuid not null references disorder(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (disorder_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table disorder enable row level security;
create policy "Allow authenticated read for non-custom" on disorder for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on disorder for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from disorder_shared_user su
      where su.disorder_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from disorder_shared_user su
      where su.disorder_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
create policy "Allow admin to manage all" on disorder for all using (is_admin()) with check (is_admin());
alter table disorder_shared_user enable row level security;
create policy "Allow all for owner" on disorder_shared_user for all using (
  auth.uid() = (
    select user_id
    from disorder
    where id = disorder_id
  )
);
create policy "Allow admin to manage all" on disorder_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_disorder_shared_user_disorder on disorder_shared_user(disorder_id);
create index idx_disorder_shared_user_user on disorder_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on disorder for each row execute function update_updated_at();