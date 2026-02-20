-- Settlement Principle
create table settlement_principle (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  principle_name varchar not null,
  option_1_name varchar not null,
  option_1_selected boolean not null default false,
  option_2_name varchar not null,
  option_2_selected boolean not null default false
);
alter table settlement_principle enable row level security;
create policy "Allow all for owner" on settlement_principle for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_principle for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_principle_settlement on settlement_principle (settlement_id);