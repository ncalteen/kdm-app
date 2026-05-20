import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SeedPatternDetail, SeedPatternGearCostDetail } from '@/lib/types'

/**
 * Normalize a Supabase seed_pattern row (with the gear cost relation joined)
 * into a SeedPatternDetail. Strips the relation array onto a `gear_costs`
 * field on the returned object.
 *
 * @param row Raw seed_pattern row including the gear cost relation.
 * @returns Normalized SeedPatternDetail.
 */
function toSeedPatternDetail(
  row: Omit<SeedPatternDetail, 'gear_costs'> & {
    seed_pattern_gear_cost?: SeedPatternGearCostDetail[] | null
  }
): SeedPatternDetail {
  const { seed_pattern_gear_cost, ...rest } = row
  return {
    ...rest,
    gear_costs: seed_pattern_gear_cost ?? []
  }
}

/**
 * Get Seed Patterns
 *
 * Retrieves the seed patterns visible to the authenticated user. RLS
 * surfaces:
 *
 * - Non-custom seed patterns
 * - Custom seed patterns created by the user
 * - Custom seed patterns on settlements the user collaborates on (via the
 *   transitive SELECT policy on `seed_pattern`)
 *
 * @returns Seed Pattern Data
 */
export async function getSeedPatterns(): Promise<{
  [key: string]: SeedPatternDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern')
    .select(
      'id, custom, seed_pattern_name, crafting_limit, crafting_steps, endeavor_cost, era, keywords, requirements, crafted_gear_id, seed_pattern_gear_cost(cost_gear_id, quantity)'
    )

  if (error) throw new Error(`Error Fetching Seed Patterns: ${error.message}`)

  const seedPatternMap: { [key: string]: SeedPatternDetail } = {}
  for (const s of data ?? []) seedPatternMap[s.id] = toSeedPatternDetail(s)

  return seedPatternMap
}

/**
 * Get User Custom Seed Patterns
 *
 * Retrieves only custom seed patterns authored by the current user. Used
 * by the user-content library so collaborator-authored customs visible via
 * the transitive SELECT policy don't pollute the caller's personal
 * catalog.
 *
 * @returns Custom Seed Pattern Data Map
 */
export async function getUserCustomSeedPatterns(): Promise<{
  [key: string]: SeedPatternDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern')
    .select(
      'id, custom, seed_pattern_name, crafting_limit, crafting_steps, endeavor_cost, era, keywords, requirements, crafted_gear_id, seed_pattern_gear_cost(cost_gear_id, quantity), archived_at'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Seed Patterns: ${error.message}`)

  const seedPatternMap: { [key: string]: SeedPatternDetail } = {}
  for (const s of data ?? [])
    if (!s.archived_at) seedPatternMap[s.id] = toSeedPatternDetail(s)

  return seedPatternMap
}

/**
 * Add Seed Pattern
 *
 * Adds a new seed pattern record to the database. Gear costs are persisted
 * separately via {@link replaceSeedPatternGearCosts}.
 *
 * @param seedPattern Seed Pattern Data
 * @returns Inserted Seed Pattern (with empty gear_costs)
 */
export async function addSeedPattern(
  seedPattern: Omit<
    TablesInsert<'seed_pattern'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<SeedPatternDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (seedPattern.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('seed_pattern')
    .insert({
      ...seedPattern,
      ...(seedPattern.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, seed_pattern_name, crafting_limit, crafting_steps, endeavor_cost, era, keywords, requirements, crafted_gear_id'
    )
    .single()

  if (error) throw new Error(`Error Adding Seed Pattern: ${error.message}`)

  return { ...data, gear_costs: [] }
}

/**
 * Update Seed Pattern
 *
 * Updates an existing seed pattern record in the database.
 *
 * @param id Seed Pattern ID
 * @param seedPattern Seed Pattern Data
 * @returns Updated Seed Pattern
 */
export async function updateSeedPattern(
  id: string,
  seedPattern: Omit<
    TablesUpdate<'seed_pattern'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern')
    .update(seedPattern)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Seed Pattern: ${error.message}`)
}

/**
 * Remove Seed Pattern
 *
 * Deletes a seed pattern record from the database.
 *
 * @param id Seed Pattern ID
 */
export async function removeSeedPattern(id: string): Promise<void> {
  await removeCatalogRow('seed_pattern', id, 'Seed Pattern')
}

/**
 * Replace Seed Pattern Gear Costs
 *
 * Replaces all gear cost rows for a seed pattern with the provided list. Any
 * cost row not present in `costs` is removed; new entries are inserted.
 *
 * @param seedPatternId Seed Pattern ID
 * @param costs Gear Cost Entries
 */
export async function replaceSeedPatternGearCosts(
  seedPatternId: string,
  costs: SeedPatternGearCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('seed_pattern_gear_cost')
    .delete()
    .eq('seed_pattern_id', seedPatternId)

  if (deleteError)
    throw new Error(
      `Error Clearing Seed Pattern Gear Costs: ${deleteError.message}`
    )

  // De-duplicate by gear ID (PK is composite on seed_pattern_id +
  // cost_gear_id) and drop invalid quantities.
  const seen = new Set<string>()
  const rows = costs
    .filter((c) => {
      if (!c.cost_gear_id || c.quantity < 1) return false
      if (seen.has(c.cost_gear_id)) return false
      seen.add(c.cost_gear_id)
      return true
    })
    .map((c) => ({
      seed_pattern_id: seedPatternId,
      cost_gear_id: c.cost_gear_id,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('seed_pattern_gear_cost')
    .insert(rows)

  if (insertError)
    throw new Error(
      `Error Saving Seed Pattern Gear Costs: ${insertError.message}`
    )
}
