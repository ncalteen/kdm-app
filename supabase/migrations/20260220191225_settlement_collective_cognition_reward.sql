--------------------------------------------------------------------------------
-- Settlement Collective Cognition Reward Table
--------------------------------------------------------------------------------
create table settlement_collective_cognition_reward (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Reward Data
  cc int not null default 0,
  reward_name varchar not null,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_collective_cognition_reward enable row level security;
create policy "Allow all for owner/shared" on settlement_collective_cognition_reward for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_collective_cognition_reward.settlement_id
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
    where su.settlement_id = settlement_collective_cognition_reward.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_collective_cognition_reward_settlement on settlement_collective_cognition_reward(settlement_id);