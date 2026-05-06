--------------------------------------------------------------------------------
-- Junction Table: Survivor Ability/Impairment
-- Represents the many-to-many relationship between survivors and abilities/impairments.
--------------------------------------------------------------------------------
create table survivor_ability_impairment (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  survivor_id uuid not null references survivor(id) on delete cascade,
  ability_impairment_id uuid not null references ability_impairment(id) on delete cascade,
  -- Constraints
  unique (survivor_id, ability_impairment_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table survivor_ability_impairment enable row level security;
create policy "Allow select for owner" on survivor_ability_impairment for
select to authenticated using (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): only the settlement owner can
-- currently INSERT/UPDATE/DELETE on this survivor-scoped junction.
-- Collaborators on the parent settlement should be able to mutate it.
-- Loosened in Phase 1 — see [E1.2.c] (issue #145).
create policy "Allow insert for owner" on survivor_ability_impairment for
insert to authenticated with check (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on survivor_ability_impairment for
update to authenticated using (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from survivor sv
        join settlement s on s.id = sv.settlement_id
      where sv.id = survivor_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on survivor_ability_impairment for delete to authenticated using (
  exists (
    select 1
    from survivor sv
      join settlement s on s.id = sv.settlement_id
    where sv.id = survivor_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on survivor_ability_impairment for
select to authenticated using (
    exists (
      select 1
      from survivor sv
        join settlement_shared_user su on su.settlement_id = sv.settlement_id
      where sv.id = survivor_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on survivor_ability_impairment for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_survivor_ability_impairment_survivor on survivor_ability_impairment(survivor_id);
create index idx_survivor_ability_impairment_ability_impairment on survivor_ability_impairment(ability_impairment_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on survivor_ability_impairment for each row execute function update_updated_at();