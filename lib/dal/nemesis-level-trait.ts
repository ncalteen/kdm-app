import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { NemesisLevelTraitDetail } from '@/lib/types'

const NEMESIS_LEVEL_TRAIT_SELECT = `
  id,
  nemesis_level_id,
  trait_id,
  trait(*)
`

/**
 * Get Nemesis Level Traits
 *
 * Retrieves all nemesis level trait rows.
 *
 * @returns Nemesis Level Traits
 */
export async function getNemesisLevelTraits(): Promise<
  NemesisLevelTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level_trait')
    .select(NEMESIS_LEVEL_TRAIT_SELECT)

  if (error)
    throw new Error(`Error Fetching Nemesis Level Traits: ${error.message}`)

  return (data ?? []) as NemesisLevelTraitDetail[]
}

/**
 * Get Nemesis Level Trait
 *
 * Retrieves a single nemesis level trait row by ID.
 *
 * @param id Nemesis Level Trait ID
 * @returns Nemesis Level Trait or null
 */
export async function getNemesisLevelTrait(
  id: string | null | undefined
): Promise<NemesisLevelTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level_trait')
    .select(NEMESIS_LEVEL_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Nemesis Level Trait: ${error.message}`)

  return data as NemesisLevelTraitDetail | null
}

/**
 * Add Nemesis Level Trait
 *
 * Adds a new nemesis level trait record to the database.
 *
 * @param nemesisLevelTrait Nemesis Level Trait Data
 * @returns Inserted Nemesis Level Trait
 */
export async function addNemesisLevelTrait(
  nemesisLevelTrait: Omit<
    TablesInsert<'nemesis_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<NemesisLevelTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'nemesis_level_trait'> = {
    ...nemesisLevelTrait
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('nemesis_level_trait')
    .insert(insertData)
    .select(NEMESIS_LEVEL_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Nemesis Level Trait: ${error.message}`)

  return data as NemesisLevelTraitDetail
}

/**
 * Update Nemesis Level Trait
 *
 * Updates an existing nemesis level trait record.
 *
 * @param id Nemesis Level Trait ID
 * @param nemesisLevelTrait Nemesis Level Trait Data
 */
export async function updateNemesisLevelTrait(
  id: string,
  nemesisLevelTrait: Omit<
    TablesUpdate<'nemesis_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'nemesis_level_trait'> = {
    ...nemesisLevelTrait
  }

  delete updateData.id

  const { error } = await supabase
    .from('nemesis_level_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Nemesis Level Trait: ${error.message}`)
}

/**
 * Remove Nemesis Level Trait
 *
 * Deletes a nemesis level trait record from the database.
 *
 * @param id Nemesis Level Trait ID
 */
export async function removeNemesisLevelTrait(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_level_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Nemesis Level Trait: ${error.message}`)
}
