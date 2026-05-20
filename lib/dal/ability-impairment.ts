import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { AbilityImpairmentDetail } from '@/lib/types'

/**
 * Get Ability Impairments
 *
 * Retrieves all ability/impairments visible to the authenticated user. RLS
 * surfaces:
 * - Built-in (non-custom) ability/impairments
 * - Custom ability/impairments owned by the user
 * - Custom ability/impairments attached to a survivor the user can see
 *   (via the transitive SELECT policy on `ability_impairment` through the
 *   `survivor_ability_impairment` junction)
 *
 * @returns Ability/Impairments by ID
 */
export async function getAbilityImpairments(): Promise<{
  [key: string]: AbilityImpairmentDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ability_impairment')
    .select('id, custom, ability_impairment_name, rules')

  if (error)
    throw new Error(`Error Fetching Ability/Impairments: ${error.message}`)

  const map: { [key: string]: AbilityImpairmentDetail } = {}
  for (const a of data ?? []) map[a.id] = a

  return map
}

/**
 * Get User Custom Ability Impairments
 *
 * Retrieves only custom ability/impairments authored by the current user.
 * Used by the user-content library so collaborator-authored customs visible
 * via the transitive SELECT policy don't pollute the caller's personal
 * catalog.
 *
 * @returns Custom Ability/Impairment Data Map
 */
export async function getUserCustomAbilityImpairments(): Promise<{
  [key: string]: AbilityImpairmentDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ability_impairment')
    .select('id, custom, ability_impairment_name, rules, archived_at')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(
      `Error Fetching Custom Ability/Impairments: ${error.message}`
    )

  const map: { [key: string]: AbilityImpairmentDetail } = {}
  for (const a of data ?? []) if (!a.archived_at) map[a.id] = a

  return map
}

/**
 * Add Ability Impairment
 *
 * Adds a new ability/impairment record to the database.
 *
 * @param data Ability/Impairment Data
 * @returns Inserted Ability/Impairment
 */
export async function addAbilityImpairment(data: {
  custom: boolean
  ability_impairment_name: string
  rules?: string | null
}): Promise<AbilityImpairmentDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (data.custom && !userId) throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('ability_impairment')
    .insert({
      ...data,
      ...(data.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, ability_impairment_name, rules')
    .single()

  if (error)
    throw new Error(`Error Adding Ability/Impairment: ${error.message}`)

  return result
}

/**
 * Update Ability Impairment
 *
 * Updates an existing ability/impairment record in the database.
 *
 * @param id Ability/Impairment ID
 * @param data Ability/Impairment Data
 */
export async function updateAbilityImpairment(
  id: string,
  data: {
    ability_impairment_name?: string
    rules?: string | null
  }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('ability_impairment')
    .update(data)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Ability/Impairment: ${error.message}`)
}

/**
 * Remove Ability Impairment
 *
 * Deletes an ability/impairment record from the database.
 *
 * @param id Ability/Impairment ID
 */
export async function removeAbilityImpairment(id: string): Promise<void> {
  await removeCatalogRow('ability_impairment', id, 'Ability/Impairment')
}
