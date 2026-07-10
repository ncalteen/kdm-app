import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { QuarryLevelSurvivorStatusDetail } from '@/lib/types'

const QUARRY_LEVEL_SURVIVOR_STATUS_SELECT = `
  id,
  quarry_level_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Quarry Level Survivor Statuss
 *
 * Retrieves all quarry level survivor status rows.
 *
 * @returns Quarry Level Survivor Statuss
 */
export async function getQuarryLevelSurvivorStatuses(): Promise<
  QuarryLevelSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level_survivor_status')
    .select(QUARRY_LEVEL_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Quarry Level Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as QuarryLevelSurvivorStatusDetail[]
}

/**
 * Get Quarry Level Survivor Status
 *
 * Retrieves a single quarry level survivor status row by ID.
 *
 * @param id Quarry Level Survivor Status ID
 * @returns Quarry Level Survivor Status or null
 */
export async function getQuarryLevelSurvivorStatus(
  id: string | null | undefined
): Promise<QuarryLevelSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level_survivor_status')
    .select(QUARRY_LEVEL_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Quarry Level Survivor Status: ${error.message}`
    )

  return data as QuarryLevelSurvivorStatusDetail | null
}

/**
 * Add Quarry Level Survivor Status
 *
 * Adds a new quarry level survivor status record to the database.
 *
 * @param quarryLevelSurvivorStatus Quarry Level Survivor Status Data
 * @returns Inserted Quarry Level Survivor Status
 */
export async function addQuarryLevelSurvivorStatus(
  quarryLevelSurvivorStatus: Omit<
    TablesInsert<'quarry_level_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<QuarryLevelSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'quarry_level_survivor_status'> = {
    ...quarryLevelSurvivorStatus
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('quarry_level_survivor_status')
    .insert(insertData)
    .select(QUARRY_LEVEL_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Quarry Level Survivor Status: ${error.message}`
    )

  return data as QuarryLevelSurvivorStatusDetail
}

/**
 * Update Quarry Level Survivor Status
 *
 * Updates an existing quarry level survivor status record.
 *
 * @param id Quarry Level Survivor Status ID
 * @param quarryLevelSurvivorStatus Quarry Level Survivor Status Data
 */
export async function updateQuarryLevelSurvivorStatus(
  id: string,
  quarryLevelSurvivorStatus: Omit<
    TablesUpdate<'quarry_level_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'quarry_level_survivor_status'> = {
    ...quarryLevelSurvivorStatus
  }

  delete updateData.id

  const { error } = await supabase
    .from('quarry_level_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Quarry Level Survivor Status: ${error.message}`
    )
}

/**
 * Remove Quarry Level Survivor Status
 *
 * Deletes a quarry level survivor status record from the database.
 *
 * @param id Quarry Level Survivor Status ID
 */
export async function removeQuarryLevelSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_level_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Quarry Level Survivor Status: ${error.message}`
    )
}
