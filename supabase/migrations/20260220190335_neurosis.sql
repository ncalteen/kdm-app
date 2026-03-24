--------------------------------------------------------------------------------
-- Neurosis Table
-- Built-in and custom neuroses.
--------------------------------------------------------------------------------
create table neurosis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  neurosis_name varchar not null,
  philosophy_id uuid references philosophy(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table neurosis_shared_user (
  neurosis_id uuid not null references neurosis(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (neurosis_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table neurosis enable row level security;
create policy "Allow insert for authenticated and custom" on neurosis for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on neurosis for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on neurosis for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on neurosis for
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
create policy "Allow delete for owner and custom" on neurosis for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on neurosis for
select to authenticated using (
    custom
    and exists (
      select 1
      from neurosis_shared_user su
      where su.neurosis_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on neurosis for
update to authenticated using (
    custom
    and exists (
      select 1
      from neurosis_shared_user su
      where su.neurosis_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from neurosis_shared_user su
      where su.neurosis_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on neurosis for all using (is_admin()) with check (is_admin());
alter table neurosis_shared_user enable row level security;
create policy "Allow insert for authenticated" on neurosis_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from neurosis n
      where n.id = neurosis_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on neurosis_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on neurosis_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on neurosis_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on neurosis_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on neurosis_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_neurosis_custom_user on neurosis(custom, user_id);
create index idx_neurosis_philosophy on neurosis(philosophy_id);
create index idx_neurosis_shared_user_neurosis on neurosis_shared_user(neurosis_id);
create index idx_neurosis_shared_user_user on neurosis_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on neurosis for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Add neurosis_id to philosophy table
-- A philosophy can have 0 or 1 neurosis. If the neurosis is deleted, the
-- reference is cleared.
--------------------------------------------------------------------------------
alter table philosophy
add column neurosis_id uuid references neurosis(id) on delete
set null;