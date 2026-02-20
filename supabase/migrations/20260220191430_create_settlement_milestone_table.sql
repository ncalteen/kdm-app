-- Settlement Milestone
create table settlement_milestone (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  milestone_name varchar not null,
  complete boolean not null default false,
  event_name varchar not null default ''
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