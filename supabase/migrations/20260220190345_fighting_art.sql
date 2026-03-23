--------------------------------------------------------------------------------
-- Fighting Art Table
-- Built-in and custom fighting arts.
--------------------------------------------------------------------------------
create table fighting_art (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  fighting_art_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table fighting_art_shared_user (
  fighting_art_id uuid not null references fighting_art(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (fighting_art_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table fighting_art enable row level security;
create policy "Allow insert for authenticated and custom" on fighting_art for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on fighting_art for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on fighting_art for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on fighting_art for
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
create policy "Allow delete for owner and custom" on fighting_art for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on fighting_art for
select to authenticated using (
    custom
    and exists (
      select 1
      from fighting_art_shared_user su
      where su.fighting_art_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on fighting_art for
update to authenticated using (
    custom
    and exists (
      select 1
      from fighting_art_shared_user su
      where su.fighting_art_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from fighting_art_shared_user su
      where su.fighting_art_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on fighting_art for all using (is_admin()) with check (is_admin());
alter table fighting_art_shared_user enable row level security;
create policy "Allow insert for authenticated" on fighting_art_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from fighting_art f
      where f.id = fighting_art_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on fighting_art_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on fighting_art_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on fighting_art_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on fighting_art_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on fighting_art_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_fighting_art_custom_user on fighting_art(custom, user_id);
create index idx_fighting_art_shared_user_fighting_art on fighting_art_shared_user(fighting_art_id);
create index idx_fighting_art_shared_user_user on fighting_art_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on fighting_art for each row execute function update_updated_at();