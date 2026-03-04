--------------------------------------------------------------------------------
-- Knowledge Table
-- Built-in and custom knowledges.
--------------------------------------------------------------------------------
create table knowledge (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Data
  knowledge_name varchar not null,
  philosophy_id uuid references philosophy(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table knowledge_shared_user (
  knowledge_id uuid not null references knowledge(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (knowledge_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table knowledge enable row level security;
create policy "Allow insert for authenticated and custom" on knowledge for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on knowledge for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on knowledge for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on knowledge for
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
create policy "Allow delete for owner and custom" on knowledge for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on knowledge for
select to authenticated using (
    custom
    and exists (
      select 1
      from knowledge_shared_user su
      where su.knowledge_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on knowledge for
update to authenticated using (
    custom
    and exists (
      select 1
      from knowledge_shared_user su
      where su.knowledge_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from knowledge_shared_user su
      where su.knowledge_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "All all for admin" on knowledge for all using (is_admin()) with check (is_admin());
alter table knowledge_shared_user enable row level security;
create policy "Allow insert for authenticated" on knowledge_shared_user for
insert to authenticated with check (
    exists (
      select 1
      from knowledge k
      where k.id = knowledge_id
        and user_id = (
          select auth.uid()
        )
    )
    and owner_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on knowledge_shared_user for
select to authenticated using (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on knowledge_shared_user for
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  ) with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on knowledge_shared_user for delete to authenticated using (
  owner_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on knowledge_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on knowledge_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_knowledge_shared_user_knowledge on knowledge_shared_user(knowledge_id);
create index idx_knowledge_shared_user_user on knowledge_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on knowledge for each row execute function update_updated_at();