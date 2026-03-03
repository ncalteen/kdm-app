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
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (knowledge_id, shared_user_id)
);
--------------------------------------------------------------------------------
-- Security Definer Function to Check Membership
--------------------------------------------------------------------------------
create or replace function is_knowledge_member(p_id uuid) returns boolean language sql stable security definer as $$
select exists (
    select 1
    from knowledge
    where id = p_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from knowledge_shared_user
    where knowledge_id = p_id
      and shared_user_id = auth.uid()
  );
$$;
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
  and is_knowledge_member(id)
) with check (
  custom
  and is_knowledge_member(id)
);
create policy "Allow admin to manage all" on knowledge for all using (is_admin()) with check (is_admin());
alter table knowledge_shared_user enable row level security;
create policy "Allow all for owner" on knowledge_shared_user for all using (is_knowledge_member(knowledge_id));
create policy "Allow admin to manage all" on knowledge_shared_user for all using (is_admin()) with check (is_admin());
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