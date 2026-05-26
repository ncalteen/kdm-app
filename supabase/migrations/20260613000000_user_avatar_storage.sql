--------------------------------------------------------------------------------
-- User Avatar Storage Bucket + RLS Policies
--
-- Adds a dedicated public `avatars` bucket for user profile avatars selected in
-- Settings (either uploaded image files or provider-backed URLs persisted in
-- `user_settings.avatar_url`).
--
-- Security model:
--   - Public read: avatars are displayed to other settlement collaborators.
--   - Authenticated write restricted to each user's own folder prefix:
--       `<auth.uid()>/avatar`
--   - Authenticated write restricted to storage objects owned by the user.
--   - Upsert support requires INSERT + SELECT + UPDATE on storage.objects.
--------------------------------------------------------------------------------
insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
values (
    'avatars',
    'avatars',
    true,
    2097152,
    array ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  ) on conflict (id) do
update
set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
--------------------------------------------------------------------------------
-- RLS policies for the `avatars` bucket.
--------------------------------------------------------------------------------
drop policy if exists "Avatar upload insert own" on storage.objects;
drop policy if exists "Avatar upload select own" on storage.objects;
drop policy if exists "Avatar upload update own" on storage.objects;
drop policy if exists "Avatar upload delete own" on storage.objects;
create policy "Avatar upload insert own" on storage.objects for
insert to authenticated with check (
    bucket_id = 'avatars'
    and storage.filename(name) = 'avatar'
    and (storage.foldername(name)) [1] = (
      select auth.uid()
    )::text
    and owner_id = (
      select auth.uid()
    )::text
  );
create policy "Avatar upload select own" on storage.objects for
select to authenticated using (
    bucket_id = 'avatars'
    and storage.filename(name) = 'avatar'
    and (storage.foldername(name)) [1] = (
      select auth.uid()
    )::text
    and owner_id = (
      select auth.uid()
    )::text
  );
create policy "Avatar upload update own" on storage.objects for
update to authenticated using (
    bucket_id = 'avatars'
    and storage.filename(name) = 'avatar'
    and (storage.foldername(name)) [1] = (
      select auth.uid()
    )::text
    and owner_id = (
      select auth.uid()
    )::text
  ) with check (
    bucket_id = 'avatars'
    and storage.filename(name) = 'avatar'
    and (storage.foldername(name)) [1] = (
      select auth.uid()
    )::text
    and owner_id = (
      select auth.uid()
    )::text
  );
create policy "Avatar upload delete own" on storage.objects for delete to authenticated using (
  bucket_id = 'avatars'
  and storage.filename(name) = 'avatar'
  and (storage.foldername(name)) [1] = (
    select auth.uid()
  )::text
  and owner_id = (
    select auth.uid()
  )::text
);