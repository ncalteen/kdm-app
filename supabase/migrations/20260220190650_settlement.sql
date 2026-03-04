--------------------------------------------------------------------------------
-- Settlement Table
-- Each entry represents a single settlement playthrough, which may include
-- multiple hunts, showdowns, and survivors.
--------------------------------------------------------------------------------
create table settlement (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Base Data
  arrival_bonuses varchar [] not null default '{}',
  campaign_type campaign_type not null default 'PEOPLE_OF_THE_LANTERN',
  current_year int not null default 0 check (current_year >= 0),
  departing_bonuses varchar [] not null default '{}',
  notes text not null default '',
  settlement_name varchar not null default 'New Settlement',
  survival_limit int not null default 1 check (survival_limit >= 0),
  survivor_type survivor_type not null default 'CORE',
  uses_scouts boolean not null default false,
  -- People of the Lantern/Sun Specific Data
  lantern_research int not null default 0,
  monster_volumes varchar [] not null default '{}'
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table settlement_shared_user (
  owner_id uuid not null references auth.users(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (owner_id, settlement_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table settlement enable row level security;
create policy "Allow insert for authenticated" on settlement for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on settlement for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on settlement for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on settlement for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on settlement for
select to authenticated using (
    exists (
      select 1
      from settlement_shared_user
      where settlement_id = id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared" on settlement for
update to authenticated using (
    exists (
      select 1
      from settlement_shared_user
      where settlement_id = id
        and shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from settlement_shared_user
      where settlement_id = id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on settlement for all using (is_admin()) with check (is_admin());
alter table settlement_shared_user enable row level security;
create policy "Allow insert for authenticated" on settlement_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from settlement
      where id = settlement_id
        and user_id = (
          select auth.uid()
        )
    )
    and owner_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on settlement_shared_user for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on settlement_shared_user for
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  ) with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on settlement_shared_user for delete to authenticated using (
  owner_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on settlement_shared_user for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on settlement_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_settlement_user on settlement(user_id);
create index idx_settlement_shared_user_settlement on settlement_shared_user(settlement_id);
create index idx_settlement_shared_user_user on settlement_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on settlement for each row execute function update_updated_at();