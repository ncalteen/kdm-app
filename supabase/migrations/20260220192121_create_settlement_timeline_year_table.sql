-- Settlement Timeline Year
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
alter table settlement_timeline_year enable row level security;
create policy "Allow all for owner" on settlement_timeline_year for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_timeline_year for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_timeline_year_settlement on settlement_timeline_year (settlement_id);