import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Gear
 *
 * Retrieves all gear available to the authenticated user:
 * - Built-in (non-custom) gear
 * - Custom gear owned by the user
 * - Custom gear shared with the user
 *
 * @returns Gear
 */
export async function getGear(): Promise<
  Omit<Tables<'gear'>, 'created_at' | 'updated_at' | 'custom' | 'user_id'>[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, gear_name, location_id'

  // Built-in gear
  const { data: builtIn, error: builtInError } = await supabase
    .from('gear')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(`Error Fetching Built-in Gear: ${builtInError.message}`)

  // Custom gear owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('gear')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Gear: ${ownedError.message}`)

  // Custom gear shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('gear_shared_user')
    .select(`gear(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Gear: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.gear) ? row.gear : row.gear ? [row.gear] : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
