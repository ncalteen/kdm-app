-- Settlement Milestone
create table settlement_milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Milestone Data
  milestone_name varchar not null,
  complete boolean not null default false,
  event_name varchar not null default '',
  settlement_id uuid not null references settlement (id) on delete cascade
);
alter table settlement_milestone enable row level security;
create policy "Allow all for owner" on settlement_milestone for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_milestone for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_milestone_settlement on settlement_milestone (settlement_id);