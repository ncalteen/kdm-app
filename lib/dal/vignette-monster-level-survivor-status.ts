import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteMonsterLevelSurvivorStatusDetail } from '@/lib/types'

const VIGNETTE_MONSTER_LEVEL_SURVIVOR_STATUS_SELECT = `
  id,
  vignette_monster_level_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Vignette Monster Level Survivor Statuss
 *
 * Retrieves all vignette monster level survivor status rows.
 *
 * @returns Vignette Monster Level Survivor Statuss
 */
export async function getVignetteMonsterLevelSurvivorStatuses(): Promise<
  VignetteMonsterLevelSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level_survivor_status')
    .select(VIGNETTE_MONSTER_LEVEL_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Level Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as VignetteMonsterLevelSurvivorStatusDetail[]
}

/**
 * Get Vignette Monster Level Survivor Status
 *
 * Retrieves a single vignette monster level survivor status row by ID.
 *
 * @param id Vignette Monster Level Survivor Status ID
 * @returns Vignette Monster Level Survivor Status or null
 */
export async function getVignetteMonsterLevelSurvivorStatus(
  id: string | null | undefined
): Promise<VignetteMonsterLevelSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level_survivor_status')
    .select(VIGNETTE_MONSTER_LEVEL_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Level Survivor Status: ${error.message}`
    )

  return data as VignetteMonsterLevelSurvivorStatusDetail | null
}

/**
 * Add Vignette Monster Level Survivor Status
 *
 * Adds a new vignette monster level survivor status record to the database.
 *
 * @param vignetteMonsterLevelSurvivorStatus Vignette Monster Level Survivor Status Data
 * @returns Inserted Vignette Monster Level Survivor Status
 */
export async function addVignetteMonsterLevelSurvivorStatus(
  vignetteMonsterLevelSurvivorStatus: Omit<
    TablesInsert<'vignette_monster_level_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteMonsterLevelSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_monster_level_survivor_status'> = {
    ...vignetteMonsterLevelSurvivorStatus
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_monster_level_survivor_status')
    .insert(insertData)
    .select(VIGNETTE_MONSTER_LEVEL_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Monster Level Survivor Status: ${error.message}`
    )

  return data as VignetteMonsterLevelSurvivorStatusDetail
}

/**
 * Update Vignette Monster Level Survivor Status
 *
 * Updates an existing vignette monster level survivor status record.
 *
 * @param id Vignette Monster Level Survivor Status ID
 * @param vignetteMonsterLevelSurvivorStatus Vignette Monster Level Survivor Status Data
 */
export async function updateVignetteMonsterLevelSurvivorStatus(
  id: string,
  vignetteMonsterLevelSurvivorStatus: Omit<
    TablesUpdate<'vignette_monster_level_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_monster_level_survivor_status'> = {
    ...vignetteMonsterLevelSurvivorStatus
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_monster_level_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Monster Level Survivor Status: ${error.message}`
    )
}

/**
 * Remove Vignette Monster Level Survivor Status
 *
 * Deletes a vignette monster level survivor status record from the database.
 *
 * @param id Vignette Monster Level Survivor Status ID
 */
export async function removeVignetteMonsterLevelSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_monster_level_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Monster Level Survivor Status: ${error.message}`
    )
}
