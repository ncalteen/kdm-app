import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { NemesisLevelSurvivorStatusDetail } from '@/lib/types'

const NEMESIS_LEVEL_SURVIVOR_STATUS_SELECT = `
  id,
  nemesis_level_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Nemesis Level Survivor Statuss
 *
 * Retrieves all nemesis level survivor status rows.
 *
 * @returns Nemesis Level Survivor Statuss
 */
export async function getNemesisLevelSurvivorStatuses(): Promise<
  NemesisLevelSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level_survivor_status')
    .select(NEMESIS_LEVEL_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Nemesis Level Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as NemesisLevelSurvivorStatusDetail[]
}

/**
 * Get Nemesis Level Survivor Status
 *
 * Retrieves a single nemesis level survivor status row by ID.
 *
 * @param id Nemesis Level Survivor Status ID
 * @returns Nemesis Level Survivor Status or null
 */
export async function getNemesisLevelSurvivorStatus(
  id: string | null | undefined
): Promise<NemesisLevelSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level_survivor_status')
    .select(NEMESIS_LEVEL_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Nemesis Level Survivor Status: ${error.message}`
    )

  return data as NemesisLevelSurvivorStatusDetail | null
}

/**
 * Add Nemesis Level Survivor Status
 *
 * Adds a new nemesis level survivor status record to the database.
 *
 * @param nemesisLevelSurvivorStatus Nemesis Level Survivor Status Data
 * @returns Inserted Nemesis Level Survivor Status
 */
export async function addNemesisLevelSurvivorStatus(
  nemesisLevelSurvivorStatus: Omit<
    TablesInsert<'nemesis_level_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<NemesisLevelSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'nemesis_level_survivor_status'> = {
    ...nemesisLevelSurvivorStatus
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('nemesis_level_survivor_status')
    .insert(insertData)
    .select(NEMESIS_LEVEL_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Nemesis Level Survivor Status: ${error.message}`
    )

  return data as NemesisLevelSurvivorStatusDetail
}

/**
 * Update Nemesis Level Survivor Status
 *
 * Updates an existing nemesis level survivor status record.
 *
 * @param id Nemesis Level Survivor Status ID
 * @param nemesisLevelSurvivorStatus Nemesis Level Survivor Status Data
 */
export async function updateNemesisLevelSurvivorStatus(
  id: string,
  nemesisLevelSurvivorStatus: Omit<
    TablesUpdate<'nemesis_level_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'nemesis_level_survivor_status'> = {
    ...nemesisLevelSurvivorStatus
  }

  delete updateData.id

  const { error } = await supabase
    .from('nemesis_level_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Nemesis Level Survivor Status: ${error.message}`
    )
}

/**
 * Remove Nemesis Level Survivor Status
 *
 * Deletes a nemesis level survivor status record from the database.
 *
 * @param id Nemesis Level Survivor Status ID
 */
export async function removeNemesisLevelSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_level_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Nemesis Level Survivor Status: ${error.message}`
    )
}
