import { SquiresOfTheCitadelSurvivors } from '@/lib/campaigns/squires'
import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Add Squires of the Citadel Survivors
 *
 * Squires of the Citadel campaigns require specific survivors to be added to
 * the settlement.
 *
 * @param settlementId Settlement ID
 */
export async function addSquiresOfTheCitadelSurvivors(
  settlementId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('survivor').insert(
    SquiresOfTheCitadelSurvivors.map((squire) => ({
      gender: squire.gender,
      settlement_id: settlementId,
      survivor_name: squire.name
    }))
  )

  if (error)
    throw new Error(`Error Adding Squires to Settlement: ${error.message}`)
}

/**
 * Get Survivors for Settlement
 *
 * @param settlementId Settlement ID
 * @returns List of Survivors
 */
export async function getSurvivors(
  settlementId: string
): Promise<Tables<'survivor'>[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })

  if (error) throw new Error(`Error Fetching Survivors: ${error.message}`)
  return data
}

/**
 * Update Survivor
 *
 * @param survivorId Survivor ID
 * @param updates Survivor Updates
 */
export async function updateSurvivor(
  survivorId: string,
  updates: Partial<Tables<'survivor'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor')
    .update(updates)
    .eq('id', survivorId)

  if (error) throw new Error(`Error Updating Survivor: ${error.message}`)
}
