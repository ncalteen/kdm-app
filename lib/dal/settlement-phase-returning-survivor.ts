import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementPhaseReturningSurvivorDetail } from '@/lib/types'

const SETTLEMENT_PHASE_RETURNING_SURVIVOR_SELECT = `
  settlement_id,
  settlement_phase_id,
  survivor_id,
  returning_survivor:survivor(*)
`

type SettlementPhaseReturningSurvivorKey = Pick<
  TablesInsert<'settlement_phase_returning_survivor'>,
  'settlement_phase_id' | 'survivor_id'
>

/**
 * Get Settlement Phase Returning Survivors
 *
 * Retrieves all settlement phase returning survivor rows.
 *
 * @returns Settlement Phase Returning Survivors
 */
export async function getSettlementPhaseReturningSurvivors(): Promise<
  SettlementPhaseReturningSurvivorDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase_returning_survivor')
    .select(SETTLEMENT_PHASE_RETURNING_SURVIVOR_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Settlement Phase Returning Survivors: ${error.message}`
    )

  return (data ?? []) as SettlementPhaseReturningSurvivorDetail[]
}

/**
 * Get Settlement Phase Returning Survivor
 *
 * Retrieves a single settlement phase returning survivor row by key.
 *
 * @param key Settlement Phase Returning Survivor Key
 * @returns Settlement Phase Returning Survivor or null
 */
export async function getSettlementPhaseReturningSurvivor(
  key: SettlementPhaseReturningSurvivorKey
): Promise<SettlementPhaseReturningSurvivorDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase_returning_survivor')
    .select(SETTLEMENT_PHASE_RETURNING_SURVIVOR_SELECT)
    .eq('settlement_phase_id', key.settlement_phase_id)
    .eq('survivor_id', key.survivor_id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Settlement Phase Returning Survivor: ${error.message}`
    )

  return data as SettlementPhaseReturningSurvivorDetail | null
}

/**
 * Add Settlement Phase Returning Survivor
 *
 * Adds a new settlement phase returning survivor record to the database.
 *
 * @param settlementPhaseReturningSurvivor Settlement Phase Returning Survivor Data
 * @returns Inserted Settlement Phase Returning Survivor
 */
export async function addSettlementPhaseReturningSurvivor(
  settlementPhaseReturningSurvivor: TablesInsert<'settlement_phase_returning_survivor'>
): Promise<SettlementPhaseReturningSurvivorDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'settlement_phase_returning_survivor'> = {
    ...settlementPhaseReturningSurvivor
  }

  const { data, error } = await supabase
    .from('settlement_phase_returning_survivor')
    .insert(insertData)
    .select(SETTLEMENT_PHASE_RETURNING_SURVIVOR_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Settlement Phase Returning Survivor: ${error.message}`
    )

  return data as SettlementPhaseReturningSurvivorDetail
}

/**
 * Update Settlement Phase Returning Survivor
 *
 * Updates an existing settlement phase returning survivor record.
 *
 * @param key Settlement Phase Returning Survivor Key
 * @param settlementPhaseReturningSurvivor Settlement Phase Returning Survivor Data
 */
export async function updateSettlementPhaseReturningSurvivor(
  key: SettlementPhaseReturningSurvivorKey,
  settlementPhaseReturningSurvivor: Omit<
    TablesUpdate<'settlement_phase_returning_survivor'>,
    keyof SettlementPhaseReturningSurvivorKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'settlement_phase_returning_survivor'> = {
    ...settlementPhaseReturningSurvivor
  }

  delete updateData.settlement_phase_id
  delete updateData.survivor_id

  const { error } = await supabase
    .from('settlement_phase_returning_survivor')
    .update(updateData)
    .eq('settlement_phase_id', key.settlement_phase_id)
    .eq('survivor_id', key.survivor_id)

  if (error)
    throw new Error(
      `Error Updating Settlement Phase Returning Survivor: ${error.message}`
    )
}

/**
 * Remove Settlement Phase Returning Survivor
 *
 * Deletes a settlement phase returning survivor record from the database.
 *
 * @param key Settlement Phase Returning Survivor Key
 */
export async function removeSettlementPhaseReturningSurvivor(
  key: SettlementPhaseReturningSurvivorKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_phase_returning_survivor')
    .delete()
    .eq('settlement_phase_id', key.settlement_phase_id)
    .eq('survivor_id', key.survivor_id)

  if (error)
    throw new Error(
      `Error Removing Settlement Phase Returning Survivor: ${error.message}`
    )
}
