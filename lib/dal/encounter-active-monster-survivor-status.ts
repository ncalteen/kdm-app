import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterActiveMonsterSurvivorStatusDetail } from '@/lib/types'

const ENCOUNTER_ACTIVE_MONSTER_SURVIVOR_STATUS_SELECT = `
  id,
  encounter_active_monster_id,
  settlement_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Encounter Active Monster Survivor Statuss
 *
 * Retrieves all encounter active monster survivor status rows.
 *
 * @returns Encounter Active Monster Survivor Statuss
 */
export async function getEncounterActiveMonsterSurvivorStatuses(): Promise<
  EncounterActiveMonsterSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster_survivor_status')
    .select(ENCOUNTER_ACTIVE_MONSTER_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Encounter Active Monster Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as EncounterActiveMonsterSurvivorStatusDetail[]
}

/**
 * Get Encounter Active Monster Survivor Status
 *
 * Retrieves a single encounter active monster survivor status row by ID.
 *
 * @param id Encounter Active Monster Survivor Status ID
 * @returns Encounter Active Monster Survivor Status or null
 */
export async function getEncounterActiveMonsterSurvivorStatus(
  id: string | null | undefined
): Promise<EncounterActiveMonsterSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster_survivor_status')
    .select(ENCOUNTER_ACTIVE_MONSTER_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Encounter Active Monster Survivor Status: ${error.message}`
    )

  return data as EncounterActiveMonsterSurvivorStatusDetail | null
}

/**
 * Add Encounter Active Monster Survivor Status
 *
 * Adds a new encounter active monster survivor status record to the database.
 *
 * @param encounterActiveMonsterSurvivorStatus Encounter Active Monster Survivor Status Data
 * @returns Inserted Encounter Active Monster Survivor Status
 */
export async function addEncounterActiveMonsterSurvivorStatus(
  encounterActiveMonsterSurvivorStatus: Omit<
    TablesInsert<'encounter_active_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterActiveMonsterSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'encounter_active_monster_survivor_status'> = {
    ...encounterActiveMonsterSurvivorStatus
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('encounter_active_monster_survivor_status')
    .insert(insertData)
    .select(ENCOUNTER_ACTIVE_MONSTER_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Encounter Active Monster Survivor Status: ${error.message}`
    )

  return data as EncounterActiveMonsterSurvivorStatusDetail
}

/**
 * Update Encounter Active Monster Survivor Status
 *
 * Updates an existing encounter active monster survivor status record.
 *
 * @param id Encounter Active Monster Survivor Status ID
 * @param encounterActiveMonsterSurvivorStatus Encounter Active Monster Survivor Status Data
 */
export async function updateEncounterActiveMonsterSurvivorStatus(
  id: string,
  encounterActiveMonsterSurvivorStatus: Omit<
    TablesUpdate<'encounter_active_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_active_monster_survivor_status'> = {
    ...encounterActiveMonsterSurvivorStatus
  }

  delete updateData.id

  const { error } = await supabase
    .from('encounter_active_monster_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Encounter Active Monster Survivor Status: ${error.message}`
    )
}

/**
 * Remove Encounter Active Monster Survivor Status
 *
 * Deletes a encounter active monster survivor status record from the database.
 *
 * @param id Encounter Active Monster Survivor Status ID
 */
export async function removeEncounterActiveMonsterSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_active_monster_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Encounter Active Monster Survivor Status: ${error.message}`
    )
}
