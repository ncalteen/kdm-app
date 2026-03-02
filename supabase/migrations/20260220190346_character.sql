--------------------------------------------------------------------------------
-- Character Table
-- Built-in and custom characters.
--------------------------------------------------------------------------------
create table character (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  character_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table character_shared_user (
  character_id uuid not null references character(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (character_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table character enable row level security;
create policy "Allow authenticated read for non-custom" on character for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on character for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from character_shared_user su
      where su.character_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from character_shared_user su
      where su.character_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
create policy "Allow admin to manage all" on character for all using (is_admin()) with check (is_admin());
alter table character_shared_user enable row level security;
create policy "Allow all for owner" on character_shared_user for all using (
  auth.uid() = (
    select user_id
    from character
    where id = character_id
  )
);
create policy "Allow admin to manage all" on character_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_character_shared_user_character on character_shared_user(character_id);
create index idx_character_shared_user_user on character_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on character for each row execute function update_updated_at();