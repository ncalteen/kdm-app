--------------------------------------------------------------------------------
-- Nemesis Table
-- Represents a nemesis that can be added to a settlement. This includes both
-- custom nemeses created by users and those available by default in the app.
--------------------------------------------------------------------------------
create table nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  alternate_id uuid references nemesis(id) on delete
  set null,
    monster_name varchar not null,
    multi_monster boolean not null default false,
    node monster_node not null,
    vignette_id uuid references nemesis(id) on delete
  set null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table nemesis_shared_user (
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (nemesis_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_nemesis_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from nemesis
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from nemesis_shared_user
    where nemesis_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis enable row level security;
create policy "Allow authenticated read for non-custom" on nemesis for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on nemesis for all using (
  custom
  and is_nemesis_member(id)
) with check (
  custom
  and is_nemesis_member(id)
);
create policy "Allow admin to manage all" on nemesis for all using (is_admin()) with check (is_admin());
create policy "Allow insert of custom for self" on nemesis for
insert with check (
    auth.role() = 'authenticated'
    and custom
    and user_id = auth.uid()
  );
alter table nemesis_shared_user enable row level security;
create policy "Allow all for owner" on nemesis_shared_user for all using (is_nemesis_member(nemesis_id));
create policy "Allow admin to manage all" on nemesis_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_node on nemesis(node);
create index idx_nemesis_shared_user_nemesis on nemesis_shared_user(nemesis_id);
create index idx_nemesis_shared_user_user on nemesis_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis for each row execute function update_updated_at();