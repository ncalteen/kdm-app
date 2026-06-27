import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { AbilityImpairmentDetail } from '@/lib/types'

type AbilityImpairmentInsertData = Omit<
  TablesInsert<'ability_impairment'>,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

type AbilityImpairmentUpdateData = Omit<
  TablesUpdate<'ability_impairment'>,
  'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
>

const ABILITY_IMPAIRMENT_SELECT = `
  id,
  custom,
  ability_impairment_name,
  rules
`

/**
 * Get Abilities/Impairments
 *
 * Retrieves all abilities/impairments visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) abilities/impairments
 * - Custom abilities/impairments owned by the user
 * - Custom abilities/impairments attached to a survivor the user can see (via
 *   the transitive SELECT policy on `ability_impairment` through the
 *   `survivor_ability_impairment` junction)
 *
 * @returns Abilities/Impairments by ID
 */
export async function getAbilityImpairments(): Promise<{
  [key: string]: AbilityImpairmentDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ability_impairment')
    .select(ABILITY_IMPAIRMENT_SELECT)

  if (error)
    throw new Error(`Error Fetching Abilities/Impairments: ${error.message}`)

  const map: { [key: string]: AbilityImpairmentDetail } = {}
  for (const a of data) map[a.id] = a

  return map
}

/**
 * Get User Custom Abilities/Impairments
 *
 * Retrieves only custom abilities/impairments authored by the current user.
 * Used by the user-content library so collaborator-authored customs visible via
 * the transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Abilities/Impairments Data Map
 */
export async function getUserCustomAbilityImpairments(): Promise<{
  [key: string]: AbilityImpairmentDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ability_impairment')
    .select(ABILITY_IMPAIRMENT_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(
      `Error Fetching Custom Abilities/Impairments: ${error.message}`
    )

  const map: { [key: string]: AbilityImpairmentDetail } = {}
  for (const a of data) map[a.id] = a

  return map
}

/**
 * Add Ability/Impairment
 *
 * Adds a new ability/impairment record to the database.
 *
 * @param abilityImpairment Ability/Impairment Data
 * @returns Inserted Ability/Impairment
 */
export async function addAbilityImpairment(
  abilityImpairment: AbilityImpairmentInsertData
): Promise<AbilityImpairmentDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'ability_impairment'> = {
    ...abilityImpairment
  }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('ability_impairment')
    .insert({
      ...insertData,
      ...(insertData.custom === true ? { user_id: userId } : {})
    })
    .select(ABILITY_IMPAIRMENT_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Ability/Impairment: ${error.message}`)

  return data
}

/**
 * Update Ability/Impairment
 *
 * Updates an existing ability/impairment record in the database.
 *
 * @param id Ability/Impairment ID
 * @param abilityImpairment Ability/Impairment Data
 */
export async function updateAbilityImpairment(
  id: string,
  abilityImpairment: AbilityImpairmentUpdateData
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'ability_impairment'> = {
    ...abilityImpairment
  }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('ability_impairment')
    .update(updateData)
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
  const supabase = createClient()

  const { error } = await supabase
    .from('ability_impairment')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Ability/Impairment: ${error.message}`)
}
