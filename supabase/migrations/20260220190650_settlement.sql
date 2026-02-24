--------------------------------------------------------------------------------
-- Settlement Table
-- Each entry represents a single settlement playthrough, which may include
-- multiple hunts, showdowns, and survivors.
--------------------------------------------------------------------------------
create table settlement (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Settlement Data
  arrival_bonuses varchar [] not null default '{}',
  campaign_type campaign_type not null default 'PEOPLE_OF_THE_LANTERN',
  departing_bonuses varchar [] not null default '{}',
  gear varchar [] not null default '{}',
  innovations varchar [] not null default '{}',
  notes text not null default '',
  patterns varchar [] not null default '{}',
  seed_patterns varchar [] not null default '{}',
  settlement_name varchar not null default 'New Settlement',
  survival_limit int not null default 1 check (survival_limit >= 0),
  survivor_type survivor_type not null default 'CORE',
  uses_scouts boolean not null default false,
  -- Arc Specific Data
  collective_cognition int not null default 0,
  -- People of the Lantern/Sun Specific Data
  lantern_research int not null default 0,
  monster_volumes varchar [] not null default '{}'
);
--------------------------------------------------------------------------------
-- Junction Table: Settlement Shared Users
--------------------------------------------------------------------------------
create table settlement_shared_user (
  settlement_id uuid not null references settlement(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (settlement_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Helper Functions
--------------------------------------------------------------------------------
create or replace function is_settlement_member(p_settlement_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from settlement
    where id = p_settlement_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from settlement_shared_user
    where settlement_id = p_settlement_id
      and shared_user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement enable row level security;
create policy "Allow all for owner/shared" on settlement for all using (is_settlement_member(id)) with check (is_settlement_member(id));
alter table settlement_shared_user enable row level security;
create policy "Allow all for owner" on settlement_shared_user for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_user on settlement(user_id);
create index idx_settlement_shared_user_settlement on settlement_shared_user(settlement_id);
create index idx_settlement_shared_user_user on settlement_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement for each row execute function update_updated_at();