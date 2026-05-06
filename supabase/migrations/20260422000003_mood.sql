--------------------------------------------------------------------------------
-- Monster Mood Table
-- Built-in and custom moods.
--------------------------------------------------------------------------------
create table mood (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  mood_name varchar not null,
  rules text
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table mood_shared_user (
  mood_id uuid not null references mood(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (mood_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
create or replace function is_mood_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.mood
    where id = record_id
      and user_id = auth.uid()
  );
$$;
alter table mood enable row level security;
create policy "Allow insert for authenticated and custom" on mood for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on mood for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on mood for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on mood for
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
create policy "Allow delete for owner and custom" on mood for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on mood for
select to authenticated using (
    custom
    and exists (
      select 1
      from mood_shared_user su
      where su.mood_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
-- CONTRADICTION (architecture §4 P1): collaborators with whom this catalog
-- row was shared can currently UPDATE rules text. Custom catalog rules
-- text should only be editable by the author (owner).
-- Removed in Phase 2 — see [E2.2] (issue #149).
create policy "Allow update for shared and custom" on mood for
update to authenticated using (
    custom
    and exists (
      select 1
      from mood_shared_user su
      where su.mood_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from mood_shared_user su
      where su.mood_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on mood for all using (is_admin()) with check (is_admin());
alter table mood_shared_user enable row level security;
create policy "Allow insert for authenticated" on mood_shared_user for
insert to authenticated with check (
    is_mood_owner(mood_id)
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on mood_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on mood_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on mood_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on mood_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on mood_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_mood_custom_user on mood(custom, user_id);
create index idx_mood_shared_user_mood on mood_shared_user(mood_id);
create index idx_mood_shared_user_user on mood_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on mood for each row execute function update_updated_at();