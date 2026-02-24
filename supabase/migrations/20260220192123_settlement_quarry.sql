--------------------------------------------------------------------------------
-- Settlement Quarry Table
--------------------------------------------------------------------------------
create table settlement_quarry (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Quarry Data
  collective_cognition_level_1 boolean not null default false,
  collective_cognition_level_2 boolean [] not null default '{false, false}',
  collective_cognition_level_3 boolean [] not null default '{false, false, false}',
  collective_cognition_prologue boolean not null default false,
  quarry_id uuid not null references quarry(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_quarry enable row level security;
create policy "Allow all for owner/shared" on settlement_quarry for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_quarry.settlement_id
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
    where su.settlement_id = settlement_quarry.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_quarry_settlement on settlement_quarry(settlement_id);
create index idx_settlement_quarry_quarry on settlement_quarry(quarry_id);