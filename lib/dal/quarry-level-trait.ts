import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { QuarryLevelTraitDetail } from '@/lib/types'

const QUARRY_LEVEL_TRAIT_SELECT = `
  id,
  quarry_level_id,
  trait_id,
  trait(*)
`

/**
 * Get Quarry Level Traits
 *
 * Retrieves all quarry level trait rows.
 *
 * @returns Quarry Level Traits
 */
export async function getQuarryLevelTraits(): Promise<
  QuarryLevelTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level_trait')
    .select(QUARRY_LEVEL_TRAIT_SELECT)

  if (error)
    throw new Error(`Error Fetching Quarry Level Traits: ${error.message}`)

  return (data ?? []) as QuarryLevelTraitDetail[]
}

/**
 * Get Quarry Level Trait
 *
 * Retrieves a single quarry level trait row by ID.
 *
 * @param id Quarry Level Trait ID
 * @returns Quarry Level Trait or null
 */
export async function getQuarryLevelTrait(
  id: string | null | undefined
): Promise<QuarryLevelTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level_trait')
    .select(QUARRY_LEVEL_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Quarry Level Trait: ${error.message}`)

  return data as QuarryLevelTraitDetail | null
}

/**
 * Add Quarry Level Trait
 *
 * Adds a new quarry level trait record to the database.
 *
 * @param quarryLevelTrait Quarry Level Trait Data
 * @returns Inserted Quarry Level Trait
 */
export async function addQuarryLevelTrait(
  quarryLevelTrait: Omit<
    TablesInsert<'quarry_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<QuarryLevelTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'quarry_level_trait'> = { ...quarryLevelTrait }

  delete insertData.id

  const { data, error } = await supabase
    .from('quarry_level_trait')
    .insert(insertData)
    .select(QUARRY_LEVEL_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Quarry Level Trait: ${error.message}`)

  return data as QuarryLevelTraitDetail
}

/**
 * Update Quarry Level Trait
 *
 * Updates an existing quarry level trait record.
 *
 * @param id Quarry Level Trait ID
 * @param quarryLevelTrait Quarry Level Trait Data
 */
export async function updateQuarryLevelTrait(
  id: string,
  quarryLevelTrait: Omit<
    TablesUpdate<'quarry_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'quarry_level_trait'> = { ...quarryLevelTrait }

  delete updateData.id

  const { error } = await supabase
    .from('quarry_level_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Quarry Level Trait: ${error.message}`)
}

/**
 * Remove Quarry Level Trait
 *
 * Deletes a quarry level trait record from the database.
 *
 * @param id Quarry Level Trait ID
 */
export async function removeQuarryLevelTrait(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_level_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Quarry Level Trait: ${error.message}`)
}
