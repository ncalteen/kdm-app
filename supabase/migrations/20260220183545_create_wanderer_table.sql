-- Wanderer
create table wanderer (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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
alter table wanderer enable row level security;
create policy "Allow authenticated read" on wanderer for
select using (auth.role() = 'authenticated');
-- Wanderer Timeline Entries
create table wanderer_timeline_entry (
  -- IDs
  id uuid primary key default gen_random_uuid(),
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Timeline Entry Data
  timeline_year int not null,
  entries varchar [] not null default '{}'
);
alter table wanderer_timeline_entry enable row level security;
create policy "Allow authenticated read" on wanderer_timeline_entry for
select using (auth.role() = 'authenticated');
-- Indexes
create index idx_timeline_entries_wanderer on wanderer_timeline_entry (wanderer_id);