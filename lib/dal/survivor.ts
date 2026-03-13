import { SquiresOfTheCitadelSurvivors } from '@/lib/campaigns/squires'
import { Tables } from '@/lib/database.types'
import {
  SURVIVOR_ON_HUNT_ERROR_MESSAGE,
  SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE
} from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import { SurvivorDetail } from '@/lib/types'

/**
 * Add Squires of the Citadel Survivors
 *
 * Squires of the Citadel campaigns require specific survivors to be added to
 * the settlement.
 *
 * @param settlementId Settlement ID
 */
export async function addSquiresOfTheCitadelSurvivors(
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { error } = await supabase.from('survivor').insert(
    SquiresOfTheCitadelSurvivors.map((squire) => ({
      gender: squire.gender,
      settlement_id: settlementId,
      survivor_name: squire.name
    }))
  )

  if (error)
    throw new Error(`Error Adding Squires to Settlement: ${error.message}`)
}

/**
 * Get Survivor for Settlement
 *
 * Includes an `embarked` boolean indicating whether the survivor is currently
 * assigned to a hunt or showdown.
 *
 * @param survivorId Survivor ID
 * @param settlementId Settlement ID
 * @returns Survivor Data with Embarked Status
 */
export async function getSurvivor(
  survivorId: string | null,
  settlementId: string | null
): Promise<SurvivorDetail | null> {
  if (!survivorId || !settlementId)
    throw new Error('Required: Survivor ID, Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor')
    .select('*')
    .eq('id', survivorId)
    .eq('settlement_id', settlementId)
    .single()

  if (error) throw new Error(`Error Fetching Survivor: ${error.message}`)
  if (!data) return null

  const [huntResult, showdownResult] = await Promise.all([
    supabase
      .from('hunt_survivor')
      .select('survivor_id')
      .eq('survivor_id', survivorId)
      .limit(1),
    supabase
      .from('showdown_survivor')
      .select('survivor_id')
      .eq('survivor_id', survivorId)
      .limit(1)
  ])

  if (huntResult.error)
    throw new Error(`Error Checking Hunt Survivor: ${huntResult.error.message}`)
  if (showdownResult.error)
    throw new Error(
      `Error Checking Showdown Survivor: ${showdownResult.error.message}`
    )

  const embarked =
    (huntResult.data?.length ?? 0) > 0 || (showdownResult.data?.length ?? 0) > 0

  return { ...data, embarked }
}

/**
 * Get Survivors for Settlement
 *
 * Includes an `embarked` boolean indicating whether the survivor is currently
 * assigned to a hunt or showdown.
 *
 * @param settlementId Settlement ID
 * @returns List of Survivors with Embarked Status
 */
export async function getSurvivors(
  settlementId: string | null
): Promise<SurvivorDetail[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data: survivors, error: survivorsError } = await supabase
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })

  if (survivorsError)
    throw new Error(`Error Fetching Survivors: ${survivorsError.message}`)

  if (!survivors?.length) return []

  const survivorIds = survivors.map((s) => s.id)

  const [huntResult, showdownResult] = await Promise.all([
    supabase
      .from('hunt_survivor')
      .select('survivor_id')
      .in('survivor_id', survivorIds),
    supabase
      .from('showdown_survivor')
      .select('survivor_id')
      .in('survivor_id', survivorIds)
  ])

  if (huntResult.error)
    throw new Error(
      `Error Checking Hunt Survivors: ${huntResult.error.message}`
    )
  if (showdownResult.error)
    throw new Error(
      `Error Checking Showdown Survivors: ${showdownResult.error.message}`
    )

  const embarkedIds = new Set([
    ...(huntResult.data ?? []).map((r) => r.survivor_id),
    ...(showdownResult.data ?? []).map((r) => r.survivor_id)
  ])

  return survivors.map((survivor) => ({
    ...survivor,
    embarked: embarkedIds.has(survivor.id)
  }))
}

/**
 * Update Survivor
 *
 * @param survivorId Survivor ID
 * @param updates Survivor Updates
 */
export async function updateSurvivor(
  survivorId: string | null | undefined,
  updates: Partial<Tables<'survivor'>>
): Promise<void> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('survivor')
    .update(updates)
    .eq('id', survivorId)

  if (error) throw new Error(`Error Updating Survivor: ${error.message}`)
}

/**
 * Delete Survivor
 *
 * Checks if a survivor can be deleted (not on a hunt or showdown) before
 * removing them from the database. Also handles any necessary cleanup, such as
 * removing the survivor from the selected state if they are currently selected.
 *
 * @param settlementId Settlement ID
 * @param selectedSurvivorId Currently Selected Survivor ID
 * @param setSelectedSurvivorId Function to Update Selected Survivor ID State
 * @param survivorId Survivor ID
 */
export async function deleteSurvivor(
  settlementId: string | null | undefined,
  selectedSurvivorId: string | null | undefined,
  setSelectedSurvivorId: (survivor: string | null) => void,
  survivorId: string
): Promise<Tables<'survivor'>[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  // Check if there is a record in the hunt_survivor table with this survivor_id
  const { data: huntData, error: huntError } = await supabase
    .from('hunt_survivor')
    .select('id')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (huntError)
    throw new Error(`Error Checking Survivor Hunts: ${huntError.message}`)
  if (huntData) throw new Error(SURVIVOR_ON_HUNT_ERROR_MESSAGE())

  // Check if there is a record in the showdown_survivor table with this
  // survivor_id
  const { data: showdownData, error: showdownError } = await supabase
    .from('showdown_survivor')
    .select('id')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (showdownError)
    throw new Error(
      `Error Checking Survivor Showdowns: ${showdownError.message}`
    )
  if (showdownData) throw new Error(SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE())

  // If the survivor is currently selected, clear the selected survivor state
  if (selectedSurvivorId === survivorId) setSelectedSurvivorId(null)

  // Proceed with deletion if the survivor is not on a hunt or showdown and
  // return the updated list of survivors for this settlement
  const { error: deleteError } = await supabase
    .from('survivor')
    .delete()
    .eq('id', survivorId)

  if (deleteError)
    throw new Error(`Error Deleting Survivor: ${deleteError.message}`)

  const { data: survivorsData, error: survivorsError } = await supabase
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })

  if (survivorsError)
    throw new Error(`Error Fetching Survivors: ${survivorsError.message}`)

  return survivorsData ?? []
}
