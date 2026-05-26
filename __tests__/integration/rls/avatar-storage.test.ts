import {
  admin,
  createAnonClient,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { buildAvatarObjectPath } from '@/lib/avatar-upload'
import {
  AVATAR_BUCKET,
  MAX_AVATAR_FILE_SIZE_BYTES,
  SUPPORTED_AVATAR_MIME_TYPES
} from '@/lib/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
])

/**
 * Avatar Upload Body
 *
 * @returns Small PNG Upload Body
 */
function avatarBody(): Blob {
  return new Blob([PNG_BYTES], { type: 'image/png' })
}

/**
 * Expect Storage Permission Denied
 *
 * Supabase Storage returns slightly different status/message combinations for
 * object RLS failures across operations, so assert the security signal without
 * pinning to brittle prose.
 *
 * @param error Storage Error
 */
function expectStorageDenied(error: unknown): void {
  expect(error).not.toBeNull()
  expect(
    String((error as { statusCode?: string | number }).statusCode)
  ).toMatch(/^4/)
}

/**
 * Upload Avatar
 *
 * @param client Supabase Client
 * @param path Storage Object Path
 * @param upsert Whether To Upsert
 * @returns Upload Error
 */
async function uploadAvatar(
  client: SupabaseClient,
  path: string,
  upsert = false
): Promise<unknown> {
  const { error } = await client.storage
    .from(AVATAR_BUCKET)
    .upload(path, avatarBody(), {
      contentType: 'image/png',
      upsert
    })

  return error
}

/**
 * RLS — Avatar Storage Bucket
 *
 * The avatars bucket is public for read/display, but all mutating access must
 * require an authenticated user and must be scoped to that user's own object.
 */
describe('RLS: avatar storage bucket', () => {
  let owner: TestUser
  let attacker: TestUser
  let anon: SupabaseClient
  let ownerPath: string
  let attackerPath: string
  let extraOwnerPath: string

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
    anon = createAnonClient()
    ownerPath = buildAvatarObjectPath(owner.id)
    attackerPath = buildAvatarObjectPath(attacker.id)
    extraOwnerPath = `${owner.id}/mask`
  })

  beforeEach(async () => {
    await admin.storage
      .from(AVATAR_BUCKET)
      .remove([ownerPath, attackerPath, extraOwnerPath])
  })

  afterAll(async () => {
    await admin.storage
      .from(AVATAR_BUCKET)
      .remove([ownerPath, attackerPath, extraOwnerPath])
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  it('configures the bucket as public read with avatar upload limits', async () => {
    const { data, error } = await admin.storage.getBucket(AVATAR_BUCKET)

    expect(error).toBeNull()
    expect(data?.public).toBe(true)
    expect((data as { file_size_limit?: number })?.file_size_limit).toBe(
      MAX_AVATAR_FILE_SIZE_BYTES
    )
    expect(
      (data as { allowed_mime_types?: string[] })?.allowed_mime_types
    ).toEqual(SUPPORTED_AVATAR_MIME_TYPES)
  })

  it('rejects unauthenticated uploads', async () => {
    const error = await uploadAvatar(anon, ownerPath)

    expectStorageDenied(error)
  })

  it('allows authenticated users to upload and upsert only their own avatar object', async () => {
    await admin.storage.from(AVATAR_BUCKET).remove([ownerPath])

    expect(await uploadAvatar(owner.client, ownerPath)).toBeNull()
    expect(await uploadAvatar(owner.client, ownerPath, true)).toBeNull()

    const crossUserError = await uploadAvatar(owner.client, attackerPath)
    const extraObjectError = await uploadAvatar(owner.client, extraOwnerPath)

    expectStorageDenied(crossUserError)
    expectStorageDenied(extraObjectError)
  })

  it('allows public read of uploaded avatars without allowing public listing', async () => {
    await uploadAvatar(owner.client, ownerPath, true)

    const { data: publicUrlData } = admin.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(ownerPath)
    const response = await fetch(publicUrlData.publicUrl)
    expect(response.status).toBe(200)

    const { data: anonList, error: anonListError } = await anon.storage
      .from(AVATAR_BUCKET)
      .list(owner.id)
    expect(anonList ?? []).toEqual([])
    expect(anonListError).toBeNull()
  })

  it('prevents authenticated users from reading, replacing, or deleting another user avatar object', async () => {
    await uploadAvatar(owner.client, ownerPath, true)

    const { data: listedObjects, error: listError } =
      await attacker.client.storage.from(AVATAR_BUCKET).list(owner.id)
    expect(listError).toBeNull()
    expect(listedObjects ?? []).toEqual([])

    const replaceError = await uploadAvatar(attacker.client, ownerPath, true)
    expectStorageDenied(replaceError)

    const { data: removedObjects, error: removeError } =
      await attacker.client.storage.from(AVATAR_BUCKET).remove([ownerPath])
    expect(removedObjects ?? []).toEqual([])
    expect(removeError).toBeNull()

    const { data: ownerObjects, error: ownerListError } =
      await owner.client.storage.from(AVATAR_BUCKET).list(owner.id)
    expect(ownerListError).toBeNull()
    expect(ownerObjects?.some((object) => object.name === 'avatar')).toBe(true)
  })

  it('allows authenticated users to delete their own avatar object', async () => {
    await uploadAvatar(owner.client, ownerPath, true)

    const { data, error } = await owner.client.storage
      .from(AVATAR_BUCKET)
      .remove([ownerPath])

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.name).toBe(ownerPath)
  })
})
