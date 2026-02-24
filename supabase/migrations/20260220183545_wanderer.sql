--------------------------------------------------------------------------------
-- Wanderer Table
--------------------------------------------------------------------------------
create table wanderer (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Wanderer Data
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
-- Junction Table: Wanderer Shared Users
--------------------------------------------------------------------------------
create table wanderer_shared_user (
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (wanderer_id, shared_user_id)
);
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
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from wanderer_shared_user su
      where su.wanderer_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from wanderer_shared_user su
      where su.wanderer_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
alter table wanderer_shared_user enable row level security;
create policy "Allow all for owner" on wanderer_shared_user for all using (
  auth.uid() = (
    select user_id
    from wanderer
    where id = wanderer_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_wanderer_shared_user_wanderer on wanderer_shared_user(wanderer_id);
create index idx_wanderer_shared_user_user on wanderer_shared_user(shared_user_id);