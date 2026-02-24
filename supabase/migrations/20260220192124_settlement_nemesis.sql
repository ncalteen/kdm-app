--------------------------------------------------------------------------------
-- Settlement Nemesis Table
--------------------------------------------------------------------------------
create table settlement_nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Nemesis Data
  collective_cognition_level_1 boolean not null default false,
  collective_cognition_level_2 boolean not null default false,
  collective_cognition_level_3 boolean not null default false,
  level_1_defeated boolean not null default false,
  level_2_defeated boolean not null default false,
  level_3_defeated boolean not null default false,
  level_4_defeated boolean not null default false,
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_nemesis enable row level security;
create policy "Allow all for owner/shared" on settlement_nemesis for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_nemesis.settlement_id
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
    where su.settlement_id = settlement_nemesis.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_nemesis_settlement on settlement_nemesis(settlement_id);
create index idx_settlement_nemesis_nemesis on settlement_nemesis(nemesis_id);