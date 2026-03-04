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
  neurosis_name varchar,
  philosophy_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table philosophy_shared_user (
  philosophy_id uuid not null references philosophy(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (philosophy_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_philosophy_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from philosophy
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from philosophy_shared_user
    where philosophy_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table philosophy enable row level security;
create policy "Allow authenticated read for non-custom" on philosophy for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on philosophy for all using (
  custom
  and is_philosophy_member(id)
) with check (
  custom
  and is_philosophy_member(id)
);
create policy "Allow admin to manage all" on philosophy for all using (is_admin()) with check (is_admin());
create policy "Allow insert of custom for self" on philosophy for
insert with check (
    auth.role() = 'authenticated'
    and custom
    and user_id = auth.uid()
  );
alter table philosophy_shared_user enable row level security;
create policy "Allow all for owner" on philosophy_shared_user for all using (is_philosophy_member(philosophy_id));
create policy "Allow admin to manage all" on philosophy_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_philosophy_shared_user_philosophy on philosophy_shared_user(philosophy_id);
create index idx_philosophy_shared_user_user on philosophy_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on philosophy for each row execute function update_updated_at();