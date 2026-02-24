--------------------------------------------------------------------------------
-- Junction Table: Settlement Wanderer
--------------------------------------------------------------------------------
create table settlement_wanderer (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Wanderer Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  wanderer_id uuid not null references wanderer(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_wanderer enable row level security;
create policy "Allow all for owner/shared" on settlement_wanderer for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_wanderer.settlement_id
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
    where su.settlement_id = settlement_wanderer.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_wanderer_settlement on settlement_wanderer(settlement_id);
create index idx_settlement_wanderer_wanderer on settlement_wanderer(wanderer_id);