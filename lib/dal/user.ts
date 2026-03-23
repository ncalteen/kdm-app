import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { UserSettingsDetail } from '@/lib/types'

/**
 * Get Authenticated User ID
 *
 * Fetches the user ID of the currently authenticated user. Centralizes the
 * auth check so callers don't each need to query `supabase.auth.getUser()`.
 *
 * @returns User ID
 * @throws If not authenticated or if fetching fails
 */
export async function getUserId(): Promise<string> {
  const supabase = createClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) throw new Error(`Auth Error: ${error.message}`)
  if (!user) throw new Error('Not Authenticated')

  return user.id
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
      'id, unlocked_killenium_butcher, unlocked_screaming_nukalope, unlocked_white_gigalion, user_id'
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
 * settlement switcher sidebar.
 *
 * @returns List of Settlement(s)
 */
export async function getSettlementForUser(): Promise<
  {
    campaign_type: DatabaseCampaignType
    id: string
    settlement_name: string
    shared: boolean
  }[]
> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch owned and shared settlements in parallel.
  const [ownedResult, sharedResult] = await Promise.all([
    supabase
      .from('settlement')
      .select('campaign_type, id, settlement_name')
      .eq('user_id', userId),
    supabase
      .from('settlement_shared_user')
      .select('settlement(campaign_type, id, settlement_name)')
      .eq('shared_user_id', userId)
  ])

  if (ownedResult.error)
    throw new Error(
      `Error Fetching Owned Settlements: ${ownedResult.error.message}`
    )
  if (sharedResult.error)
    throw new Error(
      `Error Fetching Shared Settlements: ${sharedResult.error.message}`
    )

  const results: {
    campaign_type: DatabaseCampaignType
    id: string
    settlement_name: string
    shared: boolean
  }[] = []

  for (const s of ownedResult.data ?? []) results.push({ ...s, shared: false })

  for (const row of sharedResult.data ?? []) {
    const s = Array.isArray(row.settlement) ? row.settlement[0] : row.settlement

    if (s) results.push({ ...s, shared: true })
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
      'id, unlocked_killenium_butcher, unlocked_screaming_nukalope, unlocked_white_gigalion, user_id'
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
 * Deletes a user settings record from the database.
 *
 * @param id User Settings ID
 */
export async function removeUserSettings(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('user_settings').delete().eq('id', id)

  if (error) throw new Error(`Error Removing User Settings: ${error.message}`)
}
