import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Ensure Gear Can Be Updated
 *
 * Ensures the current user can mutate crafting costs for the target gear row.
 * Gear cost rows are part of an authored catalog definition, so the parent
 * gear must be an active custom row owned by the current user.
 *
 * @param gearId Gear ID
 */
export async function ensureGearCanBeUpdated(gearId: string): Promise<void> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear')
    .select('id')
    .eq('id', gearId)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)
    .maybeSingle()

  if (error)
    throw new Error(`Error Checking Gear Update Permission: ${error.message}`)
  if (!data) throw new Error('Not Authorized to Update Gear')
}
