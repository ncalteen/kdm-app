import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Milestones
 *
 * Retrieves the milestones associated with a settlement. Each returned row
 * carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional pre-fetched map of IDs to usernames
 * @returns Settlement Milestone Data
 */
export async function getSettlementMilestones(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['milestones']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_milestone')
      .select(
        'complete, id, milestone_id, milestone(custom, user_id, event_name, milestone_name, requirements, rules)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Milestones: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // docs/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const rawMilestone = item.milestone as unknown as
        | {
            custom: boolean
            user_id: string | null
            event_name: string
            milestone_name: string
            requirements: string | null
            rules: string | null
          }
        | {
            custom: boolean
            user_id: string | null
            event_name: string
            milestone_name: string
            requirements: string | null
            rules: string | null
          }[]
        | null

      const milestone = Array.isArray(rawMilestone)
        ? (rawMilestone[0] ?? null)
        : rawMilestone

      if (!milestone) return []

      return [
        {
          complete: item.complete,
          event_name: milestone.event_name,
          id: item.id,
          milestone_id: item.milestone_id,
          milestone_name: milestone.milestone_name,
          requirements: milestone.requirements,
          rules: milestone.rules,
          custom: milestone.custom,
          ...resolveSettlementAuthorship(
            { custom: milestone.custom, user_id: milestone.user_id },
            memberProfiles
          )
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Milestones
 *
 * Adds milestones to a settlement by their IDs. This is used when adding
 * milestones to a settlement during settlement creation or editing.
 *
 * @param milestoneIds Milestone IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Milestone Rows
 */
export async function addSettlementMilestones(
  milestoneIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (milestoneIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_milestone')
    .insert(
      milestoneIds.map((milestoneId) => ({
        complete: false,
        milestone_id: milestoneId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Milestones: ${error.message}`)

  return data
}

/**
 * Update Settlement Milestone
 *
 * Updates an existing settlement milestone record.
 *
 * @param id Settlement Milestone ID
 * @param settlementMilestone Settlement Milestone Data
 */
export async function updateSettlementMilestone(
  id: string,
  settlementMilestone: Omit<
    TablesUpdate<'settlement_milestone'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_milestone')
    .update(settlementMilestone)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Milestone: ${error.message}`)
}

/**
 * Remove Settlement Milestone
 *
 * Deletes a settlement milestone record from the database.
 *
 * @param id Settlement Milestone ID
 */
export async function removeSettlementMilestone(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_milestone')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Milestone: ${error.message}`)
}
