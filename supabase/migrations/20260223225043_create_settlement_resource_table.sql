-- Settlement Resource
create table settlement_resource (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Resource Data
  category resource_category not null default 'BASIC',
  monster_name varchar,
  monster_node monster_node,
  resource_name varchar not null,
  resource_types resource_type [] not null default '{}',
  settlement_id uuid not null references settlement(id) on delete cascade,
  quantity int not null default 0
);
alter table settlement_resource enable row level security;
create policy "Allow all for owner" on settlement_resource for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on settlement_resource for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);