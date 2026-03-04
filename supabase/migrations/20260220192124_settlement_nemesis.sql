--------------------------------------------------------------------------------
-- Settlement Nemesis Table
-- This table tracks the nemeses associated with each settlement.
--------------------------------------------------------------------------------
create table settlement_nemesis (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  collective_cognition_level_1 boolean not null default false,
  collective_cognition_level_2 boolean not null default false,
  collective_cognition_level_3 boolean not null default false,
  level_1_defeated boolean not null default false,
  level_2_defeated boolean not null default false,
  level_3_defeated boolean not null default false,
  level_4_defeated boolean not null default false,
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  unlocked boolean not null default false,
  -- Constraints
  unique (settlement_id, nemesis_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_nemesis enable row level security;
create policy "Allow select for owner" on settlement_nemesis for
select to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner" on settlement_nemesis for
insert to authenticated with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on settlement_nemesis for
update to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on settlement_nemesis for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on settlement_nemesis for
select to authenticated using (
    exists (
      select 1
      from settlement_shared_user su
      where settlement_id = su.settlement_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on settlement_nemesis for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_nemesis_settlement on settlement_nemesis(settlement_id);
create index idx_settlement_nemesis_nemesis on settlement_nemesis(nemesis_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_nemesis for each row execute function update_updated_at();