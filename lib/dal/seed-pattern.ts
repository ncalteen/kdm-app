import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SeedPatternDetail } from '@/lib/types'

/**
 * Get Seed Patterns
 *
 * Retrieves the seed patterns a user has access to. This includes:
 *
 * - Non-custom seed patterns
 * - Custom seed patterns created by the user
 * - Custom seed patterns shared with the user (via the
 *   seed_pattern_shared_user table)
 *
 * @returns Seed Pattern Data
 */
export async function getSeedPatterns(): Promise<{
  [key: string]: SeedPatternDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of seed patterns in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom seed patterns (available to all users)
    supabase
      .from('seed_pattern')
      .select('id, seed_pattern_name')
      .eq('custom', false),
    // Custom seed patterns created by the user
    supabase
      .from('seed_pattern')
      .select('id, seed_pattern_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom seed patterns shared with the user
    supabase
      .from('seed_pattern_shared_user')
      .select('seed_pattern(id, seed_pattern_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Seed Patterns: ${result.error.message}`)

  // Collect seed patterns from all sources, deduplicating by ID
  const seedPatternMap: { [key: string]: SeedPatternDetail } = {}

  for (const s of nonCustomResult.data ?? []) seedPatternMap[s.id] = s
  for (const s of userCustomResult.data ?? []) seedPatternMap[s.id] = s
  for (const row of sharedResult.data ?? [])
    seedPatternMap[row.seed_pattern[0].id] = row.seed_pattern[0]

  return seedPatternMap
}

/**
 * Add Seed Pattern
 *
 * Adds a new seed pattern record to the database.
 *
 * @param seedPattern Seed Pattern Data
 * @returns Inserted Seed Pattern
 */
export async function addSeedPattern(
  seedPattern: Omit<
    TablesInsert<'seed_pattern'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<SeedPatternDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern')
    .insert(seedPattern)
    .select('id, seed_pattern_name')
    .single()

  if (error) throw new Error(`Error Adding Seed Pattern: ${error.message}`)

  return data
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
): Promise<SeedPatternDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern')
    .update(seedPattern)
    .eq('id', id)
    .select('id, seed_pattern_name')
    .single()

  if (error) throw new Error(`Error Updating Seed Pattern: ${error.message}`)
  if (!data) throw new Error('Seed Pattern Not Found')

  return data
}
