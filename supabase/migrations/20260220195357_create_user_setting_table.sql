-- User/Global Setting
create table user_setting (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Settings
  unlocked_killenium_butcher boolean not null default false,
  unlocked_screaming_nukalope boolean not null default false,
  unlocked_white_gigalion boolean not null default false,
  user_id uuid not null references auth.users (id) on delete cascade
);
alter table user_setting enable row level security;
create policy "Users can only access their own settings" on user_setting for all using (auth.uid () = user_id);