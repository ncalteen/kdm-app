import { createClient } from '@/lib/supabase/client'
import { WeaponTypeDetail } from '@/lib/types'

/**
 * Get Weapon Types
 *
 * Retrieves all weapon types available to the authenticated user:
 *
 * - Built-in (non-custom) weapon types
 * - Custom weapon types owned by the user
 * - Custom weapon types shared with the user
 *
 * @returns Weapon Types
 */
export async function getWeaponTypes(): Promise<{
  [key: string]: WeaponTypeDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('weapon_type')
      .select('id, weapon_type_name')
      .eq('custom', false),
    supabase
      .from('weapon_type')
      .select('id, weapon_type_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('weapon_type_shared_user')
      .select('weapon_type(id, weapon_type_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Weapon Types: ${result.error.message}`)

  const weaponTypeMap: { [key: string]: WeaponTypeDetail } = {}

  for (const w of nonCustomResult.data ?? []) weaponTypeMap[w.id] = w
  for (const w of userCustomResult.data ?? []) weaponTypeMap[w.id] = w
  for (const row of sharedResult.data ?? [])
    weaponTypeMap[row.weapon_type[0].id] = row.weapon_type[0]

  return weaponTypeMap
}
