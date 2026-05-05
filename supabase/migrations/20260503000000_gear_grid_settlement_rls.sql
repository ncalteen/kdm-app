--------------------------------------------------------------------------------
-- Gear Grid → Settlement-Scoped Row Level Security
--
-- The original gear_grid migration (20260424000009) modelled access on a
-- catalog-style `custom` / `user_id` / `gear_grid_shared_user` triad. That
-- pattern doesn't fit the actual data: a `gear_grid` belongs to a `survivor`,
-- which belongs to a `settlement`, which is the real ownership boundary in the
-- application. As a result:
--
--   * Users invited to a shared settlement could read the settlement and its
--     survivors but not those survivors' gear grids.
--   * The `custom` / `user_id` columns on gear_grid duplicated information
--     already encoded in the survivor → settlement relationship.
--   * The `gear_grid_shared_user` junction was unreachable from the rest of the
--     data model.
--
-- This migration replaces the access model with the same settlement-scoped
-- approach used by other survivor-owned junction tables (e.g.
-- survivor_disorder, survivor_cursed_gear). Settlement owners can fully
-- manage grids for their survivors; shared users can read them.
--
-- Dev data has no `gear_grid` rows yet, so dropping the now-unused columns
-- and the shared-user junction is safe.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Drop existing RLS policies on gear_grid
--------------------------------------------------------------------------------
drop policy if exists "Allow insert for authenticated and custom" on gear_grid;
drop policy if exists "Allow select for authenticated and non-custom" on gear_grid;
drop policy if exists "Allow select for owner and custom" on gear_grid;
drop policy if exists "Allow update for owner and custom" on gear_grid;
drop policy if exists "Allow delete for owner and custom" on gear_grid;
drop policy if exists "Allow select for shared and custom" on gear_grid;
drop policy if exists "Allow update for shared and custom" on gear_grid;
drop policy if exists "Allow all for admin" on gear_grid;
--------------------------------------------------------------------------------
-- Drop the unused shared-user junction (and its policies/indexes/helper)
--------------------------------------------------------------------------------
drop table if exists gear_grid_shared_user;
drop function if exists is_gear_grid_owner(uuid);
--------------------------------------------------------------------------------
-- Drop unused columns. Both default to non-meaningful values for grids that
-- now derive ownership from the survivor's settlement.
--------------------------------------------------------------------------------
alter table gear_grid drop column if exists custom;
alter table gear_grid drop column if exists user_id;
drop index if exists idx_gear_grid_custom_user;
--------------------------------------------------------------------------------
-- New settlement-scoped RLS policies
--
-- Mirrors the policy structure on `survivor_disorder` and similar tables:
--   * Settlement owner: full read/write access.
--   * Shared user: read-only access.
--   * Admin: bypass.
--------------------------------------------------------------------------------
create policy "Allow select for owner" on gear_grid for
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
create policy "Allow insert for owner" on gear_grid for
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
create policy "Allow update for owner" on gear_grid for
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
create policy "Allow delete for owner" on gear_grid for delete to authenticated using (
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
create policy "Allow select for shared" on gear_grid for
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
create policy "Allow all for admin" on gear_grid for all using (is_admin()) with check (is_admin());