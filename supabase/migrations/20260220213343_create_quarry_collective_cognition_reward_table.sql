-- Quarry Collective Cognition Reward
create table quarry_collective_cognition_reward (
  id uuid primary key default gen_random_uuid(),
  cc int not null default 0,
  reward_name varchar not null
);
alter table quarry_collective_cognition_reward enable row level security;
create policy "Allow read access to all users" on quarry_collective_cognition_reward for
select using (true);