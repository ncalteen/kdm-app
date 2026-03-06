import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlements for the Authenticated User
 *
 * This will include settlements owned by the user, or settlements that have
 * been shared with the user via the settlement_shared_user table.
 *
 * @returns List of Settlements (or empty array)
 */
export async function getSettlements(): Promise<
  (Tables<'settlement'> & { shared: boolean })[]
> {
  const supabase = createClient()

  // Get the authenticated user's ID
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not Authenticated')

  // Get settlements owned by the user.
  const { data: owned, error: ownedError } = await supabase
    .from('settlement')
    .select('*')
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

  const results: (Tables<'settlement'> & { shared: boolean })[] = []

  for (const s of owned ?? [])
    results.push({
      ...s,
      shared: false
    })

  for (const row of shared ?? []) {
    // The join returns an array type, but each shared_user row references
    // exactly one settlement. Access the first (and only) element.
    const s = Array.isArray(row.settlement) ? row.settlement[0] : row.settlement

    if (s) {
      results.push({
        ...s,
        shared: true
      })
    }
  }

  return results
}

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

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw new Error(`Error Fetching User Settings: ${error.message}`)

  return data
}
