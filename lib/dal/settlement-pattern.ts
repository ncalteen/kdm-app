import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Patterns
 *
 * Retrieves the patterns associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Pattern Data
 */
export async function getSettlementPatterns(
  settlementId: string | null | undefined
): Promise<SettlementDetail['patterns']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_pattern')
    .select('id, pattern_id, pattern(pattern_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Patterns: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      pattern_id: item.pattern_id,
      pattern_name: (item.pattern as unknown as { pattern_name: string })
        .pattern_name
    })) ?? []
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
 */
export async function addSettlementPatterns(
  patternIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (patternIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_pattern').insert(
    patternIds.map((patternId) => ({
      pattern_id: patternId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Patterns: ${error.message}`)
}
