--------------------------------------------------------------------------------
-- Wanderer Table
-- Information about individual wanderers, before they are added to a settlement
-- as survivors. This includes both custom wanderers created by users and those
-- available by default in the app.
--------------------------------------------------------------------------------
create table wanderer (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  abilities_impairments varchar [] not null default '{}',
  accuracy int not null default 0,
  arc boolean not null default false,
  courage int not null default 0,
  disposition int not null default 0,
  evasion int not null default 0,
  fighting_arts varchar [] not null default '{}',
  gender gender not null,
  hunt_xp int not null default 0,
  hunt_xp_rank_up int [] not null default '{}',
  insanity int not null default 0,
  luck int not null default 0,
  lumi int not null default 0,
  movement int not null default 0,
  wanderer_name varchar not null,
  permanent_injuries varchar [] not null default '{}',
  rare_gear varchar [] not null default '{}',
  speed int not null default 0,
  strength int not null default 0,
  survival int not null default 0,
  systemic_pressure int not null default 0,
  torment int not null default 0,
  understanding int not null default 0
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table wanderer_shared_user (
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (wanderer_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_wanderer_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from wanderer
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from wanderer_shared_user
    where wanderer_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table wanderer enable row level security;
create policy "Allow authenticated read for non-custom" on wanderer for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on wanderer for all using (
  custom
  and is_wanderer_member(id)
) with check (
  custom
  and is_wanderer_member(id)
);
create policy "Allow admin to manage all" on wanderer for all using (is_admin()) with check (is_admin());
create policy "Allow insert of custom for self" on wanderer for
insert with check (
    auth.role() = 'authenticated'
    and custom
    and user_id = auth.uid()
  );
alter table wanderer_shared_user enable row level security;
create policy "Allow all for owner" on wanderer_shared_user for all using (is_wanderer_member(wanderer_id));
create policy "Allow admin to manage all" on wanderer_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_wanderer_user on wanderer(user_id);
create index idx_wanderer_custom on wanderer(custom);
create index idx_wanderer_shared_user_wanderer on wanderer_shared_user(wanderer_id);
create index idx_wanderer_shared_user_user on wanderer_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on wanderer for each row execute function update_updated_at();