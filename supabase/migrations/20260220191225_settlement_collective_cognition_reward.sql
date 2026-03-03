--------------------------------------------------------------------------------
-- Settlement Collective Cognition Reward Table
-- Represents collective cognition milestones and rewards for settlements.
--------------------------------------------------------------------------------
create table settlement_collective_cognition_reward (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  collective_cognition_reward_id uuid not null references collective_cognition_reward(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false,
  unique (collective_cognition_reward_id, settlement_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_collective_cognition_reward enable row level security;
create policy "Allow all for owner/shared" on settlement_collective_cognition_reward for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_collective_cognition_reward for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_collective_cognition_reward_settlement on settlement_collective_cognition_reward(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_collective_cognition_reward for each row execute function update_updated_at();