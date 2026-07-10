import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterMonsterLevelTraitDetail } from '@/lib/types'

const ENCOUNTER_MONSTER_LEVEL_TRAIT_SELECT = `
  id,
  encounter_monster_level_id,
  trait_id,
  trait(*)
`

/**
 * Get Encounter Monster Level Traits
 *
 * Retrieves all encounter monster level trait rows.
 *
 * @returns Encounter Monster Level Traits
 */
export async function getEncounterMonsterLevelTraits(): Promise<
  EncounterMonsterLevelTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level_trait')
    .select(ENCOUNTER_MONSTER_LEVEL_TRAIT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Encounter Monster Level Traits: ${error.message}`
    )

  return (data ?? []) as EncounterMonsterLevelTraitDetail[]
}

/**
 * Get Encounter Monster Level Trait
 *
 * Retrieves a single encounter monster level trait row by ID.
 *
 * @param id Encounter Monster Level Trait ID
 * @returns Encounter Monster Level Trait or null
 */
export async function getEncounterMonsterLevelTrait(
  id: string | null | undefined
): Promise<EncounterMonsterLevelTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level_trait')
    .select(ENCOUNTER_MONSTER_LEVEL_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Encounter Monster Level Trait: ${error.message}`
    )

  return data as EncounterMonsterLevelTraitDetail | null
}

/**
 * Add Encounter Monster Level Trait
 *
 * Adds a new encounter monster level trait record to the database.
 *
 * @param encounterMonsterLevelTrait Encounter Monster Level Trait Data
 * @returns Inserted Encounter Monster Level Trait
 */
export async function addEncounterMonsterLevelTrait(
  encounterMonsterLevelTrait: Omit<
    TablesInsert<'encounter_monster_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterMonsterLevelTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'encounter_monster_level_trait'> = {
    ...encounterMonsterLevelTrait
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('encounter_monster_level_trait')
    .insert(insertData)
    .select(ENCOUNTER_MONSTER_LEVEL_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Encounter Monster Level Trait: ${error.message}`
    )

  return data as EncounterMonsterLevelTraitDetail
}

/**
 * Update Encounter Monster Level Trait
 *
 * Updates an existing encounter monster level trait record.
 *
 * @param id Encounter Monster Level Trait ID
 * @param encounterMonsterLevelTrait Encounter Monster Level Trait Data
 */
export async function updateEncounterMonsterLevelTrait(
  id: string,
  encounterMonsterLevelTrait: Omit<
    TablesUpdate<'encounter_monster_level_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_monster_level_trait'> = {
    ...encounterMonsterLevelTrait
  }

  delete updateData.id

  const { error } = await supabase
    .from('encounter_monster_level_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Encounter Monster Level Trait: ${error.message}`
    )
}

/**
 * Remove Encounter Monster Level Trait
 *
 * Deletes a encounter monster level trait record from the database.
 *
 * @param id Encounter Monster Level Trait ID
 */
export async function removeEncounterMonsterLevelTrait(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_monster_level_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Encounter Monster Level Trait: ${error.message}`
    )
}
