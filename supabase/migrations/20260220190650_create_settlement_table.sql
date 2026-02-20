-- Settlement
create table settlement (
  -- IDs
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shared_user_ids uuid [] not null default '{}',
  -- General Data
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
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
  wanderer_ids uuid [] not null default '{}',
  -- Arc Specific Data
  -- collective_cognition_rewards
  cc_value int,
  -- knowledges
  -- philosophies
  -- People of the Lantern/Sun Specific Data
  lantern_research int,
  monster_volumes varchar [] not null default '{}' -- Squires of the Citadel Specific Data
  -- squire_suspicions
);
alter table settlement enable row level security;
create policy "Allow all for owner" on settlement for all using (auth.uid() = user_id);
create policy "Allow all for shared users" on settlement for all using (auth.uid() = any(shared_user_ids));