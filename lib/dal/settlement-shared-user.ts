import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlement Shared Users
 *
 * Retrieves all users a settlement is shared with.
 *
 * @param settlementId Settlement ID
 * @returns Shared User IDs
 */
export async function getSettlementSharedUsers(
  settlementId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_shared_user')
    .select('shared_user_id')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Settlement Shared User
 *
 * Shares a settlement with another user.
 *
 * @param settlementId Settlement ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addSettlementSharedUser(
  settlementId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('settlement_shared_user').insert({
    settlement_id: settlementId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Settlement Shared User: ${error.message}`)
}

/**
 * Remove Settlement Shared User
 *
 * Revokes sharing of a settlement with a user.
 *
 * @param settlementId Settlement ID
 * @param sharedUserId Shared User ID
 */
export async function removeSettlementSharedUser(
  settlementId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_shared_user')
    .delete()
    .eq('settlement_id', settlementId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Settlement Shared User: ${error.message}`)
}
