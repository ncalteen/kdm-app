--------------------------------------------------------------------------------
-- Fix: settlement_shared_user SELECT policy for shared users
--
-- The "Allow select for shared" policy on `settlement_shared_user` was
-- previously filtering on `user_id = auth.uid()`, which is identical to the
-- owner's policy and therefore does not grant the shared user visibility of
-- their own share row.
--
-- Because the `settlement` "Allow select for shared" policy delegates to a
-- subquery against `settlement_shared_user`, and that subquery is subject to
-- RLS, shared users could never actually read the settlements granted to
-- them. This aligns the policy with every other `*_shared_user` table, which
-- correctly filters on `shared_user_id = auth.uid()`.
--------------------------------------------------------------------------------
drop policy if exists "Allow select for shared" on settlement_shared_user;
create policy "Allow select for shared" on settlement_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );