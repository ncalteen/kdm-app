--------------------------------------------------------------------------------
-- Junction Table: Settlement Pattern
-- Represents the many-to-many relationship between settlements and
-- patterns.
--------------------------------------------------------------------------------
create table settlement_pattern (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  settlement_id uuid not null references settlement(id) on delete cascade,
  pattern_id uuid not null references pattern(id) on delete cascade,
  -- Constraints
  unique (settlement_id, pattern_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement_pattern enable row level security;
create policy "Allow select for owner" on settlement_pattern for
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
create policy "Allow insert for owner" on settlement_pattern for
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
create policy "Allow update for owner" on settlement_pattern for
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
create policy "Allow delete for owner" on settlement_pattern for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on settlement_pattern for
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
create policy "Allow all for admin" on settlement_pattern for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_pattern_settlement on settlement_pattern(settlement_id);
create index idx_settlement_pattern_pattern on settlement_pattern(pattern_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement_pattern for each row execute function update_updated_at();