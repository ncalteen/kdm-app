import { getEncounterActiveMonsters } from '@/lib/dal/encounter-active-monster'
import { getEncounterActiveSurvivors } from '@/lib/dal/encounter-active-survivor'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterDetail } from '@/lib/types'

const ENCOUNTER_SELECT = `
  id,
  hunt_id,
  monster_level,
  settlement_id,
  turn
`

/**
 * Get Encounter
 *
 * Gets the active encounter for a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Encounter Data
 */
export async function getEncounter(
  settlementId: string | null | undefined
): Promise<EncounterDetail | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter')
    .select(ENCOUNTER_SELECT)
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Encounter: ${error.message}`)
  if (!data) return null

  const [monsters, survivors] = await Promise.all([
    getEncounterActiveMonsters(data.id),
    getEncounterActiveSurvivors(data.id)
  ])

  return {
    ...data,
    monsters: monsters ?? {},
    survivors: survivors ?? {}
  }
}

/**
 * Add Encounter
 *
 * Adds an active encounter record to the database.
 *
 * @param encounter Encounter Data
 * @returns Inserted Encounter ID
 */
export async function addEncounter(
  encounter: Omit<TablesInsert<'encounter'>, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter')
    .insert(encounter)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Encounter: ${error.message}`)

  return data.id
}

/**
 * Update Encounter
 *
 * Updates an active encounter record.
 *
 * @param id Encounter ID
 * @param encounter Encounter Data
 */
export async function updateEncounter(
  id: string,
  encounter: Omit<TablesUpdate<'encounter'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter')
    .update(encounter)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Encounter: ${error.message}`)
}

/**
 * Remove Encounter
 *
 * Deletes an active encounter record.
 *
 * @param id Encounter ID
 */
export async function removeEncounter(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('encounter').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Encounter: ${error.message}`)
}
