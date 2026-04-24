import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PhilosophyRankDetail } from '@/lib/types'

/**
 * Get Philosophy Ranks
 *
 * Retrieves all ranks for a philosophy, ordered by rank number.
 *
 * @param philosophyId Philosophy ID
 * @returns Philosophy Ranks
 */
export async function getPhilosophyRanks(
  philosophyId: string | null | undefined
): Promise<PhilosophyRankDetail[]> {
  if (!philosophyId) throw new Error('Required: Philosophy ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy_rank')
    .select('id, philosophy_id, rank_number, rules')
    .eq('philosophy_id', philosophyId)
    .order('rank_number', { ascending: true })

  if (error)
    throw new Error(`Error Fetching Philosophy Ranks: ${error.message}`)

  return data ?? []
}

/**
 * Add Philosophy Rank
 *
 * Adds a new rank to a philosophy.
 *
 * @param philosophyRank Philosophy Rank Data
 * @returns Inserted Philosophy Rank
 */
export async function addPhilosophyRank(
  philosophyRank: Omit<
    TablesInsert<'philosophy_rank'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<PhilosophyRankDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy_rank')
    .insert(philosophyRank)
    .select('id, philosophy_id, rank_number, rules')
    .single()

  if (error) throw new Error(`Error Adding Philosophy Rank: ${error.message}`)

  return data
}

/**
 * Update Philosophy Rank
 *
 * Updates an existing philosophy rank record.
 *
 * @param id Philosophy Rank ID
 * @param philosophyRank Philosophy Rank Data
 */
export async function updatePhilosophyRank(
  id: string,
  philosophyRank: Omit<
    TablesUpdate<'philosophy_rank'>,
    'id' | 'created_at' | 'updated_at' | 'philosophy_id'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('philosophy_rank')
    .update(philosophyRank)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Philosophy Rank: ${error.message}`)
}

/**
 * Remove Philosophy Rank
 *
 * Deletes a philosophy rank record from the database.
 *
 * @param id Philosophy Rank ID
 */
export async function removePhilosophyRank(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('philosophy_rank').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Philosophy Rank: ${error.message}`)
}
