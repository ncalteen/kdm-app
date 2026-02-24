--------------------------------------------------------------------------------
-- Junction Table: Settlement Philosophy
--------------------------------------------------------------------------------
create table settlement_philosophy (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Philosophy Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  philosophy_id uuid not null references philosophy(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_philosophy enable row level security;
create policy "Allow all for owner/shared" on settlement_philosophy for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_philosophy.settlement_id
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
    where su.settlement_id = settlement_philosophy.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_philosophy_settlement on settlement_philosophy(settlement_id);
create index idx_settlement_philosophy_philosophy on settlement_philosophy(philosophy_id);