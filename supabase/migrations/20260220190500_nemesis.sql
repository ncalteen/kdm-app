--------------------------------------------------------------------------------
-- Nemesis Table
-- Represents a nemesis that can be added to a settlement. This includes both
-- custom nemeses created by users and those available by default in the app.
--------------------------------------------------------------------------------
create table nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Nemesis Data
  alternate_id uuid references nemesis(id) on delete
  set null,
    monster_name varchar not null,
    multi_monster boolean not null default false,
    node monster_node not null,
    vignette_id uuid references nemesis(id) on delete
  set null
);
--------------------------------------------------------------------------------
-- Junction Table: Nemesis Shared Users
--------------------------------------------------------------------------------
create table nemesis_shared_user (
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (nemesis_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis enable row level security;
create policy "Allow authenticated read for non-custom" on nemesis for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on nemesis for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from nemesis_shared_user su
      where su.nemesis_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from nemesis_shared_user su
      where su.nemesis_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
alter table nemesis_shared_user enable row level security;
create policy "Allow all for owner" on nemesis_shared_user for all using (
  auth.uid() = (
    select user_id
    from nemesis
    where id = nemesis_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_shared_user_nemesis on nemesis_shared_user(nemesis_id);
create index idx_nemesis_shared_user_user on nemesis_shared_user(shared_user_id);