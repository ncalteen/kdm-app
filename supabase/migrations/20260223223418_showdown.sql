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
create policy "Allow all for owner/shared" on showdown for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = showdown.settlement_id
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
    where su.settlement_id = showdown.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_settlement on showdown(settlement_id);
create index idx_showdown_scout on showdown(scout_id);