--------------------------------------------------------------------------------
-- Fix: settlement_phase_returning_survivor RLS Policies
--
-- Drops and recreates all RLS policies on settlement_phase_returning_survivor
-- with explicitly qualified column references to eliminate any potential
-- ambiguity during policy evaluation.
--------------------------------------------------------------------------------
-- Drop existing policies
drop policy if exists "Allow insert for owner" on settlement_phase_returning_survivor;
drop policy if exists "Allow select for owner" on settlement_phase_returning_survivor;
drop policy if exists "Allow update for owner" on settlement_phase_returning_survivor;
drop policy if exists "Allow delete for owner" on settlement_phase_returning_survivor;
drop policy if exists "Allow select for shared" on settlement_phase_returning_survivor;
drop policy if exists "Allow all for admin" on settlement_phase_returning_survivor;
-- Ensure RLS is enabled
alter table settlement_phase_returning_survivor enable row level security;
-- Recreate policies with explicit column qualification
create policy "Allow insert for owner" on settlement_phase_returning_survivor for
insert to authenticated with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_phase_returning_survivor.settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for owner" on settlement_phase_returning_survivor for
select to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_phase_returning_survivor.settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on settlement_phase_returning_survivor for
update to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_phase_returning_survivor.settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_phase_returning_survivor.settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on settlement_phase_returning_survivor for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_phase_returning_survivor.settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on settlement_phase_returning_survivor for
select to authenticated using (
    exists (
      select 1
      from settlement_shared_user su
      where settlement_phase_returning_survivor.settlement_id = su.settlement_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on settlement_phase_returning_survivor for all using (is_admin()) with check (is_admin());