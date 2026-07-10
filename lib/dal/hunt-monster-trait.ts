import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntMonsterTraitDetail } from '@/lib/types'

const HUNT_MONSTER_TRAIT_SELECT = `
  id,
  hunt_monster_id,
  settlement_id,
  trait_id,
  trait(*)
`

/**
 * Get Hunt Monster Traits
 *
 * Retrieves all hunt monster trait rows.
 *
 * @returns Hunt Monster Traits
 */
export async function getHuntMonsterTraits(): Promise<
  HuntMonsterTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster_trait')
    .select(HUNT_MONSTER_TRAIT_SELECT)

  if (error)
    throw new Error(`Error Fetching Hunt Monster Traits: ${error.message}`)

  return (data ?? []) as HuntMonsterTraitDetail[]
}

/**
 * Get Hunt Monster Trait
 *
 * Retrieves a single hunt monster trait row by ID.
 *
 * @param id Hunt Monster Trait ID
 * @returns Hunt Monster Trait or null
 */
export async function getHuntMonsterTrait(
  id: string | null | undefined
): Promise<HuntMonsterTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster_trait')
    .select(HUNT_MONSTER_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Hunt Monster Trait: ${error.message}`)

  return data as HuntMonsterTraitDetail | null
}

/**
 * Add Hunt Monster Trait
 *
 * Adds a new hunt monster trait record to the database.
 *
 * @param huntMonsterTrait Hunt Monster Trait Data
 * @returns Inserted Hunt Monster Trait
 */
export async function addHuntMonsterTrait(
  huntMonsterTrait: Omit<
    TablesInsert<'hunt_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<HuntMonsterTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'hunt_monster_trait'> = { ...huntMonsterTrait }

  delete insertData.id

  const { data, error } = await supabase
    .from('hunt_monster_trait')
    .insert(insertData)
    .select(HUNT_MONSTER_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Hunt Monster Trait: ${error.message}`)

  return data as HuntMonsterTraitDetail
}

/**
 * Update Hunt Monster Trait
 *
 * Updates an existing hunt monster trait record.
 *
 * @param id Hunt Monster Trait ID
 * @param huntMonsterTrait Hunt Monster Trait Data
 */
export async function updateHuntMonsterTrait(
  id: string,
  huntMonsterTrait: Omit<
    TablesUpdate<'hunt_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'hunt_monster_trait'> = { ...huntMonsterTrait }

  delete updateData.id

  const { error } = await supabase
    .from('hunt_monster_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Hunt Monster Trait: ${error.message}`)
}

/**
 * Remove Hunt Monster Trait
 *
 * Deletes a hunt monster trait record from the database.
 *
 * @param id Hunt Monster Trait ID
 */
export async function removeHuntMonsterTrait(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_monster_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Hunt Monster Trait: ${error.message}`)
}
