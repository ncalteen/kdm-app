--------------------------------------------------------------------------------
-- Settlement Principle Table
--------------------------------------------------------------------------------
create table settlement_principle (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Principle Data
  option_1_name varchar not null,
  option_1_selected boolean not null default false,
  option_2_name varchar not null,
  option_2_selected boolean not null default false,
  principle_name varchar not null,
  settlement_id uuid not null references settlement (id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_principle enable row level security;
create policy "Allow all for owner/shared" on settlement_principle for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_principle.settlement_id
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
    where su.settlement_id = settlement_principle.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_principle_settlement on settlement_principle(settlement_id);