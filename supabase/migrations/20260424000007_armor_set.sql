--------------------------------------------------------------------------------
-- Armor Set Table
-- Built-in and custom armor sets.
--------------------------------------------------------------------------------
create table armor_set (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  armor_set_name varchar not null,
  bonuses text
);
--------------------------------------------------------------------------------
-- Junction Table: Gear Pieces
--------------------------------------------------------------------------------
create table armor_set_gear (
  armor_set_id uuid not null references armor_set(id) on delete cascade,
  gear_id uuid not null references gear(id) on delete cascade,
  primary key (armor_set_id, gear_id)
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table armor_set_shared_user (
  armor_set_id uuid not null references armor_set(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (armor_set_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
create or replace function is_armor_set_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.armor_set
    where id = record_id
      and user_id = auth.uid()
  );
$$;
alter table armor_set enable row level security;
create policy "Allow insert for authenticated and custom" on armor_set for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on armor_set for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on armor_set for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on armor_set for
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
create policy "Allow delete for owner and custom" on armor_set for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on armor_set for
select to authenticated using (
    custom
    and exists (
      select 1
      from armor_set_shared_user su
      where su.armor_set_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): collaborators with whom this catalog
-- row was shared can currently UPDATE rules text. Custom catalog rules
-- text should only be editable by the author (owner).
-- Removed in Phase 2 — see [E2.2] (issue #149).
create policy "Allow update for shared and custom" on armor_set for
update to authenticated using (
    custom
    and exists (
      select 1
      from armor_set_shared_user su
      where su.armor_set_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from armor_set_shared_user su
      where su.armor_set_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on armor_set for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Armor Set Gear RLS
--------------------------------------------------------------------------------
alter table armor_set_gear enable row level security;
create policy "Allow insert for owner and custom" on armor_set_gear for
insert to authenticated with check (is_armor_set_owner(armor_set_id));
create policy "Allow select for authenticated and non-custom" on armor_set_gear for
select to authenticated using (
    exists (
      select 1
      from armor_set a
      where a.id = armor_set_id
        and not a.custom
    )
  );
create policy "Allow select for owner and custom" on armor_set_gear for
select to authenticated using (is_armor_set_owner(armor_set_id));
create policy "Allow select for shared and custom" on armor_set_gear for
select to authenticated using (
    exists (
      select 1
      from armor_set_shared_user su
      where su.armor_set_id = armor_set_gear.armor_set_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on armor_set_gear for delete to authenticated using (is_armor_set_owner(armor_set_id));
create policy "Allow all for admin" on armor_set_gear for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Armor Set Shared User RLS
--------------------------------------------------------------------------------
alter table armor_set_shared_user enable row level security;
create policy "Allow insert for authenticated" on armor_set_shared_user for
insert to authenticated with check (
    is_armor_set_owner(armor_set_id)
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on armor_set_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on armor_set_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on armor_set_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on armor_set_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on armor_set_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_armor_set_custom_user on armor_set(custom, user_id);
create index idx_armor_set_gear_armor_set on armor_set_gear(armor_set_id);
create index idx_armor_set_gear_gear on armor_set_gear(gear_id);
create index idx_armor_set_shared_user_armor_set on armor_set_shared_user(armor_set_id);
create index idx_armor_set_shared_user_user on armor_set_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on armor_set for each row execute function update_updated_at();