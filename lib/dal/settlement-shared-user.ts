import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlement Shared Users
 *
 * Retrieves all users a settlement is shared with, including their usernames
 * from the user_settings table.
 *
 * @param settlementId Settlement ID
 * @returns Shared User IDs and Usernames
 */
export async function getSettlementSharedUsers(
  settlementId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_shared_user')
    .select('shared_user_id')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id, username')
    .in(
      'user_id',
      data.map((row) => row.shared_user_id)
    )

  if (settingsError)
    throw new Error(
      `Error Fetching Shared User Settings: ${settingsError.message}`
    )

  return settings.map((row) => ({
    shared_user_id: row.user_id,
    username: row.username
  }))
}

/**
 * Add Settlement Shared Users
 *
 * Shares a settlement with other users.
 *
 * @param settlementId Settlement ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addSettlementSharedUsers(
  settlementId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('settlement_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      settlement_id: settlementId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Shared Users: ${error.message}`)
}

/**
 * Remove Settlement Shared Users
 *
 * Revokes sharing of a settlement with users.
 *
 * @param settlementId Settlement ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeSettlementSharedUsers(
  settlementId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_shared_user')
    .delete()
    .eq('settlement_id', settlementId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Settlement Shared Users: ${error.message}`)
}
