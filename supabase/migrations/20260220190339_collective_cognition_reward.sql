--------------------------------------------------------------------------------
-- Collective Cognition Reward Table
-- Built-in and custom collective cognition rewards for Arc settlements.
--------------------------------------------------------------------------------
create table collective_cognition_reward (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  collective_cognition int not null default 0,
  reward_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table collective_cognition_reward_shared_user (
  collective_cognition_reward_id uuid not null references collective_cognition_reward(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (
    collective_cognition_reward_id,
    shared_user_id,
    user_id
  )
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table collective_cognition_reward enable row level security;
create policy "Allow insert for authenticated and custom" on collective_cognition_reward for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on collective_cognition_reward for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on collective_cognition_reward for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on collective_cognition_reward for
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
create policy "Allow delete for owner and custom" on collective_cognition_reward for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on collective_cognition_reward for
select to authenticated using (
    custom
    and exists (
      select 1
      from collective_cognition_reward_shared_user su
      where su.collective_cognition_reward_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on collective_cognition_reward for
update to authenticated using (
    custom
    and exists (
      select 1
      from collective_cognition_reward_shared_user su
      where su.collective_cognition_reward_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from collective_cognition_reward_shared_user su
      where su.collective_cognition_reward_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on collective_cognition_reward for all using (is_admin()) with check (is_admin());
alter table collective_cognition_reward_shared_user enable row level security;
create policy "Allow insert for authenticated" on collective_cognition_reward_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from collective_cognition_reward c
      where c.id = collective_cognition_reward_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on collective_cognition_reward_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on collective_cognition_reward_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on collective_cognition_reward_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on collective_cognition_reward_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on collective_cognition_reward_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_collective_cognition_reward_shared_user_collective_cognition_reward on collective_cognition_reward_shared_user(collective_cognition_reward_id);
create index idx_collective_cognition_reward_shared_user_user on collective_cognition_reward_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on collective_cognition_reward for each row execute function update_updated_at();