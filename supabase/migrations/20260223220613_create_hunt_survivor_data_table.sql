-- Hunt Survivor
create table hunt_survivor_data (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hunt Survivor Data
  accuracy_tokens integer not null default 0,
  evasion_tokens integer not null default 0,
  insanity_tokens integer not null default 0,
  luck_tokens integer not null default 0,
  movement_tokens integer not null default 0,
  notes text not null default '',
  settlement_id uuid not null references settlement (id) on delete cascade,
  speed_tokens integer not null default 0,
  strength_tokens integer not null default 0,
  survival_tokens integer not null default 0,
  survivor_id uuid not null references survivor(id) on delete cascade
);
alter table hunt_survivor_data enable row level security;
create policy "Allow all for owner" on hunt_survivor_data for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on hunt_survivor_data for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_hunt_survivor_data_settlement on hunt_survivor_data (settlement_id);
create index idx_hunt_survivor_data_survivor on hunt_survivor_data (survivor_id);