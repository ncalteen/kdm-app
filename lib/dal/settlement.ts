import { Tables } from '@/lib/database.types'
import { CampaignType, SurvivorType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlement Campaign Type
 *
 * Retrieves the selected settlement's campaign type.
 *
 * @param settlementId Settlement ID
 * @returns Campaign Type (or null)
 */
export async function getCampaignType(
  settlementId: string | null
): Promise<CampaignType | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlements')
    .select('campaign_type')
    .eq('id', settlementId)
    .single()

  if (error)
    throw new Error(`Error Fetching Settlement Campaign Type: ${error.message}`)

  return data?.campaign_type || null
}

/**
 * Get Settlement Survivor Type
 *
 * Retrieves the selected settlement's survivor type.
 *
 * @param settlementId Settlement ID
 * @returns Survivor Type (or null)
 */
export async function getSurvivorType(
  settlementId: string | null
): Promise<SurvivorType | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlements')
    .select('survivor_type')
    .eq('id', settlementId)
    .single()

  if (error)
    throw new Error(`Error Fetching Settlement Survivor Type: ${error.message}`)

  return data?.survivor_type || null
}

/**
 * Get Settlement Hunt ID
 *
 * Retrieves the selected settlement's hunt ID.
 *
 * @param settlementId Settlement ID
 * @returns Hunt ID (or null)
 */
export async function getHuntId(
  settlementId: string | null
): Promise<string | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt')
    .select('id')
    .eq('settlement_id', settlementId)
    .single()

  if (error)
    throw new Error(`Error Fetching Settlement Hunt ID: ${error.message}`)

  return data?.id || null
}

/**
 * Get Settlement Showdown ID
 *
 * Retrieves the selected settlement's showdown ID.
 *
 * @param settlementId Settlement ID
 * @returns Showdown ID (or null)
 */
export async function getShowdownId(
  settlementId: string | null
): Promise<string | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .select('id')
    .eq('settlement_id', settlementId)
    .single()

  if (error)
    throw new Error(`Error Fetching Settlement Showdown ID: ${error.message}`)

  return data?.id || null
}

/**
 * Get Settlement Settlement Phase ID
 *
 * Retrieves the selected settlement's settlement phase ID.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Phase ID (or null)
 */
export async function getSettlementPhaseId(
  settlementId: string | null
): Promise<string | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .select('id')
    .eq('settlement_id', settlementId)
    .single()

  if (error)
    throw new Error(
      `Error Fetching Settlement Settlement Phase ID: ${error.message}`
    )

  return data?.id || null
}

/**
 * Get Settlements for the Authenticated User
 *
 * This will include settlements owned by the user, or settlements that have
 * been shared with the user via the settlement_shared_user table.
 *
 * @returns List of Settlements (or empty array)
 */
export async function getSettlementsForUser(): Promise<
  (Tables<'settlement'> & { shared: boolean })[]
> {
  const supabase = createClient()

  // Get the authenticated user's ID
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  // Get settlements owned by the user.
  const { data: owned, error: ownedError } = await supabase
    .from('settlement')
    .select('*')
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Settlements: ${ownedError.message}`)

  // Get settlements shared with the user via the junction table.
  const { data: shared, error: sharedError } = await supabase
    .from('settlement_shared_user')
    .select('settlement(*)')
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Settlements: ${sharedError.message}`)

  const results: (Tables<'settlement'> & { shared: boolean })[] = []

  for (const s of owned)
    results.push({
      ...s,
      shared: false
    })

  for (const row of shared) {
    // The join returns an array type, but each shared_user row references
    // exactly one settlement. Access the first (and only) element.
    const s = Array.isArray(row.settlement) ? row.settlement[0] : row.settlement

    if (s) {
      results.push({
        ...s,
        shared: true
      })
    }
  }

  return results
}
