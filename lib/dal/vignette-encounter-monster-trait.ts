import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterMonsterTraitDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_MONSTER_TRAIT_SELECT = `
  id,
  vignette_encounter_monster_id,
  trait_id,
  trait(*)
`

/**
 * Get Vignette Encounter Monster Traits
 *
 * Retrieves all vignette encounter monster trait rows.
 *
 * @returns Vignette Encounter Monster Traits
 */
export async function getVignetteEncounterMonsterTraits(): Promise<
  VignetteEncounterMonsterTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_trait')
    .select(VIGNETTE_ENCOUNTER_MONSTER_TRAIT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monster Traits: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterMonsterTraitDetail[]
}

/**
 * Get Vignette Encounter Monster Trait
 *
 * Retrieves a single vignette encounter monster trait row by ID.
 *
 * @param id Vignette Encounter Monster Trait ID
 * @returns Vignette Encounter Monster Trait or null
 */
export async function getVignetteEncounterMonsterTrait(
  id: string | null | undefined
): Promise<VignetteEncounterMonsterTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_trait')
    .select(VIGNETTE_ENCOUNTER_MONSTER_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monster Trait: ${error.message}`
    )

  return data as VignetteEncounterMonsterTraitDetail | null
}

/**
 * Add Vignette Encounter Monster Trait
 *
 * Adds a new vignette encounter monster trait record to the database.
 *
 * @param vignetteEncounterMonsterTrait Vignette Encounter Monster Trait Data
 * @returns Inserted Vignette Encounter Monster Trait
 */
export async function addVignetteEncounterMonsterTrait(
  vignetteEncounterMonsterTrait: Omit<
    TablesInsert<'vignette_encounter_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterMonsterTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_monster_trait'> = {
    ...vignetteEncounterMonsterTrait
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_monster_trait')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_MONSTER_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Trait: ${error.message}`
    )

  return data as VignetteEncounterMonsterTraitDetail
}

/**
 * Update Vignette Encounter Monster Trait
 *
 * Updates an existing vignette encounter monster trait record.
 *
 * @param id Vignette Encounter Monster Trait ID
 * @param vignetteEncounterMonsterTrait Vignette Encounter Monster Trait Data
 */
export async function updateVignetteEncounterMonsterTrait(
  id: string,
  vignetteEncounterMonsterTrait: Omit<
    TablesUpdate<'vignette_encounter_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_monster_trait'> = {
    ...vignetteEncounterMonsterTrait
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_monster_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Monster Trait: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Monster Trait
 *
 * Deletes a vignette encounter monster trait record from the database.
 *
 * @param id Vignette Encounter Monster Trait ID
 */
export async function removeVignetteEncounterMonsterTrait(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Trait: ${error.message}`
    )
}
