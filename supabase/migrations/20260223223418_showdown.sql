--------------------------------------------------------------------------------
-- Showdown Table
--------------------------------------------------------------------------------
create table showdown (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Showdown Data
  ambush boolean not null default false,
  monster_level int not null,
  scout_id uuid references survivor(id) on delete
  set null,
    settlement_id uuid references settlement(id) on delete cascade,
    showdown_type showdown_type not null default 'REGULAR',
    turn showdown_turn not null default 'MONSTER'
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown enable row level security;
create policy "Allow all for owner/shared" on showdown for all using (is_settlement_member(settlement_id)) with check (is_settlement_member(settlement_id));
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_settlement on showdown(settlement_id);
create index idx_showdown_scout on showdown(scout_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on showdown for each row execute function update_updated_at();