--------------------------------------------------------------------------------
-- Philosophy Table
-- Built-in and custom philosophies.
--------------------------------------------------------------------------------
create table philosophy (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  philosophy_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table philosophy_shared_user (
  philosophy_id uuid not null references philosophy(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (philosophy_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table philosophy enable row level security;
create policy "Allow insert for authenticated and custom" on philosophy for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on philosophy for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on philosophy for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on philosophy for
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
create policy "Allow delete for owner and custom" on philosophy for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on philosophy for
select to authenticated using (
    custom
    and exists (
      select 1
      from philosophy_shared_user su
      where su.philosophy_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on philosophy for
update to authenticated using (
    custom
    and exists (
      select 1
      from philosophy_shared_user su
      where su.philosophy_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from philosophy_shared_user su
      where su.philosophy_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on philosophy for all using (is_admin()) with check (is_admin());
alter table philosophy_shared_user enable row level security;
create policy "Allow insert for authenticated" on philosophy_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from philosophy p
      where p.id = philosophy_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on philosophy_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on philosophy_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on philosophy_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on philosophy_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on philosophy_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_philosophy_custom_user on philosophy(custom, user_id);
create index idx_philosophy_shared_user_philosophy on philosophy_shared_user(philosophy_id);
create index idx_philosophy_shared_user_user on philosophy_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on philosophy for each row execute function update_updated_at();