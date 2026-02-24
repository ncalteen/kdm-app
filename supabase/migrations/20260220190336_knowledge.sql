--------------------------------------------------------------------------------
-- Knowledge Table
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
  knowledge_name varchar not null
);
--------------------------------------------------------------------------------
-- Junction Table: Knowledge Shared Users
--------------------------------------------------------------------------------
create table knowledge_shared_user (
  knowledge_id uuid not null references knowledge(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (knowledge_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table knowledge enable row level security;
create policy "Allow authenticated read for non-custom" on knowledge for
select using (
    auth.role() = 'authenticated'
    and not custom
  );
create policy "Allow all for owner/shared of custom" on knowledge for all using (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from knowledge_shared_user su
      where su.knowledge_id = id
        and su.shared_user_id = auth.uid()
    )
  )
) with check (
  custom
  and (
    auth.uid() = user_id
    or exists (
      select 1
      from knowledge_shared_user su
      where su.knowledge_id = id
        and su.shared_user_id = auth.uid()
    )
  )
);
alter table knowledge_shared_user enable row level security;
create policy "Allow all for owner" on knowledge_shared_user for all using (
  auth.uid() = (
    select user_id
    from knowledge
    where id = knowledge_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_knowledge_shared_user_knowledge on knowledge_shared_user(knowledge_id);
create index idx_knowledge_shared_user_user on knowledge_shared_user(shared_user_id);