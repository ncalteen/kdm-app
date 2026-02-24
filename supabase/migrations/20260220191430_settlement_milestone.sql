--------------------------------------------------------------------------------
-- Settlement Milestone Table
--------------------------------------------------------------------------------
create table settlement_milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Milestone Data
  milestone_name varchar not null,
  complete boolean not null default false,
  event_name varchar not null default '',
  settlement_id uuid not null references settlement(id) on delete cascade,
  unique (settlement_id, milestone_name)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_milestone enable row level security;
create policy "Allow all for owner/shared" on settlement_milestone for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_milestone_settlement on settlement_milestone(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_milestone for each row execute function update_updated_at();