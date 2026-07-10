import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ShowdownMonsterSurvivorStatusDetail } from '@/lib/types'

const SHOWDOWN_MONSTER_SURVIVOR_STATUS_SELECT = `
  id,
  showdown_monster_id,
  settlement_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Showdown Monster Survivor Statuss
 *
 * Retrieves all showdown monster survivor status rows.
 *
 * @returns Showdown Monster Survivor Statuss
 */
export async function getShowdownMonsterSurvivorStatuses(): Promise<
  ShowdownMonsterSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster_survivor_status')
    .select(SHOWDOWN_MONSTER_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Showdown Monster Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as ShowdownMonsterSurvivorStatusDetail[]
}

/**
 * Get Showdown Monster Survivor Status
 *
 * Retrieves a single showdown monster survivor status row by ID.
 *
 * @param id Showdown Monster Survivor Status ID
 * @returns Showdown Monster Survivor Status or null
 */
export async function getShowdownMonsterSurvivorStatus(
  id: string | null | undefined
): Promise<ShowdownMonsterSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster_survivor_status')
    .select(SHOWDOWN_MONSTER_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Showdown Monster Survivor Status: ${error.message}`
    )

  return data as ShowdownMonsterSurvivorStatusDetail | null
}

/**
 * Add Showdown Monster Survivor Status
 *
 * Adds a new showdown monster survivor status record to the database.
 *
 * @param showdownMonsterSurvivorStatus Showdown Monster Survivor Status Data
 * @returns Inserted Showdown Monster Survivor Status
 */
export async function addShowdownMonsterSurvivorStatus(
  showdownMonsterSurvivorStatus: Omit<
    TablesInsert<'showdown_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<ShowdownMonsterSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'showdown_monster_survivor_status'> = {
    ...showdownMonsterSurvivorStatus
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('showdown_monster_survivor_status')
    .insert(insertData)
    .select(SHOWDOWN_MONSTER_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Showdown Monster Survivor Status: ${error.message}`
    )

  return data as ShowdownMonsterSurvivorStatusDetail
}

/**
 * Update Showdown Monster Survivor Status
 *
 * Updates an existing showdown monster survivor status record.
 *
 * @param id Showdown Monster Survivor Status ID
 * @param showdownMonsterSurvivorStatus Showdown Monster Survivor Status Data
 */
export async function updateShowdownMonsterSurvivorStatus(
  id: string,
  showdownMonsterSurvivorStatus: Omit<
    TablesUpdate<'showdown_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'showdown_monster_survivor_status'> = {
    ...showdownMonsterSurvivorStatus
  }

  delete updateData.id

  const { error } = await supabase
    .from('showdown_monster_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Showdown Monster Survivor Status: ${error.message}`
    )
}

/**
 * Remove Showdown Monster Survivor Status
 *
 * Deletes a showdown monster survivor status record from the database.
 *
 * @param id Showdown Monster Survivor Status ID
 */
export async function removeShowdownMonsterSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_monster_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Showdown Monster Survivor Status: ${error.message}`
    )
}
