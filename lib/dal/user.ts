import { createClient } from '@/lib/supabase/client'

/**
 * Get User Data
 *
 * Retrieves the current authenticated user's data from Supabase Auth. This is
 * used in various parts of the application to display user information and
 * manage user-specific settings.
 *
 * @returns User Data (or null)
 */
export async function getUser() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  return user
}

/**
 * Get User Settings
 *
 * Fetches the user settings for the currently authenticated user from the
 * `user_settings` table in Supabase. This includes information about which
 * vignettes the user has unlocked.
 *
 * @returns User Settings (or null)
 */
export async function getUserSettings() {
  const supabase = createClient()

  const user = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw new Error(`Error Fetching User Settings: ${error.message}`)

  return data
}
