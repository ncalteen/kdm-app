import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { TraitDetail } from '@/lib/types'

export const TRAIT_SELECT = `
  id,
  custom,
  trait_name,
  rules
`

/**
 * Get Traits
 *
 * Retrieves all monster traits visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) traits
 * - Custom traits owned by the user
 *
 * @returns Traits by ID
 */
export async function getTraits(): Promise<{ [key: string]: TraitDetail }> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase.from('trait').select(TRAIT_SELECT)

  if (error) throw new Error(`Error Fetching Traits: ${error.message}`)

  const map: { [key: string]: TraitDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Traits
 *
 * Retrieves only custom traits authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Trait Data Map
 */
export async function getUserCustomTraits(): Promise<{
  [key: string]: TraitDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trait')
    .select(TRAIT_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error) throw new Error(`Error Fetching Custom Traits: ${error.message}`)

  const map: { [key: string]: TraitDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Trait
 *
 * Adds a new trait record to the database.
 *
 * @param trait Trait Data
 * @returns Inserted Trait
 */
export async function addTrait(
  trait: Omit<
    TablesInsert<'trait'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<TraitDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'trait'> = { ...trait }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('trait')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(TRAIT_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Trait: ${error.message}`)

  return result
}

/**
 * Update Trait
 *
 * Updates an existing trait record in the database.
 *
 * @param id Trait ID
 * @param trait Trait Data
 */
export async function updateTrait(
  id: string,
  trait: Omit<
    TablesUpdate<'trait'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'trait'> = { ...trait }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase.from('trait').update(updateData).eq('id', id)

  if (error) throw new Error(`Error Updating Trait: ${error.message}`)
}

/**
 * Remove Trait
 *
 * Deletes a trait record.
 *
 * @param id Trait ID
 */
export async function removeTrait(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('trait').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Trait: ${error.message}`)
}

/**
 * Get Trait IDs
 *
 * Retrieves the IDs of traits. This depends on if they are custom traits
 * (requires the user ID if so).
 *
 * @param traitNames Trait Names
 * @param custom Custom
 * @param userId User ID
 * @returns Traits IDs
 */
export async function getTraitIds(
  traitNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('trait')
        .select('id')
        .in('trait_name', traitNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('trait')
        .select('id')
        .in('trait_name', traitNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Trait ID(s): ${error.message}`)

  if (!data) throw new Error('Trait(s) Not Found')

  return data.map((trait) => trait.id)
}
