--------------------------------------------------------------------------------
-- Settlement Collective Cognition Reward Table
--------------------------------------------------------------------------------
create table settlement_collective_cognition_reward (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Reward Data
  collective_cognition int not null default 0,
  reward_name varchar not null,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false,
  unique (settlement_id, reward_name)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_collective_cognition_reward enable row level security;
create policy "Allow all for owner/shared" on settlement_collective_cognition_reward for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_collective_cognition_reward_settlement on settlement_collective_cognition_reward(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_collective_cognition_reward for each row execute function update_updated_at();