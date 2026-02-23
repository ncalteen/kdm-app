-- Settlement Knowledge
create table settlement_knowledge (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Knowledge Data
  knowledge_name varchar not null,
  philosophy_id uuid references philosophy (id) on delete cascade,
  settlement_id uuid not null references settlement (id) on delete cascade
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