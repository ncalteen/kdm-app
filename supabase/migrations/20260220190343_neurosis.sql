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
  primary key (neurosis_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_neurosis_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from neurosis
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from neurosis_shared_user
    where neurosis_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table neurosis enable row level security;
create policy "Allow authenticated read for non-custom" on neurosis for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on neurosis for all using (
  custom
  and is_neurosis_member(id)
) with check (
  custom
  and is_neurosis_member(id)
);
create policy "Allow admin to manage all" on neurosis for all using (is_admin()) with check (is_admin());
create policy "Allow insert of custom for self" on neurosis for
insert with check (
    auth.role() = 'authenticated'
    and custom
    and user_id = auth.uid()
  );
alter table neurosis_shared_user enable row level security;
create policy "Allow all for owner" on neurosis_shared_user for all using (is_neurosis_member(neurosis_id));
create policy "Allow admin to manage all" on neurosis_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_neurosis_shared_user_neurosis on neurosis_shared_user(neurosis_id);
create index idx_neurosis_shared_user_user on neurosis_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on neurosis for each row execute function update_updated_at();