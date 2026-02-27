--------------------------------------------------------------------------------
-- Hunt Survivor Table
-- Data related to a survivor during a hunt.
--------------------------------------------------------------------------------
create table hunt_survivor (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  accuracy_tokens integer not null default 0,
  evasion_tokens integer not null default 0,
  hunt_id uuid not null references hunt(id) on delete cascade,
  insanity_tokens integer not null default 0,
  luck_tokens integer not null default 0,
  movement_tokens integer not null default 0,
  notes text not null default '',
  settlement_id uuid not null references settlement(id) on delete cascade,
  speed_tokens integer not null default 0,
  strength_tokens integer not null default 0,
  survival_tokens integer not null default 0,
  survivor_id uuid not null references survivor(id) on delete cascade,
  -- Constraints
  unique (hunt_id, survivor_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_survivor enable row level security;
create policy "Allow all for owner/shared" on hunt_survivor for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on hunt_survivor for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_survivor_hunt on hunt_survivor(hunt_id);
create index idx_hunt_survivor_settlement on hunt_survivor(settlement_id);
create index idx_hunt_survivor_survivor on hunt_survivor(survivor_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_survivor for each row execute function update_updated_at();