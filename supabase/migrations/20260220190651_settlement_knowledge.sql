--------------------------------------------------------------------------------
-- Junction Table: Settlement Knowledge
-- Represents the many-to-many relationship between settlements and knowledges.
--------------------------------------------------------------------------------
create table settlement_knowledge (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Knowledge Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  knowledge_id uuid not null references knowledge(id) on delete cascade,
  -- Constraints
  unique (settlement_id, knowledge_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_knowledge enable row level security;
create policy "Allow all for owner/shared" on settlement_knowledge for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_knowledge for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_knowledge_settlement on settlement_knowledge(settlement_id);
create index idx_settlement_knowledge_knowledge on settlement_knowledge(knowledge_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_knowledge for each row execute function update_updated_at();