--------------------------------------------------------------------------------
-- Philosophy Rank Table
-- Ranks within a philosophy, each with their own rules.
--------------------------------------------------------------------------------
create table philosophy_rank (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  philosophy_id uuid not null references philosophy(id) on delete cascade,
  rank_number int not null,
  rules text
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table philosophy_rank enable row level security;
create policy "Allow insert for owner and custom" on philosophy_rank for
insert to authenticated with check (
    exists (
      select 1
      from philosophy p
      where p.id = philosophy_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on philosophy_rank for
select to authenticated using (
    exists (
      select 1
      from philosophy p
      where p.id = philosophy_id
        and not p.custom
    )
  );
create policy "Allow select for owner and custom" on philosophy_rank for
select to authenticated using (
    exists (
      select 1
      from philosophy p
      where p.id = philosophy_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on philosophy_rank for
update to authenticated using (
    exists (
      select 1
      from philosophy p
      where p.id = philosophy_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from philosophy p
      where p.id = philosophy_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on philosophy_rank for delete to authenticated using (
  exists (
    select 1
    from philosophy p
    where p.id = philosophy_id
      and p.custom
      and p.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on philosophy_rank for
select to authenticated using (
    exists (
      select 1
      from philosophy_shared_user su
      where su.philosophy_id = philosophy_rank.philosophy_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on philosophy_rank for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_philosophy_rank_philosophy on philosophy_rank(philosophy_id);
create index idx_philosophy_rank_philosophy_rank on philosophy_rank(philosophy_id, rank_number);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on philosophy_rank for each row execute function update_updated_at();