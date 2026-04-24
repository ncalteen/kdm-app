--------------------------------------------------------------------------------
-- Junction Table: Nemesis Level / Trait
-- Replaces the `nemesis_level.traits` varchar[] column with a many-to-many
-- mapping to the normalized `trait` catalog.
--------------------------------------------------------------------------------
create table nemesis_level_trait (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  nemesis_level_id uuid not null references nemesis_level(id) on delete cascade,
  trait_id uuid not null references trait(id) on delete cascade,
  -- Constraints
  unique (nemesis_level_id, trait_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Mirrors `nemesis_level`: gated by the parent nemesis' custom/owner/shared
-- status. Catalog (non-custom) rows are readable by every authenticated
-- user; mutations on catalog rows are admin-only.
--------------------------------------------------------------------------------
alter table nemesis_level_trait enable row level security;
create policy "Allow insert for owner and custom" on nemesis_level_trait for
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
create policy "Allow select for authenticated and non-custom" on nemesis_level_trait for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and not n.custom
    )
  );
create policy "Allow select for owner and custom" on nemesis_level_trait for
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
create policy "Allow update for owner and custom" on nemesis_level_trait for
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
create policy "Allow delete for owner and custom" on nemesis_level_trait for delete to authenticated using (
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
create policy "Allow select for shared and custom" on nemesis_level_trait for
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
create policy "Allow all for admin" on nemesis_level_trait for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_level_trait_nemesis_level on nemesis_level_trait(nemesis_level_id);
create index idx_nemesis_level_trait_trait on nemesis_level_trait(trait_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_level_trait for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Junction Table: Nemesis Level / Mood
-- Replaces the `nemesis_level.moods` varchar[] column.
--------------------------------------------------------------------------------
create table nemesis_level_mood (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  nemesis_level_id uuid not null references nemesis_level(id) on delete cascade,
  mood_id uuid not null references mood(id) on delete cascade,
  -- Constraints
  unique (nemesis_level_id, mood_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis_level_mood enable row level security;
create policy "Allow insert for owner and custom" on nemesis_level_mood for
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
create policy "Allow select for authenticated and non-custom" on nemesis_level_mood for
select to authenticated using (
    exists (
      select 1
      from nemesis_level nl
        join nemesis n on n.id = nl.nemesis_id
      where nl.id = nemesis_level_id
        and not n.custom
    )
  );
create policy "Allow select for owner and custom" on nemesis_level_mood for
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
create policy "Allow update for owner and custom" on nemesis_level_mood for
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
create policy "Allow delete for owner and custom" on nemesis_level_mood for delete to authenticated using (
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
create policy "Allow select for shared and custom" on nemesis_level_mood for
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
create policy "Allow all for admin" on nemesis_level_mood for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_level_mood_nemesis_level on nemesis_level_mood(nemesis_level_id);
create index idx_nemesis_level_mood_mood on nemesis_level_mood(mood_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_level_mood for each row execute function update_updated_at();