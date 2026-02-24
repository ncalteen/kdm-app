--------------------------------------------------------------------------------
-- Settlement Principle Table
--------------------------------------------------------------------------------
create table settlement_principle (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Principle Data
  option_1_name varchar not null,
  option_1_selected boolean not null default false,
  option_2_name varchar not null,
  option_2_selected boolean not null default false,
  principle_name varchar not null,
  settlement_id uuid not null references settlement (id) on delete cascade,
  unique (settlement_id, principle_name)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_principle enable row level security;
create policy "Allow all for owner/shared" on settlement_principle for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_principle_settlement on settlement_principle(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_principle for each row execute function update_updated_at();