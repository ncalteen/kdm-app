import { admin } from '@/__tests__/integration/helpers/supabase'
import { afterAll, describe, expect, it } from 'vitest'

/**
 * Trigger / Helper — `provision_user_settings_for_oauth` (avatar capture)
 *
 * Validates that the OAuth-provisioning helper called by the
 * `handle_new_oauth_user()` trigger captures `avatar_url` from
 * `raw_user_meta_data->>'avatar_url'` for OAuth sign-ups, leaves it null
 * when the provider does not supply one, and treats empty strings as null.
 *
 * The end-to-end trigger path cannot be exercised through
 * `admin.auth.admin.createUser` because GoTrue inserts the auth.users row
 * with `provider = 'email'` first and only patches `raw_app_meta_data`
 * afterwards — so the trigger always sees provider='email' and
 * short-circuits. Instead we set the metadata via the admin API (which
 * GoTrue persists onto `auth.users.raw_user_meta_data`) and then call
 * the SECURITY DEFINER helper directly.
 */
describe('Helper: provision_user_settings_for_oauth (avatar_url)', () => {
  const createdUserIds: string[] = []

  afterAll(async () => {
    for (const id of createdUserIds) await admin.auth.admin.deleteUser(id)
  })

  /**
   * Create An OAuth-Style User Without A user_settings Row
   *
   * GoTrue's admin createUser fires the existing trigger as a no-op (it
   * sees provider='email' on insert), so the user_settings row is not
   * pre-created. Tests then call `provision_user_settings_for_oauth`
   * directly to simulate the OAuth path.
   *
   * @param userMetadata Discord/Google-shaped user_metadata payload
   * @returns Created Auth User ID
   */
  async function createPendingOauthUser(
    userMetadata: Record<string, unknown>
  ): Promise<string> {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const email = `oauth-${suffix}@test.local`

    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: userMetadata
    })
    if (error || !data.user)
      throw new Error(`createUser failed: ${error?.message}`)

    createdUserIds.push(data.user.id)
    return data.user.id
  }

  it('captures avatar_url from raw_user_meta_data on Discord-style sign-up', async () => {
    const url = 'https://cdn.discordapp.com/avatars/123/abc.png'
    const userId = await createPendingOauthUser({
      user_name: `oauth_user_${Date.now().toString(36)}`,
      avatar_url: url
    })

    const { error: rpcError } = await admin.rpc(
      'provision_user_settings_for_oauth',
      { p_user_id: userId }
    )
    expect(rpcError).toBeNull()

    const { data, error } = await admin
      .from('user_settings')
      .select('avatar_url, username')
      .eq('user_id', userId)
      .maybeSingle()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data?.avatar_url).toBe(url)
    expect(data?.username).toBeTruthy()
  })

  it('stores null avatar_url when the provider does not supply one', async () => {
    const userId = await createPendingOauthUser({
      user_name: `noavatar_${Date.now().toString(36)}`
    })

    const { error: rpcError } = await admin.rpc(
      'provision_user_settings_for_oauth',
      { p_user_id: userId }
    )
    expect(rpcError).toBeNull()

    const { data, error } = await admin
      .from('user_settings')
      .select('avatar_url')
      .eq('user_id', userId)
      .maybeSingle()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data?.avatar_url).toBeNull()
  })

  it('treats an empty-string avatar_url as null', async () => {
    const userId = await createPendingOauthUser({
      user_name: `emptyavatar_${Date.now().toString(36)}`,
      avatar_url: ''
    })

    const { error: rpcError } = await admin.rpc(
      'provision_user_settings_for_oauth',
      { p_user_id: userId }
    )
    expect(rpcError).toBeNull()

    const { data } = await admin
      .from('user_settings')
      .select('avatar_url')
      .eq('user_id', userId)
      .maybeSingle()

    expect(data).not.toBeNull()
    expect(data?.avatar_url).toBeNull()
  })

  it('is idempotent when a user_settings row already exists', async () => {
    const url = 'https://example.com/first.png'
    const userId = await createPendingOauthUser({
      user_name: `idempotent_${Date.now().toString(36)}`,
      avatar_url: url
    })

    // First call provisions the row.
    await admin.rpc('provision_user_settings_for_oauth', { p_user_id: userId })

    const { data: first } = await admin
      .from('user_settings')
      .select('avatar_url, username')
      .eq('user_id', userId)
      .maybeSingle()

    // Mutate raw_user_meta_data to a different avatar URL and re-run the
    // helper — the existing row must be left alone, otherwise we'd race
    // with user-driven changes.
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        user_name: `idempotent_${Date.now().toString(36)}`,
        avatar_url: 'https://example.com/second.png'
      }
    })
    await admin.rpc('provision_user_settings_for_oauth', { p_user_id: userId })

    const { data: second } = await admin
      .from('user_settings')
      .select('avatar_url, username')
      .eq('user_id', userId)
      .maybeSingle()

    expect(second?.avatar_url).toBe(first?.avatar_url)
    expect(second?.username).toBe(first?.username)
  })
})
