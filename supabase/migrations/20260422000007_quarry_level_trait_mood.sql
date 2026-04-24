--------------------------------------------------------------------------------
-- Junction Table: Quarry Level / Trait
-- Replaces the `quarry_level.traits` varchar[] column with a many-to-many
-- mapping to the normalized `trait` catalog.
--------------------------------------------------------------------------------
create table quarry_level_trait (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  quarry_level_id uuid not null references quarry_level(id) on delete cascade,
  trait_id uuid not null references trait(id) on delete cascade,
  -- Constraints
  unique (quarry_level_id, trait_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Mirrors `quarry_level`: gated by the parent quarry's custom/owner/shared
-- status. Catalog (non-custom) rows are readable by every authenticated
-- user; mutations on catalog rows are admin-only.
--------------------------------------------------------------------------------
alter table quarry_level_trait enable row level security;
create policy "Allow insert for owner and custom" on quarry_level_trait for
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
create policy "Allow select for authenticated and non-custom" on quarry_level_trait for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_level_trait for
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
create policy "Allow update for owner and custom" on quarry_level_trait for
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
create policy "Allow delete for owner and custom" on quarry_level_trait for delete to authenticated using (
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
create policy "Allow select for shared and custom" on quarry_level_trait for
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
create policy "Allow all for admin" on quarry_level_trait for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_level_trait_quarry_level on quarry_level_trait(quarry_level_id);
create index idx_quarry_level_trait_trait on quarry_level_trait(trait_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_level_trait for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Junction Table: Quarry Level / Mood
-- Replaces the `quarry_level.moods` varchar[] column.
--------------------------------------------------------------------------------
create table quarry_level_mood (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  quarry_level_id uuid not null references quarry_level(id) on delete cascade,
  mood_id uuid not null references mood(id) on delete cascade,
  -- Constraints
  unique (quarry_level_id, mood_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_level_mood enable row level security;
create policy "Allow insert for owner and custom" on quarry_level_mood for
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
create policy "Allow select for authenticated and non-custom" on quarry_level_mood for
select to authenticated using (
    exists (
      select 1
      from quarry_level ql
        join quarry q on q.id = ql.quarry_id
      where ql.id = quarry_level_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_level_mood for
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
create policy "Allow update for owner and custom" on quarry_level_mood for
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
create policy "Allow delete for owner and custom" on quarry_level_mood for delete to authenticated using (
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
create policy "Allow select for shared and custom" on quarry_level_mood for
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
create policy "Allow all for admin" on quarry_level_mood for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_level_mood_quarry_level on quarry_level_mood(quarry_level_id);
create index idx_quarry_level_mood_mood on quarry_level_mood(mood_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_level_mood for each row execute function update_updated_at();