-- Settlement Location
create table settlement_location (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  location_name varchar not null,
  unlocked boolean not null default false
);
alter table settlement_location enable row level security;
create policy "Allow all for owner" on settlement_location for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_location for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_location_settlement on settlement_location (settlement_id);