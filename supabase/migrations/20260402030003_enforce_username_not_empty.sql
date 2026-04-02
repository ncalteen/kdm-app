--------------------------------------------------------------------------------
-- Enforce Non-Empty Username
--
-- Adds a CHECK constraint to prevent null or empty-string usernames now that
-- sign-up always requires a username. Also removes the default '' so inserts
-- without a username will fail explicitly.
--------------------------------------------------------------------------------
alter table user_settings
alter column username drop default;
alter table user_settings
add constraint chk_username_not_empty check (username <> '');
-- The partial unique index (WHERE username <> '') is no longer needed since
-- empty usernames are now impossible. Replace it with a full unique constraint.
drop index if exists idx_user_settings_username;
alter table user_settings
add constraint user_settings_username_unique unique (username);