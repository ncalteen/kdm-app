--------------------------------------------------------------------------------
-- Wanderer Table
-- Information about individual wanderers, before they are added to a settlement
-- as survivors. This includes both custom wanderers created by users and those
-- available by default in the app.
--------------------------------------------------------------------------------
create table wanderer (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  abilities_impairments varchar [] not null default '{}',
  accuracy int not null default 0,
  arc boolean not null default false,
  courage int not null default 0,
  disposition int not null default 0,
  evasion int not null default 0,
  fighting_arts varchar [] not null default '{}',
  gender gender not null,
  hunt_xp int not null default 0,
  hunt_xp_rank_up int [] not null default '{}',
  insanity int not null default 0,
  luck int not null default 0,
  lumi int not null default 0,
  movement int not null default 0,
  wanderer_name varchar not null,
  permanent_injuries varchar [] not null default '{}',
  rare_gear varchar [] not null default '{}',
  speed int not null default 0,
  strength int not null default 0,
  survival int not null default 0,
  systemic_pressure int not null default 0,
  torment int not null default 0,
  understanding int not null default 0
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table wanderer_shared_user (
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  primary key (shared_user_id, user_id, wanderer_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table wanderer enable row level security;
create policy "Allow insert for authenticated and custom" on wanderer for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on wanderer for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on wanderer for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on wanderer for
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
create policy "Allow delete for owner and custom" on wanderer for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on wanderer for
select to authenticated using (
    custom
    and exists (
      select 1
      from wanderer_shared_user su
      where su.wanderer_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on wanderer for
update to authenticated using (
    custom
    and exists (
      select 1
      from wanderer_shared_user su
      where su.wanderer_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from wanderer_shared_user su
      where su.wanderer_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on wanderer for all using (is_admin()) with check (is_admin());
alter table wanderer_shared_user enable row level security;
create policy "Allow insert for authenticated" on wanderer_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.user_id = (
          select auth.uid()
        )
    )
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on wanderer_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on wanderer_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on wanderer_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on wanderer_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on wanderer_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_wanderer_user on wanderer(user_id);
create index idx_wanderer_custom on wanderer(custom);
create index idx_wanderer_shared_user_wanderer on wanderer_shared_user(wanderer_id);
create index idx_wanderer_shared_user_user on wanderer_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on wanderer for each row execute function update_updated_at();