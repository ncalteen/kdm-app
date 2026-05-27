import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterSurvivorDetail } from '@/lib/types'

/**
 * Get Encounter Survivors
 *
 * Retrieves all survivors assigned to an active encounter.
 *
 * @param encounterId Encounter ID
 * @returns Encounter Survivors
 */
export async function getEncounterSurvivors(
  encounterId: string | null | undefined
): Promise<{ [key: string]: EncounterSurvivorDetail } | null> {
  if (!encounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_survivor')
    .select(
      'id, accuracy_tokens, activation_used, bleeding_tokens, block_tokens, deflect_tokens, encounter_id, evasion_tokens, insanity_tokens, knocked_down, luck_tokens, movement_tokens, movement_used, notes, scout, settlement_id, speed_tokens, strength_tokens, survival_tokens, survivor_id'
    )
    .eq('encounter_id', encounterId)

  if (error)
    throw new Error(`Error Fetching Encounter Survivors: ${error.message}`)
  if (!data) return null

  const encounterSurvivorMap: { [key: string]: EncounterSurvivorDetail } = {}

  for (const survivor of data ?? [])
    encounterSurvivorMap[survivor.id] = survivor

  return encounterSurvivorMap
}

/**
 * Add Encounter Survivor
 *
 * Adds a survivor to an active encounter.
 *
 * @param encounterSurvivor Encounter Survivor Data
 * @returns Inserted Encounter Survivor ID
 */
export async function addEncounterSurvivor(
  encounterSurvivor: Omit<
    TablesInsert<'encounter_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_survivor')
    .insert(encounterSurvivor)
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Encounter Survivor: ${error.message}`)

  return data.id
}

/**
 * Update Encounter Survivor
 *
 * Updates an encounter survivor's data.
 *
 * @param survivorId Encounter Survivor Row ID
 * @param updateData Data to Update
 */
export async function updateEncounterSurvivor(
  survivorId: string,
  updateData: Partial<EncounterSurvivorDetail>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_survivor')
    .update(updateData)
    .eq('id', survivorId)

  if (error)
    throw new Error(`Error Updating Encounter Survivor: ${error.message}`)
}

/**
 * Remove Encounter Survivor
 *
 * Deletes an encounter survivor row.
 *
 * @param id Encounter Survivor Row ID
 */
export async function removeEncounterSurvivor(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_survivor')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Encounter Survivor: ${error.message}`)
}
