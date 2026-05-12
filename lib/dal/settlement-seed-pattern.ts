import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Seed Patterns
 *
 * Retrieves the seed patterns associated with a settlement. Each returned
 * row carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberUsernames Optional pre-fetched map of IDs to usernames
 * @returns Settlement Seed Pattern Data
 */
export async function getSettlementSeedPatterns(
  settlementId: string | null | undefined,
  prefetchedMemberUsernames?: Promise<Map<string, string>>
): Promise<SettlementDetail['seed_patterns']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberUsernames] = await Promise.all([
    supabase
      .from('settlement_seed_pattern')
      .select(
        'id, seed_pattern_id, seed_pattern(custom, user_id, seed_pattern_name)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberUsernames ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Seed Patterns: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const seedPatternRelation = item.seed_pattern as unknown as
        | {
            custom: boolean
            user_id: string | null
            seed_pattern_name: string
          }
        | {
            custom: boolean
            user_id: string | null
            seed_pattern_name: string
          }[]
        | null

      const seedPattern = Array.isArray(seedPatternRelation)
        ? (seedPatternRelation[0] ?? null)
        : seedPatternRelation

      if (!seedPattern) return []

      return [
        {
          id: item.id,
          seed_pattern_id: item.seed_pattern_id,
          seed_pattern_name: seedPattern.seed_pattern_name,
          custom: seedPattern.custom,
          author_username:
            seedPattern.custom && seedPattern.user_id
              ? (memberUsernames.get(seedPattern.user_id) ?? null)
              : null
        }
      ]
    }) ?? []
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
 * @returns Inserted Settlement Seed Pattern Rows
 */
export async function addSettlementSeedPatterns(
  seedPatternIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (seedPatternIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_seed_pattern')
    .insert(
      seedPatternIds.map((seedPatternId) => ({
        seed_pattern_id: seedPatternId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Seed Patterns: ${error.message}`)

  return data
}

/**
 * Update Settlement Seed Pattern
 *
 * Updates an existing settlement seed pattern record.
 *
 * @param id Settlement Seed Pattern ID
 * @param settlementSeedPattern Settlement Seed Pattern Data
 * @param settlementSeedPattern.seed_pattern_id Seed Pattern ID
 * @param settlementSeedPattern.settlement_id Settlement ID
 */
export async function updateSettlementSeedPattern(
  id: string,
  settlementSeedPattern: {
    seed_pattern_id?: string
    settlement_id?: string
  }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_seed_pattern')
    .update(settlementSeedPattern)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Seed Pattern: ${error.message}`)
}

/**
 * Remove Settlement Seed Pattern
 *
 * Deletes a settlement seed pattern record from the database.
 *
 * @param id Settlement Seed Pattern ID
 */
export async function removeSettlementSeedPattern(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_seed_pattern')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Seed Pattern: ${error.message}`)
}
