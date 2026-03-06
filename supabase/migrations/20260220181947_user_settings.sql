--------------------------------------------------------------------------------
-- User Settings Table
-- All settings stored at the user level, such as strain milestone unlocks,
-- vignettes, etc.
--------------------------------------------------------------------------------
create table user_settings (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  unlocked_killenium_butcher boolean not null default false,
  unlocked_screaming_nukalope boolean not null default false,
  unlocked_white_gigalion boolean not null default false,
  user_id uuid not null unique references auth.users(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table user_settings enable row level security;
create policy "Allow insert for authenticated" on user_settings for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on user_settings for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on user_settings for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on user_settings for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow all for admin" on user_settings for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_user_settings_user_id on user_settings(user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on user_settings for each row execute function update_updated_at();