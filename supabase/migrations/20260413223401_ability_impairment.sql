--------------------------------------------------------------------------------
-- Ability and Impairment Table
-- Built-in and custom abilities and impairments.
--------------------------------------------------------------------------------
create table ability_impairment (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  ability_impairment_name varchar not null,
  rules text
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table ability_impairment_shared_user (
  ability_impairment_id uuid not null references ability_impairment(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (ability_impairment_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
create or replace function is_ability_impairment_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.ability_impairment
    where id = record_id
      and user_id = auth.uid()
  );
$$;
alter table ability_impairment enable row level security;
create policy "Allow insert for authenticated and custom" on ability_impairment for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on ability_impairment for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on ability_impairment for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on ability_impairment for
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
create policy "Allow delete for owner and custom" on ability_impairment for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on ability_impairment for
select to authenticated using (
    custom
    and exists (
      select 1
      from ability_impairment_shared_user su
      where su.ability_impairment_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): collaborators with whom this catalog
-- row was shared can currently UPDATE rules text. Custom catalog rules
-- text should only be editable by the author (owner).
-- Removed in Phase 2 — see [E2.2] (issue #149).
create policy "Allow update for shared and custom" on ability_impairment for
update to authenticated using (
    custom
    and exists (
      select 1
      from ability_impairment_shared_user su
      where su.ability_impairment_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from ability_impairment_shared_user su
      where su.ability_impairment_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on ability_impairment for all using (is_admin()) with check (is_admin());
alter table ability_impairment_shared_user enable row level security;
create policy "Allow insert for authenticated" on ability_impairment_shared_user for
insert to authenticated with check (
    is_ability_impairment_owner(ability_impairment_id)
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on ability_impairment_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on ability_impairment_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on ability_impairment_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on ability_impairment_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on ability_impairment_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_ability_impairment_custom_user on ability_impairment(custom, user_id);
create index idx_ability_impairment_shared_user_ability_impairment on ability_impairment_shared_user(ability_impairment_id);
create index idx_ability_impairment_shared_user_user on ability_impairment_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on ability_impairment for each row execute function update_updated_at();