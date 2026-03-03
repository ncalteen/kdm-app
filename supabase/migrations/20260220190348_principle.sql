--------------------------------------------------------------------------------
-- Principle Table
-- Built-in and custom principles.
--------------------------------------------------------------------------------
create table principle (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  campaign_types campaign_type [] not null default '{}',
  principle_name varchar not null,
  option_1_name varchar not null,
  option_2_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table principle_shared_user (
  principle_id uuid not null references principle(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (principle_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table principle enable row level security;
create policy "Allow authenticated read for non-custom" on principle for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on principle for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from principle_shared_user su
      where su.principle_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from principle_shared_user su
      where su.principle_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
create policy "Allow admin to manage all" on principle for all using (is_admin()) with check (is_admin());
alter table principle_shared_user enable row level security;
create policy "Allow all for owner" on principle_shared_user for all using (
  auth.uid() = (
    select user_id
    from principle
    where id = principle_id
  )
);
create policy "Allow admin to manage all" on principle_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_principle_shared_user_principle on principle_shared_user(principle_id);
create index idx_principle_shared_user_user on principle_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on principle for each row execute function update_updated_at();