--------------------------------------------------------------------------------
-- Milestone Table
-- Built-in and custom milestones.
--------------------------------------------------------------------------------
create table milestone (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  campaign_types campaign_type [] not null default '{}',
  event_name varchar not null,
  milestone_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table milestone_shared_user (
  milestone_id uuid not null references milestone(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (milestone_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table milestone enable row level security;
create policy "Allow insert for authenticated and custom" on milestone for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on milestone for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on milestone for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on milestone for
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
create policy "Allow delete for owner and custom" on milestone for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on milestone for
select to authenticated using (
    custom
    and exists (
      select 1
      from milestone_shared_user su
      where su.milestone_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on milestone for
update to authenticated using (
    custom
    and exists (
      select 1
      from milestone_shared_user su
      where su.milestone_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from milestone_shared_user su
      where su.milestone_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on milestone for all using (is_admin()) with check (is_admin());
alter table milestone_shared_user enable row level security;
create policy "Allow insert for authenticated" on milestone_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from milestone m
      where m.id = milestone_id
        and user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on milestone_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on milestone_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on milestone_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on milestone_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on milestone_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_milestone_shared_user_milestone on milestone_shared_user(milestone_id);
create index idx_milestone_shared_user_user on milestone_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on milestone for each row execute function update_updated_at();