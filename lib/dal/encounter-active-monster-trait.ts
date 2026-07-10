import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterActiveMonsterTraitDetail } from '@/lib/types'

const ENCOUNTER_ACTIVE_MONSTER_TRAIT_SELECT = `
  id,
  encounter_active_monster_id,
  settlement_id,
  trait_id,
  trait(*)
`

/**
 * Get Encounter Active Monster Traits
 *
 * Retrieves all encounter active monster trait rows.
 *
 * @returns Encounter Active Monster Traits
 */
export async function getEncounterActiveMonsterTraits(): Promise<
  EncounterActiveMonsterTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster_trait')
    .select(ENCOUNTER_ACTIVE_MONSTER_TRAIT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Encounter Active Monster Traits: ${error.message}`
    )

  return (data ?? []) as EncounterActiveMonsterTraitDetail[]
}

/**
 * Get Encounter Active Monster Trait
 *
 * Retrieves a single encounter active monster trait row by ID.
 *
 * @param id Encounter Active Monster Trait ID
 * @returns Encounter Active Monster Trait or null
 */
export async function getEncounterActiveMonsterTrait(
  id: string | null | undefined
): Promise<EncounterActiveMonsterTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster_trait')
    .select(ENCOUNTER_ACTIVE_MONSTER_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Encounter Active Monster Trait: ${error.message}`
    )

  return data as EncounterActiveMonsterTraitDetail | null
}

/**
 * Add Encounter Active Monster Trait
 *
 * Adds a new encounter active monster trait record to the database.
 *
 * @param encounterActiveMonsterTrait Encounter Active Monster Trait Data
 * @returns Inserted Encounter Active Monster Trait
 */
export async function addEncounterActiveMonsterTrait(
  encounterActiveMonsterTrait: Omit<
    TablesInsert<'encounter_active_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterActiveMonsterTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'encounter_active_monster_trait'> = {
    ...encounterActiveMonsterTrait
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('encounter_active_monster_trait')
    .insert(insertData)
    .select(ENCOUNTER_ACTIVE_MONSTER_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Encounter Active Monster Trait: ${error.message}`
    )

  return data as EncounterActiveMonsterTraitDetail
}

/**
 * Update Encounter Active Monster Trait
 *
 * Updates an existing encounter active monster trait record.
 *
 * @param id Encounter Active Monster Trait ID
 * @param encounterActiveMonsterTrait Encounter Active Monster Trait Data
 */
export async function updateEncounterActiveMonsterTrait(
  id: string,
  encounterActiveMonsterTrait: Omit<
    TablesUpdate<'encounter_active_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_active_monster_trait'> = {
    ...encounterActiveMonsterTrait
  }

  delete updateData.id

  const { error } = await supabase
    .from('encounter_active_monster_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Encounter Active Monster Trait: ${error.message}`
    )
}

/**
 * Remove Encounter Active Monster Trait
 *
 * Deletes a encounter active monster trait record from the database.
 *
 * @param id Encounter Active Monster Trait ID
 */
export async function removeEncounterActiveMonsterTrait(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_active_monster_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Encounter Active Monster Trait: ${error.message}`
    )
}
