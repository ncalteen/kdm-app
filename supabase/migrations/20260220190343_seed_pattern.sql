--------------------------------------------------------------------------------
-- Seed Pattern Table
-- Built-in and custom seed patterns.
--------------------------------------------------------------------------------
create table seed_pattern (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  seed_pattern_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table seed_pattern_shared_user (
  seed_pattern_id uuid not null references seed_pattern(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (seed_pattern_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table seed_pattern enable row level security;
create policy "Allow insert for authenticated and custom" on seed_pattern for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on seed_pattern for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on seed_pattern for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on seed_pattern for
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
create policy "Allow delete for owner and custom" on seed_pattern for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on seed_pattern for
select to authenticated using (
    custom
    and exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on seed_pattern for
update to authenticated using (
    custom
    and exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on seed_pattern for all using (is_admin()) with check (is_admin());
alter table seed_pattern_shared_user enable row level security;
create policy "Allow insert for authenticated" on seed_pattern_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from seed_pattern p
      where p.id = seed_pattern_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on seed_pattern_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on seed_pattern_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on seed_pattern_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on seed_pattern_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on seed_pattern_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_seed_pattern_custom_user on seed_pattern(custom, user_id);
create index idx_seed_pattern_shared_user_seed_pattern on seed_pattern_shared_user(seed_pattern_id);
create index idx_seed_pattern_shared_user_user on seed_pattern_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on seed_pattern for each row execute function update_updated_at();