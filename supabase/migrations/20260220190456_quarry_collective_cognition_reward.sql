--------------------------------------------------------------------------------
-- Junction Table: Quarry Collective Cognition Reward
-- The collective cognition rewards that will be added to a settlement when the
-- quarry is added.
--------------------------------------------------------------------------------
create table quarry_collective_cognition_reward (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  collective_cognition_reward_id uuid not null references collective_cognition_reward(id) on delete cascade,
  quarry_id uuid not null references quarry(id) on delete cascade,
  -- Constraints
  unique (quarry_id, collective_cognition_reward_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_collective_cognition_reward enable row level security;
create policy "Allow insert for authenticated and custom" on quarry_collective_cognition_reward for
insert to authenticated with check (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on quarry_collective_cognition_reward for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_collective_cognition_reward for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on quarry_collective_cognition_reward for
update to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on quarry_collective_cognition_reward for delete to authenticated using (
  exists (
    select 1
    from quarry q
    where q.id = quarry_id
      and q.custom
      and q.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on quarry_collective_cognition_reward for
select to authenticated using (
    exists (
      select 1
      from quarry_shared_user su
      where quarry_id = su.quarry_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on quarry_collective_cognition_reward for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_collective_cognition_reward_quarry_id on quarry_collective_cognition_reward(quarry_id);
create index idx_quarry_collective_cognition_reward_reward_id on quarry_collective_cognition_reward(collective_cognition_reward_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_collective_cognition_reward for each row execute function update_updated_at();