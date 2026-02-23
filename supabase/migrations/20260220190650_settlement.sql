--------------------------------------------------------------------------------
-- Settlement Table
--------------------------------------------------------------------------------
create table settlement (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Settlement Data
  arrival_bonuses varchar [] not null default '{}',
  campaign_type campaign_type not null default 'PEOPLE_OF_THE_LANTERN',
  -- death_count
  departing_bonuses varchar [] not null default '{}',
  gear varchar [] not null default '{}',
  innovations varchar [] not null default '{}',
  -- locations
  -- lost_settlements
  -- milestones
  -- nemeses
  notes text not null default '',
  patterns varchar [] not null default '{}',
  -- population
  -- principles
  -- quarries
  -- resources
  seed_patterns varchar [] not null default '{}',
  settlement_name varchar not null default 'New Settlement',
  survival_limit int not null default 1,
  survivor_type survivor_type not null default 'CORE',
  -- timeline
  uses_scouts boolean not null default false,
  -- Arc Specific Data
  -- collective_cognition_rewards
  cc_value int,
  -- knowledges
  -- philosophies
  -- People of the Lantern/Sun Specific Data
  lantern_research int,
  monster_volumes varchar [] not null default '{}' --
  -- Squires of the et nullet nullCitadel Specific Data
  -- squire_suspicions
);
--------------------------------------------------------------------------------
-- Junction Table: Settlement Wanderers
--------------------------------------------------------------------------------
create table settlement_wanderer (
  settlement_id uuid not null references settlement(id) on delete cascade,
  wanderer_id uuid not null references wanderer(id) on delete -- If a wanderer is deleted, don't delete the settlement!
  set null,
    primary key (settlement_id, wanderer_id)
);
--------------------------------------------------------------------------------
-- Junction Table: Settlement Shared Users
--------------------------------------------------------------------------------
create table settlement_shared_user (
  settlement_id uuid not null references settlement(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (settlement_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement enable row level security;
create policy "Allow all for owner/shared" on settlement for all using (
  auth.uid() = user_id
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = id
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = user_id
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = id
      and su.shared_user_id = auth.uid()
  )
);
alter table settlement_wanderer enable row level security;
create policy "Allow all for owner/shared" on settlement_wanderer for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_wanderer.settlement_id
      and su.shared_user_id = auth.uid()
  )
) with check (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_wanderer.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
alter table settlement_shared_user enable row level security;
create policy "Allow all for owner" on settlement_shared_user for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_wanderer_settlement on settlement_wanderer (settlement_id);
create index idx_settlement_wanderer_wanderer on settlement_wanderer (wanderer_id);
create index idx_settlement_shared_user_settlement on settlement_shared_user (settlement_id);
create index idx_settlement_shared_user_user on settlement_shared_user (shared_user_id);