import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteMonsterLevelTraitDetail } from '@/lib/types'

const VIGNETTE_MONSTER_LEVEL_TRAIT_SELECT = `
  id,
  vignette_monster_level_id,
  trait_id,
  trait(*)
`

/**
 * Get Vignette Monster Level Traits
 *
 * Retrieves all vignette monster level trait rows.
 *
 * @returns Vignette Monster Level Traits
 */
export async function getVignetteMonsterLevelTraits(): Promise<
  VignetteMonsterLevelTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level_trait')
    .select(VIGNETTE_MONSTER_LEVEL_TRAIT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Level Traits: ${error.message}`
    )

  return (data ?? []) as VignetteMonsterLevelTraitDetail[]
}

/**
 * Get Vignette Monster Level Trait
 *
 * Retrieves a single vignette monster level trait row by ID.
 *
 * @param id Vignette Monster Level Trait ID
 * @returns Vignette Monster Level Trait or null
 */
export async function getVignetteMonsterLevelTrait(
  id: string | null | undefined
): Promise<VignetteMonsterLevelTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level_trait')
    .select(VIGNETTE_MONSTER_LEVEL_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Level Trait: ${error.message}`
    )

  return data as VignetteMonsterLevelTraitDetail | null
}

/**
 * Add Vignette Monster Level Trait
 *
 * Adds a new vignette monster level trait record to the database.
 *
 * @param vignetteMonsterLevelTrait Vignette Monster Level Trait Data
 * @returns Inserted Vignette Monster Level Trait
 */
export async function addVignetteMonsterLevelTrait(
  vignetteMonsterLevelTrait: Omit<
    TablesInsert<'vignette_monster_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteMonsterLevelTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_monster_level_trait'> = {
    ...vignetteMonsterLevelTrait
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_monster_level_trait')
    .insert(insertData)
    .select(VIGNETTE_MONSTER_LEVEL_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Monster Level Trait: ${error.message}`
    )

  return data as VignetteMonsterLevelTraitDetail
}

/**
 * Update Vignette Monster Level Trait
 *
 * Updates an existing vignette monster level trait record.
 *
 * @param id Vignette Monster Level Trait ID
 * @param vignetteMonsterLevelTrait Vignette Monster Level Trait Data
 */
export async function updateVignetteMonsterLevelTrait(
  id: string,
  vignetteMonsterLevelTrait: Omit<
    TablesUpdate<'vignette_monster_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_monster_level_trait'> = {
    ...vignetteMonsterLevelTrait
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_monster_level_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Monster Level Trait: ${error.message}`
    )
}

/**
 * Remove Vignette Monster Level Trait
 *
 * Deletes a vignette monster level trait record from the database.
 *
 * @param id Vignette Monster Level Trait ID
 */
export async function removeVignetteMonsterLevelTrait(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_monster_level_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Monster Level Trait: ${error.message}`
    )
}
