--------------------------------------------------------------------------------
-- Settlement Timeline Year Table
-- Represents a single year in a settlement's timeline.
--------------------------------------------------------------------------------
create table settlement_timeline_year (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  completed boolean not null default false,
  entries varchar [] not null default '{}',
  settlement_id uuid not null references settlement(id) on delete cascade,
  year_number int not null,
  -- Constraints
  unique (settlement_id, year_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_timeline_year enable row level security;
create policy "Allow all for owner/shared" on settlement_timeline_year for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
create policy "Allow admin to manage all" on settlement_timeline_year for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_timeline_year_settlement on settlement_timeline_year(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_timeline_year for each row execute function update_updated_at();