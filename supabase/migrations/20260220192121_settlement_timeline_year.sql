--------------------------------------------------------------------------------
-- Settlement Timeline Year Table
--------------------------------------------------------------------------------
create table settlement_timeline_year (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Timeline Data
  completed boolean not null default false,
  entries varchar [] not null default '{}',
  settlement_id uuid not null references settlement(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_timeline_year enable row level security;
create policy "Allow all for owner/shared" on settlement_timeline_year for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_timeline_year.settlement_id
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
    where su.settlement_id = settlement_timeline_year.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_timeline_year_settlement on settlement_timeline_year (settlement_id);