import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntMonsterSurvivorStatusDetail } from '@/lib/types'

const HUNT_MONSTER_SURVIVOR_STATUS_SELECT = `
  id,
  hunt_monster_id,
  settlement_id,
  survivor_status_id,
  survivor_status(*)
`

/**
 * Get Hunt Monster Survivor Statuss
 *
 * Retrieves all hunt monster survivor status rows.
 *
 * @returns Hunt Monster Survivor Statuss
 */
export async function getHuntMonsterSurvivorStatuses(): Promise<
  HuntMonsterSurvivorStatusDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster_survivor_status')
    .select(HUNT_MONSTER_SURVIVOR_STATUS_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Hunt Monster Survivor Statuss: ${error.message}`
    )

  return (data ?? []) as HuntMonsterSurvivorStatusDetail[]
}

/**
 * Get Hunt Monster Survivor Status
 *
 * Retrieves a single hunt monster survivor status row by ID.
 *
 * @param id Hunt Monster Survivor Status ID
 * @returns Hunt Monster Survivor Status or null
 */
export async function getHuntMonsterSurvivorStatus(
  id: string | null | undefined
): Promise<HuntMonsterSurvivorStatusDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster_survivor_status')
    .select(HUNT_MONSTER_SURVIVOR_STATUS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Hunt Monster Survivor Status: ${error.message}`
    )

  return data as HuntMonsterSurvivorStatusDetail | null
}

/**
 * Add Hunt Monster Survivor Status
 *
 * Adds a new hunt monster survivor status record to the database.
 *
 * @param huntMonsterSurvivorStatus Hunt Monster Survivor Status Data
 * @returns Inserted Hunt Monster Survivor Status
 */
export async function addHuntMonsterSurvivorStatus(
  huntMonsterSurvivorStatus: Omit<
    TablesInsert<'hunt_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<HuntMonsterSurvivorStatusDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'hunt_monster_survivor_status'> = {
    ...huntMonsterSurvivorStatus
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('hunt_monster_survivor_status')
    .insert(insertData)
    .select(HUNT_MONSTER_SURVIVOR_STATUS_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Hunt Monster Survivor Status: ${error.message}`
    )

  return data as HuntMonsterSurvivorStatusDetail
}

/**
 * Update Hunt Monster Survivor Status
 *
 * Updates an existing hunt monster survivor status record.
 *
 * @param id Hunt Monster Survivor Status ID
 * @param huntMonsterSurvivorStatus Hunt Monster Survivor Status Data
 */
export async function updateHuntMonsterSurvivorStatus(
  id: string,
  huntMonsterSurvivorStatus: Omit<
    TablesUpdate<'hunt_monster_survivor_status'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'hunt_monster_survivor_status'> = {
    ...huntMonsterSurvivorStatus
  }

  delete updateData.id

  const { error } = await supabase
    .from('hunt_monster_survivor_status')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Hunt Monster Survivor Status: ${error.message}`
    )
}

/**
 * Remove Hunt Monster Survivor Status
 *
 * Deletes a hunt monster survivor status record from the database.
 *
 * @param id Hunt Monster Survivor Status ID
 */
export async function removeHuntMonsterSurvivorStatus(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_monster_survivor_status')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Hunt Monster Survivor Status: ${error.message}`
    )
}
