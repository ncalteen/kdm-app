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
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (shared_user_id, strain_milestone_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table strain_milestone enable row level security;
create policy "Allow insert for authenticated and custom" on strain_milestone for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on strain_milestone for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on strain_milestone for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on strain_milestone for
update to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  ) with check (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner and custom" on strain_milestone for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on strain_milestone for
select to authenticated using (
    custom
    and exists (
      select 1
      from strain_milestone_shared_user su
      where su.strain_milestone_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on strain_milestone for
update to authenticated using (
    custom
    and exists (
      select 1
      from strain_milestone_shared_user su
      where su.strain_milestone_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from strain_milestone_shared_user su
      where su.strain_milestone_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on strain_milestone for all using (is_admin()) with check (is_admin());
alter table strain_milestone_shared_user enable row level security;
create policy "Allow insert for authenticated" on strain_milestone_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from strain_milestone s
      where s.id = strain_milestone_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on strain_milestone_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on strain_milestone_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on strain_milestone_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on strain_milestone_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on strain_milestone_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_strain_milestone_custom_user on strain_milestone(custom, user_id);
create index idx_strain_milestone_shared_user_strain_milestone on strain_milestone_shared_user(strain_milestone_id);
create index idx_strain_milestone_shared_user_user on strain_milestone_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on strain_milestone for each row execute function update_updated_at();