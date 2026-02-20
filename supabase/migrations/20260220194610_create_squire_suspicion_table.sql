-- Squire Suspicion
create table squire_suspicion (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  survivor_id uuid not null references survivor (id) on delete cascade,
  level_1 boolean not null default false,
  level_2 boolean not null default false,
  level_3 boolean not null default false,
  level_4 boolean not null default false
);
alter table squire_suspicion enable row level security;
create policy "Allow all for owner" on squire_suspicion for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on squire_suspicion for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_squire_suspicion_settlement on squire_suspicion (settlement_id);