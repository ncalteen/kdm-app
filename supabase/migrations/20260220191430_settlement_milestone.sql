--------------------------------------------------------------------------------
-- Settlement Milestone Table
--------------------------------------------------------------------------------
create table settlement_milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Milestone Data
  milestone_name varchar not null,
  complete boolean not null default false,
  event_name varchar not null default '',
  settlement_id uuid not null references settlement(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_milestone enable row level security;
create policy "Allow all for owner/shared" on settlement_milestone for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_milestone.settlement_id
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
    where su.settlement_id = settlement_milestone.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_milestone_settlement on settlement_milestone (settlement_id);