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
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (principle_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table principle enable row level security;
create policy "Allow insert for authenticated and custom" on principle for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on principle for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on principle for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on principle for
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
create policy "Allow delete for owner and custom" on principle for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on principle for
select to authenticated using (
    custom
    and exists (
      select 1
      from principle_shared_user su
      where su.principle_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on principle for
update to authenticated using (
    custom
    and exists (
      select 1
      from principle_shared_user su
      where su.principle_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from principle_shared_user su
      where su.principle_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on principle for all using (is_admin()) with check (is_admin());
alter table principle_shared_user enable row level security;
create policy "Allow insert for authenticated" on principle_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from principle p
      where p.id = principle_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on principle_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on principle_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on principle_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on principle_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on principle_shared_user for all using (is_admin()) with check (is_admin());
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