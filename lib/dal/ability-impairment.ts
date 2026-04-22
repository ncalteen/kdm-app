import { createClient } from '@/lib/supabase/client'
import { AbilityImpairmentDetail } from '@/lib/types'

/**
 * Get Ability Impairments
 *
 * Retrieves all ability/impairments available to the authenticated user:
 * - Built-in (non-custom) ability/impairments
 * - Custom ability/impairments owned by the user
 * - Custom ability/impairments shared with the user
 *
 * @returns Ability/Impairments by ID
 */
export async function getAbilityImpairments(): Promise<{
  [key: string]: AbilityImpairmentDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('ability_impairment')
      .select('id, custom, ability_impairment_name, rules')
      .eq('custom', false),
    supabase
      .from('ability_impairment')
      .select('id, custom, ability_impairment_name, rules')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('ability_impairment_shared_user')
      .select('ability_impairment(id, custom, ability_impairment_name, rules)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(
        `Error Fetching Ability/Impairments: ${result.error.message}`
      )

  const map: { [key: string]: AbilityImpairmentDetail } = {}

  for (const a of nonCustomResult.data ?? []) map[a.id] = a
  for (const a of userCustomResult.data ?? []) map[a.id] = a
  for (const row of sharedResult.data ?? []) {
    const ai = Array.isArray(row.ability_impairment)
      ? row.ability_impairment[0]
      : row.ability_impairment
    if (ai) map[ai.id] = ai
  }

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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (data.custom && !user) throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('ability_impairment')
    .insert({
      ...data,
      ...(data.custom ? { user_id: user!.id } : {})
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
  const supabase = createClient()

  const { error } = await supabase
    .from('ability_impairment')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Ability/Impairment: ${error.message}`)
}
