-- Settlement Collective Cognition Reward
create table settlement_collective_cognition_reward (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  cc int not null default 0,
  reward_name varchar not null,
  unlocked boolean not null default false
);
alter table settlement_collective_cognition_reward enable row level security;
create policy "Allow all for owner" on settlement_collective_cognition_reward for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_collective_cognition_reward for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_collective_cognition_reward_settlement on settlement_collective_cognition_reward (settlement_id);