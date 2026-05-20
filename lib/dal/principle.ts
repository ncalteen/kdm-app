import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { PrincipleDetail } from '@/lib/types'

/**
 * Get Principles
 *
 * Retrieves all principles visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) principles
 * - Custom principles owned by the user
 * - Custom principles on settlements the user collaborates on (via the
 *   transitive SELECT policy on `principle`)
 *
 * @returns Principles
 */
export async function getPrinciples(): Promise<{
  [key: string]: PrincipleDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('principle')
    .select(
      'id, custom, principle_name, option_1_name, option_2_name, campaign_types, option_1_rules, option_2_rules'
    )

  if (error) throw new Error(`Error Fetching Principles: ${error.message}`)

  const principleMap: { [key: string]: PrincipleDetail } = {}
  for (const p of data ?? []) principleMap[p.id] = p

  return principleMap
}

/**
 * Get User Custom Principles
 *
 * Retrieves only custom principles authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Principle Data Map
 */
export async function getUserCustomPrinciples(): Promise<{
  [key: string]: PrincipleDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('principle')
    .select(
      'id, custom, principle_name, option_1_name, option_2_name, campaign_types, option_1_rules, option_2_rules, archived_at'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Principles: ${error.message}`)

  const principleMap: { [key: string]: PrincipleDetail } = {}
  for (const p of data ?? []) if (!p.archived_at) principleMap[p.id] = p

  return principleMap
}

/**
 * Get Principle IDs
 *
 * Retrieves the IDs of principles. This depends on if they are custom
 * principles (requires the user ID if so).
 *
 * @param principleNames Principle Names
 * @param campaignType Campaign Type
 * @param custom Custom
 * @param userId User ID
 * @returns Principle IDs
 */
export async function getPrincipleIds(
  principleNames: string[],
  campaignType: CampaignType,
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('principle')
        .select('id')
        .in('principle_name', principleNames)
        .or(
          `campaign_types.eq.{},campaign_types.cs.{${DatabaseCampaignType[campaignType]}}`
        )
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('principle')
        .select('id')
        .in('principle_name', principleNames)
        .or(
          `campaign_types.eq.{},campaign_types.cs.{${DatabaseCampaignType[campaignType]}}`
        )
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Principle ID(s): ${error.message}`)

  if (!data) throw new Error('Principle(s) Not Found')

  return data.map((principle) => principle.id)
}

/**
 * Add Principle
 *
 * Adds a new principle record to the database.
 *
 * @param principle Principle Data
 * @returns Inserted Principle
 */
export async function addPrinciple(
  principle: Omit<
    TablesInsert<'principle'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<PrincipleDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (principle.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('principle')
    .insert({
      ...principle,
      ...(principle.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, principle_name, option_1_name, option_2_name, campaign_types, option_1_rules, option_2_rules'
    )
    .single()

  if (error) throw new Error(`Error Adding Principle: ${error.message}`)

  return data
}

/**
 * Update Principle
 *
 * Updates an existing principle record in the database.
 *
 * @param id Principle ID
 * @param principle Principle Data
 * @returns Updated Principle
 */
export async function updatePrinciple(
  id: string,
  principle: Omit<TablesUpdate<'principle'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('principle')
    .update(principle)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Principle: ${error.message}`)
}

/**
 * Remove Principle
 *
 * Deletes a principle record from the database.
 *
 * @param id Principle ID
 */
export async function removePrinciple(id: string): Promise<void> {
  await removeCatalogRow('principle', id, 'Principle')
}
