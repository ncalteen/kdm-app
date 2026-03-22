import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { UserSettingsDetail } from '@/lib/types'

/**
 * Get User Settings
 *
 * Fetches the user settings for the currently authenticated user from the
 * `user_settings` table in Supabase. This includes information about which
 * vignettes the user has unlocked.
 *
 * @returns User Settings (or null if none exist yet)
 */
export async function getUserSettings(): Promise<UserSettingsDetail | null> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching User Settings: ${error.message}`)

  return data
}

/**
 * Get Settlements for the Authenticated User
 *
 * This will include settlements owned by the user, or settlements that have
 * been shared with the user via the settlement_shared_user table. This is used
 * to populate the settlement switcher in the sidebar, so it includes minimal
 * data.
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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Get settlements owned by the user.
  const { data: owned, error: ownedError } = await supabase
    .from('settlement')
    .select('campaign_type, id, settlement_name')
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Settlements: ${ownedError.message}`)

  // Get settlements shared with the user via the junction table.
  const { data: shared, error: sharedError } = await supabase
    .from('settlement_shared_user')
    .select('settlement(*)')
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Settlements: ${sharedError.message}`)

  const results: {
    campaign_type: DatabaseCampaignType
    id: string
    settlement_name: string
    shared: boolean
  }[] = []

  for (const s of owned ?? [])
    results.push({
      ...s,
      shared: false
    })

  for (const row of shared ?? []) {
    // The join returns an array type, but each shared_user row references
    // exactly one settlement. Access the first (and only) element.
    const s = Array.isArray(row.settlement) ? row.settlement[0] : row.settlement

    if (s)
      results.push({
        ...s,
        shared: true
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
 * @returns Inserted User Settings ID
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

/**
 * Get User ID
 *
 * Fetches the user ID of the currently authenticated user.
 *
 * @returns User ID (or null)
 */
export async function getUserId(): Promise<string> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  return user.id
}
