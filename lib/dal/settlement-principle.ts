import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Principles
 *
 * Gets the settlement principles for a given settlement. Each returned
 * row carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional pre-fetched map of IDs to usernames
 * @returns Settlement Principles
 */
export async function getSettlementPrinciples(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['principles']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_principle')
      .select(
        'id,  option_1_selected, option_2_selected, principle_id, principle(custom, user_id, principle_name, option_1_name, option_2_name, option_1_rules, option_2_rules)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Principles: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const embeddedPrinciple = item.principle as unknown as
        | {
            custom: boolean
            user_id: string | null
            principle_name: string
            option_1_name: string
            option_2_name: string
            option_1_rules: string | null
            option_2_rules: string | null
          }
        | {
            custom: boolean
            user_id: string | null
            principle_name: string
            option_1_name: string
            option_2_name: string
            option_1_rules: string | null
            option_2_rules: string | null
          }[]
        | null

      const principle = Array.isArray(embeddedPrinciple)
        ? (embeddedPrinciple[0] ?? null)
        : embeddedPrinciple

      if (!principle) return []

      return [
        {
          id: item.id,
          option_1_name: principle.option_1_name,
          option_1_rules: principle.option_1_rules,
          option_1_selected: item.option_1_selected,
          option_2_name: principle.option_2_name,
          option_2_rules: principle.option_2_rules,
          option_2_selected: item.option_2_selected,
          principle_id: item.principle_id,
          principle_name: principle.principle_name,
          custom: principle.custom,
          ...resolveSettlementAuthorship(
            { custom: principle.custom, user_id: principle.user_id },
            memberProfiles
          )
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Principles
 *
 * Adds principles to a settlement by their IDs. This is used when adding
 * principles to a settlement during settlement creation or editing.
 *
 * @param principleIds Principle IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Principle Rows
 */
export async function addSettlementPrinciples(
  principleIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (principleIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_principle')
    .insert(
      principleIds.map((principleId) => ({
        option_1_selected: false,
        option_2_selected: false,
        principle_id: principleId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Principles: ${error.message}`)

  return data
}

/**
 * Update Settlement Principle
 *
 * Updates an existing settlement principle record.
 *
 * @param id Settlement Principle ID
 * @param settlementPrinciple Settlement Principle Data
 */
export async function updateSettlementPrinciple(
  id: string,
  settlementPrinciple: Omit<
    TablesUpdate<'settlement_principle'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_principle')
    .update(settlementPrinciple)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Principle: ${error.message}`)
}

/**
 * Remove Settlement Principle
 *
 * Deletes a settlement principle record from the database.
 *
 * @param id Settlement Principle ID
 */
export async function removeSettlementPrinciple(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_principle')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Principle: ${error.message}`)
}
