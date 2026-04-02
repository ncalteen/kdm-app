--------------------------------------------------------------------------------
-- Add Username to User Settings
--------------------------------------------------------------------------------
alter table user_settings
add column username varchar not null default '';
-- Enforce uniqueness on non-empty usernames (allows multiple empty defaults)
create unique index idx_user_settings_username on user_settings (username)
where username <> '';