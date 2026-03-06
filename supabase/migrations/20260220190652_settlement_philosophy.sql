--------------------------------------------------------------------------------
-- Junction Table: Settlement Philosophy
-- Represents the many-to-many relationship between settlements and
-- philosophies.
--------------------------------------------------------------------------------
create table settlement_philosophy (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  philosophy_id uuid not null references philosophy(id) on delete cascade,
  -- Constraints
  unique (settlement_id, philosophy_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_philosophy enable row level security;
create policy "Allow select for owner" on settlement_philosophy for
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
create policy "Allow insert for owner" on settlement_philosophy for
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
create policy "Allow update for owner" on settlement_philosophy for
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
create policy "Allow delete for owner" on settlement_philosophy for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on settlement_philosophy for
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
create policy "Allow all for admin" on settlement_philosophy for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_philosophy_settlement on settlement_philosophy(settlement_id);
create index idx_settlement_philosophy_philosophy on settlement_philosophy(philosophy_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_philosophy for each row execute function update_updated_at();