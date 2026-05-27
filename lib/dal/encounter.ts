import { getEncounterActiveMonsters } from '@/lib/dal/encounter-active-monster'
import { getEncounterSurvivors } from '@/lib/dal/encounter-survivor'
import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterDetail } from '@/lib/types'

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
    .select('id, hunt_id, monster_level, settlement_id, turn')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Encounter: ${error.message}`)
  if (!data) return null

  const memberProfilesPromise = getSettlementMemberUsernames(settlementId)

  const [encounterMonsters, encounterSurvivors] = await Promise.all([
    getEncounterActiveMonsters(data.id, memberProfilesPromise),
    getEncounterSurvivors(data.id)
  ])

  return {
    ...data,
    encounter_monsters: encounterMonsters,
    encounter_survivors: encounterSurvivors
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
