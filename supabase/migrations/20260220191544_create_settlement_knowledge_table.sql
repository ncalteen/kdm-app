-- Settlement Knowledge
create table settlement_knowledge (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement (id) on delete cascade,
  knowledge_name varchar not null,
  philosophy_id uuid references philosophy (id) on delete
  set null
);
alter table settlement_knowledge enable row level security;
create policy "Allow all for owner" on settlement_knowledge for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_knowledge for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_settlement_knowledge_settlement on settlement_knowledge (settlement_id);