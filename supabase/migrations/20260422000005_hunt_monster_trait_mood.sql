--------------------------------------------------------------------------------
-- Junction Table: Hunt Monster / Trait
-- Replaces the `hunt_monster.traits` varchar[] column with a many-to-many
-- mapping to the normalized `trait` catalog.
--------------------------------------------------------------------------------
create table hunt_monster_trait (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  hunt_monster_id uuid not null references hunt_monster(id) on delete cascade,
  trait_id uuid not null references trait(id) on delete cascade,
  -- Constraints
  unique (hunt_monster_id, trait_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Mirrors `hunt_monster` itself: owner of the settlement can CRUD, shared
-- settlement users can SELECT, admins bypass.
--------------------------------------------------------------------------------
alter table hunt_monster_trait enable row level security;
create policy "Allow select for owner" on hunt_monster_trait for
select to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): only the settlement owner can
-- currently INSERT/UPDATE/DELETE on this hunt-phase table. Collaborators
-- should be able to play through the hunt phase on a shared settlement.
-- Loosened in Phase 1 — see [E1.2.d] (issue #140).
create policy "Allow insert for owner" on hunt_monster_trait for
insert to authenticated with check (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on hunt_monster_trait for
update to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on hunt_monster_trait for delete to authenticated using (
  exists (
    select 1
    from hunt_monster hm
      join settlement s on s.id = hm.settlement_id
    where hm.id = hunt_monster_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_monster_trait for
select to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement_shared_user su on su.settlement_id = hm.settlement_id
      where hm.id = hunt_monster_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on hunt_monster_trait for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_monster_trait_hunt_monster on hunt_monster_trait(hunt_monster_id);
create index idx_hunt_monster_trait_trait on hunt_monster_trait(trait_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_monster_trait for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Junction Table: Hunt Monster / Mood
-- Replaces the `hunt_monster.moods` varchar[] column.
--------------------------------------------------------------------------------
create table hunt_monster_mood (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  hunt_monster_id uuid not null references hunt_monster(id) on delete cascade,
  mood_id uuid not null references mood(id) on delete cascade,
  -- Constraints
  unique (hunt_monster_id, mood_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_monster_mood enable row level security;
create policy "Allow select for owner" on hunt_monster_mood for
select to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): only the settlement owner can
-- currently INSERT/UPDATE/DELETE on this hunt-phase table. Collaborators
-- should be able to play through the hunt phase on a shared settlement.
-- Loosened in Phase 1 — see [E1.2.d] (issue #140).
create policy "Allow insert for owner" on hunt_monster_mood for
insert to authenticated with check (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on hunt_monster_mood for
update to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from hunt_monster hm
        join settlement s on s.id = hm.settlement_id
      where hm.id = hunt_monster_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on hunt_monster_mood for delete to authenticated using (
  exists (
    select 1
    from hunt_monster hm
      join settlement s on s.id = hm.settlement_id
    where hm.id = hunt_monster_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_monster_mood for
select to authenticated using (
    exists (
      select 1
      from hunt_monster hm
        join settlement_shared_user su on su.settlement_id = hm.settlement_id
      where hm.id = hunt_monster_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on hunt_monster_mood for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_monster_mood_hunt_monster on hunt_monster_mood(hunt_monster_id);
create index idx_hunt_monster_mood_mood on hunt_monster_mood(mood_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_monster_mood for each row execute function update_updated_at();