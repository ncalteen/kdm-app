import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Patterns
 *
 * Retrieves the patterns associated with a settlement. Each returned row
 * carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional pre-fetched map of IDs to usernames
 * @returns Settlement Pattern Data
 */
export async function getSettlementPatterns(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['patterns']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_pattern')
      .select('id, pattern_id, pattern(custom, user_id, pattern_name)')
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Patterns: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // docs/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const rawPattern = item.pattern as unknown as
        | { custom: boolean; user_id: string | null; pattern_name: string }
        | { custom: boolean; user_id: string | null; pattern_name: string }[]
        | null

      const pattern = Array.isArray(rawPattern)
        ? (rawPattern[0] ?? null)
        : rawPattern

      if (!pattern) return []

      return [
        {
          id: item.id,
          pattern_id: item.pattern_id,
          pattern_name: pattern.pattern_name,
          custom: pattern.custom,
          ...resolveSettlementAuthorship(
            { custom: pattern.custom, user_id: pattern.user_id },
            memberProfiles
          )
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Patterns
 *
 * Adds patterns to a settlement by their IDs. This is used when adding
 * patterns to a settlement during settlement creation or editing.
 *
 * @param patternIds Pattern IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Pattern Rows
 */
export async function addSettlementPatterns(
  patternIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (patternIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_pattern')
    .insert(
      patternIds.map((patternId) => ({
        pattern_id: patternId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Patterns: ${error.message}`)

  return data
}

/**
 * Update Settlement Pattern
 *
 * Updates an existing settlement pattern record.
 *
 * @param id Settlement Pattern ID
 * @param settlementPattern Settlement Pattern Data
 */
export async function updateSettlementPattern(
  id: string,
  settlementPattern: Omit<
    TablesUpdate<'settlement_pattern'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_pattern')
    .update(settlementPattern)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Pattern: ${error.message}`)
}

/**
 * Remove Settlement Pattern
 *
 * Deletes a settlement pattern record from the database.
 *
 * @param id Settlement Pattern ID
 */
export async function removeSettlementPattern(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_pattern')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Pattern: ${error.message}`)
}
