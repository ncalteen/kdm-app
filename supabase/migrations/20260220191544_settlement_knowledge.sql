--------------------------------------------------------------------------------
-- Settlement Knowledge Table
--------------------------------------------------------------------------------
create table settlement_knowledge (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Knowledge Data
  knowledge_id uuid not null references knowledge(id) on delete cascade,
  philosophy_id uuid references philosophy(id) on delete
  set null,
    settlement_id uuid not null references settlement(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_knowledge enable row level security;
create policy "Allow all for owner/shared" on settlement_knowledge for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_knowledge.settlement_id
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
    where su.settlement_id = settlement_knowledge.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_knowledge_settlement on settlement_knowledge(settlement_id);