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
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (pattern_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table pattern enable row level security;
create policy "Allow insert for authenticated and custom" on pattern for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on pattern for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on pattern for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on pattern for
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
create policy "Allow delete for owner and custom" on pattern for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on pattern for
select to authenticated using (
    custom
    and exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on pattern for
update to authenticated using (
    custom
    and exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on pattern for all using (is_admin()) with check (is_admin());
alter table pattern_shared_user enable row level security;
create policy "Allow insert for authenticated" on pattern_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on pattern_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on pattern_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on pattern_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on pattern_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on pattern_shared_user for all using (is_admin()) with check (is_admin());
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