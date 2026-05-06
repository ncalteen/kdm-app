--------------------------------------------------------------------------------
-- Survivor Status Table
-- Built-in and custom survivor statuses.
--------------------------------------------------------------------------------
create table survivor_status (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  survivor_status_name varchar not null,
  rules text
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table survivor_status_shared_user (
  survivor_status_id uuid not null references survivor_status(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (survivor_status_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
create or replace function is_survivor_status_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.survivor_status
    where id = record_id
      and user_id = auth.uid()
  );
$$;
alter table survivor_status enable row level security;
create policy "Allow insert for authenticated and custom" on survivor_status for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on survivor_status for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on survivor_status for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on survivor_status for
update to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  ) with check (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner and custom" on survivor_status for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on survivor_status for
select to authenticated using (
    custom
    and exists (
      select 1
      from survivor_status_shared_user su
      where su.survivor_status_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): collaborators with whom this catalog
-- row was shared can currently UPDATE rules text. Custom catalog rules
-- text should only be editable by the author (owner).
-- Removed in Phase 2 — see [E2.2] (issue #149).
create policy "Allow update for shared and custom" on survivor_status for
update to authenticated using (
    custom
    and exists (
      select 1
      from survivor_status_shared_user su
      where su.survivor_status_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from survivor_status_shared_user su
      where su.survivor_status_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on survivor_status for all using (is_admin()) with check (is_admin());
alter table survivor_status_shared_user enable row level security;
create policy "Allow insert for authenticated" on survivor_status_shared_user for
insert to authenticated with check (
    is_survivor_status_owner(survivor_status_id)
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on survivor_status_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on survivor_status_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on survivor_status_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on survivor_status_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on survivor_status_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_survivor_status_custom_user on survivor_status(custom, user_id);
create index idx_survivor_status_shared_user_survivor_status on survivor_status_shared_user(survivor_status_id);
create index idx_survivor_status_shared_user_user on survivor_status_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on survivor_status for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Junction Table: Nemesis Level / Survivor Status
-- Replaces the `nemesis_level.survivor_statuses` varchar[] column with a
-- many-to-many mapping to the normalized `survivor_status` catalog.
--------------------------------------------------------------------------------
create table nemesis_level_survivor_status (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  nemesis_level_id uuid not null references nemesis_level(id) on delete cascade,
  survivor_status_id uuid not null references survivor_status(id) on delete cascade,
  -- Constraints
  unique (nemesis_level_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Mirrors `nemesis_level`: gated by the parent nemesis' custom/owner/shared
-- status. Catalog (non-custom) rows are readable by every authenticated
-- user; mutations on catalog rows are admin-only.
--------------------------------------------------------------------------------
alter table nemesis_level_survivor_status enable row level security;
create policy "Allow insert for owner and custom" on nemesis_level_survivor_status for
insert to authenticated with check (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on nemesis_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and not n.custom
    )
  );
create policy "Allow select for owner and custom" on nemesis_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on nemesis_level_survivor_status for
update to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on nemesis_level_survivor_status for delete to authenticated using (
  exists (
    select 1
    from nemesis_level nl
      join nemesis n on n.id = nl.nemesis_id
    where nl.id = nemesis_level_id
      and n.custom
      and n.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on nemesis_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis_shared_user su on su.nemesis_id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on nemesis_level_survivor_status for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_level_survivor_status_nemesis_level on nemesis_level_survivor_status(nemesis_level_id);
create index idx_nemesis_level_survivor_status_survivor_status on nemesis_level_survivor_status(survivor_status_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_level_survivor_status for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Junction Table: Quarry Level / Survivor Status
-- Replaces the `quarry_level.survivor_statuses` varchar[] column with a
-- many-to-many mapping to the normalized `survivor_status` catalog.
--------------------------------------------------------------------------------
create table quarry_level_survivor_status (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  quarry_level_id uuid not null references quarry_level(id) on delete cascade,
  survivor_status_id uuid not null references survivor_status(id) on delete cascade,
  -- Constraints
  unique (quarry_level_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Mirrors `quarry_level`: gated by the parent quarry's custom/owner/shared
-- status. Catalog (non-custom) rows are readable by every authenticated
-- user; mutations on catalog rows are admin-only.
--------------------------------------------------------------------------------
alter table quarry_level_survivor_status enable row level security;
create policy "Allow insert for owner and custom" on quarry_level_survivor_status for
insert to authenticated with check (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on quarry_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on quarry_level_survivor_status for
update to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on quarry_level_survivor_status for delete to authenticated using (
  exists (
    select 1
    from quarry_level ql
      join quarry q on q.id = ql.quarry_id
    where ql.id = quarry_level_id
      and q.custom
      and q.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on quarry_level_survivor_status for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry_shared_user su on su.quarry_id = ql.quarry_id
      where ql.id = quarry_level_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on quarry_level_survivor_status for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_level_survivor_status_quarry_level on quarry_level_survivor_status(quarry_level_id);
create index idx_quarry_level_survivor_status_survivor_status on quarry_level_survivor_status(survivor_status_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_level_survivor_status for each row execute function update_updated_at();