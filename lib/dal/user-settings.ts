import { getUserId } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { UserSettingsDetail } from '@/lib/types'

export const USER_SETTINGS_SELECT = `
  app_role,
  avatar_url,
  id,
  unlocked_killenium_butcher,
  unlocked_screaming_nukalope,
  unlocked_white_gigalion,
  user_id,
  username,
  username_renamed_at
`

/**
 * Get User Settings
 *
 * Fetches the user settings for the currently authenticated user from the
 * `user_settings` table. This includes information about which vignettes
 * the user has unlocked.
 *
 * @returns User Settings, or null if none exist yet
 */
export async function getUserSettings(): Promise<UserSettingsDetail | null> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_settings')
    .select(USER_SETTINGS_SELECT)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching User Settings: ${error.message}`)

  return data
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
    'app_role' | 'id' | 'created_at' | 'updated_at'
  >
): Promise<UserSettingsDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_settings')
    .insert(userSettings)
    .select(USER_SETTINGS_SELECT)
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
    'app_role' | 'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'user_settings'> = { ...userSettings }

  delete updateData.app_role
  delete updateData.id

  const { error } = await supabase
    .from('user_settings')
    .update(updateData)
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
