import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ShowdownMonsterTraitDetail } from '@/lib/types'

const SHOWDOWN_MONSTER_TRAIT_SELECT = `
  id,
  showdown_monster_id,
  settlement_id,
  trait_id,
  trait(*)
`

/**
 * Get Showdown Monster Traits
 *
 * Retrieves all showdown monster trait rows.
 *
 * @returns Showdown Monster Traits
 */
export async function getShowdownMonsterTraits(): Promise<
  ShowdownMonsterTraitDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster_trait')
    .select(SHOWDOWN_MONSTER_TRAIT_SELECT)

  if (error)
    throw new Error(`Error Fetching Showdown Monster Traits: ${error.message}`)

  return (data ?? []) as ShowdownMonsterTraitDetail[]
}

/**
 * Get Showdown Monster Trait
 *
 * Retrieves a single showdown monster trait row by ID.
 *
 * @param id Showdown Monster Trait ID
 * @returns Showdown Monster Trait or null
 */
export async function getShowdownMonsterTrait(
  id: string | null | undefined
): Promise<ShowdownMonsterTraitDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster_trait')
    .select(SHOWDOWN_MONSTER_TRAIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Showdown Monster Trait: ${error.message}`)

  return data as ShowdownMonsterTraitDetail | null
}

/**
 * Add Showdown Monster Trait
 *
 * Adds a new showdown monster trait record to the database.
 *
 * @param showdownMonsterTrait Showdown Monster Trait Data
 * @returns Inserted Showdown Monster Trait
 */
export async function addShowdownMonsterTrait(
  showdownMonsterTrait: Omit<
    TablesInsert<'showdown_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<ShowdownMonsterTraitDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'showdown_monster_trait'> = {
    ...showdownMonsterTrait
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('showdown_monster_trait')
    .insert(insertData)
    .select(SHOWDOWN_MONSTER_TRAIT_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Showdown Monster Trait: ${error.message}`)

  return data as ShowdownMonsterTraitDetail
}

/**
 * Update Showdown Monster Trait
 *
 * Updates an existing showdown monster trait record.
 *
 * @param id Showdown Monster Trait ID
 * @param showdownMonsterTrait Showdown Monster Trait Data
 */
export async function updateShowdownMonsterTrait(
  id: string,
  showdownMonsterTrait: Omit<
    TablesUpdate<'showdown_monster_trait'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'showdown_monster_trait'> = {
    ...showdownMonsterTrait
  }

  delete updateData.id

  const { error } = await supabase
    .from('showdown_monster_trait')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Showdown Monster Trait: ${error.message}`)
}

/**
 * Remove Showdown Monster Trait
 *
 * Deletes a showdown monster trait record from the database.
 *
 * @param id Showdown Monster Trait ID
 */
export async function removeShowdownMonsterTrait(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_monster_trait')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Showdown Monster Trait: ${error.message}`)
}
