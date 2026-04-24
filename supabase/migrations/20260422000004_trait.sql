--------------------------------------------------------------------------------
-- Monster Trait Table
-- Built-in and custom traits.
--------------------------------------------------------------------------------
create table trait (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  trait_name varchar not null,
  rules text
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table trait_shared_user (
  trait_id uuid not null references trait(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (trait_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
create or replace function is_trait_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.trait
    where id = record_id
      and user_id = auth.uid()
  );
$$;
alter table trait enable row level security;
create policy "Allow insert for authenticated and custom" on trait for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on trait for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on trait for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on trait for
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
create policy "Allow delete for owner and custom" on trait for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on trait for
select to authenticated using (
    custom
    and exists (
      select 1
      from trait_shared_user su
      where su.trait_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on trait for
update to authenticated using (
    custom
    and exists (
      select 1
      from trait_shared_user su
      where su.trait_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from trait_shared_user su
      where su.trait_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on trait for all using (is_admin()) with check (is_admin());
alter table trait_shared_user enable row level security;
create policy "Allow insert for authenticated" on trait_shared_user for
insert to authenticated with check (
    is_trait_owner(trait_id)
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on trait_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on trait_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on trait_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on trait_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on trait_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_trait_custom_user on trait(custom, user_id);
create index idx_trait_shared_user_trait on trait_shared_user(trait_id);
create index idx_trait_shared_user_user on trait_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on trait for each row execute function update_updated_at();