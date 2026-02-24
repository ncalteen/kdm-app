--------------------------------------------------------------------------------
-- Showdown Survivor Table
--------------------------------------------------------------------------------
create table showdown_survivor (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Showdown Survivor Data
  activation_used boolean not null default false,
  accuracy_tokens integer not null default 0,
  bleeding_tokens integer not null default 0,
  block_tokens integer not null default 0,
  deflect_tokens integer not null default 0,
  evasion_tokens integer not null default 0,
  insanity_tokens integer not null default 0,
  knocked_down boolean not null default false,
  luck_tokens integer not null default 0,
  movement_tokens integer not null default 0,
  movement_used boolean not null default false,
  notes text not null default '',
  priority_target boolean not null default false,
  settlement_id uuid not null references settlement(id) on delete cascade,
  speed_tokens integer not null default 0,
  strength_tokens integer not null default 0,
  survival_tokens integer not null default 0,
  survivor_id uuid not null references survivor(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown_survivor enable row level security;
create policy "Allow all for owner/shared" on showdown_survivor for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = showdown_survivor.settlement_id
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
    where su.settlement_id = showdown_survivor.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_survivor_settlement on showdown_survivor(settlement_id);
create index idx_showdown_survivor_survivor on showdown_survivor(survivor_id);