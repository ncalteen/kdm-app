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
  -- Settings
  unlocked_killenium_butcher boolean not null default false,
  unlocked_screaming_nukalope boolean not null default false,
  unlocked_white_gigalion boolean not null default false,
  user_id uuid not null unique references auth.users(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table user_settings enable row level security;
create policy "Users can only access their own settings" on user_settings for all using (auth.uid() = user_id);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_user_settings_user_id on user_settings(user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on user_settings for each row execute function update_updated_at();