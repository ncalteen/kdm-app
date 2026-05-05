import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { SettlementRole, UserSettingsDetail } from '@/lib/types'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cached User-ID Promise
 *
 * `supabase.auth.getUser()` hits `/auth/v1/user` to server-validate the JWT.
 * Page loads can trigger 5-10 DAL calls — caching the in-flight promise
 * collapses them into a single round trip per session.
 *
 * The cache is keyed by the Supabase client instance so that test harnesses
 * which re-mock `createClient` per file get a fresh cache automatically. The
 * cache is invalidated on any auth-state change so sign-in / sign-out /
 * token-refresh events immediately take effect.
 */
const userIdCache = new WeakMap<SupabaseClient, Promise<string>>()
const listenerAttached = new WeakSet<SupabaseClient>()

/**
 * Active client instances the cache knows about. Tracked as a plain array
 * so `invalidateUserIdCache` can wipe every entry without needing a handle
 * to the client (important for sign-out and test harnesses). The WeakMap
 * provides GC safety; this array just mirrors the keys for iteration.
 */
let trackedClients: SupabaseClient[] = []

/**
 * Register Auth State Listener
 *
 * Clears the cached promise whenever the session changes. Called lazily on
 * the first `getUserId()` invocation per client.
 *
 * @param supabase Supabase Client Instance
 */
function ensureAuthListener(supabase: SupabaseClient): void {
  if (listenerAttached.has(supabase)) return
  listenerAttached.add(supabase)

  // Guarded: some test harnesses mock `auth` without `onAuthStateChange`.
  if (typeof supabase.auth?.onAuthStateChange !== 'function') return
  supabase.auth.onAuthStateChange(() => {
    userIdCache.delete(supabase)
  })
}

/**
 * Fetch Authenticated User ID (uncached)
 *
 * Exported `getUserId` wraps this with memoization. Separated so the
 * side-effectful network call stays in one place.
 *
 * @param supabase Supabase Client
 * @param allowAnonymous When true, returns null instead of throwing if the
 *   caller is unauthenticated. Network/auth errors still throw.
 * @returns User ID, or null if `allowAnonymous` and unauthenticated.
 */
async function fetchUserId(
  supabase: SupabaseClient,
  allowAnonymous: boolean
): Promise<string | null> {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    // Clear any stale session so subsequent calls don't keep failing.
    // Guarded in case a test harness mocks `auth` without `signOut`.
    if (typeof supabase.auth?.signOut === 'function')
      await supabase.auth.signOut()
    throw new Error(`Error Fetching User: ${error.message}`)
  }
  if (!user) {
    if (allowAnonymous) return null
    throw new Error('Not Authenticated')
  }

  return user.id
}

/**
 * Get Authenticated User ID
 *
 * Fetches (and memoizes) the user ID of the currently authenticated user.
 * Centralizes the auth check so callers don't each need to query
 * `supabase.auth.getUser()`. If the session references a user that no longer
 * exists (e.g. after a DB reset), the stale session is cleared automatically.
 *
 * @returns User ID
 * @throws If not authenticated or if fetching fails
 */
export async function getUserId(): Promise<string> {
  const supabase = createClient()
  ensureAuthListener(supabase)

  // Skip module-level caching under Vitest so unit tests that re-mock
  // `auth.getUser` per case observe fresh results without needing manual
  // invalidation in every spec file.
  if (process.env.VITEST) return fetchUserId(supabase, false) as Promise<string>

  let promise = userIdCache.get(supabase)
  if (!promise) {
    promise = (fetchUserId(supabase, false) as Promise<string>).catch((err) => {
      // Clear the cache on failure so the next call retries.
      userIdCache.delete(supabase)
      throw err
    })
    userIdCache.set(supabase, promise)
    if (!trackedClients.includes(supabase)) trackedClients.push(supabase)
  }

  return promise
}

/**
 * Get Authenticated User ID or Null
 *
 * Non-throwing variant for code paths that tolerate anonymous access (e.g.
 * inserting a non-custom catalog row). Returns null when no session is
 * present, but still propagates network/auth errors so callers can surface
 * them. Bypasses the module cache to preserve the semantics of "check
 * fresh".
 *
 * @returns User ID or null if not authenticated
 */
export async function getUserIdOrNull(): Promise<string | null> {
  const supabase = createClient()
  return fetchUserId(supabase, true)
}

/**
 * Invalidate Cached User ID
 *
 * Exposed for tests and explicit sign-out flows that need to guarantee the
 * next `getUserId()` call re-hits the network.
 */
export function invalidateUserIdCache(): void {
  for (const client of trackedClients) userIdCache.delete(client)
  trackedClients = []
}

/**
 * Get User Settings
 *
 * Fetches the user settings for the currently authenticated user from the
 * `user_settings` table. This includes information about which vignettes
 * the user has unlocked.
 *
 * @returns User Settings (or null if none exist yet)
 */
export async function getUserSettings(): Promise<UserSettingsDetail | null> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_settings')
    .select(
      'id, unlocked_killenium_butcher, unlocked_screaming_nukalope, unlocked_white_gigalion, user_id, username'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching User Settings: ${error.message}`)

  return data
}

/**
 * Get Settlements for the Authenticated User
 *
 * Includes settlements owned by the user and settlements shared with the user
 * via the `settlement_shared_user` table. Returns minimal data for the
 * settlement switcher sidebar. Each row is tagged with the caller's `role` so
 * downstream UI can gate owner-only affordances. For collaborator rows, the
 * owner's `username` is resolved via the `get_shared_settlement_owners` RPC
 * (RLS on `user_settings` blocks direct cross-user reads).
 *
 * @returns List of Settlement(s)
 */
export async function getSettlementForUser(): Promise<
  {
    campaign_type: DatabaseCampaignType
    id: string
    settlement_name: string
    role: SettlementRole
    owner_username: string | null
  }[]
> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch owned settlements, shared settlements, and the owner usernames for
  // shared settlements in parallel. The RPC is used for owner usernames
  // because RLS on `user_settings` restricts SELECT to the owning user.
  const [ownedResult, sharedResult, ownersResult] = await Promise.all([
    supabase
      .from('settlement')
      .select('campaign_type, id, settlement_name')
      .eq('user_id', userId),
    supabase
      .from('settlement_shared_user')
      .select('settlement(campaign_type, id, settlement_name)')
      .eq('shared_user_id', userId),
    supabase.rpc('get_shared_settlement_owners')
  ])

  if (ownedResult.error)
    throw new Error(
      `Error Fetching Owned Settlements: ${ownedResult.error.message}`
    )
  if (sharedResult.error)
    throw new Error(
      `Error Fetching Shared Settlements: ${sharedResult.error.message}`
    )
  if (ownersResult.error)
    throw new Error(
      `Error Fetching Settlement Owner Usernames: ${ownersResult.error.message}`
    )

  const ownerUsernames = new Map<string, string>(
    (
      (ownersResult.data ?? []) as {
        settlement_id: string
        username: string
      }[]
    ).map((row) => [row.settlement_id, row.username])
  )

  const results: {
    campaign_type: DatabaseCampaignType
    id: string
    settlement_name: string
    role: SettlementRole
    owner_username: string | null
  }[] = []

  for (const s of ownedResult.data ?? [])
    results.push({ ...s, role: 'owner', owner_username: null })

  for (const row of sharedResult.data ?? []) {
    const s = Array.isArray(row.settlement) ? row.settlement[0] : row.settlement

    if (s)
      results.push({
        ...s,
        role: 'collaborator',
        owner_username: ownerUsernames.get(s.id) ?? null
      })
  }

  return results
}

/**
 * Add User Settings
 *
 * Adds a new user settings record to the database.
 *
 * @param userSettings User Settings Data
 * @returns Inserted User Settings
 */
export async function addUserSettings(
  userSettings: Omit<
    TablesInsert<'user_settings'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<UserSettingsDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_settings')
    .insert(userSettings)
    .select(
      'id, unlocked_killenium_butcher, unlocked_screaming_nukalope, unlocked_white_gigalion, user_id, username'
    )
    .single()

  if (error) throw new Error(`Error Adding User Settings: ${error.message}`)
  if (!data) throw new Error('Error Adding User Settings: No Data Returned')

  return data
}

/**
 * Update User Settings
 *
 * Updates an existing user settings record in the database.
 *
 * @param id User Settings ID
 * @param userSettings User Settings Data
 */
export async function updateUserSettings(
  id: string,
  userSettings: Omit<
    TablesUpdate<'user_settings'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_settings')
    .update(userSettings)
    .eq('id', id)

  if (error) throw new Error(`Error Updating User Settings: ${error.message}`)
}

/**
 * Remove User Settings
 *
 * Deletes a user settings record from the database. Scoped by the
 * authenticated user's ID to provide defense-in-depth alongside RLS: even if
 * a policy regression exposed the row, the WHERE clause here would still
 * block a cross-user delete.
 *
 * @param id User Settings ID
 */
export async function removeUserSettings(id: string): Promise<void> {
  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('user_settings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Removing User Settings: ${error.message}`)
}
