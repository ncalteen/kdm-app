import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterMonsterSurvivorStatusDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_MONSTER_SURVIVOR_STATUS_SELECT = `
  id,
  vignette_encounter_monster_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Vignette Encounter Monster Survivor Statuss
 *
 * Retrieves all vignette encounter monster survivor status rows.
 *
 * @returns Vignette Encounter Monster Survivor Statuss
 */
export async function getVignetteEncounterMonsterSurvivorStatuses(): Promise<
  VignetteEncounterMonsterSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .select(VIGNETTE_ENCOUNTER_MONSTER_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monster Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterMonsterSurvivorStatusDetail[]
}

/**
 * Get Vignette Encounter Monster Survivor Status
 *
 * Retrieves a single vignette encounter monster survivor status row by ID.
 *
 * @param id Vignette Encounter Monster Survivor Status ID
 * @returns Vignette Encounter Monster Survivor Status or null
 */
export async function getVignetteEncounterMonsterSurvivorStatus(
  id: string | null | undefined
): Promise<VignetteEncounterMonsterSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .select(VIGNETTE_ENCOUNTER_MONSTER_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monster Survivor Status: ${error.message}`
    )

  return data as VignetteEncounterMonsterSurvivorStatusDetail | null
}

/**
 * Add Vignette Encounter Monster Survivor Status
 *
 * Adds a new vignette encounter monster survivor status record to the database.
 *
 * @param vignetteEncounterMonsterSurvivorStatus Vignette Encounter Monster Survivor Status Data
 * @returns Inserted Vignette Encounter Monster Survivor Status
 */
export async function addVignetteEncounterMonsterSurvivorStatus(
  vignetteEncounterMonsterSurvivorStatus: Omit<
    TablesInsert<'vignette_encounter_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterMonsterSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_monster_survivor_status'> =
    { ...vignetteEncounterMonsterSurvivorStatus }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_MONSTER_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Survivor Status: ${error.message}`
    )

  return data as VignetteEncounterMonsterSurvivorStatusDetail
}

/**
 * Update Vignette Encounter Monster Survivor Status
 *
 * Updates an existing vignette encounter monster survivor status record.
 *
 * @param id Vignette Encounter Monster Survivor Status ID
 * @param vignetteEncounterMonsterSurvivorStatus Vignette Encounter Monster Survivor Status Data
 */
export async function updateVignetteEncounterMonsterSurvivorStatus(
  id: string,
  vignetteEncounterMonsterSurvivorStatus: Omit<
    TablesUpdate<'vignette_encounter_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_monster_survivor_status'> =
    { ...vignetteEncounterMonsterSurvivorStatus }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Monster Survivor Status: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Monster Survivor Status
 *
 * Deletes a vignette encounter monster survivor status record from the database.
 *
 * @param id Vignette Encounter Monster Survivor Status ID
 */
export async function removeVignetteEncounterMonsterSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Survivor Status: ${error.message}`
    )
}
