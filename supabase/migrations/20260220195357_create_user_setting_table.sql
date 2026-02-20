-- User/Global Setting
create table user_setting (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  unlocked_killenium_butcher boolean not null default false,
  unlocked_screaming_nukalope boolean not null default false,
  unlocked_white_gigalion boolean not null default false
);
alter table user_setting enable row level security;
create policy "Users can only access their own settings" on user_setting for all using (auth.uid () = user_id);