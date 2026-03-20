import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Seed Patterns
 *
 * Retrieves the seed patterns associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Seed Pattern Data
 */
export async function getSettlementSeedPatterns(
  settlementId: string | null | undefined
): Promise<SettlementDetail['seed_patterns']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_seed_pattern')
    .select('id, seed_pattern_id, seed_pattern(seed_pattern_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Seed Patterns: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      seed_pattern_id: item.seed_pattern_id,
      seed_pattern_name: (
        item.seed_pattern as unknown as { seed_pattern_name: string }
      ).seed_pattern_name
    })) ?? []
  )
}

/**
 * Add Settlement Seed Patterns
 *
 * Adds seed patterns to a settlement by their IDs. This is used when adding
 * seed patterns to a settlement during settlement creation or editing.
 *
 * @param seedPatternIds Seed Pattern IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementSeedPatterns(
  seedPatternIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (seedPatternIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_seed_pattern').insert(
    seedPatternIds.map((seedPatternId) => ({
      seed_pattern_id: seedPatternId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Seed Patterns: ${error.message}`)
}
