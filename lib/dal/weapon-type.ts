import { createClient } from '@/lib/supabase/client'
import { Tables } from '../database.types'

/**
 * Get Weapon Types
 *
 * Retrieves all weapon types available to the authenticated user:
 * - Built-in (non-custom) weapon types
 * - Custom weapon types owned by the user
 * - Custom weapon types shared with the user
 *
 * @returns Weapon Types
 */
export async function getWeaponTypes(): Promise<
  Omit<
    Tables<'weapon_type'>,
    'created_at' | 'updated_at' | 'custom' | 'user_id'
  >[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Built-in weapon types
  const { data: builtIn, error: builtInError } = await supabase
    .from('weapon_type')
    .select('id, weapon_type_name')
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Weapon Types: ${builtInError.message}`
    )

  // Custom weapon types owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('weapon_type')
    .select('id, weapon_type_name')
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Weapon Types: ${ownedError.message}`)

  // Custom weapon types shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('weapon_type_shared_user')
    .select('weapon_type(id, weapon_type_name)')
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(
      `Error Fetching Shared Weapon Types: ${sharedError.message}`
    )

  const sharedTypes = (shared ?? []).flatMap((row) => {
    const wt = Array.isArray(row.weapon_type)
      ? row.weapon_type
      : row.weapon_type
        ? [row.weapon_type]
        : []
    return wt
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedTypes]
}
