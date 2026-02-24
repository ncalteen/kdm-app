--------------------------------------------------------------------------------
-- Settlement Resource Table
--------------------------------------------------------------------------------
create table settlement_resource (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settlement Resource Data
  category resource_category not null default 'BASIC',
  monster_name varchar,
  monster_node monster_node,
  resource_name varchar not null,
  resource_types resource_type [] not null default '{}',
  settlement_id uuid not null references settlement(id) on delete cascade,
  quantity int not null default 0
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_resource enable row level security;
create policy "Allow all for owner/shared" on settlement_resource for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
  or exists (
    select 1
    from settlement_shared_user su
    where su.settlement_id = settlement_resource.settlement_id
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
    where su.settlement_id = settlement_resource.settlement_id
      and su.shared_user_id = auth.uid()
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_resource_settlement on settlement_resource(settlement_id);
create index idx_settlement_resource_monster_node on settlement_resource(monster_node);