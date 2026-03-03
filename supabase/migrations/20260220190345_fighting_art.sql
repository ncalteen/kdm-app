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
  fighting_art_name varchar not null,
  secret_fighting_art boolean not null default false
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table fighting_art_shared_user (
  fighting_art_id uuid not null references fighting_art(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (fighting_art_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_fighting_art_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from fighting_art
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from fighting_art_shared_user
    where fighting_art_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table fighting_art enable row level security;
create policy "Allow authenticated read for non-custom" on fighting_art for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on fighting_art for all using (
  custom
  and is_fighting_art_member(id)
) with check (
  custom
  and is_fighting_art_member(id)
);
create policy "Allow admin to manage all" on fighting_art for all using (is_admin()) with check (is_admin());
alter table fighting_art_shared_user enable row level security;
create policy "Allow all for owner" on fighting_art_shared_user for all using (is_fighting_art_member(fighting_art_id));
create policy "Allow admin to manage all" on fighting_art_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_fighting_art_shared_user_fighting_art on fighting_art_shared_user(fighting_art_id);
create index idx_fighting_art_shared_user_user on fighting_art_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on fighting_art for each row execute function update_updated_at();