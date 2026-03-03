--------------------------------------------------------------------------------
-- Settlement Milestone Table
-- Represents a milestone the settlement can achieve.
--------------------------------------------------------------------------------
create table settlement_milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  complete boolean not null default false,
  milestone_id uuid not null references milestone(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  -- Constraints
  unique (settlement_id, milestone_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_milestone enable row level security;
create policy "Allow all for owner/shared" on settlement_milestone for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_milestone for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_milestone_settlement on settlement_milestone(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_milestone for each row execute function update_updated_at();